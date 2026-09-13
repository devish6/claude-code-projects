# V61 — the spoken cut: "the kitchen table at night"

Art direction for six new photographic grounds, `lamp-i` … `doorway-n`.
Spec: `docs/specs/2026-09-12-spoken-format-design.md`. Method follows
`docs/v58-art-direction.md`, with one correction noted below.

## Visual through-line

Six close observations inside one ordinary home late at night, lit by a single
warm tungsten lamp and nothing else. Light enters low and from the left
throughout, holding a palette of amber, deep brown and dull brass as the exposure
falls away. Distinct peripheral compositions move attention around a calm,
featureless centre, so each dissolve reads as another glance around the same room
rather than a cut to somewhere new. The room is lived in and slightly worn: this
is a household doing paperwork at the end of a day, not a styled interior.

## 🔴 Two corrections to how these are measured and graded

**1. The target is the COPY STRIP, not the full image.** `v58-art-direction.md`
gave targets as "the mean of the full image", while `scripts/measure-grounds.mjs`
and `checkTextContrast` both read the **copy strip** — y 700..1220, x 140..940 of
the *covered* 1080×1920 frame. Codex already caught one report comparing a
full-frame plate mean against a post-scrim strip measurement and calling it
like-for-like. The numbers below are therefore **copy-strip means, pre-scrim**,
which is what the gate actually reads.

