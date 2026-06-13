# Hero video

Drop the homepage hero video here:

- `hero.mp4` — required. ~10–20s loop, no audio, H.264, max ~3 MB.
  - Recommended: 1280×720, 30fps, target 1.5–2 Mbps bitrate.
  - Generate with ffmpeg, e.g.:
    ```
    ffmpeg -i source.mov -an -vf "scale=1280:-2,fps=30" \
      -c:v libx264 -preset slow -crf 23 -movflags +faststart hero.mp4
    ```
- `hero-poster.jpg` — optional fallback shown before the video loads (or for browsers that block autoplay).
  - 1280×720, JPEG, ~100–200 KB.

The hero detects the files at request time. No code change is needed — just add the file and refresh.
