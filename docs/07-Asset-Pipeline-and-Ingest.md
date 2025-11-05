# Asset Pipeline & Ingest

## Folders
```
/assets
  /photos
  /videos
  /music
  /logos
/themes
/config
```

## File Watch & Preprocess
- **watchdog** monitors asset folders.
- **Images**: EXIF orientation fix, scale to max ~2200px, thumbnail generation, pHash.
- **Videos**: ffprobe metadata (codec/duration); validate MP4 H.264/AAC; first-frame thumbnail.
- **Audio**: basic metadata; optional loudness measurement (future).

## Caching
- SQLite tables: `assets`, `thumbnails`, `metadata`.
- Preload queue: next scene's textures / first video frame prepared before switch.

## Constraints
- Avoid repeats in slideshow for N minutes.
- Prefer newer photos first (weighted selection).

