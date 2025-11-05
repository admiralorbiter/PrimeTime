"""Configuration settings for PrimeTime application."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).parent

# Flask Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
SQLALCHEMY_DATABASE_URI = os.environ.get(
    'DATABASE_PATH',
    f'sqlite:///{BASE_DIR / "data" / "primetime.db"}'
)
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Asset paths
ASSETS_PATH = os.environ.get('ASSETS_PATH', str(BASE_DIR / 'assets'))
ASSETS_PHOTOS = os.path.join(ASSETS_PATH, 'photos')
ASSETS_VIDEOS = os.path.join(ASSETS_PATH, 'videos')
ASSETS_MUSIC = os.path.join(ASSETS_PATH, 'music')
ASSETS_LOGOS = os.path.join(ASSETS_PATH, 'logos')

# Data directory
DATA_DIR = BASE_DIR / 'data'

# SocketIO Configuration
SOCKETIO_CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
SOCKETIO_PING_INTERVAL = int(os.environ.get('SOCKETIO_PING_INTERVAL', '25'))
SOCKETIO_PING_TIMEOUT = int(os.environ.get('SOCKETIO_PING_TIMEOUT', '60'))
SOCKETIO_ASYNC_MODE = os.environ.get('SOCKETIO_ASYNC_MODE', 'threading')

# Asset Validation Configuration
MAX_VIDEO_SIZE_MB = 500
MAX_IMAGE_SIZE_MB = 50
MAX_AUDIO_SIZE_MB = 100
MAX_VIDEO_RESOLUTION = (1920, 1080)
MAX_IMAGE_DIMENSIONS = (6000, 6000)

# Playback Configuration
TIMECODE_UPDATE_INTERVAL_MS = 500  # Server sends timecode updates every 500ms
STATUS_UPDATE_INTERVAL_MS = 1000   # Show View sends status updates every 1s

# Development Configuration
DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
PORT = int(os.environ.get('FLASK_PORT', '5000'))

