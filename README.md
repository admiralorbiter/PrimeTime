# PrimeTime - Phase 1A Foundation

Live hype-loop application for PREP-KC Math Relays.

## Phase 1A Status: ✅ Complete

This phase implements the core infrastructure foundation:
- Flask server scaffold with static file serving
- SQLite database with schema and seed data
- WebSocket plumbing with SocketIO namespaces
- Asset watcher for file indexing
- Show View shell with FPS counter
- Operator UI shell with Web Components

## Quick Start

### Prerequisites
- Python 3.10+
- Modern web browser (Chrome recommended for Show View)

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app.py
```

### Testing

1. Open Show View: `http://localhost:5000/show`
   - Press F11 for fullscreen
   - Should see FPS counter in top-right corner
   - Should show "Connected" status

2. Open Operator UI: `http://localhost:5000/operator`
   - Should see three-column layout
   - Status bar should show "Connected"

3. Test ping/pong:
   - Open browser console on either view
   - Run: `socket.emit('PING', { timestamp: Date.now() })`
   - Should receive PONG response

## Project Structure

```
primetime/
  app.py                    # Flask application entry
  models.py                 # SQLAlchemy database models
  database.py               # Database initialization and CRUD
  asset_pipeline.py         # File watcher and indexing
  routes/
    websocket.py            # SocketIO event handlers
  static/
    show/                   # Show View frontend
    operator/               # Operator UI frontend
  assets/                   # Media assets (watched)
  data/                     # SQLite database
```

## Next Steps

Phase 1B will add:
- Video asset validation
- VideoScene renderer
- Timeline loading
- Basic transport controls
- Telemetry reporting

See `docs/11-Roadmap-and-Phased-Plan.md` for full roadmap.

