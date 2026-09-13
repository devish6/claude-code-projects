# The SPOKEN format — V61, "You were the one who read the letters out loud"

**Date:** 2026-09-12. **Status:** design approved by the owner, not yet implemented.
**Scope:** one new composition family (`src/viral/spoken/`) and one cut in it (V61).

---

## 1. Why this exists, and who decided it

The owner decided on 2026-09-12 to **change format**. This section records the
measurement that prompted it and — separately — the fact that the measurement
does not force the decision, so that no later session mistakes an owner ruling
for a measured result.

### What was read, 2026-09-12 23:35 UTC

TikTok Studio (`/tiktokstudio/content`), all in one reading, so the platform's
own counting rule is held constant:

| cut | posted | TikTok views |
|---|---|---|
| V55 | Sep 3 | 653 |
| V56 | Sep 4 | 154 |
| V57 | Sep 7 | 637 |
| V58 | Sep 8 | 635 |
| V59 | Sep 9 | 615 |
| DRAW01 (carousel) | Sep 10 | 421 |
| **V60** | **Sep 11 10:43** | **168 at ~33h** |

Instagram via Windsor.ai (`instagram` connector, `media_*` fields):
V60 = 40 views / 30 reach / skip 0.706 at ~7h.

Two other results closed in the same reading:

- **V60 was already posted.** Memory carried "NOT POSTED"; the owner hand-posted
  it TikTok-first on Sep 11 and to Instagram on Sep 12 03:26 UTC. *Ask the
  platform, not its mirror.*
- **DRAW01 failed its Instagram bar.** The bar was `views > 150 OR saves >= 10`,
  read at 48h (expired 2026-09-12 14:58 UTC). Delivered: **71 views / 3 saves.**
  Failed on both arms. TikTok has it at 421 and still climbing.

### ⚠️ The dissent, recorded on purpose

**168 is about one sigma, and one sigma is not a break.** `src/viral/quiet/scenes.ts`
records σ of log₁₀(views) ≈ 0.6 for this account with the creative held constant;
one sigma is a factor of four, and 630/168 = 3.75. V56 had already produced 154
inside the same format. The standing rule in that same comment block is **read
the class, never the post**, and promoting a single post to a rule is precisely
the V33 → V34 error this repo has already paid for.

⇒ **This format change is an owner decision, not an evidence-forced one.** It may
well be right — the owner's 2026-09-08 platform-fit call was his and it was
correct. But a future session must not cite V60's 168 as proof the quiet format
broke. V60's own pre-registered bar (**TikTok views ≥ 400 at 48h**) is still
unread; it falls due **2026-09-13 ~14:43 UTC** and must be recorded either way.

---

## 2. What was ruled out, and why

Recording these so they are not re-proposed.

