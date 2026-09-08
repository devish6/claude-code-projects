# Render report — the cut is finished. Your spec, measured against the result.

Rendered 1080x1920, 30fps, 16.66s, 498 frames. All gates and 795 tests pass.
`art-direction.md` (yours, unchanged) is beside this file for reference.

## 1. The plates came back far lighter than your targets

The generator does not honour absolute luma. But the SHAPE of your ladder
survived: monotonic descent with your intended lift at the end.

| plate | your target | delivered (full / centre) |
|---|---|---|
| glass-a | 122 | 175 / 191 |
| linen-b | 88 | 156 / 155 |
| plaster-c | 76 | 122 / 137 |
| stone-d | 57 | 93 / 95 |
| fold-e | 45 | 47 / 44 |
| threshold-f | 49 | 55 / 56 |

I chose NOT to grade them down to your targets, because contrast passed
comfortably at native brightness and a brighter opener serves the experiment.

## 2. THE PROBLEM. Our scrim flattened your ladder.

A scrim (a downward-darkening black gradient) is composited over every plate so
type stays legible. Measured on the actual rendered frames:

| scene | plate centre | RENDERED | kept |
|---|---|---|---|
| 1 glass-a | 191 | 75.4 | 39% |
| 2 linen-b | 155 | 67.2 | 43% |
| 3 plaster-c | 137 | 74.5 | 54% |
| 4 stone-d | 95 | 57.8 | 61% |
| 5 fold-e | 44 | 39.7 | 90% |
| 6 threshold-f | 56 | 46.2 | 83% |

It keeps 39% of the bright plates and 90% of the dark ones. So:
- Your designed range (122 to 45, a span of 77) rendered as 75 to 40, span 35.
- **Scene 3 now renders BRIGHTER than scene 2** (74.5 vs 67.2). Your descent
  inverts in the middle.
- The emotional arc you specified — light open, gathering weight, dark
  threshold — is mostly gone. It reads as one fairly even dim video.

## 3. You were right about the ink and I was wrong

I told you cream ink, citing a repo measurement that dark ink decays to 1.4:1.
That measurement was taken under our HEAVIEST scrim, which darkens the ground
until it is no longer light. On a light ground with a light scrim:

| ink + scrim | rendered frame luma | contrast |
|---|---|---|
| cream + heavy (SHIPPED) | 78 | 7.1:1 |
| cream + normal | 134 | 3.1:1 (our floor is 3.0 — too thin) |
| dark + light | 166 | 6.3:1 |

Dark ink is the only way to get a genuinely light frame. Your original call.
The cost: scenes 5 and 6 are dark grounds and need cream ink, so the ink must
change partway through the cut, across a 0.5s cross-dissolve.

## What I want your opinion on

1. Is the flattened ladder worth re-rendering for, or is it acceptable? Be
   blunt — I am not attached to the current render.
2. If we go dark-ink, WHERE should the ink change, and how do we stop the
   0.5s dissolve looking like a glitch? You flagged this risk in your spec
   before I hit it.
3. Would you instead grade the plates so the ladder survives the scrim —
   i.e. pre-compensate, pushing plates 1-2 much brighter and 5-6 darker so
   the RENDERED result lands on your original 122/88/76/57/45/49?

Answer in your summary. Do not message the Claude agent.
