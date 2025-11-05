"""WebSocket event handlers for SocketIO namespaces."""
import time
import logging
import json
from flask_socketio import emit, disconnect
from flask import request
from playback import PlaybackManager
from database import get_active_timeline

logger = logging.getLogger(__name__)

# Store connected clients (namespace -> {session_id: client_info})
connected_clients = {
    '/control': {},
    '/show': {}
}

# Global playback manager instance (will be initialized in register_websocket_handlers)
playback_manager = None


def register_websocket_handlers(socketio):
    """Register all WebSocket event handlers."""
    global playback_manager
    
    # Initialize playback manager (lazy initialization - will initialize on first use)
    playback_manager = PlaybackManager(socketio)
    
    # Start timecode update loop (every 500ms)
    def timecode_update_loop():
        import threading
        def update_loop():
            while True:
                time.sleep(0.5)  # 500ms
                if playback_manager and playback_manager._initialized:
                    try:
                        playback_manager.send_timecode_update()
                    except Exception as e:
                        logger.error(f"Error in timecode update loop: {e}", exc_info=True)
        
        thread = threading.Thread(target=update_loop, daemon=True)
        thread.start()
    
    timecode_update_loop()
    
    # Control namespace (Operator UI)
    @socketio.on('connect', namespace='/control')
    def on_control_connect():
        """Handle Operator UI connection."""
        # Ensure playback manager is initialized
        if playback_manager:
            playback_manager.ensure_initialized()
        
        session_id = request.sid
        connected_clients['/control'][session_id] = {
            'connected_at': time.time(),
            'session_id': session_id
        }
        logger.info(f"Operator UI connected: {session_id}")
        emit('connect', {'status': 'connected', 'namespace': '/control'})
    
    @socketio.on('disconnect', namespace='/control')
    def on_control_disconnect():
        """Handle Operator UI disconnection."""
        session_id = request.sid
        if session_id in connected_clients['/control']:
            del connected_clients['/control'][session_id]
        logger.info(f"Operator UI disconnected: {session_id}")
    
    @socketio.on('PING', namespace='/control')
    def on_control_ping(data):
        """Handle ping from Operator UI."""
        logger.debug(f"PING received from Operator UI: {data}")
        emit('PONG', {'timestamp': data.get('timestamp'), 'echo': 'pong'}, namespace='/control')
    
    @socketio.on('PONG', namespace='/control')
    def on_control_pong(data):
        """Handle pong acknowledgment from Operator UI."""
        logger.debug(f"PONG received from Operator UI: {data}")
    
    # Show namespace (Show View)
    @socketio.on('connect', namespace='/show')
    def on_show_connect():
        """Handle Show View connection."""
        # Ensure playback manager is initialized
        if playback_manager:
            playback_manager.ensure_initialized()
        
        session_id = request.sid
        connected_clients['/show'][session_id] = {
            'connected_at': time.time(),
            'session_id': session_id
        }
        logger.info(f"Show View connected: {session_id}")
        emit('connect', {'status': 'connected', 'namespace': '/show'})
        
        # Send current timeline if available
        if playback_manager and playback_manager.current_timeline:
            emit('SHOW_LOAD_TIMELINE', {
                'timeline': playback_manager.current_timeline
            }, namespace='/show')
    
    @socketio.on('disconnect', namespace='/show')
    def on_show_disconnect():
        """Handle Show View disconnection."""
        session_id = request.sid
        if session_id in connected_clients['/show']:
            del connected_clients['/show'][session_id]
        logger.info(f"Show View disconnected: {session_id}")
    
    @socketio.on('PING', namespace='/show')
    def on_show_ping(data):
        """Handle ping from Show View."""
        logger.debug(f"PING received from Show View: {data}")
        emit('PONG', {'timestamp': data.get('timestamp'), 'echo': 'pong'}, namespace='/show')
    
    @socketio.on('PONG', namespace='/show')
    def on_show_pong(data):
        """Handle pong acknowledgment from Show View."""
        logger.debug(f"PONG received from Show View: {data}")
    
    @socketio.on('SHOW_STATUS', namespace='/show')
    def on_show_status(data):
        """Handle status update from Show View."""
        logger.debug(f"SHOW_STATUS received: {data}")
        # Update playback manager state if needed
        if playback_manager and 'timecodeMs' in data:
            playback_manager.timecode_ms = data['timecodeMs']
    
    @socketio.on('SHOW_LOAD_TIMELINE', namespace='/show')
    def on_show_load_timeline(data):
        """Handle timeline load request from Show View (reconnection)."""
        if playback_manager:
            playback_manager.ensure_initialized()
            # Send current timeline if available
            if playback_manager.current_timeline:
                emit('SHOW_LOAD_TIMELINE', {
                    'timeline': playback_manager.current_timeline
                }, namespace='/show')
    
    @socketio.on('SHOW_PLAY', namespace='/show')
    def on_show_play(data):
        """Handle play command from Show View (echo)."""
        # This is just an echo, actual play comes from operator
        logger.debug(f"SHOW_PLAY echo from Show View: {data}")
    
    @socketio.on('SHOW_PAUSE', namespace='/show')
    def on_show_pause(data):
        """Handle pause command from Show View (echo)."""
        # This is just an echo, actual pause comes from operator
        logger.debug(f"SHOW_PAUSE echo from Show View: {data}")
    
    @socketio.on('ASSET_PRELOAD_DONE', namespace='/show')
    def on_asset_preload_done(data):
        """Handle asset preload completion from Show View."""
        logger.debug(f"ASSET_PRELOAD_DONE: {data}")
    
    @socketio.on('ERROR', namespace='/show')
    def on_show_error(data):
        """Handle error report from Show View."""
        logger.error(f"Show View error: {data}")
        # Broadcast to operator UI
        emit('SHOW_ERROR', data, namespace='/control', broadcast=True)
    
    # Operator UI control handlers
    @socketio.on('TIMELINE_SAVE', namespace='/control')
    def on_timeline_save(data):
        """Handle timeline save from Operator UI."""
        if playback_manager:
            playback_manager.ensure_initialized()
        
        timeline_data = data.get('timeline')
        if not timeline_data:
            emit('TIMELINE_SAVED', {'error': 'No timeline data provided'}, namespace='/control')
            return
        
        try:
            # Create or update timeline via API logic
            import time
            timeline_json_str = json.dumps(timeline_data) if isinstance(timeline_data, dict) else timeline_data
            
            # Check if active timeline exists
            active_timeline = get_active_timeline()
            if active_timeline:
                # Update existing
                active_timeline.timeline_json = timeline_json_str
                active_timeline.updated_at = int(time.time())
                from models import db
                db.session.commit()
                
                # Update playback manager
                if playback_manager:
                    playback_manager.load_timeline(timeline_data)
                
                # Send to Show View
                emit('SHOW_LOAD_TIMELINE', {
                    'timeline': timeline_data
                }, namespace='/show', broadcast=True)
                
                emit('TIMELINE_SAVED', {'success': True, 'timeline_id': active_timeline.id}, namespace='/control')
            else:
                # Create new timeline
                from database import create_timeline
                timeline_record = create_timeline({
                    'name': timeline_data.get('name', 'Untitled Timeline'),
                    'timeline_json': timeline_json_str,
                    'theme_id': timeline_data.get('theme', 'neon-chalkboard'),
                    'created_at': int(time.time()),
                    'updated_at': int(time.time()),
                    'is_active': True,
                    'notes': None
                })
                
                # Update playback manager
                if playback_manager:
                    playback_manager.load_timeline(timeline_data)
                
                # Send to Show View
                emit('SHOW_LOAD_TIMELINE', {
                    'timeline': timeline_data
                }, namespace='/show', broadcast=True)
                
                emit('TIMELINE_SAVED', {'success': True, 'timeline_id': timeline_record.id}, namespace='/control')
        except Exception as e:
            logger.error(f"Error saving timeline: {e}", exc_info=True)
            emit('TIMELINE_SAVED', {'error': str(e)}, namespace='/control')
    
    @socketio.on('ASSET_INDEX_REQUEST', namespace='/control')
    def on_asset_index_request(data):
        """Handle asset index request from Operator UI."""
        from models import Asset
        assets = Asset.query.filter(Asset.error_state.is_(None)).order_by(Asset.added_at.desc()).all()
        assets_list = [asset.to_dict() for asset in assets]
        emit('ASSET_INDEX_RESPONSE', {'assets': assets_list}, namespace='/control')
    
    # Playback control handlers from Operator UI
    @socketio.on('CONTROL_PLAY', namespace='/control')
    def on_control_play(data):
        """Handle play command from Operator UI."""
        if playback_manager:
            playback_manager.ensure_initialized()
            index = data.get('index')
            if playback_manager.play(index):
                emit('SHOW_PLAY', {'index': playback_manager.current_index}, namespace='/show', broadcast=True)
    
    @socketio.on('CONTROL_PAUSE', namespace='/control')
    def on_control_pause(data):
        """Handle pause command from Operator UI."""
        if playback_manager:
            playback_manager.ensure_initialized()
            playback_manager.pause()
            emit('SHOW_PAUSE', {}, namespace='/show', broadcast=True)
    
    @socketio.on('CONTROL_JUMP', namespace='/control')
    def on_control_jump(data):
        """Handle jump command from Operator UI."""
        index = data.get('index')
        if playback_manager and index is not None:
            playback_manager.ensure_initialized()
            if playback_manager.jump(index):
                emit('SHOW_JUMP', {'index': index}, namespace='/show', broadcast=True)
    
    @socketio.on('CONTROL_SKIP', namespace='/control')
    def on_control_skip(data):
        """Handle skip command from Operator UI."""
        delta = data.get('delta', 1)
        if playback_manager:
            playback_manager.ensure_initialized()
            if playback_manager.skip(delta):
                emit('SHOW_SKIP', {'delta': delta}, namespace='/show', broadcast=True)