| Option | Ruled out because |
|---|---|
| **Captions AROUND a subject** (`Internal-CaptionsAroundSubject`, already built) | It requires a subject — a person — and that means the owner's face, which is owner-tested dead for this account (~700 views against 1,268–2,408 faceless). He has been told twice; ⛔ do not raise a third time. |
| **Kinetic** (`src/viral/kinetic/`) | `KINETIC_SCENE_MAX` is 2.2s and the format's own header states *"You cannot feel something in 1.7 seconds."* It also renders at whole-video mean luma 27.9/255 — *"architecturally a black card with type on it"* — which a warm-lamp ground world cannot survive. |
| **Narrated story** (`src/viral/story/` + ElevenLabs) | Bills on every render, and it would put the owner's cloned voice on the numerology account — a decision he has not made. Not assumed from the face ruling. |
| **The ViralVideo engine** (V03's shape) | V03 is still the account's best post by 13.6×, but it is the `trait-per-number` information shape, and `content/angles.json` records V03's number as **confounded with era** (pre-07-24 median reach was 1,487). |
| **Word-by-word captions** (the `loud` preset) | Already ruled against **in writing** in this repo: `build-story-captions.mjs` — *"the eye is yanked ~3x/second and the sentence never exists as a whole"* — and `CaptionDemo.tsx` states `loud` exists *"to prove it is buildable, not to recommend it."* The kinetic register it belongs to measured 2,790–3,289 ms average watch against the quiet format's 7,745–7,988. |

---

## 3. ⭐ Two corrections made during design

Both were mine, and both changed the design. Stated here because the wrong
version is the plausible one.

**3.1 — The "more prose on screen" argument is FALSE. Retracted.**
The format was initially argued for on the grounds that it lifts the ~300-word
Instagram caption onto the video, since `MAX_WORDS` caps a quiet beat at 11.
That is wrong, because **static text is read in parallel and captions are read
serially.** A quiet beat shows an 8-word line *and* a 7-word under-line together
for 2.7s, so V60 displays ~90 words in 16.4s ≈ 5.5 words/sec. Word-lit captions
at the `quiet` preset run ~2.7–2.9 words/sec, i.e. ~45 words in 16s.

⇒ **At equal length this format carries roughly HALF the prose of a quiet cut.**
The writing must get tighter, not looser, and a longer runtime is the only way to
carry more words. ⚠️ Runtime is not a lever in either direction —
`content/v54-measured.md` measured runtime moving 87% with attention flat — so
the extra seconds here are a consequence of the cadence, never a claim.

**3.2 — The `QUIET_MUSIC` refactor is WITHDRAWN. It was unnecessary.**
`QUIET_MUSIC = MUSIC.kineticV18` is a module constant shared by all seven
published quiet cuts and pinned by no test, so editing it would silently
re-score V50–V60 — the only controls the account owns. The first design
proposed lifting it to a prop. **That is not needed:** V61 is a *new component*,
so it simply declares its own bed. `QuietVideo.tsx` is not touched at all, which
is strictly safer than refactoring it.

---

## 4. Architecture

```
src/viral/spoken/
  SpokenVideo.tsx          the composition
  scenes.ts                the contract, the gates, assertSpokenRenderable
  v61-read-the-letters.ts   the cut's data
  v61.test.ts              every gate + a positive control for each
```

Registered in a new `Spoken` folder in `src/Root.tsx`, with
`calculateMetadata={() => spokenMetadata(id, V61_SCENES, V61_PAYOFF_INDEX)}` so a
bad cut **throws before frame 1**, CLI or Studio — the same contract
`assertQuietRenderable` and `assertKineticRenderable` provide.

### 🔴 The isolation rule

`spoken/` imports from `quiet/` **only** `GROUND_BANDS` / `bandCentreY`
(`ground-bands.ts`) and the scrim model (`SCRIM_STOPS`, `scrimAlphaAt`,
`groundLuminances`, `relLuminance`, `contrastRatio`). It imports **nothing** from
`kinetic/`, and it **never modifies** `quiet/` or `kinetic/`. V50–V60 and V43–V49
must keep rendering byte-for-byte as published; they are the account's only
controls.

⭐ Reusing `GROUND_BANDS` is correct rather than convenient: the caption block at
74px over ~3 lines centres to roughly **y 830..1090**, which sits inside the
`COPY_TOP 700 / COPY_BOTTOM 1220` strip the band data already measures. The
contrast question is literally the same question.

### Reused, unchanged

- `src/internal/captions/captions-from-text.ts` — authored word timings. **No
  audio, no API, no key, deterministic.** ElevenLabs never animated anything; its
  only job elsewhere is answering *when is each word spoken*, which only matters
  over real narration.
- `src/internal/captions/TikTokCaptions.tsx` + `CAPTION_PRESETS.quiet`
  (`switchEveryMs` 1150, `fontSize` 74, sentence case, `pop` 1.04). Already
  calibrated to this account's register.
- Type: `UI` (Inter 800). ⭐ Deliberately **not** `QUIET_DISPLAY` (Cormorant 600) —
  a different face is part of not being recognised, which is the point of a new
  format. Cinzel is unavailable regardless: it has no true lowercase and renders
  sentence case as monumental caps.

---

## 5. The contract

```ts
export type SpokenScene = {
  /** The photographic ground. Adjacent scenes MUST differ. */
  bg: string;
  /** Foreground ink. Cream throughout in V61 — see §7. */
  fg: string;
  /** The accent colour for the word currently being lit. */
  accent: string;
  /** The prose this ground carries. ONE or TWO sentences. */
  text: string;
  /** How hard to darken the ground. CONSTANT across a cut — see §7. */
  scrim?: "light" | "normal" | "heavy";
  /** Words per second for this scene's authored cadence. */
  wordsPerSecond?: number;
};
```

### 🔴 Hold duration is DERIVED, never authored

Each scene's hold = its own caption duration (`captionsDurationMs`) + a tail pad,
**not** a hand-set `seconds` like the quiet format uses. Authoring both
independently lets the pages and the hold disagree, and the failure is silent:
the plate simply sits there with no type on it, or a phrase is cut off
mid-sentence by the dissolve. Deriving makes the two agree by construction, and
`checkPagesTileScene` gates the derivation with a positive control.

Bounds, this format's own (quiet's 2.0–4.0s do not apply — these scenes carry
more words): `SPOKEN_SCENE_MIN = sec(2.5)`, `SPOKEN_SCENE_MAX = sec(5.5)`.
`DISSOLVE` stays `sec(0.5)`, and the cross-dissolve is inherited wholesale — it
is what makes a black frame structurally impossible, because scene N+1 fades in
beneath scene N fading out, so ground opacity sums to ~1 throughout.

