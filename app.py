"""Flask application entry point for PrimeTime."""
import os
import time
from flask import Flask, send_from_directory, redirect, jsonify
from flask_socketio import SocketIO
from flask_migrate import Migrate
from dotenv import load_dotenv
from models import db
from database import init_db
from asset_pipeline import AssetWatcher

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='static', static_url_path='')

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_PATH',
    'sqlite:///' + os.path.join(os.path.dirname(__file__), 'data', 'primetime.db')
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['ASSETS_PATH'] = os.environ.get('ASSETS_PATH', os.path.join(os.path.dirname(__file__), 'assets'))

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
# Use 'threading' async mode for Python 3.12 compatibility (eventlet has SSL issues)
socketio = SocketIO(app, cors_allowed_origins="*", ping_interval=25, ping_timeout=60, async_mode='threading')

# Ensure data directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), 'data'), exist_ok=True)

# Initialize database (will be called before first request)
# Note: Flask 2.2+ deprecated @app.before_first_request, so we initialize directly
init_db(app)

# Register WebSocket handlers
from routes import websocket
websocket.register_websocket_handlers(socketio)

# Initialize asset watcher
asset_watcher = None

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


@app.route('/api/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'timestamp': int(time.time())
    })


if __name__ == '__main__':
    # Start asset watcher
    asset_watcher = AssetWatcher(app)
    asset_watcher.start()
    
    try:
        # Start the server
        socketio.run(app, debug=True, host='0.0.0.0', port=5000)
    finally:
        # Stop asset watcher on shutdown
        if asset_watcher:
            asset_watcher.stop()

