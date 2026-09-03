#!/usr/bin/env python3
"""
Find, for every frame, where a caption can sit WITHOUT covering the subject.

⭐⭐⭐⭐ THIS IS THE ONE THE OWNER MEANS BY "ANIMATED CAPTIONS".
Not captions hidden BEHIND the body — captions placed in the negative space
AROUND it, moving as the subject moves, so every word stays fully readable.
85% of short-form is watched with sound off: a word behind a jaw is content
lost, not a stylish effect.

WHAT IT DOES
------------
Same MediaPipe matte as `build-person-matte.py`, used the opposite way. Instead
of compositing the person on top of the text, it asks the mask where the person
ISN'T, and writes the best caption position per frame to JSON. Remotion then
just reads the JSON.

    person mask  ──┬─→ composite on top      = captions BEHIND  (occlusion)
                   └─→ find the empty space  = captions AROUND  (this file)

THE SEARCH
----------
A coarse grid of candidate caption boxes is scored by how much subject alpha
falls inside each one; lowest wins. Three things stop that from being naive:

🪤 SAFE ZONES. TikTok's own UI eats the right edge (action buttons) and the
   bottom fifth (caption, handle, music). A caption placed there is technically
   off the subject and still unreadable in the app, so those bands are excluded
   before scoring rather than penalised after.

🪤 A CENTRE BIAS. Pure "least subject coverage" parks the text in a corner every
   time, which looks like a mistake rather than a decision. A mild pull toward
   the horizontal centre and the upper-middle keeps it looking composed.

🪤 TEMPORAL SMOOTHING, AND IT IS THE WHOLE DIFFERENCE BETWEEN THIS AND JITTER.
   Scoring each frame independently makes the box twitch every time the subject
   breathes. The path is smoothed with an exponential moving average, and a
   dead-zone stops sub-threshold movement entirely — the caption holds still
   until there is a real reason to move, then glides.

USAGE
-----
    python3 scripts/build-caption-placement.py public/talking/M1.mp4 \\
        public/talking/placement-m1.json
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

MODEL = "/tmp/selfie_segmenter.tflite"

# The caption box, as a fraction of the frame. Generous on purpose — the box is
# what must stay clear, so over-estimating it is the safe direction.
BOX_W = 0.66
BOX_H = 0.10

# 🪤 Excluded before scoring, not penalised after. See the safe-zone note above.
SAFE_TOP = 0.06
SAFE_BOTTOM = 0.78   # everything below this is TikTok's own furniture
SAFE_RIGHT = 0.86    # the action-button rail

# How strongly to pull toward a composed position rather than the emptiest one.
CENTRE_BIAS = 0.22
PREFERRED_Y = 0.34

EMA = 0.18           # lower = smoother, slower to move
DEAD_ZONE = 0.012    # below this, do not move at all


def extract_frames(src: Path, tmp: Path) -> list[Path]:
    tmp.mkdir(parents=True, exist_ok=True)
    for old in tmp.glob("*.png"):
        old.unlink()
    subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(src), "-vsync", "0", str(tmp / "%05d.png")],
        check=True,
    )
    return sorted(tmp.glob("*.png"))


def best_slot(mask: np.ndarray) -> tuple[float, float]:
    """Return the (cx, cy) of the emptiest allowed caption box, normalised."""
    h, w = mask.shape
    bw, bh = int(w * BOX_W), int(h * BOX_H)

    # Integral image makes every candidate an O(1) lookup instead of a sum.
    integral = mask.cumsum(axis=0).cumsum(axis=1)

    def coverage(x0: int, y0: int) -> float:
        x1, y1 = min(x0 + bw, w) - 1, min(y0 + bh, h) - 1
        total = integral[y1, x1]
        if x0 > 0:
            total -= integral[y1, x0 - 1]
        if y0 > 0:
            total -= integral[y0 - 1, x1]
        if x0 > 0 and y0 > 0:
            total += integral[y0 - 1, x0 - 1]
        return float(total) / (bw * bh * 255.0)

    best, best_score = (0.5, PREFERRED_Y), float("inf")
    for yf in np.linspace(SAFE_TOP, SAFE_BOTTOM - BOX_H, 26):
        for xf in np.linspace(0.0, SAFE_RIGHT - BOX_W, 9):
            x0, y0 = int(xf * w), int(yf * h)
            cx, cy = xf + BOX_W / 2, yf + BOX_H / 2
            # Distance from a composed position, so ties break toward centre.
            bias = ((cx - 0.5) ** 2 + (cy - PREFERRED_Y) ** 2) ** 0.5
            score = coverage(x0, y0) + CENTRE_BIAS * bias
            if score < best_score:
                best, best_score = (cx, cy), score
    return best


def main() -> None:
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    frames = extract_frames(src, Path("/tmp/_place_frames"))
    print(f"{len(frames)} frames from {src.name}")

    options = vision.ImageSegmenterOptions(
        base_options=BaseOptions(model_asset_path=MODEL),
        running_mode=vision.RunningMode.VIDEO,
        output_confidence_masks=True,
    )

    raw: list[tuple[float, float]] = []
    with vision.ImageSegmenter.create_from_options(options) as seg:
        for i, f in enumerate(frames):
            arr = np.asarray(Image.open(f).convert("RGB"))
            res = seg.segment_for_video(
                mp.Image(image_format=mp.ImageFormat.SRGB, data=arr),
                int(i * 1000 / 30),
            )
            conf = np.squeeze(res.confidence_masks[0].numpy_view())
            # Downsample hard — placement needs shape, not detail, and this is
            # the difference between seconds and minutes over a whole clip.
            small = np.array(
                Image.fromarray((np.clip(conf, 0, 1) * 255).astype(np.uint8)).resize(
                    (135, 240)
                )
            )
            raw.append(best_slot(small))

    # 🪤 Smooth, then dead-zone. Without this the box twitches every frame.
    sx, sy = raw[0]
    path = []
    for cx, cy in raw:
        nx = sx + EMA * (cx - sx)
        ny = sy + EMA * (cy - sy)
        if ((nx - sx) ** 2 + (ny - sy) ** 2) ** 0.5 > DEAD_ZONE:
            sx, sy = nx, ny
        path.append({"x": round(sx, 4), "y": round(sy, 4)})

    out.write_text(json.dumps(path))
    ys = [p["y"] for p in path]
    print(f"wrote {len(path)} placements to {out}")
    print(f"y range {min(ys):.2f} → {max(ys):.2f} (the caption moves this much)")


if __name__ == "__main__":
    main()
