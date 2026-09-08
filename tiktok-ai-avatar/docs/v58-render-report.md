# V58 render report — two renders, and what the second one fixed

`v58-art-direction.md` (Codex's spec, unchanged) is beside this file.

**Render 1** — `f4044c0` / `7611701`. Shipped, measured, and wrong about its own arc.
**Render 2** — this one. 1080x1920, 30fps, 16.6s, 498 frames. 826 tests, all gates green.

---

## 1. What render 1 got wrong: the scrim flattened the ladder

A scrim (a downward-darkening black gradient) is composited over every plate so
type stays legible. It was assigned PER SCENE: `heavy` on the bright plates,
`light` on the dark ones. Measured on the rendered frames:

| scene | plate centre | rendered | kept |
|---|---|---|---|
| 1 glass-a | 191 | 75.4 | 39% |
| 2 linen-b | 155 | 67.2 | 43% |
| 3 plaster-c | 137 | 74.5 | 54% |
| 4 stone-d | 95 | 57.8 | 61% |
| 5 fold-e | 44 | 39.7 | 90% |
| 6 threshold-f | 56 | 46.2 | 83% |

39% of the bright plates survived and 90% of the dark ones, so **scene 3
rendered brighter than scene 2** and the descent inverted in the middle. The
designed arc — light open, gathering weight, dark threshold — read as one fairly
even dim video.

**The mechanism, named:** a per-scene scrim is a legibility fix applied one scene
at a time, and applied to a luma ladder it is a ladder-flattening operation *by
construction* — it darkens exactly the plates whose brightness was the point.
Nothing was misjudged. The mechanism guarantees the outcome.

## 2. Codex's ruling, and what measuring it changed

Codex was asked three questions and answered all three.

1. **Re-render.** "Scenes 1 and 3 are nearly equal, and scene 3 reverses the
   descent from scene 2. Passing tests establishes technical acceptance, not the
   intended arc." Taken.
2. **Dark ink on scenes 1–2, cream from scene 3** — with the boundary flagged as
   provisional and needing measurement, the outgoing copy faded fully out before
   the incoming one fades in, a text-free interval at the polarity change, and
   no lettering interpolated through grey. Taken, with the boundary moved (below).
3. **Do not pre-compensate the plates** to force the rendered output onto
   122/88/76/57/45/49. "Those numbers describe photographic grounds before
   overlays, not final frames." Taken — no plate was graded.

**Correction Codex asked for, applied:** the previous report said "you were right
about the ink and I was wrong," attributing an original dark-ink call to Codex.
The spec does not contain one; it explicitly endorses cream on the strength of
the earlier repo measurement. The dark-ink error was mine and the spec followed
the evidence it was given.

**The boundary moved one scene later, because measuring it moved it.** Codex
called it provisional: the supplied test did not establish dark-ink legibility
through scene 2 or cream legibility on scene 3. Measured against the actual
plates under a uniform `light` scrim:

- `plaster-c` sits at 120 luma — the mid-tone — and **no accent colour clears
  3.0:1 there on either side**: gold reads 2.28:1, rust 2.34:1. A mid-tone ground
  has no room for an accent.
- Dark ink on `plaster-c` reads 3.47:1 at its worst row, and a pale ivory accent
  reads 3.08:1 — both clear the floor where no warm accent could.

So `plaster-c` keeps dark ink with a light accent, and the flip lands on the
120 → 87 step into `stone-d` instead of stacking on the cut's largest luma drop.

## 3. The fix: polarity carries legibility, so the scrim can be constant

All six scenes now use `light`. **A constant scrim cannot flatten anything.**
Legibility is carried by ink polarity instead — dark ink on the three light
plates, cream on the three dark ones.

Worst-row contrast, as `checkTextContrast` computes it — floor 3.0:1:

| # | plate | ink | ink : ground | accent | accent : ground | ground luma |
|---|---|---|---|---|---|---|
| 1 | glass-a | `#241C14` | 5.35 | `#67270C` | 3.58 | 166.6 |
| 2 | linen-b | `#1C1712` | 4.88 | `#67270C` | 3.08 | 142.6 |
| 3 | plaster-c | `#1C1712` | 3.47 | `#F2E0BC` | 3.08 | 119.6 |
| 4 | stone-d | `#F5F0E8` | 5.73 | `#E4B978` | 3.56 | 86.0 |
| 5 | fold-e | `#F2ECE2` | 11.91 | `#D9A45C` | 6.28 | 43.0 |
| 6 | threshold-f | `#FFF0E4` | 10.22 | `#FF8A48` | 4.87 | 52.7 |

The old rule in the source said the opposite — *"cream ink, never dark ink, on
the light opener"* — citing a measurement that dark ink decays to 1.4:1 down the
block. That measurement was taken on `dawn-a` (115 luma) under the **heaviest**
scrim, which darkens a pale ground until it is no longer pale. True of that
frame, false as a rule, and it cost this cut its arc. On `glass-a` (175) under
`light`, dark ink clears the floor at every row (5.35:1 at its worst) while
cream on that same plate and scrim fails the gate outright.

## 4. What render 2 delivered

`node scripts/measure-quiet-ladder.mjs out/V58-who-you-used-to-be.mp4 2.9,2.6,2.5,2.9,2.9,2.8`

| scene | frame | copy strip | whole frame | step |
|---|---|---|---|---|
| 1 | 43 | 158.0 | 135.9 | |
| 2 | 126 | 135.2 | 120.8 | −22.9 |
| 3 | 202 | 122.7 | 97.3 | −12.5 |
| 4 | 283 | 95.1 | 74.7 | −27.6 |
| 5 | 370 | 57.4 | 39.7 | −37.6 |
| 6 | 456 | 64.3 | 46.1 | **+6.9** |

Span **100.6** luma, against 35 in render 1. Monotonic descent all the way to the
refusal, then the small lift back for the ask. No inversion.

`npm run qa:frame` — frame 1 mean 135.41 (min 12), stddev 43.23 (min 18); every
frame carries content, none under stddev 11.15.

**The polarity handoff, measured on the encoded file** (crossing at frame 240):

| frame | dark lettering | cream lettering | frame mean |
|---|---|---|---|
| 224 | 8.05% | 3.87% | 97.5 |
| 228 | 0.30% | 0.29% | 76.2 |
| 231 | **0.00%** | **0.00%** | 63.3 |
| 232 | **0.00%** | **0.00%** | 60.8 |
| 233 | **0.00%** | **0.00%** | 59.2 |
| 236 | 0.00% | 3.06% | 60.2 |
| 240 | 0.41% | 9.01% | 74.0 |

Three frames — 0.1s — with no type on screen, at mean luma 59–63. For contrast,
the black frame kinetic shipped at its payload beat measured 7.05. The gap is
only safe because the ground is bright enough to be the light there;
`checkInkPolarityHandoff` refuses a crossing over any ground that is not.

## 5. Two gates that did not exist, and what they caught

- **`checkTextContrast`** measures ink *and accent* against the scrimmed
  photograph underneath, at every row of the block. `checkAccentContrast` only
  ever compared the accent to the **ink**, so an accent lost against its own
  ground was invisible to every gate. It caught the `plaster-c` gold at 2.28:1
  before a frame was drawn. An unmeasured ground is a **failure**, not a skip.
- **`checkUnderLineEntrance`** caught a defect in the **shipped** render 1: scene
  3's under-line entered at **2.11:1**, the worst in the account. Its floor is
  2.2, calibrated on what every shipped cut already does (stone-d 2.26, fold-e
  2.73) rather than on the 3.0 reading floor — a 3.0 gate here would fail
  V50–V57, which must keep rendering byte-for-byte as published.

The scrim now exists once, as data (`SCRIM_STOPS`), and the CSS the renderer
draws is built from it — so the gate cannot be measuring a scrim nobody renders.
A test pins the built string to the literal that shipped V50–V57.

## 6. Still open

- **Nobody has watched it.** Every number here is measured off the encoded file;
  the ink change is proved frame-accurate and legible, not proved *tasteful*.
- The plate data is measured at `scale = 1`, the first frame of each hold.
  `GROUND_DRIFT` zooms 4.5% across a hold, moving the ground under the type a
  little. Not modelled.
- The `MIN_ACCENT_DISTANCE` gate (accent vs ink) and `checkTextContrast` (accent
  vs ground) are now both needed, and neither subsumes the other.
