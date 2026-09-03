#!/usr/bin/env python3
"""
Cut a person out of a clip, frame by frame, so captions can pass BEHIND them.

WHY THIS EXISTS
---------------
"Text behind the subject" is not a caption feature — it is a COMPOSITING order:

    background  →  captions  →  the person, cut out, on top

Remotion can already stack those three layers. The only thing it cannot do by
itself is decide which pixels are "the person", and that is what this script
produces: one RGBA PNG per frame where the person is opaque and everything else
is transparent. Drop that sequence on top of the captions and the text is
occluded by the body for free.

⭐ THE MATTE IS THE WHOLE JOB. Everything downstream is layer order.

WHAT IT USES
------------
MediaPipe's Selfie Segmenter (244 KB, float16). Runs locally, offline, no API
key and no per-frame cost. It is built for exactly this shot — one person,
upper body, facing camera — which is why it is small and fast. It is NOT a
general object matter: give it two people, a hand crossing the face, or hair
against a busy background and the edge will show.

🪤 EDGE QUALITY IS THE WHOLE GAME AND THIS MODEL IS THE CHEAP END. The
confidence mask is soft; thresholding it hard gives a crunchy outline, so the
mask is fed straight in as alpha and then eroded very slightly to pull the edge
inside the subject. A halo of background pixels riding along the shoulder is the
tell that separates this from a real roto job.

USAGE
-----
    python3 scripts/build-person-matte.mjs.py public/talking/M1.mp4 public/talking/matte-m1
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

MODEL = "/tmp/selfie_segmenter.tflite"


def extract_frames(src: Path, tmp: Path) -> list[Path]:
    tmp.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(src), "-vsync", "0", str(tmp / "%05d.png")],
        check=True,
    )
    return sorted(tmp.glob("*.png"))


def main() -> None:
    src = Path(sys.argv[1])
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)

    tmp = Path("/tmp/_matte_frames")
    for old in tmp.glob("*.png"):
        old.unlink()
    frames = extract_frames(src, tmp)
    print(f"{len(frames)} frames extracted from {src.name}")

    options = vision.ImageSegmenterOptions(
        base_options=BaseOptions(model_asset_path=MODEL),
        running_mode=vision.RunningMode.VIDEO,
        output_confidence_masks=True,
    )

    written = 0
    with vision.ImageSegmenter.create_from_options(options) as segmenter:
        for i, f in enumerate(frames):
            rgb = Image.open(f).convert("RGB")
            arr = np.asarray(rgb)
            mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=arr)
            # VIDEO mode wants a monotonically increasing timestamp in ms.
            result = segmenter.segment_for_video(mp_img, int(i * 1000 / 30))

            # Index 0 is the person channel for the selfie segmenter.
            conf = np.squeeze(result.confidence_masks[0].numpy_view())
            alpha = np.clip(conf * 255.0, 0, 255).astype(np.uint8)
            a = Image.fromarray(alpha, mode="L")

            # 🪤 Pull the edge INSIDE the subject. MinFilter is an erosion, and
            #    one pixel is enough to drop the background halo that otherwise
            #    rides along a shoulder and reads as a cheap cut-out.
            a = a.filter(ImageFilter.MinFilter(3))
            a = a.filter(ImageFilter.GaussianBlur(0.6))

            cut = rgb.convert("RGBA")
            cut.putalpha(a)
            cut.save(out / f"{i:05d}.png")
            written += 1

    print(f"wrote {written} RGBA cut-outs to {out}")


if __name__ == "__main__":
    main()
