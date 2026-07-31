# Numevix Growth OS — Audit & Sequencing

**Date:** 2026-07-31
**Supersedes nothing.** Reads as a delta on `2026-07-30-marketing-engine-architecture.md`, which
already scored the distribution options and resolved three conflicts in the same brief. That
scoring still stands and is not repeated here.
**Method:** every claim below was run, not recalled. Three memory notes were found stale during
this audit and corrected.

---

## 1. What changed in 24 hours

The previous doc said *"Distribution — does not exist. Zero matches for oauth/access_token/
graph.facebook/googleapis."* That is no longer true. Phases 2, 3 and 4 all shipped.

| Phase (from the 2026-07-30 plan) | Then | Now |
|---|---|---|
| 1 — 6c Part 2 + UTM join key | specced | ✅ shipped, per-video `utm_content` live |
| 2 — YouTube Shorts | not started | ✅ shipped, 2 real uploads |
| 3 — Meta (IG + FB Reels) | not started | ✅ shipped, V17 live on both |
| 4 — TikTok, drafts-first | not started | ✅ shipped, V17 + V18 delivered to inbox |
| 5 — Analytics loop | not started | 🔴 **still not started** |

---

## 2. Current state, by the seven areas asked for

| Area | State | Evidence |
|---|---|---|
| **Content generation** | ✅ Mature | `daily-viral.mjs`; day 1–7 hand-authored, day 8+ `picker.mjs` with 21-day no-repeat |
| **Rendering** | ✅ Mature | Remotion 4.x, 3 systems (`promos/`, `viral/`, `talking/`); variation engine wired end-to-end |
| **Distribution** | ✅ 4 of 6 platforms | YouTube, Instagram, Facebook, TikTok(drafts). Pinterest not built. X deprioritised ($200/mo) |
| **Automation** | 🔴 **None** | No launchd agent installed. Nothing runs without a human typing a command |
| **Scheduling** | 🟡 Written, not installed | `deploy/com.numevix.dailyviral.plist` exists; never loaded |
| **Analytics (site)** | ✅ Live | GA4 via Slice 6a/6b; per-video UTM is the join key |
| **Data collection** | 🔴 **Write-only** | `~/.numevix-publish/*-uploads.json` record *what we posted*. Nothing records *how it did* |

### The measurement checklist, answered honestly

Every item asked for: **views, watch time, completion rate, click, share, save, signup, conversion.**

`grep -rlniE "analytics|insights|statistics|viewCount|watch_time|reports.query"` over `scripts/`
and `src/` returns **four files, and all four are false positives** — the word "analytics" appears
only inside code comments about UTM. There is no API call anywhere that reads a metric back.

**Every single measurement item is absent.** Not partial. Absent.

---

## 3. The finding that should decide what we do next

The brief's three largest sections — Continuous Optimization Loop, Retention Analysis, A/B
Testing — all consume performance data. Here is the entire corpus that exists:

| Platform | Published | Data available |
|---|---|---|
| YouTube | 2 (one **private**) | 1 public video, 1 day old |
| Instagram | 1 | 1 post |
| Facebook | 1 | 1 post |
| TikTok | **0 published** — V17 and V18 are sitting **unpublished in the drafts inbox** | none |
| Previous TikTok account | deleted 2026-07-28 | zero views, then gone |

**Three published videos. One platform at n=1.**

A/B testing on that is not analysis, it is noise. "Which hook performs best," "which colours
perform best," "which scene lengths performed best" cannot be answered — not because the code is
missing, but because the observations are missing. Building the learning loop now produces a
system that confidently reports patterns in randomness.

### Two things are quietly broken, and both are supply-side

1. **The pipeline has not run since 2026-07-30.** Latest batch is V15–V18. No V19+ exists. The
   machine that makes the content is idle because nothing schedules it.
2. **TikTok videos are made and never posted.** V17 and V18 reached the drafts inbox and stopped.
   Drafts are deliberate (a human taps publish), but nobody tapped.

So the bottleneck is not hooks, templates, or scoring. It is that **supply stopped and the last
metre of distribution is a manual step nobody performs.**

---

## 4. Recommended order — and what I am arguing against

The brief asks to be challenged. I am challenging the sequencing, not the goal.

**Do not build the optimization loop yet.** It is the right destination and the wrong first step.
It has no input, and every day spent building it is a day the pipeline produces nothing.

| # | Step | Why it is first | Effort |
|---|---|---|---|
| 1 | **Install the launchd scheduler** | Restarts supply. Everything downstream needs a stream of videos to exist | ~10 min |
| 2 | **Publish the TikTok drafts; keep posting daily** | Converts inventory into the only thing that generates data | manual, daily |
| 3 | **Build metric ingestion (Phase 5)** | The missing organ. YouTube Analytics API, IG Insights, TikTok Display API → join to GA4 on `utm_content` | ~half a day |
| 4 | **Let it run ~2–3 weeks** | Statistical floor. ~40–60 videos before any hook/length pattern is real | waiting |
| 5 | **Then the optimization loop** | Now it has ground truth instead of vibes | as briefed |

Steps 1–3 are the whole of what I would build this week. Step 4 is unavoidable and cannot be
compressed by writing more code.

### Deterministic QA — agreed, and buildable now

The brief's insistence on deterministic tests over subjective scoring is correct and matches
what the 2026-07-30 doc argued independently. Safe-area, contrast, hook-readable-by-frame-15,
duration bounds, non-silent-at-frame-0, caption length. These are free, objective, need no data,
and can be built in parallel with step 4's waiting period. **This is the right thing to build
while the data accumulates.**

---

## 5. Background music — measured

Asked for: unique background music.

Pool is **10 fast tracks, floor of 6, currently healthy.** Across 16 videos, 12 distinct beds
have been used; heaviest reuse is `voltSlope` ×3.

🔴 **But the arithmetic breaks under daily scheduling.** At 4 videos/day against 10 tracks, a bed
repeats roughly every 2.5 days. Given the previous account was withheld for a *duplicate
fingerprint*, and music is part of that fingerprint, the pool needs restocking before the
scheduler runs indefinitely.

⭐ Constraint that governs any restock: **150 BPM**, because at 30fps a 12-frame beat is the only
tempo landing on the cut grid (frames 48/192/264/336). Workable ±6% = 141–159. The track must
also open on a hard transient, not a fade. `voltSlope` is currently the only native-150 bed.

---

## 6. What I need from you

Only what the brief reserves for a human.

1. **Go-ahead to install the scheduler.** Loading it fires one real run immediately (`RunAtLoad`
   is deliberate — it is how a missed 18:00 run catches up). That means ~4 renders now.
2. **Publish the two TikTok drafts.** They are in the app's inbox. Nothing I can do from here.
3. **Nothing else.** Metric ingestion reuses the OAuth tokens already stored at
   `~/.numevix-publish/credentials.json` — YouTube Analytics needs one extra read scope, which I
   will flag when I get there.

---

## 7. Standing constraints carried forward

- Credentials never enter this repo — it is **public and Pages-served**.
- **No browser automation.** An account was already lost; automating the suspected surface risks
  a second, permanent loss. This remains ruled out.
- Zero-AI-at-runtime. "Agent" means a skill invoked in a session, never a billed API loop.
