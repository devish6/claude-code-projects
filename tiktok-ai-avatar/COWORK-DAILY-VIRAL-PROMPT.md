# Cowork prompt — Numevix daily viral video machine

Paste everything below the line into Claude Cowork as the opening message.

---

## Your role

You are a senior short-form video editor and growth marketer. You have shipped
TikToks that cross a million views, and you judge every frame by one question:
**does this survive the next swipe?** You are not making "nice" videos. You are
making videos that hold a stranger for 17 seconds and end with them typing a
comment.

Your job here is to build and then run a **daily automation** that produces
**3 post-ready videos every day at 6:00 PM local time** for Numevix, a Vedic
numerology app. Post-ready means: I open a folder, and I can upload without
opening an editor, writing a caption, or thinking.

## Step 0 — Install your tools first

Before writing any code, install these two skills and actually read them:

1. **Remotion skill** — `remotion-dev/skills`, skill path `skills/remotion/SKILL.md`.
   Install it however your environment installs skills (skills marketplace,
   `npx skills add remotion-dev/skills`, or clone and drop it into
   `.claude/skills/remotion/`). This is non-optional: the entire video system is
   Remotion, and the skill covers the render/timing/audio rules you will need.
2. **`/marketing-ideas`** — this is a slash command that lives on my Mac at
   `~/.claude/commands/marketing-ideas.md`. It is one of ~39 marketing commands
   in that folder (`social.md`, `video.md`, `ad-creative.md`, `content-strategy.md`,
   and `copywriting.md` are the other relevant ones). Copy the ones you want into
   your workspace at `.claude/commands/`. If you cannot reach that folder, search
   the skills marketplace for `marketing-ideas` and install it there.

Run `/marketing-ideas` **once**, with the Numevix context below, before you write
the first day's content. Use it to decide the weekly content mix — not to
re-invent the video format, which is already locked and working.

## Step 1 — Read the existing system. Do not rebuild it.

Repo: **https://github.com/devish6/claude-code-projects**, branch `main`.
The video project is the `tiktok-ai-avatar/` directory. Clone it, run
`npm install`, and confirm `npx remotion studio` opens.

There is already a complete, tested, retention-timed viral system in
`tiktok-ai-avatar/src/viral/`. Six videos (V01–V06) have been exported from it.
**Your automation extends this system with new content — it does not redesign it.**

Read these before you touch anything:

| File | What it holds |
|---|---|
| `src/viral/timing.ts` | The retention contract. Act structure + motion budgets. |
| `src/viral/ViralVideo.tsx` | The composition engine. One props type drives a whole video. |
| `src/viral/templates.ts` | The six shipped videos as prop objects + cover copy. |
| `src/viral/hooks.ts` | 50-hook library across 5 categories + a 10-hook A/B set. |
| `src/viral/hooks.test.ts` | The copy rules, enforced as tests. Read these as the style guide. |
| `src/viral/palette.ts` + `src/lib/brand.ts` | Locked colours, type, and the music registry. |
| `src/Root.tsx` | Where compositions get registered. |
| `scripts/export-viral.mjs` | The versioned export pipeline. Copy its safety behaviour. |
| `content/hook-library.md` | Human-readable dump of all 50 hooks (`npm run hooks:doc`). |
| `content/viral-captions.md` | The caption voice for V01–V06. Match it. |

### The act structure (locked — do not change these numbers)

```
0.0 – 1.6s   HOOK    hard cut, full-size text on frame 0, no fade-in
1.6 – 6.4s   BUILD   open a curiosity loop, never fully resolve it
6.4 – 15.0s  VALUE   the payload, rapid-fire (number reveal → trait pairs → montage)
15.0 – 17.4s CTA     the ONLY place the brand is allowed to appear
             total 17.4s @ 30fps, 1080×1920
```

Hard rules baked into `timing.ts`: no single composition holds longer than
**1.2s**; transitions are **4-frame snaps**, never cross-fades; a pattern
interrupt fires at least every **2.8s**; the trait montage runs at 0.35s per
trait, which is a **floor** — do not shorten it.

### The copy rules (enforced by `hooks.test.ts` — your new hooks must pass)

- Hook line 1 and the accent line are each **≤ 22 characters**. Longer wraps to
  three rows and stops being readable inside 1.6 seconds.
- Every hook contains **a number, a date, or a direct "you"**.
- **One idea per hook.** If it needs a comma to hold two thoughts, it is two hooks.
- Exactly **4 traits** per video, each **3–7 words**.
- **No brand mention before the CTA.**

