"""State machine and timeline management for playback control."""
import time
import json
import logging
from models import db, Timeline, PlaybackState
from database import get_active_timeline, update_playback_state, get_playback_state

logger = logging.getLogger(__name__)


class PlaybackManager:
    """Manages playback state machine and timeline control."""
    
    def __init__(self, socketio):
        self.socketio = socketio
        self.current_timeline = None
        self.current_index = 0
        self.timecode_ms = 0
        self.is_playing = False
        self.playback_start_time = None  # Unix timestamp in ms
        self.initial_offset_ms = 0  # Offset when playback started
        self.state = 'IDLE'  # IDLE, LOADING, PLAYING, PAUSED, TRANSITIONING, BLACKOUT, ERROR
        self._initialized = False
    
    def ensure_initialized(self):
        """Ensure PlaybackManager is initialized with database state."""
        if not self._initialized:
            from flask import has_app_context
            if has_app_context():
                self.load_state_from_db()
                self._initialized = True
    
    def load_state_from_db(self):
        """Load playback state from database."""
        state = get_playback_state()
        if state:
            self.current_index = state.current_index
            self.timecode_ms = state.timecode_ms
            self.is_playing = state.is_playing
            
            # Load timeline if active
            if state.timeline_id:
                timeline = Timeline.query.get(state.timeline_id)
                if timeline:
                    self.current_timeline = json.loads(timeline.timeline_json)
    
    def save_state_to_db(self):
        """Save current playback state to database."""
        timeline_id = None
        if self.current_timeline:
            # Find or create timeline record
            active_timeline = get_active_timeline()
            if active_timeline:
                timeline_id = active_timeline.id
        
        update_playback_state(
            timeline_id=timeline_id,
            current_index=self.current_index,
            timecode_ms=self.timecode_ms,
            is_playing=self.is_playing
        )
    
    def load_timeline(self, timeline_data):
        """
        Load a timeline for playback.
        
        Args:
            timeline_data: dict or Timeline object
        """
        if isinstance(timeline_data, Timeline):
            self.current_timeline = json.loads(timeline_data.timeline_json)
        else:
            self.current_timeline = timeline_data
        
        self.current_index = 0
        self.timecode_ms = 0
        self.is_playing = False
        self.state = 'LOADING'
        
        self.save_state_to_db()
        
        logger.info(f"Timeline loaded: {self.current_timeline.get('name', 'Unnamed')}")
    
    def play(self, index=None):
        """Start or resume playback."""
        if index is not None:
            self.current_index = index
            self.timecode_ms = 0
        
        if not self.current_timeline or not self.current_timeline.get('items'):
            logger.warning("No timeline loaded")
            return False
        
        if self.current_index >= len(self.current_timeline['items']):
            logger.warning(f"Index {self.current_index} out of range")
            return False
        
        # Record playback start time
        self.playback_start_time = time.time() * 1000  # Convert to ms
        self.initial_offset_ms = self.timecode_ms
        self.is_playing = True
        self.state = 'PLAYING'
        
        self.save_state_to_db()
        
        logger.info(f"Playback started at index {self.current_index}, timecode {self.timecode_ms}ms")
        return True
    
    def pause(self):
        """Pause playback."""
        if self.is_playing:
            # Calculate current timecode before pausing
            self.timecode_ms = self.get_current_timecode()
            self.is_playing = False
            self.state = 'PAUSED'
            self.playback_start_time = None
            
            self.save_state_to_db()
            
            logger.info(f"Playback paused at index {self.current_index}, timecode {self.timecode_ms}ms")
    
    def jump(self, index):
        """Jump to specific timeline item index."""
        if not self.current_timeline or not self.current_timeline.get('items'):
            return False
        
        if index < 0 or index >= len(self.current_timeline['items']):
            logger.warning(f"Jump index {index} out of range")
            return False
        
        was_playing = self.is_playing
        self.pause()
        
        self.current_index = index
        self.timecode_ms = 0
        
        if was_playing:
            self.play()
        else:
            self.state = 'LOADING'
            self.save_state_to_db()
        
        logger.info(f"Jumped to index {index}")
        return True
    
    def skip(self, delta):
        """Skip to next/previous item."""
        if not self.current_timeline or not self.current_timeline.get('items'):
            return False
        
        new_index = self.current_index + delta
        
        if new_index < 0:
            new_index = 0
        elif new_index >= len(self.current_timeline['items']):
            new_index = len(self.current_timeline['items']) - 1
        
        return self.jump(new_index)
    
    def get_current_timecode(self):
        """Calculate current timecode based on playback state."""
        if not self.is_playing or self.playback_start_time is None:
            return self.timecode_ms
        
        # Calculate elapsed time since playback started
        now_ms = time.time() * 1000
        elapsed_ms = now_ms - self.playback_start_time
        current_timecode = self.initial_offset_ms + elapsed_ms
        
        return int(current_timecode)
    
    def get_current_item(self):
        """Get current timeline item."""
        if not self.current_timeline or not self.current_timeline.get('items'):
            return None
        
        if self.current_index < len(self.current_timeline['items']):
            return self.current_timeline['items'][self.current_index]
        
        return None
    
    def send_timecode_update(self):
        """Send timecode update to Show View via WebSocket."""
        if not self.is_playing:
            return
        
        timecode = self.get_current_timecode()
        
        # Send to all connected Show Views
        self.socketio.emit('SHOW_SET_TIMECODE', {
            'timecodeMs': timecode
        }, namespace='/show')
    
    def start_timecode_updates(self):
        """Start periodic timecode updates (every 500ms)."""
        # This will be called from a background thread or async task
        # For now, we'll rely on external timer or Flask-SocketIO background task
        pass

