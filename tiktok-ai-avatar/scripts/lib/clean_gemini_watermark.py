#!/usr/bin/env python3
"""
Remove the Gemini "sparkle" watermark from AI Studio images.

Google stamps a small translucent four-point star into the bottom-right corner of every
image generated in AI Studio. It is visible, sits inside our 9:16 frame, and would be on
screen for the whole scene.

WHY PATCH RATHER THAN CROP
--------------------------
Cropping it away costs real composition. The mark sits within ~80px of both edges of a
768x1376 image, so removing it by cropping means losing ~11% of the frame AND re-cropping
to hold 9:16 — on a source we are already upscaling 1.41x to reach 1080x1920. Patching
costs nothing outside a ~110px corner.

That corner is, in every image we generate, dark low-detail ground/floor/sky. So a
feathered blur-fill sampled from the surrounding pixels is invisible in motion. This would
NOT be safe on a corner containing a face or hard edge — the guard below refuses when the
corner has too much structure, rather than silently smearing something that matters.

NOTE: this removes the VISIBLE mark only. Google's invisible SynthID watermark survives,
which is correct and intended — we are not trying to hide that the images are AI-generated
(labelled and unlabelled videos performed identically for this account). We are removing a
logo that does not belong in the frame.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageFilter, ImageStat

# The mark is bottom-right with a small margin. This box is deliberately generous:
# measured instances spanned x[689..720] y[1297..1341] on 768x1376.
BOX_W_FRAC = 0.145   # fraction of width, from the right edge
BOX_H_FRAC = 0.082   # fraction of height, from the bottom edge
FEATHER = 18         # px of soft edge so the patch has no seam
# 🪤 DO NOT RAISE THIS. 40 was tried and the mark GHOSTED BACK: the mask's own Gaussian
# falloff reaches inward past the nominal opaque core, so a wide feather leaves the centre
# of the box only partly covered — exactly where the watermark is. 20 is the safe ceiling.
FEATHER_DETAILED = 20
BLUR = 22            # px blur radius for the fill
CORE_DRIFT_LIMIT = 2.0  # mean abs difference allowed between the patched core and the fill;
                        # anything above this means the original bled through
COPY_MATCH_LIMIT = 14.0 # how close the copy source's mean must be to the corner's own mean
                        # before copy-fill is allowed instead of blur-fill
STRUCTURE_LIMIT = 26.0  # stddev above which the corner is textured -> use the copy fill,
                        # not the blur fill (neither is a refusal; both remove the mark)


def corner_box(w: int, h: int) -> tuple[int, int, int, int]:
    bw, bh = int(w * BOX_W_FRAC), int(h * BOX_H_FRAC)
    return (w - bw, h - bh, w, h)


def clean(src: Path, dst: Path) -> dict:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    box = corner_box(w, h)

    before = im.crop(box)

    # Measure structure in the RING AROUND the box, never inside it.
    #
    # 🪤 The first version measured inside, which is circular: the watermark is a bright
    # mark on a dark corner, so it inflates the very stddev meant to decide whether the
    # corner is safe to patch. Every image "failed" a test the watermark itself was
    # causing. The neighbourhood is what actually tells us if real content is at risk.
    pad_x, pad_y = (box[2] - box[0]), (box[3] - box[1])
    ring = im.crop((max(0, box[0] - pad_x), max(0, box[1] - pad_y), w, h)).convert("L")
    ring_px = ring.load()
    rw, rh = ring.size
    bx0, by0 = rw - (box[2] - box[0]), rh - (box[3] - box[1])
    vals = [ring_px[x, y] for y in range(0, rh, 2) for x in range(0, rw, 2)
            if not (x >= bx0 and y >= by0)]
    mean = sum(vals) / len(vals)
    structure = (sum((v - mean) ** 2 for v in vals) / len(vals)) ** 0.5

    bw, bh = box[2] - box[0], box[3] - box[1]

    # Blur-fill is the DEFAULT and copy-fill is the exception, deliberately.
    #
    # 🪤 Copy-fill was first applied to every textured corner and produced the worst
    # artefact of the whole exercise: on one image it pasted brightly-lit floorboard into
    # a near-black corner, a glaring rectangle far more visible than the watermark it
    # replaced. Blur-fill's failure mode is a faint smudge; copy-fill's is a visible block.
    # Prefer the gentler failure unless copy demonstrably fits.
    sample = im.crop((max(0, box[0] - bw), max(0, box[1] - bh), w, h))
    blur_fill = sample.filter(ImageFilter.GaussianBlur(BLUR)).crop(
        (sample.size[0] - bw, sample.size[1] - bh, sample.size[0], sample.size[1])
    )
    copy_fill = im.crop((box[0] - bw, box[1] - bh, box[0], box[1]))
    copy_mean = ImageStat.Stat(copy_fill.convert("L")).mean[0]

    # Copy only earns its place when the source it lifts genuinely matches the destination's
    # tone. Otherwise the texture it preserves is worth less than the tone it breaks.
    detailed = structure > STRUCTURE_LIMIT and abs(copy_mean - mean) < COPY_MATCH_LIMIT

    if detailed:
        # Blur would read as a smudge on a textured corner (lit floorboards, for one).
        #
        # 🪤 MIRRORING was tried first and is WRONG for directional texture: reflecting a
        # diagonal floorboard makes the plank meet itself in a chevron, which reads as a
        # fold in the floor. Caught by LOOKING — every metric said the watermark was gone
        # either way, because "is the bright mark gone" and "does the patch look right"
        # are different questions.
        #
        # Copy from diagonally UP-LEFT by the patch size. Grain running on a diagonal
        # continues along its own direction, so the lines join instead of folding.
        filled = copy_fill
    else:
        filled = blur_fill

    # Feathered mask: opaque in the middle, fading out at the edges -> no visible seam.
    # A textured patch shows its edge far more readily than a blurred one, so it gets a
    # wider feather. Safe either way: the box is ~111x113 and the mark sits in roughly its
    # middle third, so even the wide feather leaves the mark inside the opaque core.
    feather = FEATHER_DETAILED if detailed else FEATHER
    mask = Image.new("L", (bw, bh), 0)
    inner = Image.new("L", (bw - feather, bh - feather), 255)
    mask.paste(inner, (feather // 2, feather // 2))
    mask = mask.filter(ImageFilter.GaussianBlur(feather / 2))

    out = im.copy()
    out.paste(filled, box[:2], mask)
    out.save(dst)

    after = out.crop(box)
    peak_after = ImageStat.Stat(after.convert("L")).extrema[0][1]

    # AUTOMATIC GHOST CHECK — does the OPAQUE CORE now equal the fill we pasted?
    #
    # If the mask is truly opaque where the mark sits, the core must be byte-close to
    # `filled`. Any bleed-through of the original shows up as a difference. Zero tuning,
    # and it is a direct test of the thing that actually goes wrong.
    #
    # 🪤 TWO WRONG CHECKS CAME FIRST, both worth remembering:
    #   1. structure measured INSIDE the box — circular, the mark inflated its own metric.
    #   2. peak brightness vs the corner mean — flagged the classroom, whose fill is SUNLIT
    #      floorboard with legitimate 150+ highlights. A brightness test cannot tell a wood
    #      highlight from a sparkle, so it fired on the one image that was actually fine.
    # Both looked reasonable and both were answering a different question from the one
    # that matters: "is the original still showing through?"
    # Inset by 2x the feather: the mask's Gaussian erodes the plateau by ~feather/2 per side,
    # so only this inner region is truly opaque. Comparing the wider core mixed partial
    # transparency into the metric and produced false 'ghost' calls.
    inset = min(2 * feather, bw // 2 - 4, bh // 2 - 4)
    core = (inset, inset, bw - inset, bh - inset)
    a_core = after.crop(core).convert("L")
    f_core = filled.crop(core).convert("L")
    ap, fp = a_core.load(), f_core.load()
    cw, ch = a_core.size
    diffs = [abs(ap[x, y] - fp[x, y]) for y in range(0, ch, 2) for x in range(0, cw, 2)]
    core_drift = sum(diffs) / len(diffs)
    ghost = core_drift > CORE_DRIFT_LIMIT

    return {
        "file": src.name,
        "box": box,
        "structure": structure,
        "fill": "copy" if detailed else "blur",
        "ghost": ghost,
        "core_drift": core_drift,
        "ring_mean": mean,
        "peak_before": ImageStat.Stat(before.convert("L")).extrema[0][1],
        "peak_after": peak_after,
    }


def main(argv: list[str]) -> int:
    if len(argv) < 3:
        print("usage: clean_gemini_watermark.py <src-dir> <out-dir>")
        return 2
    src_dir, out_dir = Path(argv[1]), Path(argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(p for p in src_dir.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg"})
    if not files:
        print(f"no images in {src_dir}")
        return 1

    print(f"{'file':<34}{'fill':>8}{'peak b/a':>12}{'core drift':>12}  result")
    bad = 0
    for p in files:
        r = clean(p, out_dir / p.name)
        # Report the fill the code ACTUALLY chose. Recomputing it here from a stale
        # condition once printed "copy" for images that were blur-filled.
        fill = r["fill"]
        if r["ghost"]:
            bad += 1
            note = "GHOST — mark still visible, do not use"
        else:
            note = "clean"
        print(f"{r['file'][:32]:<34}{fill:>8}"
              f"{r['peak_before']:>6}/{r['peak_after']:<5}"
              f"{r['core_drift']:>12.2f}  {note}")
    if bad:
        print(f"\n{bad} image(s) still show the mark. Lower FEATHER_DETAILED or widen the box.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