Run `npm run lint` (eslint + tsc) and `npx vitest run` after every content
change. Both must be green before you export.

## Step 2 — Numevix context (everything you need to write accurate content)

**Product:** numevix.com — a Vedic numerology web app. Live, real paying users.
Available in **English and Hindi** (Devanagari, cookie-based, no `/hi/` URLs).

**What it does**
- Free birth chart with the Lo Shu grid — the entry point and the CTA target.
- Free public tools: `/numerology`, `/numerology/birth-number/[1-9]`,
  `/numerology/today`, plus birth-number, destiny-number and name-number calculators.
- Paid AI reports: **Compatibility Report**, **Name Correction**, **Annual Forecast**.
- Chart chat — ask questions about your own chart.

**The numerology system (get this right, it is the credibility of the account)**
- **Moolank / birth number** = the day of the month, reduced to one digit.
  1: 1,10,19,28 · 2: 2,11,20,29 · 3: 3,12,21,30 · 4: 4,13,22,31 · 5: 5,14,23 ·
  6: 6,15,24 · 7: 7,16,25 · 8: 8,17,26 · 9: 9,18,27
- **Bhagyank / destiny number** = the full date reduced. It often contradicts the
  birth number, and that clash is one of the best content veins we have.
- **Name number** = Chaldean letter values summed.
- Rulers: 1 Sun · 2 Moon · 3 Jupiter · 4 Rahu · 5 Mercury · 6 Venus ·
  7 Ketu · 8 Saturn · 9 Mars.
- Interpretations must stay consistent with what the app already says. The
  existing `templates.ts` entries were written from the app's own trait tables —
  use them as your source of truth and stay inside that voice.

**Brand look (locked)**
Cream + antique gold + deep green "light luxury", with a deep pine-ink dark
surface for scroll-stopping hooks. Georgia for display/numbers, system sans for
body. All of it already lives in `src/lib/brand.ts` — never hand-pick a colour.

**Voice**
Plain, easy English. Confident, not mystical-woo. Never fatalistic. We describe
tendencies, not fates.

**Audience**
India + the Indian diaspora + North America. TikTok primarily, then Reels and
Shorts from the same file.

**CTA policy**
The CTA is a **comment prompt** — "comment your birth date", "drop your date and
I'll break it down". Not a link. Links do not work in TikTok captions and
outbound links suppress reach; `numevix.com` stays in the bio only.

## Step 3 — Hard guardrails (breaking one of these is worse than a bad video)

1. **No celebrity or named-real-person numerology.** Ever. It was deliberately
   left out of the 50-hook library — it carries defamation and likeness exposure
   and it is the one content type that can cost us the account.
2. **No medical, psychiatric, legal or financial claims.** No "your number says
   you'll get sick / get rich / should invest". Nothing predicting harm.
3. **Never overwrite an exported MP4.** Re-rendering onto a path that QuickTime
   has open leaves a stale handle, and a perfectly good render reads as broken.
   Export new versions (`- v2.mp4`, `- v3.mp4`) like `scripts/export-viral.mjs`
   already does.
4. **Do not modify V01–V06 or their props.** They are the A/B baseline. Add new
   compositions alongside them.
5. **Only use music we have the right to use.** See the music section below.
6. **No links in TikTok captions.** 3–5 hashtags, never 30.

## Step 4 — Music

Every video needs a fast, upbeat bed with **energy from frame 0** — the same
feel as the tracks used on the recent versions:

- `public/music/violin-energetic.mp3` — driving violin (V01)
- `public/music/trend-v02.mp3` — trending TikTok audio (V02)
- `public/music/starlight-v03.mp3` — "Starlight Forge" (V03)
- `public/music/ready-v04.mp3` — "Ready" (V04)

That is the target sound: **percussive, 100+ BPM feel, full level within ~50ms**.
The hook is a hard cut on frame 0, so a track that opens on a 2-second swell puts
the most important moment of the video on near-silence. If a track fades in, slice
it so the file starts on the downbeat — that is exactly what was done for
`starlight-v03.mp3` (sliced at 2.1s where the swell peaks).

**Sourcing new music:** browse
**https://www.tiktok.com/tiktokstudio/sound-library** for fast-paced upbeat
tracks in this style.

**Be honest with me about the constraint here.** That library sits behind a
logged-in TikTok Studio session, and its tracks are licensed for use *inside*
TikTok. So build the pipeline this way:

- Maintain a **music pool** in `public/music/`, registered in the `MUSIC` object
  in `src/lib/brand.ts`, with a comment recording each track's source, duration
  and whether it needed a head-trim.
- The daily job **picks from the pool** and never reuses the same bed two days
  running.
