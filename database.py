"""Database initialization and CRUD helper functions."""
import time
import json
from models import db, Timeline, Asset, AssetThumbnail, Setting, PlaybackState


def init_db(app):
    """Initialize database tables and seed default data."""
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Seed default settings
        seed_default_settings()
        
        # Initialize playback state
        if not PlaybackState.query.filter_by(id=1).first():
            db.session.add(PlaybackState(id=1, updated_at=int(time.time())))
            db.session.commit()


def seed_default_settings():
    """Seed default settings if they don't exist."""
    default_theme = {
        "id": "neon-chalkboard",
        "palette": {
            "bg": "#0f1115",
            "fg": "#F4F4F4",
            "accent": ["#39FF14", "#00E5FF", "#FF3AF2", "#FFE600"]
        },
        "fonts": {
            "heading": "Bebas Neue",
            "body": "Inter"
        },
        "motion": {
            "easing": "easeOutQuad",
            "defaultMs": 350
        },
        "gammaLift": 0.1,
        "confetti": {
            "particleCount": 150,
            "spread": 65,
            "decay": 0.92
        }
    }
    
    default_settings = [
        {
            'key': 'theme',
            'value': json.dumps(default_theme)
        },
        {
            'key': 'master_volume',
            'value': '0.8'
        },
        {
            'key': 'operator_ui_layout',
            'value': json.dumps({
                'left_panel_width': 250,
                'right_panel_width': 300,
                'timeline_height': 200
            })
        }
    ]
    
    for setting_data in default_settings:
        if not Setting.query.filter_by(key=setting_data['key']).first():
            db.session.add(Setting(
                key=setting_data['key'],
                value=setting_data['value'],
                updated_at=int(time.time())
            ))
    
    db.session.commit()


# CRUD Helper Functions

def create_asset(asset_data):
    """Create a new asset record."""
    asset = Asset(**asset_data)
    db.session.add(asset)
    db.session.commit()
    return asset


def get_asset_by_id(asset_id):
    """Get asset by ID."""
    return Asset.query.get(asset_id)


def get_asset_by_path(path):
    """Get asset by path."""
    return Asset.query.filter_by(path=path).first()


def get_assets_by_type(asset_type, limit=None):
    """Get assets by type, ordered by added_at desc."""
    query = Asset.query.filter_by(type=asset_type).order_by(Asset.added_at.desc())
    if limit:
        query = query.limit(limit)
    return query.all()


def update_asset(asset_id, **updates):
    """Update asset fields."""
    asset = Asset.query.get(asset_id)
    if asset:
        for key, value in updates.items():
            setattr(asset, key, value)
        db.session.commit()
    return asset


def delete_asset(asset_id):
    """Delete an asset (cascades to thumbnails)."""
    asset = Asset.query.get(asset_id)
    if asset:
        db.session.delete(asset)
        db.session.commit()
    return asset


def create_timeline(timeline_data):
    """Create a new timeline."""
    timeline = Timeline(**timeline_data)
    db.session.add(timeline)
    db.session.commit()
    return timeline


def get_active_timeline():
    """Get the currently active timeline."""
    return Timeline.query.filter_by(is_active=True).first()


def get_timeline_by_id(timeline_id):
    """Get timeline by ID."""
    return Timeline.query.get(timeline_id)


def update_timeline(timeline_id, **updates):
    """Update timeline fields."""
    timeline = Timeline.query.get(timeline_id)
    if timeline:
        for key, value in updates.items():
            setattr(timeline, key, value)
        db.session.commit()
    return timeline


def get_setting(key):
    """Get a setting value by key."""
    setting = Setting.query.get(key)
    return setting.value if setting else None


def set_setting(key, value):
    """Set a setting value."""
    setting = Setting.query.get(key)
    if setting:
        setting.value = value
        setting.updated_at = int(time.time())
    else:
        setting = Setting(key=key, value=value, updated_at=int(time.time()))
        db.session.add(setting)
    db.session.commit()
    return setting


def get_playback_state():
    """Get the current playback state (always id=1)."""
    return PlaybackState.query.get(1)


def update_playback_state(**updates):
    """Update playback state."""
    state = PlaybackState.query.get(1)
    if state:
        for key, value in updates.items():
            setattr(state, key, value)
        state.updated_at = int(time.time())
        db.session.commit()
    return state

