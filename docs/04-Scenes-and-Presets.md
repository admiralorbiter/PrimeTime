# Scenes & Presets

## Common Parameters
- `transitionIn/Out`: `cut | fade:ms | cross:ms`
- `overlayTitle`: optional string; rendered as an upper-left bug.
- `brightness`, `gamma`, `saturation`: global tweak per scene (optional).

## VideoScene
- **Params**: `src`, `loop:boolean`, `holdLastFrame:boolean`.
- **Controls**: play/pause, seek, loop; end-action (hold/cut/next).

## PhotoSlideshow
- **Params**: `folder`, `kenBurns:boolean`, `holdEachMs`, `randomize:boolean`, `avoidRepeatMinutes`.
- **Notes**: Images are pre-scaled to max edge ~2200px; EXIF rotate applied.

## TextCards
- **Params**: `lines:[string]`, `layout:"center|lower-third"`, `enter:"slide|fade|zoom"`, `exit:"slide|fade|zoom"`.
- **Use**: slogans, roll-call, sponsor messages.

## Countdown
- **Params**: `from:int (10)`, `style:"big-flash|neon"`, `sound:boolean`.
- **Behavior**: overlays or standalone; `0` triggers optional confetti macro.

## MathVisuals (Presets)
All GPU/Canvas friendly with performance guardrails.

1. **Lissajous Lab**: `{a:int=3, b:int=2, delta:float, trail:int, glow:float}`  
2. **Polar Roses**: `{k:float, rotation:float, petalGlow:float}`  
3. **Spirograph/Epicycles**: `{radii:[...], speed:float}`  
4. **Digits Rain (π/e/primes)**: `{charset:"pi|e|primes", density:0..1, speed:0..1}`  
5. **Ulam Prime Spiral**: `{grid:int, pulse:float}`  
6. **Conway's Game of Life**: `{seed:"gosper|random", stepMs:int}`  
7. **Platonic Solids**: `{type:"tetra|cube|octa|dodeca|icosa", wire:boolean, spinSpeed:float}`  
8. **Voronoi Flow**: `{sites:int, flowSpeed:float}`  
9. **Vector Field Swirls**: `{noiseScale:float, particleCount:int}`  
10. **Mandelbrot/Julia**: `{zoom:float<=1.5, hueCycle:float}`

### Default Rotation (good show mix)
- PhotoSlideshow (3–4s each) → Lissajous → TextCard → Video → Polar Roses → π Rain → TextCard → Video → Countdown.