---

## 6. Gates

`runSpokenGates()` → `assertSpokenRenderable()`. Each gate names the failure it
catches; each gets a positive-control mutant in `v61.test.ts`.

### Inherited in substance

| Gate | Catches |
|---|---|
| `checkGroundChanges` | Two adjacent scenes sharing a ground — a 0.5s cross-fade that produces no visible change at all. |
| `checkHoldDurations` | A hold outside `[2.5s, 5.5s]`. |
| `checkDissolveFits` | A hold ≤ 2 × `DISSOLVE`, which renders as a permanent average of two photographs and never resolves to either. |
| `checkTextContrast` | Ink or accent under 3.0:1 against its own **scrimmed** ground, **at every band** — not on average. |
| `checkPayoffLate` | A payoff landing before 6.4s. |

### New, specific to captions

| Gate | Catches |
|---|---|
| **`checkPageRegister`** | Single-word pages — i.e. the `loud` register creeping in. The ban is structural, not a comment, so it cannot be "improved" away. Minimum words per page: 3. |
| **`checkPagesTileScene`** | A scene whose caption pages do not cover its hold: a bare plate with no type, or a phrase guillotined by the dissolve. Guards the §5 derivation. |
| **`checkFirstPageComplete`** | Frame 0 is the poster frame, and it must carry a complete clause rather than a fragment. This repo has shipped a blank or broken frame 0 **twice**. |
| **`checkPageWidth`** | A page wider than the safe box. V60's ask accent rendered **963px against an 860px box**, reaching 68px from the right edge — under TikTok's rail — and every gate was green. `textWrap: "balance"` means the `whiteSpace: nowrap` mechanism cannot recur here, but width still needs a ceiling: a characters-at-size proxy, with the rendered frame measured in the report. |

⚠️ **`checkPageWidth` is a proxy and says so.** A unit test cannot lay out text.
The proxy catches the gross case; the rendered ask frame must still be measured,
exactly as V60's was. A gate that cannot fail the way the real operation fails is
not a gate — so this one is documented as partial rather than trusted.

---

## 7. The grounds

Six new plates, warm tungsten **Indian domestic night**. A true break from the
cool grey "quiet interior after rain" world that V58, V59 and V60 all share.

| plate | subject | target mean luma (pre-scrim, copy strip) |
|---|---|---|
| `lamp-i` | a tungsten lamp on a kitchen table | **145** |
| `envelope-j` | a window envelope among papers | 120 |
| `dial-k` | a landline handset | 100 |
| `steel-l` | the rim of a steel tumbler | 78 |
| `fan-m` | a ceiling fan blade in dim light | 52 |
| `doorway-n` | a lit doorway seen from a dark room | 66 |

