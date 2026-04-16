#!/bin/bash
# Optimize hero demo videos for web delivery.
#
# Requires: ffmpeg (install on Windows: winget install ffmpeg, or https://ffmpeg.org)
# Usage:   bash scripts/optimize-videos.sh
#
# Targets:
#   - H.264 baseline profile (maximum browser compatibility incl. iOS Safari)
#   - 1080p max, 30fps
#   - CRF 26 (visually near-lossless for screen recordings)
#   - AAC 128k audio
#   - +faststart (moov atom at front = instant playback start while buffering)
#   - yuv420p (required for most browsers)
#
# Expected compression: 27 MB → ~3-5 MB per video (~80% reduction)
# Also extracts poster JPG (first frame) for each video.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VIDEOS_DIR="$REPO_ROOT/apps/web/public/videos"
ORIG_DIR="$VIDEOS_DIR/originals"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ERROR: ffmpeg not found in PATH."
  echo "Install:"
  echo "  Windows: winget install ffmpeg   (or https://ffmpeg.org/download.html)"
  echo "  macOS:   brew install ffmpeg"
  echo "  Linux:   sudo apt install ffmpeg"
  exit 1
fi

mkdir -p "$ORIG_DIR"

echo "Videos dir: $VIDEOS_DIR"
echo "Originals backup: $ORIG_DIR"
echo ""
echo "Before:"
ls -lh "$VIDEOS_DIR"/demo-*.mp4 2>/dev/null || true
echo ""

for name in 1 2 3 4 budget; do
  SRC="$VIDEOS_DIR/demo-$name.mp4"
  if [ ! -f "$SRC" ]; then
    echo "skip demo-$name.mp4 (not found)"
    continue
  fi

  # Backup original once
  if [ ! -f "$ORIG_DIR/demo-$name.mp4" ]; then
    cp "$SRC" "$ORIG_DIR/demo-$name.mp4"
    echo "backup -> $ORIG_DIR/demo-$name.mp4"
  fi

  echo "encoding demo-$name.mp4 ..."
  # QHD 2560x1440 max, lanczos scaling (sharp thin lines), main profile (wider than baseline
  # but still universally supported), CRF 20 (visually lossless for screen content).
  # -g 30 -keyint_min 30 -sc_threshold 0 → keyframe every 1s (fixes mid-GOP autoplay artifacts).
  ffmpeg -hide_banner -loglevel error -y \
    -i "$ORIG_DIR/demo-$name.mp4" \
    -c:v libx264 -profile:v main -level 4.0 \
    -vf "scale='min(2560,iw)':'-2':flags=lanczos,fps=30" \
    -crf 20 -preset slow -pix_fmt yuv420p -tune animation \
    -g 30 -keyint_min 30 -sc_threshold 0 \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    "$SRC.tmp.mp4"
  mv "$SRC.tmp.mp4" "$SRC"

  # Extract poster image from 1s mark (avoids black intro frame)
  ffmpeg -hide_banner -loglevel error -y \
    -ss 00:00:01 -i "$SRC" -vframes 1 -q:v 3 \
    "$VIDEOS_DIR/demo-$name-poster.jpg"

  echo "  done demo-$name.mp4 + poster"
done

echo ""
echo "After:"
ls -lh "$VIDEOS_DIR"/demo-*.mp4
echo ""
echo "Posters:"
ls -lh "$VIDEOS_DIR"/demo-*-poster.jpg 2>/dev/null || true
echo ""
echo "Next: commit the compressed videos + posters. To update <video> poster attrs, use /videos/demo-N-poster.jpg"
