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

## TL;DR
- **Renderer:** Fullscreen browser Show View (Canvas/WebGL + HTML5 `<video>`/WebAudio).
- **Backend:** Flask + Flask-SocketIO; watches assets; persists timeline/settings.
- **Operator UI:** Web app for timeline, scene params, and live cues.
- **Media:** MP4 H.264/AAC (video), MP3/MP4 (audio), JPG/PNG (images), 1080p target.
- **Signature:** Neon Chalkboard theme; math visual presets; 10→0 countdown macro.
