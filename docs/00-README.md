# Prime Time — Design Docs
**Date:** 2025-11-04  
**Owner:** Jonathan Lane  
**Scope:** Single-operator, preplanned show with music, videos, photo slideshow, math visuals, big-text interstitials, and a triggerable awards countdown.

## Contents
- `01-Product-Vision-and-Scope.md`
- `02-System-Architecture.md`
- `03-Timeline-and-Data-Contracts.md`
- `04-Scenes-and-Presets.md`
- `05-Operator-UI-Design.md`
- `06-WebSocket-Events-and-API.md`
- `07-Asset-Pipeline-and-Ingest.md`
- `08-Performance-and-Reliability.md`
- `09-Setup-Runbook-and-Deployment.md`
- `10-Acceptance-Tests-and-QA.md`
- `11-Roadmap-and-Phased-Plan.md`
- `12-Database-Schema-and-Persistence.md`
- `13-State-Machine-and-Playback-Logic.md`
- `14-Error-Handling-and-Validation.md`
- `15-Frontend-Technology-and-Setup.md`
- `16-Testing-Strategy.md`

## TL;DR
- **Renderer:** Fullscreen browser Show View (PixiJS WebGL + HTML5 `<video>`/WebAudio).
- **Backend:** Flask + Flask-SocketIO; SQLite database; watches assets; persists timeline/settings.
- **Operator UI:** Vanilla JS + Web Components; timeline editor, scene params, and live cues.
- **Media:** MP4 H.264/AAC (video), MP3/M4A (audio), JPG/PNG (images), 1080p target.
- **Signature:** Neon Chalkboard theme; math visual presets; 10→0 countdown macro.
