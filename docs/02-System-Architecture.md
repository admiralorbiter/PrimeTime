# System Architecture

## High-Level
- **Flask Control Server**: Serves Operator UI + Show View; manages assets/timeline; WebSocket hub.
- **Show View (Projector)**: Fullscreen browser page at `/show`. Renders scenes with Canvas/WebGL + `<video>`; listens to SocketIO events.
- **Operator View (Laptop)**: Web UI at `/operator`. Edits timeline, triggers cues, monitors status.
- **Asset Pipeline**: File watcher preprocesses images and validates video/audio, caches metadata.

## Components
- **Backend**
  - Flask
  - Flask-SocketIO (WebSocket)
  - watchdog (filesystem events)
  - Pillow (image scale/EXIF)
  - SQLite (settings/timeline) or TinyDB
  - mutagen/ffprobe (media metadata)
- **Frontend / Renderer**
  - Show View: Canvas/WebGL (PixiJS or vanilla), HTML `<video>`, WebAudio for music/meters.
  - Operator View: React (optional), SocketIO client.

## Process & Communication
- SocketIO namespaces:
  - `/control` (operator → server)
  - `/show` (server → show view)
- Server is the **source of truth** for timeline and current index; show view streams back telemetry (fps, scene, timecode).

## Displays
- Dual-window launch: Projector at `/show` in kiosk/fullscreen; Operator UI at `/operator`.