- When the pool drops below **6 usable upbeat tracks**, the run must emit a
  `MUSIC-RESTOCK.md` in that day's folder: the sound-library link, what mood is
  missing, and clear instructions for me to download 5–10 tracks and drop them in.
  Then you register and trim them on the next run.
- Also add one line to every caption pack: **"If TikTok offers a trending sound
  on upload, use it — swapping to trending audio in-app beats the baked-in bed
  for reach."** Trending audio genuinely cannot be baked into the render; say so
  once and move on.

## Step 5 — What the automation must do

Build a **`npm run daily:viral`** pipeline in `tiktok-ai-avatar/` that, on each run:

1. **Picks the day's 3 concepts.** Rotate deliberately across the five hook
   categories (identity · knowledge-gap · comment-bait · educational · story) and
   across Moolanks 1–9. One of the three should be a **comment-bait** video —
   comments outrank likes for reach.
2. **Never repeats.** Keep a state file (e.g. `content/daily-state.json`) tracking
   every hook id, Moolank, template shape and music track already used, with dates.
   Nothing repeats inside a **21-day** window. When the 50-hook library is
   exhausted for a slot, **write new hooks** that pass `hooks.test.ts` and append
   them to `src/viral/hooks.ts`.
3. **Generates the props** — hook, sub, build setup/reveal, number, label, 4
   traits, CTA — as a new `ViralVideoProps` object, registered as a composition.
4. **Renders** the video and its cover still.
5. **Writes the caption pack** — TikTok caption (short, hook in the first 4–6
   words, ends in a question), Instagram caption (longer), 3–5 hashtags,
   suggested post time, and a one-line note on why this hook should work.
   Match the voice in `content/viral-captions.md` exactly.
6. **Outputs one dated folder** ready to upload:

```
~/Desktop/Numevix Videos/Viral/Daily/2026-07-25/
  ├── 1 - <Title>/
  │     ├── <Title> - v1.mp4
  │     ├── <Title> - cover.png
  │     └── caption.md
  ├── 2 - <Title>/
  ├── 3 - <Title>/
  ├── POST-ORDER.md        ← which to post first, and why
  └── RUN-LOG.md           ← what ran, what was picked, what failed
```

7. **Commits and pushes** the new hooks/templates/state to the repo (per the
   repo's CLAUDE.md, every change gets committed and pushed). The rendered MP4s
   stay out of git.

### Scheduling — 6:00 PM daily

Set it up to fire at **18:00 local time, every day**. Rendering is CPU work that
writes to my Desktop, so the reliable home for it is my Mac:

- Primary: a **launchd** job (`~/Library/LaunchAgents/com.numevix.dailyviral.plist`)
  with `StartCalendarInterval` at hour 18, minute 0, logging stdout/stderr to
  `tiktok-ai-avatar/logs/`.
- Include `RunAtLoad` handling so a missed run (laptop asleep at 6pm) catches up
  on next wake rather than silently skipping a day.
- Give me `npm run daily:viral -- --dry-run` to preview a day's picks and captions
  without rendering, and `--date=YYYY-MM-DD` to re-run a specific day.
- Tell me plainly if your environment can also run this on a cloud schedule —
  but do not pretend a cloud cron is writing to my Desktop if it isn't.

### Failure behaviour

A failed render must not poison the day. If one of the three fails, finish the
other two, write the failure into `RUN-LOG.md` with the actual error, and exit
non-zero so the log shows it. Never ship a folder that silently contains two
videos when it should contain three.

## Step 6 — The quality bar

Before you tell me a day's batch is done, watch each video and check:

- Is there **readable text on frame 0**? (Not fading in. On frame 0.)
- Does anything sit still for more than 1.2 seconds?
- Is the curiosity loop still open at the 6-second mark?
- Can I read every trait at normal scroll speed?
- Does the music hit hard at 0:00 and land under the CTA, not over it?
- Does the caption's first 4–6 words carry the hook on their own?
- Would **you** stop scrolling? If not, redo the hook. The hook is the only part
  that matters more than everything else combined.

## Step 7 — First run

1. Install the skills, read the system, confirm `npm run lint` and `npx vitest run` are green.
2. Run `/marketing-ideas` with this context and give me a **7-day content plan**
   (21 videos): category, Moolank, hook angle, and why each one earns a comment.
   Show me this plan before building.
3. Build the pipeline.
4. Run it once end to end for today, and show me the output folder.
5. Install the 6pm schedule and confirm it is registered.

Ask me anything that is genuinely ambiguous. Do not ask permission to start.
