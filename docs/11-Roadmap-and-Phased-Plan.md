# Roadmap & Phased Plan

## Overview
Phase 1 is broken down into vertical slices (1A-1K), each delivering independently testable functionality. Slices are ordered to prove architecture early, deliver incremental value, and defer complexity until core UX works.

## Phase 1A: Foundation (Core Infrastructure)

1. **Flask server scaffold** - basic routes, static serving, config loading
2. **SQLite schema** - create tables, seed data, basic CRUD
3. **WebSocket plumbing** - SocketIO namespaces, connection/reconnection
4. **Asset watcher** - watchdog integration, basic file indexing
5. **Show View shell** - blank canvas, SocketIO connection, FPS counter
6. **Operator UI shell** - Vanilla JS app, basic layout with Web Components, SocketIO connection

**Acceptance**: Two browser windows connect to server, see FPS counter, exchange ping/pong messages.

## Phase 1B: Video Playback (First Vertical Slice)

1. **Video asset validation** - ffprobe codec check, thumbnail extraction
2. **VideoScene renderer** - HTML5 `<video>` element, play/pause/seek
3. **Timeline with 1 video** - load timeline JSON, send SHOW_PLAY event
4. **Operator transport controls** - Play/Pause/Next buttons work
5. **Telemetry** - Show View reports timecode back to operator

**Acceptance**: Load a 1-item timeline with MP4, press play, video plays, see timecode updating.

## Phase 1C: Photo Slideshow (Second Feature)

1. **Image preprocessing** - EXIF rotation, scale to 2200px, thumbnail
2. **PhotoSlideshow scene** - Canvas texture loading, crossfade transitions
3. **Ken Burns effect** - slow zoom/pan with easing
4. **Live asset injection** - new photo appears in running slideshow
5. **Timeline with video + photos** - transition between scene types

**Acceptance**: 2-item timeline (video → photos), smooth crossfade, new photo hot-added during playback.

## Phase 1D: Timeline Editor (Operator UX)

1. **Asset bins UI** - display thumbnails from DB, drag-and-drop
2. **Timeline track** - visual cards for each item, reorder, delete
3. **Inspector panel** - edit scene params (duration, transitions)
4. **Save/load timeline** - persist to DB, validation warnings
5. **Hotkeys** - Space, ←/→, basic transport

**Acceptance**: Build a 5-item timeline from UI, save, reload, playback matches edited sequence.

## Phase 1E: Text Cards (Simple Scene)

1. **TextCards renderer** - Canvas text rendering with theme fonts
2. **Animation presets** - slide/fade/zoom enter/exit
3. **Timeline integration** - add text card items via operator UI
4. **Quick cue** - "Show Text" live cue with input field

**Acceptance**: Insert text card between video/photos, animate in/out, trigger ad-hoc text via cue.

## Phase 1F: Countdown (Signature Feature)

1. **Countdown scene** - large numerals, theme styling
2. **Timing precision** - exactly 1 second per number
3. **Sound effects** - tick sound, air horn at zero
4. **Confetti trigger** - particle system fires at 0
5. **Live cue button** - countdown 10/5/3 from any moment

**Acceptance**: Countdown runs 10→0 in exactly 10s, confetti fires, operator can trigger mid-show.

## Phase 1G: Math Visuals (3 Core Presets)

1. **GPU rendering base** - PixiJS setup, shader pipeline
2. **Lissajous Lab** - first preset, parameterized
3. **Polar Roses** - second preset
4. **Digits Rain (π)** - third preset
5. **Performance monitoring** - FPS backoff if < 55fps

**Acceptance**: Timeline with all 3 math presets, each sustains 60fps, parameters adjustable.

## Phase 1H: Music Playback (Audio Layer)

1. **Web Audio API** - load/decode MP3, play/pause/volume
2. **Background music track** - plays independently of scenes
3. **Volume control** - operator master volume slider
4. **Audio meters** - visual feedback in operator UI
5. **Crossfade** - smooth transition between music tracks

**Acceptance**: Music plays under photo slideshow, volume adjustable live, smooth track changes.

## Phase 1I: Themes and Polish

1. **Neon Chalkboard theme** - apply palette to all scenes
2. **Transition system** - fade/cross/cut with proper timing
3. **Preloading** - next scene textures load during current scene
4. **Error UI** - toasts for missing files, warnings panel
5. **Preview window** - mini show view in operator UI

**Acceptance**: Theme colors consistent, transitions smooth < 300ms, error handling graceful.

## Phase 1J: Remaining Math Visuals (Complete Set)

1. **Ulam Prime Spiral**
2. **Conway's Game of Life**
3. **Platonic Solids** (WebGL)
4. **Voronoi Flow**
5. **Vector Field Swirls**
6. **Mandelbrot/Julia**
7. **Spirograph/Epicycles**

**Acceptance**: All 10 math presets available, configurable, performant.

## Phase 1K: Integration Testing & Production Readiness

1. **Build 20-minute test timeline** - all scene types, realistic show flow
2. **Dual-screen setup** - kiosk mode script, runbook validation
3. **Pytest suite** - asset validation, state machine, API endpoints
4. **Performance benchmarks** - sustained 60fps for full timeline
5. **Packaging script** - requirements.txt, build commands, launcher

**Acceptance**: Full timeline runs for 20+ minutes without errors, all acceptance tests pass.

## Phase 2 — Live Polish (Future)

- Beat-aware swaps (offline BPM grid)
- Sponsor ticker; school roll-call
- Confetti particles with physics and stingers
- Stream Deck / hotkeys mapping UI

## Phase 3 — Deluxe (Future)

- External scoreboard (Google Sheet); winner reveal cards
- Face-blur and NSFW guard; NDI/OBS; DMX/Art-Net bridge
- Highlight auto-export; analytics (photos shown, FPS histograms)
