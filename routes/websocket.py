"""WebSocket event handlers for SocketIO namespaces."""
import time
import logging
from flask_socketio import emit, disconnect
from flask import request

logger = logging.getLogger(__name__)

# Store connected clients (namespace -> {session_id: client_info})
connected_clients = {
    '/control': {},
    '/show': {}
}


def register_websocket_handlers(socketio):
    """Register all WebSocket event handlers."""
    
    # Control namespace (Operator UI)
    @socketio.on('connect', namespace='/control')
    def on_control_connect():
        """Handle Operator UI connection."""
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
        session_id = request.sid
        connected_clients['/show'][session_id] = {
            'connected_at': time.time(),
            'session_id': session_id
        }
        logger.info(f"Show View connected: {session_id}")
        emit('connect', {'status': 'connected', 'namespace': '/show'})
    
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
        # For Phase 1A, just acknowledge - future phases will process this

