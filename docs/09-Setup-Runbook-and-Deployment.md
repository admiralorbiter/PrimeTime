# Setup, Runbook & Deployment

## Environment
- Python 3.10+
- Node (if using React for Operator UI)
- Chrome/Chromium for Show View

## Runbook
1. Place media in `/assets/...`.
2. Launch server (`flask run` or packaged script).
3. Open two windows:
   - **Projector**: `/show` in fullscreen/kiosk.
   - **Operator**: `/operator` on laptop display.
4. Load or build `timeline.json` from Operator UI.
5. Sound check: set master volume; verify no clipping.
6. Go live.

## Packaging
- Simple: `pip install -r requirements.txt`; `npm run build` for Operator UI.
- Optional: PyInstaller/Briefcase to ship a single app bundle.

## Fallbacks
- Export a safe MP4 of the timeline (without live photos) for venues that require files.
- Keep a static sponsor slide on a USB stick.
