# State Machine & Playback Logic

## Overview
The playback system uses a state machine to manage transitions between scenes, handle user input, and recover from errors or disconnections. The server is the source of truth for current state.

## States

### `IDLE`
Initial state, no timeline loaded or playback stopped.

- **Entry**: Server start, timeline cleared, or explicit stop
- **Actions**: Show View displays black/standby screen
- **Transitions**: → `LOADING` (on `SHOW_LOAD_TIMELINE`)

### `LOADING`
Preparing next scene: loading assets, textures, or video buffers.

- **Entry**: Beginning scene transition, or after `SHOW_LOAD_TIMELINE`
- **Actions**: Show View preloads scene assets, reports `ASSET_PRELOAD_DONE`
- **Timeout**: 5 seconds max, then → `ERROR` if failed
- **Transitions**: → `PLAYING` (assets ready + play command) | → `PAUSED` (assets ready + pause) | → `ERROR` (load failure)

### `PLAYING`
Active playback of current scene.

- **Entry**: Assets loaded + `SHOW_PLAY` received
- **Actions**: Scene renders, timecode advances, telemetry sent periodically
- **Transitions**: → `PAUSED` (on pause) | → `TRANSITIONING` (scene end or skip) | → `BLACKOUT` (on blackout cue) | → `ERROR` (runtime failure)

### `PAUSED`
Playback halted, holding current frame/position.

- **Entry**: `SHOW_PAUSE` received, or hold button pressed
- **Actions**: Scene frozen, timecode stopped
- **Transitions**: → `PLAYING` (on resume) | → `TRANSITIONING` (skip/next while paused) | → `BLACKOUT` (on blackout cue)

### `TRANSITIONING`
Crossfading or cutting between scenes.

- **Entry**: Current scene ending, or `SHOW_JUMP`/`SHOW_SKIP` received
- **Actions**: Transition animation plays (fade/cross/cut), next scene starts loading
- **Duration**: Transition duration from timeline item (e.g., `fade:800` = 800ms)
- **Transitions**: → `LOADING` (transition complete, prepare next) | → `PLAYING` (if auto-play) | → `IDLE` (end of timeline)

### `BLACKOUT`
Screen forced to black (overlay or full screen).

- **Entry**: `SHOW_BLACKOUT { on: true }` received
- **Actions**: Black screen displayed, audio may continue or mute
- **Transitions**: → `PLAYING`/`PAUSED` (previous state restored on `{ on: false }`)

### `ERROR`
Scene failed to load or runtime error occurred.

- **Entry**: Asset missing, codec unsupported, decode failure, timeout
- **Actions**: Error logged, operator notified, fallback scene shown (text card with error message or skip)
- **Recovery**: Auto-skip to next scene after 2 seconds, or operator manual skip
- **Transitions**: → `LOADING` (skip to next) | → `IDLE` (if end of timeline)

## State Transitions Diagram

```
IDLE → LOADING → PLAYING ↔ PAUSED
                ↓         ↓
         TRANSITIONING ← ┘
                ↓
          LOADING (next)
                ↓
         PLAYING/PAUSED

BLACKOUT ← (can interrupt any state)
         → (returns to previous state)

ERROR → (auto-recover to LOADING next)
```

## Clock Synchronization

### Problem
Operator UI and Show View run on separate clocks. Need consistent timecode for seeking, display, and telemetry.

### Solution: Server Authoritative Time

**Server maintains master clock:**
- On `SHOW_PLAY`, server records `playback_start_time` (Unix timestamp in ms)
- Server calculates `elapsed_ms = now - playback_start_time + initial_offset`
- Server sends periodic `SHOW_SET_TIMECODE { timecodeMs }` events (every 500ms)

**Show View uses server timecode:**
- Receives `SHOW_SET_TIMECODE`, stores as `serverTimecodeMs`
- Local rendering interpolates between server updates using `requestAnimationFrame` delta
- Reports back via `SHOW_STATUS { timecodeMs, sceneId, itemIndex }` (every 1 second)

