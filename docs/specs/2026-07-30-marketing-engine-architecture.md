# Numevix Marketing Engine — Architecture Evaluation & Plan

**Date:** 2026-07-30
**Status:** proposal, awaiting account/credential decisions
**Scope:** the brief's "First Task" — inspect, evaluate, recommend. No code written yet.

---

## 1. What actually exists (inspected, not assumed)

`tiktok-ai-avatar/` is a mature Remotion 4.0.467 project. It is much further along than "an existing Remotion project."

**Rendering — built and proven**
- 51 source files. 3 video systems: `promos/` (10 compositions), `viral/` (the daily engine), `talking/` (talking-head cuts).
- A real motion vocabulary already exists: `NumberReveal`, `PatternInterrupt`, `CuriosityGap`, `CinematicTransition`, `PhoneFrame`, `CheckoutScreens`, `AstrolBackground`, `vfx.tsx`, `motion.tsx`, `timing.ts`, `palette.ts`.
- Beat-sync is solved and hard-won: **150 BPM target**, 12-frame beat at 30fps is the only tempo that lands on the cut grid. 10 tracks in the fast-track pool, floor of 6.

**Pipeline — built and proven** (`scripts/daily-viral.mjs`, 318 lines)
- Produces 3 post-ready videos/day. Days 1–7 from a hand-authored `weekly-plan-w1.json`; day 8+ from `picker.mjs` (21-day no-repeat, moolank coverage).
- `--dry-run` is genuinely non-mutating — a deliberate design decision, documented, because persisting V-numbers from a preview would desync state.
- Failure isolation: one bad render does not poison the day's batch.
- Already writes, per video: MP4, **TikTok caption, Instagram caption, hashtags, suggested post time, "why this earns a comment"**, plus `POST-ORDER.md` and `RUN-LOG.md`.
- Auto-commits code/content, never the MP4s.

**Distribution — does not exist**
- `grep -rlniE "oauth|access_token|playwright|puppeteer|graph\.facebook|googleapis"` over `src/` and `scripts/`: **zero matches.**
- No `.github/workflows/`. launchd schedule specced but never installed.
- The pipeline ends at "files on the Desktop." **Every video is still posted by hand.**

**The uncomfortable data point**
- TikTok account **deleted 2026-07-28** after literal 0 views. Cause never isolated. Web upload is the leading suspect.
- Therefore: **there is currently no performance data at all.** Not thin data — none.

### What this means

The brief asks for nine agents. Eight of them consume performance data. There is no performance data, and the one channel that was producing it is gone. The binding constraint is **distribution and measurement, not content generation** — content generation is the part that already works.

---

## 2. Three conflicts in the brief that need resolving

The brief asks to be challenged. These are the places where following it literally would cost money or accounts.

### 2.1 The QA agent as specified cannot work, and is not free

"Watch every rendered video, score /100, regenerate below 90" requires a vision model on every render — 3+ calls/day forever. That breaks "near-$0" and the growth program's standing zero-AI rule.

Worse, it wouldn't work: **a model scoring its own output has no ground truth.** The number is unanchored, drifts between runs, and a regenerate-until-90 loop optimizes for whatever the scorer likes, not for watch time.

**Recommend instead — two real layers:**
- **Deterministic QA (free, objective, catches actual defects):** text inside the safe area, contrast ratio, hook readable by frame 15, duration in 20–30s, audio non-silent at frame 0 (this class of bug is real — `BrandAudio` silenced frame 0 and it shipped), caption length limits per platform, no overlay on the speaker's face. These are assertions, not opinions, and they run in `npm test`.
- **The true score is retention.** Average view duration and completion rate from the platform. That is ground truth, it is free from the APIs, and it needs distribution to exist first.

### 2.2 "Agent" must mean a session, not a paid API loop

Near-$0 and an autonomous LLM agent fleet are in direct tension — unless "agent" means **a Claude Code skill/subagent I run in a session**, which costs nothing extra, rather than a cron-triggered API loop billed per call.

**Recommend:** the nine roles become **skills in the repo** (`.claude/skills/`), invoked when I'm working. Deterministic code handles everything that runs unattended. Recurring cost stays at zero. This also keeps the standing zero-AI-at-runtime rule intact.

### 2.3 Browser automation is the one thing you must not build

The brief lists Playwright/Puppeteer as a candidate. Given an account was just deleted after suspected web upload, automating that same surface is the highest-risk option available. It also violates TikTok's and Meta's terms, which means the failure mode is not a broken selector — it is a second terminated account, and a permanent device/IP association.

**Recommend: rule it out entirely.** It is the only option on the table that can destroy an asset you cannot rebuild.

---

## 3. Publishing strategy — scored evaluation

Scored 1–10. **Weighted toward account safety**, because account loss is unrecoverable and you have already sustained one.

| Option | Reliab. | Maintain. | Cost | Setup | Scale | Break risk | ToS | Full auto | **Total /80** |
|---|---|---|---|---|---|---|---|---|---|
| **Official platform APIs** | 9 | 9 | 10 | 5 | 9 | 8 | 10 | 7 | **67** |
| **launchd + local render** (render only) | 9 | 9 | 10 | 9 | 7 | 8 | 10 | 8 | **70** |
| **GitHub Actions** (schedule/publish only) | 8 | 8 | 9 | 7 | 8 | 7 | 10 | 8 | **65** |
| **Native in-app schedulers** | 8 | 10 | 10 | 9 | 5 | 9 | 10 | 2 | **63** |
| **n8n self-hosted** | 6 | 5 | 7 | 4 | 7 | 5 | 8 | 8 | **50** |
| **MCP servers** | 6 | 6 | 9 | 6 | 5 | 6 | 9 | 5 | **52** |
| **Free-tier SaaS (Buffer/Publer)** | 7 | 8 | 6 | 8 | 4 | 7 | 10 | 5 | **55** |
| **Browser automation** | 4 | 2 | 10 | 6 | 5 | 2 | **1** | 9 | **39** |