Ladder descends at every step to the payoff and **lifts once, at the doorway** —
the same shape `v60.test.ts` asserts.

### Method

Follows `docs/v58-art-direction.md` exactly, because that is the established
method here and V58/V59/V60 already run on generated grounds: write a per-plate
generation prompt with a target luma and the explicit standing caveat that these
are *"generation and grading targets, not guaranteed prompt outputs: measure the
finished plates and adjust exposure before rendering."* Generation happens in
ChatGPT. Then:

1. Drop the six JPEGs into `public/grounds/` (the letter series continues `i..n`).
2. `node scripts/measure-grounds.mjs` — regenerates `ground-bands.ts` from the
   **covered** frame, not the file (plates are not all 1080×1920).
3. `checkTextContrast` judges the real pixels. 🔴 **An unmeasured ground is a
   failure, not a skip.**

Prompts must specify: full-bleed vertical 9:16 for 1080×1920; no baked-in scrim
or typography; a low-contrast, feature-free central half for the caption block;
distinctive detail kept peripheral; **no people, faces, hands, text, lettering,
numerals, or astrology/zodiac imagery**; real photography, not illustration or a
3D render.

### 🔴 Why the brightest plate is capped at 145, and why ink never flips

**All six scenes carry cream ink and a CONSTANT `light` scrim.**

- *Constant scrim:* a per-scene scrim applied to a luma ladder is a
  ladder-flattening operation **by construction** — it darkens exactly the plates
  whose brightness was the point. V58's designed 191→155→137→95→44→56 rendered as
  87→76→**97**→73→47→57: scene 3 became the brightest frame in the cut. Nothing
  was misjudged; the mechanism guarantees it. A constant scrim cannot flatten
  anything.
- *The 145 cap:* cream ink needs the ground to stay dark enough to carry it. At
  **170** pre-scrim, a `light` scrim leaves ~144, and cream measures ≈ **3.1:1** —
  sitting on the 3.0 floor. At **145** it lands ≈ 4.3:1 with margin. This is why
  the top of the ladder is 145 and not brighter. `v60.test.ts` already proves the
  converse case: cream on V60's 191-luma opener **fails** the gate.
- *No polarity flip:* with cream throughout there are zero crossings, so no beat
  ever renders text-free, and `MIN_GAP_GROUND_LUMA` never binds. A warm night
  interior is genuinely dark, so this costs nothing.

---

## 8. The bed

`SPOKEN_MUSIC = MUSIC.sweetMemories` (`public/music/2.mp3`, 120.03s, registered
as the emotional bed, never used on a quiet cut). Free, already in the repo.
Declared as a per-cut field with that default, so V62 can differ without
touching the component.

⛔ **Not generated.** `npm run music:generate` bills on every call — the notes
record ~900 credits burned probing endpoint spellings — and its acceptance gate
tests for *a percussive transient on every beat*, which is the instrument for a
beat-synced kinetic bed and the wrong one for an ambient cut.

🔴 **The bed is not optional and must be verified on the encoded file.** The
kinetic format's first cut shipped with **no audio at all** through 502 green
tests, caught by the owner watching it rather than by any gate. Verify the mp4,
never the timeline.

---

## 9. The cut

**V61 — "You were the one who read the letters out loud."**
Composition `Spoken-V61-Read-The-Letters`. Estimated **~22–24s** (≈56 words at
~2.7 wps plus punctuation pauses); the render settles it. This also satisfies the
standing requirement that duration keep varying — V59 and V60 both ran 16.6/16.4s,
and a fixed runtime once made TikTok read the whole set as repeated content.

| # | plate | prose |
|---|---|---|
| 1 | `lamp-i` | You were the one who read the letters out loud. |
| 2 | `envelope-j` | The ones with the little window in the envelope. |
| 3 | `dial-k` | You made the phone calls. You knew which drawer. |
| 4 | `steel-l` | Nobody decided this. It just needed doing, and you could. |
| 5 | `fan-m` | **I won't tell you it made you who you are.** |
| 6 | `doorway-n` | Send this to whoever else read the letters. |

`V61_PAYOFF_INDEX = 4`.