**Seeking:**
- Operator sends `SHOW_JUMP { index }` or seek within scene
- Server resets `playback_start_time`, sends `SHOW_SET_TIMECODE` with new value
- Show View immediately updates local timecode

### Handling Drift
- If Show View reports timecode > 100ms off from server calculation, server sends correction
- Network lag is handled by using monotonic clock (performance.now) locally and sync messages from server

## Preloading Strategy

### When to Preload
- **During current scene**: When current scene is > 75% complete, start loading next scene assets
- **On timeline load**: Preload first scene immediately
- **On skip/jump**: Cancel in-flight loads, load target scene

### What to Preload
- **VideoScene**: Video element created, `load()` called, first frame ready
- **PhotoSlideshow**: First 3-5 images as Canvas Image objects
- **MathVisuals**: Shader programs compiled, GPU buffers allocated
- **TextCards**: Fonts loaded (if not already), text metrics calculated

### Preload Queue
- Maintain queue of next 2-3 scenes
- Priority: current → next → next+1
- If memory pressure, drop items beyond "next"

## Recovery & Reconnection

### WebSocket Disconnect (Show View)
1. **Show View detects disconnect**: Stop rendering, show "reconnecting" message
2. **Auto-reconnect**: Socket.IO client attempts reconnect with exponential backoff
3. **On reconnect**: 
   - Server sends `SHOW_LOAD_TIMELINE { timeline }` with current timeline
   - Server sends `SHOW_JUMP { index: playback_state.current_index }`
   - Server sends `SHOW_SET_TIMECODE { timecodeMs: playback_state.timecode_ms }`
   - If `playback_state.is_playing`, server sends `SHOW_PLAY`
   - Show View resumes from correct position

### WebSocket Disconnect (Operator UI)
- Operator UI shows disconnected badge, transport controls disabled
- Auto-reconnect with same exponential backoff
- On reconnect: Request current timeline and state via `TIMELINE_SAVE {}` (read) or new `TIMELINE_GET {}` event

### Server Restart
- `playback_state` table preserved in DB
- On startup, server loads active timeline and resumes state
- Show View must reconnect to receive new timeline

### Graceful Shutdown
- Server sends `SHOW_PAUSE {}` to all connected Show Views
- Saves current playback state to DB
- Closes WebSocket connections cleanly

## Timeline Navigation

### Playback Flow
1. Start at `timeline.items[0]`
2. Play scene for `duration` (or `auto` for video/countdown)
3. Apply `transitionOut` when scene ends
4. Move to `next_index = current_index + 1`
5. Apply `transitionIn` of next scene
6. Loop if `next_index >= items.length` (depending on timeline loop setting)

### Skip/Jump Commands
- `SHOW_SKIP { delta: +1 }`: Next scene
- `SHOW_SKIP { delta: -1 }`: Previous scene
- `SHOW_JUMP { index: N }`: Jump to specific item index
- State transitions: `PLAYING/PAUSED` → `TRANSITIONING` → `LOADING` → `PLAYING/PAUSED`

### Hold Command
- `SHOW_HOLD { on: true }`: Freeze current scene, pause timecode
- `SHOW_HOLD { on: false }`: Resume from frozen position
- Useful for operator to pause without losing position

## Implementation Notes

### Server State Tracking
```python
class PlaybackState:
    current_timeline: dict
    current_index: int
    timecode_ms: int
    is_playing: bool
    playback_start_time: float  # Unix timestamp in ms
    state: str  # IDLE, LOADING, PLAYING, etc.
```

### Show View State
```javascript
class ShowViewState {
    timeline: Timeline
    currentIndex: number
    currentScene: Scene | null
    state: 'IDLE' | 'LOADING' | 'PLAYING' | 'PAUSED' | 'TRANSITIONING' | 'ERROR'
    serverTimecodeMs: number
    localTimecodeMs: number  // Interpolated
}
```