### Per-platform API reality (the detail that decides sequencing)

| Platform | API path | Cost | Real constraint |
|---|---|---|---|
| **YouTube Shorts** | Data API v3 `videos.insert` | Free | 1600 quota units/upload, 10k/day → ~6 uploads/day. Plenty for 3/day. **Most permissive. Start here.** |
| **Instagram Reels** | Instagram Graph API | Free | Needs IG **Business/Creator** account linked to a Facebook Page. ~50 posts/24h. |
| **Facebook Reels** | Pages API | Free | Same Meta app as above — one integration covers both. |
| **TikTok** | Content Posting API | Free | Unaudited apps can only send to **drafts/inbox**; Direct Post needs audit. Drafts still remove the risky web-upload step. |
| **Pinterest** | API v5 | Free | Needs app review for production. Low priority. |
| **X** | API v2 | **$200/mo** for practical media upload | Free tier can't realistically post video. **Deprioritize or post by hand.** |

### Recommendation

**Local render (launchd) + official APIs for distribution + GA4 for site-side attribution. No browser automation, no n8n, no paid SaaS.**

Why this beats the alternatives:
- **Render stays local.** Remotion on GitHub Actions means Chrome headless + ffmpeg on a slow shared runner; macOS runners are billed at 10× minutes. Your Mac renders free and fast. Actions is the wrong place for the expensive step.
- **n8n adds an orchestration layer that duplicates a 318-line pipeline that already works,** plus an always-on host. It buys a GUI you don't need.
- **MCP is an interface, not a transport.** It doesn't solve OAuth or ToS. Useful later as the way *I* call the publisher; not an architecture.
- **APIs are the only ToS-compliant automated path**, and three of them are free.

---

## 4. How Slice 6c Part 2 folds in

6c Part 2 is already specced (feed → snapshot → daily-energy video). It should ship **essentially as specced**, with one addition that turns it into the foundation for everything above.

**Reuse, unchanged:**
- `sync-daily-energy.mjs`, `content/daily-energy.json`, the prop mapping onto `ViralVideo` — all still correct.
- The caption/hashtag generator already in `daily-viral.mjs` — this *is* the Publishing Agent's content half, already deterministic and already written.
- `picker.mjs`, the 21-day rule, music selection — untouched, as the spec requires.

**One addition — the join key.** Give every generated video a stable **`videoId` and a per-video UTM link** (`?utm_source=tiktok&utm_campaign=daily&utm_content=<videoId>`), written into the caption pack and into `daily-state.json`.

This is small and it is what makes the Analytics Agent possible at all: GA4 is already collecting (Slice 6b, live 2026-07-30), so a per-video UTM is the only thing standing between "we posted a video" and "that video produced N sessions and M signups." Without it, platform metrics and site metrics can never be joined, and the self-improving loop has no input.

**Do not** let the feed pick the number — the spec already rejected this correctly (only 7 planets rule weekdays, so moolank 4 and 7 would never feature again). And the correctness constraint stands: **day traits from the day's own fields, never `moolank-traits.json`** — borrowing personality traits for a date would contradict `/tarot`'s own "a correspondence, not a prediction" framing.

---

## 5. Phased plan

**Phase 0 — Re-establish distribution and ground truth (highest value, mostly not code)**
Before any automation: a fresh TikTok account, posted **from the phone, natively**, for 7 days from the existing backlog (V05–V14 are rendered and waiting). This isolates whether web upload killed the last account, and produces the first performance data the entire system depends on. Automating onto an unexplained ban reproduces the ban at machine speed.

**Phase 1 — 6c Part 2 + the join key**
Ship the daily-energy video as specced, plus `videoId`/UTM. Add the deterministic QA assertions (§2.1) to `npm test`. Install the launchd schedule. Still zero external dependencies.

**Phase 2 — YouTube Shorts publishing (first real automation)**
OAuth once, refresh token stored **outside this repo** (it is public and Pages-served — see §6). `videos.insert` from the local pipeline. Lowest-risk platform, most permissive API, immediate reach with zero manual steps.

**Phase 3 — Meta (Instagram + Facebook Reels)**
One Meta app covers both. Requires the IG account to be Business/Creator and linked to a Page.

**Phase 4 — TikTok Content Posting API, drafts-first**
Even unaudited, drafts remove web upload from the loop entirely — you tap publish in the app. If the audit clears, it becomes direct post.

**Phase 5 — Analytics loop closes**
Pull YouTube Analytics + IG Insights + TikTok Display API; join to GA4 sessions on `utm_content`. *Now* the Marketing Director and Creative Director skills have real retention data, and hook selection can be weighted by measured performance instead of intuition.

**Deliberately deferred:** X (costs $200/mo), Pinterest (needs review), n8n, any paid SaaS.

---

## 6. Hard constraint: where credentials may live

**This repo is PUBLIC and GitHub-Pages-served.** OAuth refresh tokens, client secrets and API keys must never enter it. `.gitignore` now covers `.mcp.json` for exactly this reason.

Publisher credentials go in **`~/.numevix-publish/credentials.json`** (outside the repo, chmod 600), read by the pipeline at runtime. If publishing ever moves to GitHub Actions, they go in encrypted repository secrets — never in the tree.

---

## 7. What I need from you

Only the items the brief reserves for a human — accounts, OAuth, and verification. Everything else I can build without asking.
