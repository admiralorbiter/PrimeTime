"""Flask application entry point for PrimeTime."""
import os
from flask import Flask, send_from_directory, redirect
from flask_socketio import SocketIO
from flask_migrate import Migrate
from models import db
from database import init_db
from asset_pipeline import AssetWatcher
import config

# Initialize Flask app
app = Flask(__name__, static_folder='static', static_url_path='')

# Load configuration
app.config['SECRET_KEY'] = config.SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = config.SQLALCHEMY_TRACK_MODIFICATIONS
app.config['ASSETS_PATH'] = config.ASSETS_PATH

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
# Use 'threading' async mode for Python 3.12 compatibility (eventlet has SSL issues)
socketio = SocketIO(
    app,
    cors_allowed_origins=config.SOCKETIO_CORS_ORIGINS,
    ping_interval=config.SOCKETIO_PING_INTERVAL,
    ping_timeout=config.SOCKETIO_PING_TIMEOUT,
    async_mode=config.SOCKETIO_ASYNC_MODE
)

# Ensure data directory exists
os.makedirs(config.DATA_DIR, exist_ok=True)

# Initialize database (will be called before first request)
# Note: Flask 2.2+ deprecated @app.before_first_request, so we initialize directly
init_db(app)

# Register WebSocket handlers
from routes import websocket
websocket.register_websocket_handlers(socketio)

# Register API routes
from routes import api
app.register_blueprint(api.api)

# Initialize asset watcher
asset_watcher = None

# Initialize playback manager (will be created in websocket handlers)
from playback import PlaybackManager
playback_manager = None

# Routes
@app.route('/')
def index():
    """Redirect root to operator UI."""
    return redirect('/operator')


@app.route('/show')
def show_view():
    """Serve Show View page."""
    return send_from_directory('static/show', 'index.html')


@app.route('/operator')
def operator_ui():
    """Serve Operator UI page."""
    return send_from_directory('static/operator', 'index.html')


if __name__ == '__main__':
    # Start asset watcher
    asset_watcher = AssetWatcher(app)
    asset_watcher.start()
    
    try:
        # Start the server
        socketio.run(app, debug=config.DEBUG, host=config.HOST, port=config.PORT)
    finally:
        # Stop asset watcher on shutdown
        if asset_watcher:
            asset_watcher.stop()

