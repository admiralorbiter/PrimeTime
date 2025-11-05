# System Architecture

## High-Level
- **Flask Control Server**: Serves Operator UI + Show View; manages assets/timeline; WebSocket hub.
- **Show View (Projector)**: Fullscreen browser page at `/show`. Renders scenes with Canvas/WebGL + `<video>`; listens to SocketIO events.
- **Operator View (Laptop)**: Web UI at `/operator`. Edits timeline, triggers cues, monitors status.
- **Asset Pipeline**: File watcher preprocesses images and validates video/audio, caches metadata.

## Components
- **Backend**
  - Flask
  - Flask-SQLAlchemy (ORM for SQLite database)
  - Flask-Migrate (database migrations)
  - Flask-SocketIO (WebSocket)
  - watchdog (filesystem events)
  - Pillow (image scale/EXIF)
  - SQLite (settings/timeline/assets/thumbnails)
  - mutagen/ffprobe (media metadata)
- **Frontend / Renderer**
  - Show View: PixiJS v7 (WebGL), Canvas 2D API, native HTML5 `<video>`, Web Audio API
  - Operator UI: Vanilla JavaScript (ES2020+), Web Components (Custom Elements), CSS Grid/Flexbox
  - Socket.io-client (vanilla JS) for both operator and show view
  - No build tools required for development (Flask serves static files directly)

## Process & Communication
- SocketIO namespaces:
  - `/control` (operator → server)
  - `/show` (server → show view)
- Server is the **source of truth** for timeline and current index; show view streams back telemetry (fps, scene, timecode).

## Displays
- Dual-window launch: Projector at `/show` in kiosk/fullscreen; Operator UI at `/operator`.

## Folder Structure

```
primetime/
  app.py                    # Flask application entry
  database.py               # SQLite DB operations
  asset_pipeline.py         # File watching, preprocessing
  asset_validator.py        # Media validation logic
  playback.py               # State machine, timeline management
  routes/                   # Flask route handlers
    api.py                  # REST API endpoints
    operator.py             # Operator UI route
    show.py                 # Show View route
  static/
    show/                   # Show View frontend
      index.html
      show.js
      scenes/               # Scene renderers
      utils/
    operator/               # Operator UI frontend
      index.html
      operator.js
      components/           # Web Components
      styles/
      utils/
    shared/                 # Shared utilities
      api.js
      timeline-validator.js
  assets/                   # Media assets (watched)
    photos/
    videos/
    music/
    logos/
  themes/                   # Theme JSON files
  config/                   # Configuration files
  logs/                     # Application logs
  data/                     # SQLite database
    primetime.db
  tests/                    # Test suite
    unit/
    integration/
    e2e/
    fixtures/
```