### The theme, and the recycle ruling

The owner's first choice was "the one who handles everything". **That overlaps two
shipped cuts** and was sharpened rather than shipped:

- **V56** owns the capable-person-carrying-an-unreciprocated-load wound: *"You
  always pick up." / "Nobody asks you the same question back." / "The strong one
  doesn't get asked."* — `#caretaker #emotionallabour`.
- **V59** owns competence-as-a-trap: *"You handled it well, so nobody asks any
  more. Competence reads as closure."*

⇒ The clean air is **origin, not present capability.** V56 and V59 are both about
who the viewer is *now*; V61 is about a role assigned *then* — the eldest one who
translated at the bank and the doctor's, read the letters, made the calls, knew
which drawer. 🪤 The rule bites hardest where it feels satisfied: V44 changed
category and kept V43's opening string, and its 1s hold halved.

### Content rules this cut satisfies

- **Feeling, not information.** Nobody pays for information; they pay to become
  someone. V43–V49 sold seven facts and V49 took 84 views.
- **Wound, not accusation.** Every line names something that *happened* — nobody
  decided it, it just needed doing. It never blames the viewer, and the
  fourth beat (*"Nobody decided this"*) absolves the parents too, so the cut
  cannot be heard as a complaint about them either.
- **Refuses to console.** The payoff at index 4 declines *"it made you who you
  are"* — the hollow consolation this theme always attracts. Consolation is
  **0-for-4** on this account (V34, V35, V37, V38).
- **Claims nothing.** No digit, no letter value, no date arithmetic, no forecast.
  Per the production ETHICS_BLOCK the payoff may read the present and past road
  and **never promise an outcome, a date, or an amount.**
- **The ask names a fellow sufferer, never a rescuer**, and bookends frame 0 on
  "the letters" — as V60 does on "weather".

---

## 10. Tests (`v61.test.ts`)

Mirrors the seven quiet cut tests. **Every gate assertion is paired with a mutant
that must FAIL**, so a gate that silently stopped working turns the file red.

Commitments asserted as negatives (a grep for a phrase that is present can never
detect one that was removed):

- No digit anywhere in any `text`.
- Frame 0's plate **and** first words differ from V60's — the recognition rule
  binds the immediate predecessor.
- Total frames differ from V60's and V59's.
- Exactly one scrim value across the cut (the constant-scrim rule).
- The ladder descends at every step to the payoff and lifts at the doorway.
- Zero ink polarity crossings.
- The payoff contains "won't tell you" and its following page contains none of
  `will`, `gets better`, `works out`, `meant to be`, `one day`, `happen`.
- The ask contains "send this to" and bookends frame 0's "letters".

---

## 11. Verification, on the encoded file

`npm run lint` (eslint + tsc) and `npm test` green, then:

1. `npm run qa:frame -- out/V61-read-the-letters.mp4` — frame 0 plus a scan of
   **every** frame against `MIN_MEAN 12` / `MIN_STDDEV 18`. ⛔ Never tune those
   floors to make a render pass. 🪤 `qa:frame` alone only ever looked at frame 0;
   V33 shipped a 2.13s hole past it.
2. `node scripts/measure-quiet-ladder.mjs out/V61-read-the-letters.mp4 <holds>` —
   the delivered ladder, one region and one method, sampled at each hold's
   midpoint and never near a boundary.
3. `ffprobe`: 1080×1920, 30fps, duration, **`aac` present with a real mean dB**.
4. Measure the rendered **ask frame's** text extent against the safe box by hand
   (see §6 — `checkPageWidth` is a proxy).
5. `npm run kit -- V61` → `~/Desktop/POST BY HAND/V61 - .../` with mp4, cover,
   CAPTION, FIRST-COMMENT, NOTES. The `V\d+` prefix is already supported.

**Posting:** TikTok-first, by hand, by the owner. 🔴 TikTok prefills the
description from the filename — **clear that field** before pasting CAPTION.txt;
V54's artefact is still live because nobody did. The handle is `nume.vix`;
`@numevix` on the closing card is the account name and is **correct**. Pin
FIRST-COMMENT.txt immediately after posting.

