# UPI Launch Video — Design

**Date:** 2026-07-26
**Project:** `tiktok-ai-avatar/` (Remotion), `src/viral/`
**Output:** `V13 - UPI Is Live` (English), `V14 - UPI Is Live (Hindi)`

## Why

Dodo went live for India on 2026-07-26, so numevix.com now accepts UPI, GPay,
PhonePe, Paytm and netbanking instead of card-only. Nothing announces it. The
video leads with the India price (₹354/mo) and lands UPI as the payoff, because
price is the stronger scroll-stopper for a cold India audience and UPI is the
thing that removes the friction from acting on it.

## Decisions locked (owner chose)

1. **New composition**, not a 7th `ViralVideo` template. The engine's payload is
   a number reveal plus four moolank traits; an announcement has neither.
2. **Both languages** — English and Hindi, two prop sets on one component.
3. **`hardstyleV10`** (149.9 BPM, native, no atempo) on both.
4. **CTA is a click, not a comment**: "Pay with UPI — numevix.com". This departs
   from every other viral video, where `CTAEnding` optimises for a reply. An
   announcement has a destination, so the click is the point.
5. **₹354/mo (Monad)** is the price on screen — the entry price, and the exact
   figure whose mandate pin was verified live.
6. **The claim sells breadth, not volume**: "career, money, marriage, health".

## Copy accuracy — three constraints

These are the reasons the obvious version of this video would have been wrong.

### 1. "All your questions answered" is an overclaim — rejected

Monad, verbatim from `messages/en.json:130`:

> Unlimited charts · 1 AI report / day · 5 / week · **2 AI follow-up questions /
> day** · Full history · 20% off Readings

A subscriber who asks a third question that day hits a wall the video told them
was not there. The approved framing — career, money, marriage, health — is a
claim about **what the reading covers**, which is true (`lib/numerology/
interpretations/birth-number.ts` carries `money`, `health` and career blocks per
number), and makes no promise about how many times they may ask.

### 2. The Hindi variant's phone screen stays in English

`messages/hi.json` already tells Hindi users:

> `checkout.paymentInEnglishNote` — "सुरक्षित भुगतान पृष्ठ English में खुलेगा।
> आपकी रिपोर्ट हिंदी में ही रहेगी।"

The payment page really is English. Only the Remotion captions **around** the
phone are Hindi; the mocked screen chrome is English in both variants. A Hindi
checkout mock would misrepresent the product to the exact audience it targets.

### 3. No invented statistics

The build beat says "Until now, India could only pay by card" — true and
checkable. No decline rate, no conversion lift, no "half of checkouts failed".
Nothing in this repo has ever measured those.

## Prices on screen

Derived from `vedic-numerology/lib/commerce/regional-pricing.ts`, not typed from
memory. `INDIA_PLAN_INR.monad.month` = 30 000 paise; `indiaGrossPaise(30000)` =
35 400 paise = **₹354**, GST-inclusive, which is what the site displays *and*
what Dodo charges. The badge under the price is a direct read of
`pricing.indiaBadge`: "Prices shown and billed in ₹ for India."

## Cut grid

`hardstyleV10` is 149.9 BPM — a 12-frame beat at 30fps. **Every cut is a
multiple of 12**, so the beats land on the cuts. This is the constraint that
governs the timing; do not move a cut to a non-multiple of 12 for editorial
reasons without re-checking the bed.

| frame | ×12 | s | beat |
|------:|----:|----:|---|
| 0 | 0 | 0.0 | HOOK — "JUST ₹354 A MONTH" / **IN INDIA** / "And now you can pay by UPI" |
| 48 | 4 | 1.6 | BUILD — "Career, money, marriage, health…" → "All read from one birth date." |
| 192 | 16 | 6.4 | 📱 pricing card — ₹354/mo, GST included |
| 252 | 21 | 8.4 | 📱 checkout — UPI ▸ GPay · PhonePe · Paytm · Netbanking |
| 324 | 27 | 10.8 | 📱 approve in your UPI app |
| 384 | 32 | 12.8 | 📱 ✓ Paid ₹354 — report unlocked |
| 450 | 37.5 | 15.0 | CTA — "Pay with UPI" + `numevix.com` |
| 522 | — | 17.4 | end (`ACT.total`) |

Frame 450 is `ACT.ctaStart`, fixed by `timing.ts`; it falls on an eighth rather
than a beat, which is pre-existing and accepted.

