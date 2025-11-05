# Timeline & Data Contracts

## Timeline JSON (authoritative)
```json
{
  "name": "Math Relays 2025",
  "theme": "neon-chalkboard",
  "items": [
    {
      "id": "intro-video",
      "sceneType": "VideoScene",
      "params": { "src": "/assets/videos/intro.mp4", "overlayTitle": "Welcome" },
      "duration": "auto",
      "transitionIn": "fade:800",
      "transitionOut": "fade:500",
      "notes": "Open the room"
    },
    {
      "id": "photo-loop",
      "sceneType": "PhotoSlideshow",
      "params": { "folder": "/assets/photos", "kenBurns": true, "holdEachMs": 3500 },
      "duration": 180000,
      "transitionIn": "cross:700",
      "transitionOut": "cross:700"
    },
    {
      "id": "math-pack",
      "sceneType": "MathVisuals",
      "params": { "preset": "lissajous", "speed": 1.0, "density": 0.8 },
      "duration": 60000,
      "transitionIn": "fade:600",
      "transitionOut": "fade:300"
    },
    {
      "id": "awards-countdown",
      "sceneType": "Countdown",
      "params": { "from": 10, "style": "big-flash" },
      "duration": "auto",
      "transitionIn": "cut",
      "transitionOut": "cut"
    }
  ]
}
```

### Field Notes
- `duration`: `"auto"` means **VideoScene** uses media duration; **Countdown** uses computed duration; others in ms.
- `transitionIn`/`Out`: `"fade:ms"`, `"cross:ms"`, `"cut"`.
- `params` are scene-specific. See `04-Scenes-and-Presets.md`.

## Asset Metadata (cached in DB)
```json
{
  "id": "a_01he9j...",
  "type": "photo|video|music|logo",
  "path": "/assets/photos/IMG_1234.jpg",
  "width": 1920,
  "height": 1280,
  "hash": "phash-...",
  "addedAt": 1730745600
}
```

## Theme JSON
```json
{
  "id": "neon-chalkboard",
  "palette": { "bg": "#0f1115", "fg": "#F4F4F4", "accent": ["#39FF14","#00E5FF","#FF3AF2","#FFE600"] },
  "fonts": { "heading": "Bebas Neue", "body": "Inter" },
  "motion": { "easing": "easeOutQuad", "defaultMs": 350 },
  "gammaLift": 0.1,
  "confetti": { "particleCount": 150, "spread": 65, "decay": 0.92 }
}
```
