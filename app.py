"""Flask application entry point for PrimeTime."""
import os
from flask import Flask
from flask_socketio import SocketIO
from flask_migrate import Migrate
from config import config
from models import db
from database import init_db
from routes import register_blueprints

# Create Flask app
app = Flask(__name__, static_folder='static', static_url_path='/static')

# Load configuration
config_name = os.environ.get('FLASK_ENV', 'default')
app.config.from_object(config[config_name])

# Initialize extensions
db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins=app.config['SOCKETIO_CORS_ALLOWED_ORIGINS'])
migrate = Migrate(app, db)

# Register blueprints
register_blueprints(app)

# Database initialization will be handled in __main__ block


# SocketIO event handlers
@socketio.on('connect', namespace='/control')
def handle_control_connect(auth):
    """Handle operator UI connection."""
    print(f'Operator UI connected: {auth}')
    return {'status': 'connected'}


@socketio.on('connect', namespace='/show')
def handle_show_connect(auth):
    """Handle show view connection."""
    print(f'Show View connected: {auth}')
    return {'status': 'connected'}


@socketio.on('disconnect', namespace='/control')
def handle_control_disconnect():
    """Handle operator UI disconnection."""
    print('Operator UI disconnected')


@socketio.on('disconnect', namespace='/show')
def handle_show_disconnect():
    """Handle show view disconnection."""
    print('Show View disconnected')


@app.route('/')
def index():
    """Root route redirects to operator UI."""
    from flask import redirect
    return redirect('/operator')


if __name__ == '__main__':
    # Ensure data directory exists
    data_dir = app.config['DATA_DIR']
    if isinstance(data_dir, str):
        os.makedirs(data_dir, exist_ok=True)
    else:
        data_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize database
    with app.app_context():
        init_db()
    
    # Run application
    socketio.run(app, debug=app.config['DEBUG'], host='0.0.0.0', port=5000)