`PatternInterrupt` fires at 192 (`colorShift`), 252 (`flash`), 324 (`flash`) and
384 (`flash`) — gaps of 60, 72 and 60 frames, all inside `INTERRUPT_EVERY` (84).
The 324 interrupt exists for that budget: without it the 252→384 gap is 132
frames, well over the cadence.

No single screen holds longer than 72 frames (2.4s), and each carries staged
internal motion, so nothing violates the spirit of `SCENE_CHANGE`.

## Components

Reused unchanged: `AstrolBackground`, `ViralHook`, `CuriosityGap`,
`CinematicTransition`, `PatternInterrupt`, `CTAEnding`, `BrandAudio`,
`palette.ts`, `motion.tsx`, `timing.ts`.

New:

- **`components/PhoneFrame.tsx`** — device shell only. Rounded body, notch, and
  a clipped screen area; takes `children` and applies a slow `useCameraDrift`.
  Knows nothing about checkout.
- **`components/CheckoutScreens.tsx`** — the four screens, one exported
  component each (`PricingScreen`, `MethodsScreen`, `ApproveScreen`,
  `PaidScreen`). Each takes only the strings it renders, so the Hindi variant
  passes different props rather than branching on a locale flag.
- **`UpiLaunch.tsx`** — the composition. Props-driven; EN and HI differ only by
  the prop object.
- **`upi-templates.ts`** — `UPI_LAUNCH_EN`, `UPI_LAUNCH_HI`, and their cover
  copy.

Edited:

- **`fonts.ts`** — add `DISPLAY_HI` (Noto Serif Devanagari) and `UI_HI` (Noto
  Sans Devanagari). Weights and subsets pinned; the bare `loadFont()` fires 100+
  network requests per render.
- **`Root.tsx`** — new `Viral-Announcements` folder, two compositions plus two
  covers. Kept out of the `Viral` folder so the A/B set stays homogeneous.
- **`ViralCover.tsx`** — widen `number: number` to `number | string` so the
  watermark can read "UPI". One-line type change, no call-site edits.
- **`scripts/export-viral.mjs`** — two `TARGETS` entries.

## V-numbering — deliberately no ledger rows

Exports as `V13 - UPI Is Live` and `V14 - UPI Is Live (Hindi)`, following the
pinned layout: one folder per video directly under `~/Desktop/Numevix Videos/
Viral/`, files prefixed with the folder name, versioned MP4 plus unversioned
cover.

`content/daily-state.json` is **not** touched. `nextVNumber()`
(`scripts/lib/state.mjs:51`) takes the max of the ledger *and* the `V<nn> -`
folder names on disk, so the daily pipeline continues at V15 on its own. Adding
rows would be actively harmful: the exporter's CLI path derives a composition id
for every non-seed generated row via `compositionId(v)`, and these two have
hand-written ids that function would never produce.

## Testing

`upi-templates.test.ts` (vitest, alongside the existing `hooks.test.ts`):

1. **Cut grid** — every value-beat start frame is a multiple of 12, and the
   beats tile `ACT.valueStart`→`ACT.ctaStart` with no gap or overlap.
2. **Price arithmetic** — the displayed "₹354" equals `round(30000 × 1.18)`
   paise formatted, so a GST-rate change fails the test instead of silently
   shipping a wrong price. (The rate is duplicated here rather than imported;
   `vedic-numerology` is a separate repo and is not a dependency.)
3. **Copy rules** — the hook is 5–8 words counted as `hookText` + `hookAccent`
   together ("JUST ₹354 A MONTH" + "IN INDIA" = 6), which is how the existing
   templates are built; `hookText` alone is under the floor on several of them.
   Also: the Hindi prop set has a Hindi string wherever the English one has an
   English string (no untranslated fallthrough).
4. **Hindi screen chrome is English** — asserts the screen props of the HI
   template are byte-identical to the EN ones, encoding constraint #2 as a test
   rather than a comment.

Plus the existing gate: `npm run lint` (eslint + tsc) clean, and a rendered
frame checked at **frame 30** — frame 0 renders empty (springs start at scale 0)
and the accent line clips at ~frame 6 (spring overshoot). Both are pre-existing
and correct; do not "fix" them.

## Out of scope

- Posting. The pipeline produces post-ready files; the owner posts them.
- Trending audio. Licensed in-app only, cannot be baked into a render.
- The stale `pricing.trust` string on the live site — `messages/en.json:134`
  still says "Secure Stripe checkout", which is wrong for India now that Dodo is
  the processor. Noted here because it was found while sourcing copy for this
  video; it is a `vedic-numerology` fix, not part of this work.