**Pre-registered bar: TikTok views ≥ 400 at 48h.** Instagram carries **no bar** —
it has served this register 35–72 views on five of six cuts, so an IG bar mostly
re-measures a refusal; record the number, do not judge on it. ⭐ The rule being
obeyed here was written down and then broken twice: **pre-register only
instruments that exist inside the judging window** (V54's YouTube primary was
still processing two days out; two of V55's three bars were unreadable at 5h).

---

## 12. What this cannot prove, and what is still open

- **One post decides nothing.** At σ(log₁₀ views) ≈ 0.6, detecting a 2× effect
  needs ~62 posts an arm. V61 is judged as the first instance of a class, and the
  class needs several cuts before it means anything.
- **Nobody will have watched it.** Every number above comes off the encoded file.
  That proves it legible and gated, **not tasteful.** Watching has caught four
  defects that green suites missed — a blank frame 0, a 2.13s hole, an empty pair
  scene, and a 0.47s flash. The owner must watch it with sound.
- **V60's bar is unread** until ~2026-09-13 14:43 UTC. Record it. If V60 clears
  400, the premise for changing format weakens and that should be said plainly
  rather than quietly dropped.
- **Out of scope, carried forward:** the quiet format still has **no gate** for
  accent/text overflow past the safe box. Adding a blocking one to
  `runQuietGates` would make V58 and V59 unrenderable, and published cuts must
  keep rendering as controls. `checkPageWidth` covers the new format only.

---

## 13. What changed during implementation — corrections to this spec

Recorded rather than silently amended, because the wrong version is the
plausible one.

**§7's "brightest plate 145" was wrong, and so was its reasoning.** The figure
was derived by checking cream ink only. Two things turned out differently:

1. **The accent binds, not the ink** — cream clears 3.0:1 up to ~142 post-scrim,
   the gold accent only to ~103. And the constraint is applied **band by band**,
   not to the strip mean: `lamp-i` at a mean of 101.9 was inside its target and
   still failed at **2.72:1** because one band measured ~128. It ships at
   **89.56**.
2. ⚠️ **The claim that a paler accent "fails `checkAccentContrast`'s 60-channel
   distance" is FALSE** — asserted, not computed. `#FFD9A0` vs `#FFF6EA` is
   **74** and passes. A lighter accent was always available.

**The delivered ladder is therefore 84.1 / 70.8 / 56.8 / 46.2 / 41.5 / 53.0,
span 42.6** — much narrower than V58's 101, as a direct consequence of capping
the top plate for accent legibility. Stated plainly because it is a real
regression against the quiet cuts' visual range, not a rounding difference.

**`createTikTokStyleCaptions` could not be used for paging.** It groups purely by
time and produced **three one-word orphan pages** on this cut's prose (scenes 0,
3 and 4) — the `loud` register arriving by accident. Widening the window moved
the orphans rather than removing them, and tuning a constant until a gate passes
is forbidden here. `spoken/scenes.ts` therefore does its own clause-based paging
with `mergeShortPages`, and `SpokenVideo` renders those pages directly:
`TikTokCaptions` places each page at an absolute frame from `page.startMs`, so
wrapping it per page would have double-offset the whole timeline.

**`npm run kit` is not used.** No quiet cut is in `daily-state.json` — the check
in §11 assumed otherwise. V55-V60's `POST BY HAND` folders were assembled by
hand and V61's is too, which avoids the V13/V14 trap where a ledger row makes the
exporter derive composition ids that do not exist.

**A limitation of the page gates, named by the `qa` skill.** Every page gate
calls `scenePageCaptions`, the same function the renderer uses. That prevents
divergence, but it means the gates *cannot* catch the paging rule itself being
wrong — they would agree with a broken pager. Only `qa:frame` across every frame
and a person watching have authority over that.

---

*Related: `docs/v58-art-direction.md` (the ground generation method),
`content/v54-measured.md` (TikTok as the primary platform), `content/angles.json`
(angle statuses and their evidence), `src/viral/quiet/scenes.ts` (the format
contract this one is modelled on).*