**2. The ladder is darker than the spec first said, and the ACCENT is why.**
The spec sized the top plate at 145 by checking cream ink alone. Cream (#FFF6EA,
relative luminance 0.932) clears the 3.0:1 floor up to roughly 142 post-scrim,
but the gold accent (#E8B36A, relative luminance 0.504) only clears to about
**103 post-scrim ≈ 118 pre-scrim**. Lifting the accent towards cream fixes the
contrast and then fails `checkAccentContrast`'s 60-channel distance instead — on
a mid-tone ground the two gates are in genuine tension, which is the same finding
the repo's scrim note records as *"a mid-tone ground has no room for an accent."*

⇒ The top plate is **110**. Gold on it computes to ~3.13:1 — clears, with little
margin. **These are generation and grading targets, not guaranteed prompt
outputs: measure the finished plates and adjust exposure before rendering.**

## 🔴🔴 CALIBRATION, MEASURED 2026-09-12 — ASK BRIGHT, GRADE DOWN

**The model ignores numeric luma targets.** The first `lamp-i` prompt asked for
"a mean luma around 110/255" and delivered a copy strip of **26.98** — roughly a
quarter of the target, and darker than `fan-m`'s 44, which is the darkest plate
in the cut. The phrases that caused it are ordinary scene description, not the
number: *"late at night"*, *"lit only by a single warm tungsten lamp"*, *"falling
away into deep warm brown"*. A generator reads those as near-black.

✅ The measurement is trustworthy: the same ffmpeg crop measured `glass-a` at
**190.649** against the **191.1** recorded in V60's notes, so it reproduces
`scripts/measure-grounds.mjs`. ⭐ Always run that control before believing a
plate measurement.

**And a dark plate CANNOT be rescued by regrading.** Measured on the real file:

| gamma | YMIN | YAVG | YMAX |
|---|---|---|---|
| 1.0 (as generated) | 1 | 26.98 | 208 |
| 2.2 | 67 | 105.97 | 234 |
| 3.2 | 108 | 144.32 | 241 |

Reaching the target needs ~gamma 2.2, which lifts the **black floor from 1 to
67** — the deep warm shadow that carries the whole night interior becomes flat
grey. And **17.6% of the copy strip already sits below luma 16**, so a fifth of
it holds no recoverable detail; lifting shows banding, not material.

⇒ **THE METHOD IS: GENERATE ABOUT 1.4-1.6x BRIGHTER THAN TARGET, THEN GRADE
DOWN.** Darkening lowers the floor and preserves detail; brightening does the
opposite. Aim each plate to arrive at roughly **160 / 140 / 120 / 100 / 70 / 90**
and grade down to the targets in the table above.

### The exposure clause — replaces the "Aim for a mean luma…" sentence in EVERY prompt below

> Overall exposure: a comfortably lit indoor photograph of an evening room, not a
> night scene. The warm light should fill a broad area of the frame rather than a
> narrow pool, and the whole image should read as clearly visible at a glance.
> The darkest corners must still show visible colour and material detail —
> nothing in the frame may read as black or as an unlit void. Keep the centre
> even and low in contrast, but do not make it dark.

⛔ Do NOT state a numeric luma target in a prompt. It is not obeyed, and it reads
as permission to go dark. State the exposure in visual language and measure the
result.

## ✅ WHAT ACTUALLY SHIPPED — measured, not planned

| plate | arrived | grade | installed | notes |
|---|---|---|---|---|
| `lamp-i` | 89.6 | **1.00** | **89.56** | first attempt arrived at 26.98 and was discarded |
| `envelope-j` | 55.7 | 1.25 | **74.52** | 1.3% crushed, so a lift was safe |
| `dial-k` | 43.5 | 1.15 | **54.20** | |
| `steel-l` | 44.4 | 1.00 | **44.47** | |
| `fan-m` | 73.2 | 0.65 | **37.52** | the payoff; graded well down |
| `doorway-n` | 66.2 | 0.85 | **52.23** | the closing lift, +14.7 over fan-m |

Delivered on the encoded file: **84.1 / 70.8 / 56.8 / 46.2 / 41.5 / 53.0**, span
**42.6**. ⚠️ That span is much narrower than V58's 101 and V60's 96.4, and the
reason is structural rather than sloppy: a gold accent cannot survive a bright
plate (see below), so the top of the ladder is capped near 90 instead of 190.
A future cut wanting V58's range must change the accent, not the plates.

### 🔴🔴 TWO CORRECTIONS TO THIS DOCUMENT

**1. "Ask 1.4-1.6x brighter and grade down" is only half right.** Grading down
IS the safe direction and that stands. But the generator would not go bright
enough to make it the general method — plates arrived between 43 and 89 against
targets up to 110, so three of six needed a lift after all. What actually worked
was: ask for one consistent "comfortably lit evening room" exposure every time,
measure, then grade in whichever direction is small. ⛔ Never ask for "dimmer
than the last one" — that phrasing overshot on every plate it was used on.

**2. THE STRIP MEAN IS NOT THE CONSTRAINT — THE BRIGHTEST BAND IS.** `lamp-i` at
a strip mean of **101.9** sat inside its 100-120 target and still FAILED
`checkTextContrast` at **2.72:1**, because its lamp pool is low in frame and band
7 measured ~128. At a mean of 93.5 it reads 2.98:1 — still failing, by two
hundredths. It only clears at 89.56. ⇒ Judge a plate band by band; "it hit its
target mean" proves nothing about legibility.

**3. An earlier claim here was FALSE.** This doc stated that raising the accent
towards cream "fails `checkAccentContrast`'s 60-channel distance". Not true, and
it was asserted rather than computed: pale amber `#FFD9A0` against cream
`#FFF6EA` measures **74** in the blue channel and passes comfortably. A lighter
accent was available the whole time; it simply was not needed once the plates
came in dark. ⭐ Compute a number before writing it down as a constraint.

## Ground plates

| plate | subject | target copy-strip mean (pre-scrim) | role |
|---|---|---|---|
| `lamp-i` | lamp-lit table edge with letters | **110** (range 100–120) | the opener / poster frame |
| `envelope-j` | a window envelope among papers | 96 | recognition |
| `dial-k` | a landline handset | 82 | the turn |
| `steel-l` | the rim of a steel tumbler | 66 | the wound |
| `fan-m` | a ceiling fan blade in dim light | 44 | the refusal |
| `doorway-n` | a lit doorway seen from a dark room | 58 | the lift for the ask |

Every scene carries **cream ink and a constant `light` scrim**, so each plate must
keep a broad, low-contrast, featureless centre with **no bright patch behind the
sentence area** — a warm highlight crossing the caption block is what pushes the
accent under its floor. Keep all distinctive detail peripheral. The light
direction stays fixed; only focal position, edge orientation and depth of focus
vary. Keep peripheral highlights restrained so their relocation does not flash
during the 0.5s cross-dissolves.

Generate photographic grounds **without baked-in scrims or typography**.

---

### 1. `lamp-i` — target 110

**Composition:** a low pool of lamplight entering from the lower left across a
worn wooden table edge; a few loose papers at the extreme left margin; the centre
sits slightly darker and completely soft.

**Prompt:** Create a full-bleed photographic still in vertical 9:16 composition, intended for 1080 × 1920 output. An intimate close view across the worn wooden edge of a kitchen table in an ordinary lived-in home late at night, lit only by a single warm tungsten table lamp just out of frame to the lower left. A small cluster of loose paper sheets rests at the extreme left margin, their edges catching the warm light; this small cluster is the sole sharp focal accent. The broadest pool of amber light sits in the lower third toward the left, falling away gradually into deep warm brown through the upper frame. Keep the entire central sentence area softly diffuse, almost featureless, and low in contrast, with no bright highlight, lamp bulb, or reflection behind it. Shallow depth of field, natural optical softness, restrained fine grain, believable wear on the wood. Aim for a copy-strip mean luma around 110/255, retaining warm detail in the lower left while the centre sits slightly lower; do not brighten the whole plate to compensate for a later overlay. Amber, deep brown and dull brass only, no strong blue or green cast, no colourful objects. No people, faces, hands, text, lettering, symbols, numerals, or astrology or zodiac imagery. Real photography, not illustration, not a 3D render, no synthetic gloss.

### 2. `envelope-j` — target 96

**Composition:** one envelope entering from the upper right, its window panel
gently in focus; no left-edge accent.

**Prompt:** Create a full-bleed photographic still in vertical 9:16 composition, intended for 1080 × 1920 output. A close observation of a single plain window envelope resting among other papers on a dark wooden surface in the same warm lamp-lit room at night. The envelope enters from the upper-right edge and angles out through the right margin within the upper third of the image. A short section of the envelope's glassine window panel is gently in focus, the sole focal accent, its upper-left-facing surface receiving the low tungsten light. The left side and lower portion fall softly out of focus into an unbroken warm plane. Across the central half the surface must stay broad, smooth and low contrast, with no creases, printing, or busy texture. Shallow depth of field, natural lens rendering, restrained fine grain, ordinary well-handled paper rather than crisp new stationery. Aim for a copy-strip mean luma around 96/255, an open warm midtone with amber highlights and deep brown shadows, neither bright nor near black. No blue or green cast; match the amber and dull brass palette of a tungsten-lit table. No people, faces, hands, printed text, lettering, symbols, numerals, addresses, logos, or astrology or zodiac imagery. Real photography, not illustration, not a 3D render, no synthetic gloss.

### 3. `dial-k` — target 82

**Composition:** the curve of a handset across the top tenth of the frame, the
surface opening beneath it.

**Prompt:** Create a full-bleed photographic still in vertical 9:16 composition, intended for 1080 × 1920 output. A very close photographic view looking slightly downward at an old corded telephone handset resting on a dark side table in the same warm lamp-lit room at night. The handset's curve runs almost horizontally across the uppermost tenth of the frame, gently oblique, with a narrow softly blurred strip of wall beyond it. A short section of its worn moulded plastic near the upper middle is in delicate focus, showing faint scuffing; the rest of the form softens. Shallow depth of field lets the broad table surface below fall into a softly blurred expanse through the centre and lower frame, with no distinct bottom edge. The low tungsten light enters from the lower left, subdued now, making a gentle tonal gradient with no bright band, specular hotspot, or hard shadow. Aim for a copy-strip mean luma around 82/255, with readable detail along the top and retained shadow detail below. Keep the central half calm, low contrast and free of features. Warm brown, amber and dull grey, no blue cast, no coloured indicator lights. No cords crossing the centre, no dial face or keypad digits visible, no people, faces, hands, text, lettering, symbols, numerals, or astrology or zodiac imagery. Real photography, not illustration, not a 3D render, no synthetic gloss.

### 4. `steel-l` — target 66

**Composition:** the rim of a steel tumbler entering the lower right; focus on a
short arc of the rim.

**Prompt:** Create a full-bleed photographic still in vertical 9:16 composition, intended for 1080 × 1920 output. A close photographic view of a plain stainless steel drinking tumbler standing on a dark wooden surface in the same warm lamp-lit room at night. The tumbler occupies only the outer lower-right corner, entering from the lower-right edge. A short arc of its rim is gently in focus, catching a thin, soft, warm reflection from the low tungsten lamp; the reflection must stay restrained and diffuse rather than a bright specular streak. Most of the image is a softly defocused plane of deep warm brown, visibly material rather than an empty black background. The tumbler and its soft shadow remain outside the central half, which stays broad, quiet and low contrast with nothing crossing the sentence area. Shallow depth of field, natural lens softness, restrained fine grain, everyday household metal with faint use marks. Aim for a copy-strip mean luma around 66/255, keeping soft surface detail and avoiding crushed black. Amber, deep brown and cool dull steel only, no strong colour cast, no theatrical lighting, no heavy vignette. No people, faces, hands, reflections of a person, text, lettering, symbols, numerals, or astrology or zodiac imagery. Real photography, not illustration, not a 3D render, no synthetic gloss.

### 5. `fan-m` — target 44

**Composition:** one fan blade crossing the upper left diagonally; no other
detail anywhere.

**Prompt:** Create a full-bleed photographic still in vertical 9:16 composition, intended for 1080 × 1920 output. An intimate photograph looking up at a single blade of an old ceiling fan in the same room, now lit only by the faintest spill of warm tungsten light from far below and to the left. The blade crosses the upper-left quarter of the frame on a shallow diagonal and exits the left edge, its underside catching a barely-there amber edge of light; a short section of its worn painted surface is softly in focus. Everything else is a deep, softly defocused plane of warm near-darkness that still reads as air and ceiling rather than empty black. Use shallow depth of field so no sharp grain, edge, or object appears anywhere in the central half, which must remain a spacious low-contrast field. Retain faint natural tonal mottling so the image still feels photographed rather than a digital gradient. Aim for a copy-strip mean luma around 44/255, maintaining visible material and soft transitions rather than crushed darkness. Deep warm brown and a trace of amber, no blue cast, no motion blur, no light fixture or bulb in frame. Quiet natural photography, restrained fine grain, no dramatic lighting and no heavy vignette. No people, faces, hands, text, lettering, symbols, numerals, or astrology or zodiac imagery. Not illustration, not a 3D render, no synthetic gloss.

### 6. `doorway-n` — target 58

**Composition:** a restrained vertical strip of warm light at the far left, focus
at mid-height rather than in a corner.

**Prompt:** Create a full-bleed photographic still in vertical 9:16 composition, intended for 1080 × 1920 output. An intimate, tightly cropped photograph of a plain painted interior door left barely ajar, seen from inside a dark room in the same home at night. The matte warm-grey painted door surface fills almost the entire frame, softly defocused through shallow depth of field. A narrow irregular vertical strip of warm tungsten light from the room beyond sits within the far-left tenth of the image. A short section of worn paint along that edge is gently in focus at approximately mid-height; the edge softens above and below, with no separate corner accent. The light is low and domestic, not a glowing portal or a dramatic beam, and the gap reveals nothing identifiable beyond it. Keep the entire central half a quiet, low-contrast painted plane with no handle, hardware, panels, or sharp features. Aim for a copy-strip mean luma around 58/255, only slightly lifted from the preceding near-dark image, retaining subdued surface detail. Warm grey, deep brown and a small soft amber edge, natural fine grain, believable aged paint. No visible room, furniture, or silhouette beyond the gap. No people, faces, hands, text, lettering, symbols, numerals, or astrology or zodiac imagery. Real photography, not illustration, not a 3D render, no synthetic gloss.

---

## After generating

1. Save as `public/grounds/<name>.jpg` (the letter series continues `i..n`).
2. `node scripts/measure-grounds.mjs` — regenerates `src/viral/quiet/ground-bands.ts`
   from the **covered** frame, not the file. Plates need not be exactly 1080×1920.
3. `npm test -- v61` — `checkTextContrast` now has data and decides. 🔴 An
   unmeasured ground is a failure, not a skip.
4. If a plate misses its target, regrade exposure rather than re-prompting: the
   composition is usually right and the level is what drifts.

## Emotional arc

A child's competence, remembered fondly, turning into the thing nobody ever named
as a cost; the final doorway offers somewhere to send it without promising that
anyone on the other side will say anything back.
