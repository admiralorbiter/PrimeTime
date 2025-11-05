"""REST API endpoints for assets, timelines, and settings."""
from flask import Blueprint, jsonify, request
from models import db, Asset, Timeline, Setting, AssetThumbnail
from database import (
    get_assets_by_type, get_asset_by_id, create_timeline,
    get_active_timeline, get_timeline_by_id, update_timeline,
    get_setting, set_setting
)
import json
import logging

logger = logging.getLogger(__name__)

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    import time
    return jsonify({
        'status': 'ok',
        'timestamp': int(time.time())
    })


@api.route('/assets', methods=['GET'])
def get_assets():
    """Get assets, optionally filtered by type."""
    asset_type = request.args.get('type')  # 'photo', 'video', 'music', 'logo'
    
    if asset_type:
        assets = get_assets_by_type(asset_type)
    else:
        # Get all assets
        assets = Asset.query.filter(Asset.error_state.is_(None)).order_by(Asset.added_at.desc()).all()
    
    result = []
    for asset in assets:
        asset_dict = asset.to_dict()
        
        # Get thumbnail if available
        thumbnails = asset.thumbnails
        if thumbnails:
            medium_thumb = next((t for t in thumbnails if t.size == 'medium'), None)
            if medium_thumb:
                # Return thumbnail as base64 or URL path
                # For now, just indicate thumbnail exists
                asset_dict['has_thumbnail'] = True
        
        result.append(asset_dict)
    
    return jsonify(result)


@api.route('/assets/<asset_id>', methods=['GET'])
def get_asset(asset_id):
    """Get a specific asset by ID."""
    asset = get_asset_by_id(asset_id)
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    asset_dict = asset.to_dict()
    
    # Include thumbnail data if available
    thumbnails = asset.thumbnails
    if thumbnails:
        medium_thumb = next((t for t in thumbnails if t.size == 'medium'), None)
        if medium_thumb:
            asset_dict['has_thumbnail'] = True
    
    return jsonify(asset_dict)


@api.route('/assets/<asset_id>/thumbnail', methods=['GET'])
def get_asset_thumbnail(asset_id):
    """Get thumbnail image for an asset."""
    from flask import send_file
    import io
    
    size = request.args.get('size', 'medium')  # 'small', 'medium', 'large'
    asset = get_asset_by_id(asset_id)
    
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    thumbnail = next(
        (t for t in asset.thumbnails if t.size == size),
        None
    )
    
    if not thumbnail:
        return jsonify({'error': 'Thumbnail not found'}), 404
    
    # Return thumbnail as image
    return send_file(
        io.BytesIO(thumbnail.thumbnail_blob),
        mimetype='image/jpeg'
    )


@api.route('/timelines', methods=['GET'])
def get_timelines():
    """Get all timelines."""
    timelines = Timeline.query.order_by(Timeline.updated_at.desc()).all()
    result = [t.to_dict() for t in timelines]
    return jsonify(result)


@api.route('/timelines', methods=['POST'])
def create_timeline_endpoint():
    """Create a new timeline."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['name', 'timeline_json']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    import time
    timeline_data = {
        'name': data['name'],
        'timeline_json': json.dumps(data['timeline_json']) if isinstance(data['timeline_json'], dict) else data['timeline_json'],
        'theme_id': data.get('theme_id', 'neon-chalkboard'),
        'created_at': int(time.time()),
        'updated_at': int(time.time()),
        'is_active': data.get('is_active', False),
        'notes': data.get('notes')
    }
    
    timeline = create_timeline(timeline_data)
    return jsonify(timeline.to_dict()), 201


@api.route('/timelines/<timeline_id>', methods=['GET'])
def get_timeline(timeline_id):
    """Get a specific timeline."""
    timeline = get_timeline_by_id(timeline_id)
    if not timeline:
        return jsonify({'error': 'Timeline not found'}), 404
    
    return jsonify(timeline.to_dict())


@api.route('/timelines/<timeline_id>', methods=['PUT'])
def update_timeline_endpoint(timeline_id):
    """Update a timeline."""
    timeline = get_timeline_by_id(timeline_id)
    if not timeline:
        return jsonify({'error': 'Timeline not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    import time
    updates = {}
    
    if 'name' in data:
        updates['name'] = data['name']
    if 'timeline_json' in data:
        updates['timeline_json'] = json.dumps(data['timeline_json']) if isinstance(data['timeline_json'], dict) else data['timeline_json']
    if 'theme_id' in data:
        updates['theme_id'] = data['theme_id']
    if 'is_active' in data:
        updates['is_active'] = data['is_active']
    if 'notes' in data:
        updates['notes'] = data['notes']
    
    updates['updated_at'] = int(time.time())
    
    update_timeline(timeline_id, **updates)
    updated_timeline = get_timeline_by_id(timeline_id)
    
    return jsonify(updated_timeline.to_dict())


@api.route('/timelines/active', methods=['GET'])
def get_active_timeline_endpoint():
    """Get the currently active timeline."""
    timeline = get_active_timeline()
    if not timeline:
        return jsonify({'error': 'No active timeline'}), 404
    
    return jsonify(timeline.to_dict())


@api.route('/settings/<key>', methods=['GET'])
def get_setting_endpoint(key):
    """Get a setting value."""
    value = get_setting(key)
    if value is None:
        return jsonify({'error': 'Setting not found'}), 404
    
    # Try to parse as JSON, fallback to string
    try:
        value = json.loads(value)
    except (json.JSONDecodeError, TypeError):
        pass
    
    return jsonify({'key': key, 'value': value})


@api.route('/settings/<key>', methods=['PUT'])
def set_setting_endpoint(key):
    """Set a setting value."""
    data = request.get_json()
    if not data or 'value' not in data:
        return jsonify({'error': 'No value provided'}), 400
    
    # Convert value to JSON string if it's a dict/list
    value = data['value']
    if isinstance(value, (dict, list)):
        value = json.dumps(value)
    else:
        value = str(value)
    
    setting = set_setting(key, value)
    return jsonify(setting.to_dict())

