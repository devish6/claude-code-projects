# AI Content Team — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build five Claude Code skills — Analyzer, Angle, First Second, Funnel, QA — that run a one-change-per-cycle content loop, judged on the 0–1s retention drop rather than on the dead ≥6s watch-time target.

**Architecture:** Each skill is a `SKILL.md` under `.claude/skills/` backed by deterministic Node tooling in `scripts/` and `src/viral/`. Skills carry judgement; scripts carry measurement. No AI at runtime, no API loop, near-$0. Pure functions live in `scripts/lib/*.mjs` with colocated `*.test.mjs` so every rule is a test rather than a remembered convention.

**Tech Stack:** Node 20+ ESM, vitest (`npm test`), Remotion 4.0.467 / React 19 (`src/viral`), ffprobe/ffmpeg (homebrew, `/opt/homebrew/bin`), Windsor.ai Instagram connector (MCP in-session; REST as the durable path).

## Global Constraints

Every task's requirements implicitly include this section.

- **Repo is PUBLIC and Pages-served.** No key, token or endpoint may enter this repo. Credentials live in `~/.numevix-publish/credentials.json` (chmod 600).
- **Commits in this repo end with:** `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` (the `vedic-numerology` repo must OMIT the trailer — it blocks the Vercel deploy; nothing in this plan commits there).
- **All content is English on every platform.** Never re-narrate a number.
- **"Vedic grid", never "Lo Shu"** — enforced by `scripts/lib/content-rules.test.mjs`.
- **Never lift a numerology claim from competitor copy.** Every number fact is DERIVED from `vedic-numerology/lib/numerology/friendship.ts` via `scripts/derive-compatibility-pairs.mjs`, which exits non-zero on drift.
- **One change per cycle.** Two simultaneous changes make the measurement meaningless.
- **Publisher role stays excluded.** API-uploaded YouTube Shorts measured max 3 views across n=7 vs hand-posted median ~17 / max 158. The owner hand-posts everywhere.
- **`media_reel_avg_watch_time` is in MILLISECONDS.** `3206.0` = 3.2s.
- **Windsor exposes NO duration field.** Duration comes from our own ledger — that is Task 1.
- **Duration must vary per video.** A fixed 17.450667s once made TikTok read the set as repeated content. `STRUCTURES` totals in `scripts/lib/variation.mjs` are the variation axis and this plan does not change any of them.
- **A scene may never exceed `SCENE_CHANGE * 2`** (72 frames). Breaching it once held a trait on screen for 2.05s.
- **Test command is `npm test`** (vitest run). Lint is `npm run lint` (eslint + tsc).

## The evidence this plan is built on

Measured 2026-08-08/09, not assumed. Do not re-derive these.

| Fact | Consequence for this plan |
|---|---|
| ≥6s watch time → median reach 1,487 before 07-28 but **248 after**, with **0 of 16** posts reaching 1,000 (one at 11.4s got 498) | The ≥6s target is **dead as the loop's metric**. Task 5 does not optimize for it. |
| Only **7 of 41** posts have a known duration | Task 1 exists, and blocks the next analysis. |
| Instagram's first *publisher* post is **07-31**; 07-28/29/30 were hand-posted and already dead (11.4s→498, 6.0s→341) | The upload route is **ruled out** as the Instagram cause. Do not re-test it. |
| Last post over 1,000 reach is **07-24**; 6 of the 8 all-time winners fall on **07-16 and 07-17** | The break is after 07-24, not 07-28. Task 2 reports cluster structure, not just an era split. |
| Both measured TikTok curves die at **0:01**; a 32s→12s cut bought **0.4s** | Length is not the variable. The first second is. |
| Compatibility content did 51.9K–57.2K on an account whose other posts did 6.8K–25.9K | Angle (Task 4) is the largest measured lever. |
| The seb.ai engine is a **comment-to-DM funnel** (2,953 comments / 673 likes), not the 7 agents | Task 6. Meta App Review submitted 2026-08-08, up to 20 days → **hand-fulfilment is the plan of record**. |

---

## File Structure

**New — tooling**

| File | Responsibility |
|---|---|
| `scripts/lib/duration.mjs` | Probe and record rendered duration per V-number. Pure parse/merge + one ffprobe call. |
| `scripts/backfill-durations.mjs` | One-shot: fill `durations.json` from every MP4 we can still find. |
| `scripts/lib/windsor.mjs` | Pure: ms→s, media_id→V join, watch-time buckets, medians, baseline deltas, cluster detection. |
| `scripts/analyze-reach.mjs` | CLI: fetch Windsor rows, join, print the baseline + cluster report. |
| `scripts/lib/niche.mjs` | Pure: same-account lift, age-skew rejection. Guards the outward scan's two known mistakes. |
| `scripts/lib/angles.mjs` | Pure: angle selection, no-repeat window, evidence validation. |
| `content/angles.json` | The angle registry. Data, not code. |
| `scripts/lib/funnel.mjs` | Pure: comment intent parsing, DM copy from DERIVED pairs, CTA builder + validator. |
| `scripts/funnel-queue.mjs` | CLI: build the hand-fulfilment queue from Windsor comment rows. |
| `src/viral/qa.ts` | Structural render gates (payload timing, scene ceilings, trait/scene parity). |
| `scripts/qa-frame.mjs` | Pixel gate: frame 0 must be non-blank, via a raw greyscale dump from ffmpeg. |
| `scripts/lib/qa-frame.mjs` | Pure: mean/stddev over a raw greyscale buffer, and the verdict. |

**New — skills**

`.claude/skills/analyzer/SKILL.md` · `.claude/skills/angle/SKILL.md` · `.claude/skills/first-second/SKILL.md` · `.claude/skills/funnel/SKILL.md` · `.claude/skills/qa/SKILL.md`

**Modified**

| File | Change |
|---|---|
| `src/viral/timing.ts` | Acts re-cut so the payload starts at 2.0s. Totals unchanged. |
| `src/viral/timing.test.ts` | New assertions for the payload boundary. |
| `scripts/lib/variation.mjs` | `STRUCTURES` acts re-cut. **Every `seconds` total stays identical.** |
| `scripts/publish-next.mjs` | Record duration on publish (YT/FB/TikTok path). |
| `scripts/publish-card.mjs` | Record duration on publish (Instagram path). |
| `package.json` | New scripts: `analyze:reach`, `backfill:durations`, `qa:frame`, `funnel:queue`. |

**Tests** are colocated: `scripts/lib/<name>.test.mjs`, `src/viral/<name>.test.ts`.

---

### Task 1: Duration instrumentation

Without this, the next analysis hits the same 7-of-41 wall. Nothing downstream is trustworthy until it lands.

**Files:**
- Create: `scripts/lib/duration.mjs`
- Create: `scripts/lib/duration.test.mjs`
- Create: `scripts/backfill-durations.mjs`
- Modify: `scripts/publish-next.mjs`
- Modify: `scripts/publish-card.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `parseFfprobeDuration(stdout: string) => number | null`, `mergeDurations(existing: object, incoming: object) => object`, `probeDuration(path: string) => Promise<number | null>`, `recordDuration(v: string, path: string, dir?: string) => Promise<number | null>`, `loadDurations(dir?: string) => object`. Ledger file: `~/.numevix-publish/durations.json`, shape `{ "V17": 23.45, "M2R": 18.05 }`.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/duration.test.mjs`:

```js
import { describe, expect, test } from "vitest";

import { mergeDurations, parseFfprobeDuration } from "./duration.mjs";

describe("parseFfprobeDuration", () => {
  test("reads the plain number ffprobe prints with -of default=nw=1:nk=1", () => {
    expect(parseFfprobeDuration("18.048000\n")).toBe(18.05);
  });

  test("rounds to 2dp, because the ledger is read by humans comparing videos", () => {
    expect(parseFfprobeDuration("23.454667")).toBe(23.45);
  });

  // ffprobe prints "N/A" for a stream it cannot measure, and Number("N/A") is
  // NaN. Writing NaN into the ledger produces `null` after a JSON round-trip
  // and silently reads back as "never measured", which is the one state this
  // whole task exists to eliminate.
  test("returns null rather than NaN when ffprobe cannot measure the file", () => {
    expect(parseFfprobeDuration("N/A\n")).toBeNull();
    expect(parseFfprobeDuration("")).toBeNull();
  });
});

describe("mergeDurations", () => {
  test("adds new entries", () => {
    expect(mergeDurations({ V17: 23.45 }, { M2R: 18.05 })).toEqual({
      V17: 23.45,
      M2R: 18.05,
    });
  });

  // A re-render legitimately changes duration (V18 was re-rendered on
  // 2026-08-01 because it ended in 2.8s of silence). The ledger must follow
  // the file, not freeze the first reading.
  test("a later real measurement overwrites an earlier one", () => {
    expect(mergeDurations({ V18: 31.7 }, { V18: 28.9 })).toEqual({ V18: 28.9 });
  });

  // 🔴 The asymmetry that matters: a FAILED probe must never erase a good
  // reading. A deleted file would otherwise wipe the only record of what we
  // shipped, and platforms cannot tell us afterwards.
  test("a null measurement never erases a recorded duration", () => {
    expect(mergeDurations({ V18: 28.9 }, { V18: null })).toEqual({ V18: 28.9 });
  });

  test("a null for an unknown video is not recorded at all", () => {
    expect(mergeDurations({}, { V99: null })).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd tiktok-ai-avatar && npx vitest run scripts/lib/duration.test.mjs`
Expected: FAIL — `Failed to resolve import "./duration.mjs"`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib/duration.mjs`:

```js
/**
 * Rendered duration per V-number — the field Windsor does not have.
 *
 * 🔴 WHY THIS EXISTS: on 2026-08-08 we tried to settle whether Instagram
 * gates reach on absolute seconds or on completion percentage, and could not,
 * because only 7 of 41 published posts had a known duration. Windsor exposes
 * no duration field (`media_duration`, `video_duration`, `media_reel_duration`
 * and three other spellings all 400). The platform will never tell us. So we
 * record it at publish time, when the file is still in our hands.
 *
 * Kept as its own tiny ledger rather than a column on the four upload ledgers:
 * one V-number maps to up to four platform rows, and duration is a property of
 * the RENDER, not of any upload.
 */
import { execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

export const DURATIONS_DIR = join(homedir(), ".numevix-publish");
export const DURATIONS_FILE = "durations.json";

/** Parses `ffprobe -of default=nw=1:nk=1` output. Null when unmeasurable. */
export const parseFfprobeDuration = (stdout) => {
  const n = Number.parseFloat(String(stdout ?? "").trim());
  return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
};

/**
 * Merges measurements into the ledger.
 *
 * A real number always wins, including over an earlier real number — a
 * re-render changes the duration and the ledger must follow the file. A null
 * never writes and never erases: a probe that failed is not evidence about
 * what we shipped.
 */
export const mergeDurations = (existing, incoming) => {
  const out = { ...(existing ?? {}) };
  for (const [v, seconds] of Object.entries(incoming ?? {})) {
    if (seconds === null || seconds === undefined) continue;
    out[v] = seconds;
  }
  return out;
};

const ledgerPath = (dir = DURATIONS_DIR) => join(dir, DURATIONS_FILE);

export const loadDurations = (dir = DURATIONS_DIR) => {
  const p = ledgerPath(dir);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
};

export const probeDuration = async (path) => {
  if (!path || !existsSync(path)) return null;
  try {
    const { stdout } = await run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=nw=1:nk=1",
      path,
    ]);
    return parseFfprobeDuration(stdout);
  } catch {
    return null;
  }
};

/**
 * Records one video's duration. Returns the measurement, or null.
 *
 * 🔴 NEVER THROWS. This is called from the publishers, after the ledger write,
 * and a throw there would make publish-next record the platform as failed and
 * re-upload the same video tomorrow. A measurement must never manufacture a
 * duplicate post — same rule as the Facebook thumbnail read-back.
 */
export const recordDuration = async (v, path, dir = DURATIONS_DIR) => {
  try {
    const seconds = await probeDuration(path);
    if (seconds === null) return null;
    const merged = mergeDurations(loadDurations(dir), { [v]: seconds });
    writeFileSync(ledgerPath(dir), `${JSON.stringify(merged, null, 2)}\n`);
    return seconds;
  } catch {
    return null;
  }
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/duration.test.mjs`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write the backfill script**

Create `scripts/backfill-durations.mjs`:

```js
#!/usr/bin/env node
/**
 * npm run backfill:durations -- [--dry-run]
 *
 * Fills durations.json from every rendered MP4 still on disk. One-shot, but
 * safe to re-run: mergeDurations never erases a reading with a failure.
 *
 * 🪤 Expect this to MISS most of history, and that is the finding, not a bug.
 * The publishing ledgers start 2026-07-31 and the mid-July winners were
 * rendered by the earlier `out/` batches before the V-series existed. Print
 * the miss count loudly — it is the number that says how much of the past is
 * permanently unmeasurable.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { loadDurations, mergeDurations, probeDuration } from "./lib/duration.mjs";
import { loadState } from "./lib/state.mjs";
import { writeFileSync } from "node:fs";

const DRY_RUN = process.argv.includes("--dry-run");
const DIR = join(homedir(), ".numevix-publish");
const VIDEO_ROOT = join(homedir(), "Desktop", "Numevix Videos", "Viral");

/** Every place a render has ever been written, newest convention first. */
const candidatePaths = (entry) => {
  const paths = [];
  if (entry.file) paths.push(join(process.cwd(), entry.file));
  if (existsSync(VIDEO_ROOT)) {
    for (const folder of readdirSync(VIDEO_ROOT)) {
      if (!folder.startsWith(`${entry.v} - `)) continue;
      const full = join(VIDEO_ROOT, folder);
      if (!statSync(full).isDirectory()) continue;
      for (const f of readdirSync(full)) {
        if (f.endsWith(".mp4")) paths.push(join(full, f));
      }
    }
  }
  return paths;
};

const state = loadState();
const found = {};
const missing = [];

for (const entry of state.videos ?? []) {
  let seconds = null;
  for (const p of candidatePaths(entry)) {
    seconds = await probeDuration(p);
    if (seconds !== null) break;
  }
  if (seconds === null) missing.push(entry.v);
  else found[entry.v] = seconds;
}

const merged = mergeDurations(loadDurations(DIR), found);
console.log(`measured ${Object.keys(found).length}, unmeasurable ${missing.length}`);
if (missing.length) console.log(`  no surviving render for: ${missing.join(", ")}`);

if (DRY_RUN) console.log("--dry-run: nothing written");
else {
  writeFileSync(join(DIR, "durations.json"), `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`wrote ${Object.keys(merged).length} durations`);
}
```

- [ ] **Step 6: Wire the four platform publishers**

`publish-next.mjs` is only a dispatcher — it shells out to `scripts/publish-<platform>.mjs`, and each of those resolves the file itself. So the call goes in the four platform scripts, not the dispatcher.

All four have an identical anchor line. In **each** of `scripts/publish-youtube.mjs:369`, `scripts/publish-instagram.mjs:268`, `scripts/publish-facebook.mjs:172`, `scripts/publish-tiktok.mjs:377`:

Add the import beside the other `./lib/` imports at the top of the file:

```js
import { recordDuration } from "./lib/duration.mjs";
```

Then change the anchor line from:

```js
  const file = findVideoFile(entry);
```

to:

```js
  const file = findVideoFile(entry);
  // Duration is a property of the RENDER, so it is recorded here — where the
  // file is resolved — rather than beside any one upload ledger.
  //
  // 🔴 NON-FATAL BY CONSTRUCTION: recordDuration swallows its own errors and
  // returns null. A throw here would make publish-next record the platform as
  // failed and re-upload the same video tomorrow. A measurement must never
  // manufacture a duplicate post — same rule as the Facebook thumbnail
  // read-back. Repeat writes are safe: mergeDurations is idempotent.
  await recordDuration(entry.v, file);
```

⚠️ `file` is `null` when no render survives; `recordDuration` handles that and returns null. Do not add a guard.

Now `scripts/publish-card.mjs`, which serves Instagram card reels. It builds its path directly rather than via `findVideoFile` — around line 122:

```js
    ? join(ROOT, "out/reels", `moolank-${n}-reel.mp4`)
```

Add the same import, and after the existing `card-posts.json` ledger write at line 239 (`writeFileSync(POST_LOG, …)`), add:

```js
    // `M<n>R` is the id this reel carries everywhere else — daily-state.json,
    // the UTM `utm_content`, and the other three publishers' ledgers — so the
    // durations ledger has to key on the same string or the join fails.
    if (isReel) await recordDuration(`M${n}R`, file);
```

- [ ] **Step 6b: Confirm the anchor sites are inside an async scope**

`await` is used at each site. Run: `npm run lint`
Expected: clean. If tsc/eslint reports `await` outside an async function in any of the five files, wrap only that call as `recordDuration(...).catch(() => {})` — never make the enclosing function async, which would change how the script exits.

- [ ] **Step 7: Add the npm script**

In `package.json` `scripts`, after `"collect:metrics"`:

```json
    "backfill:durations": "node scripts/backfill-durations.mjs",
```

- [ ] **Step 8: Run the backfill dry and confirm the shape**

Run: `npm run backfill:durations -- --dry-run`
Expected: prints a `measured N, unmeasurable M` line and writes nothing. `N` should be at least the 9 reels in `out/reels/`.

- [ ] **Step 9: Run the full suite and lint**

Run: `npm test && npm run lint`
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add scripts/lib/duration.mjs scripts/lib/duration.test.mjs scripts/backfill-durations.mjs scripts/publish-next.mjs scripts/publish-card.mjs package.json
git commit -m "feat(analyzer): record rendered duration per V -- Windsor has no duration field

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Analyzer — inward

The only role that touches reality. It never authors and never scores. Its first job is the 07-24 diagnosis.

**Files:**
- Create: `scripts/lib/windsor.mjs`
- Create: `scripts/lib/windsor.test.mjs`
- Create: `scripts/analyze-reach.mjs`
- Create: `.claude/skills/analyzer/SKILL.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: `loadDurations()` from Task 1.
- Produces: `msToSeconds(ms: number) => number | null`, `median(nums: number[]) => number | null`, `indexByMediaId(ledgerRows: {v, mediaId}[]) => Map<string,string>`, `joinWindsor(rows, mediaIdToV, durations) => EnrichedRow[]`, `bucketByWatchTime(rows) => {label, n, medianReach, minReach, maxReach}[]`, `splitAt(rows, isoDate) => {before, after}`, `findWinnerClusters(rows, {minReach, windowHours}) => Cluster[]`, `describeAgainstBaseline(row, rows) => string`. `EnrichedRow` = `{ mediaId, v: string|null, timestamp, reach, watchSeconds, durationSeconds: number|null, completion: number|null, views, likes, comments, saves }`.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/windsor.test.mjs`:

```js
import { describe, expect, test } from "vitest";

import {
  bucketByWatchTime,
  describeAgainstBaseline,
  findWinnerClusters,
  indexByMediaId,
  joinWindsor,
  median,
  msToSeconds,
  splitAt,
} from "./windsor.mjs";

describe("msToSeconds", () => {
  // 🪤 The single most expensive unit trap in this connector: 3206.0 is 3.2
  // seconds, not 3206. A raw read makes every post look like an hour.
  test("converts milliseconds to seconds at 2dp", () => {
    expect(msToSeconds(3206)).toBe(3.21);
    expect(msToSeconds(11377)).toBe(11.38);
  });

  test("returns null for a missing measurement rather than 0", () => {
    expect(msToSeconds(null)).toBeNull();
    expect(msToSeconds(undefined)).toBeNull();
  });
});

describe("median", () => {
  test("averages the middle two on an even count", () => {
    expect(median([341, 156, 498, 25])).toBe(248.5);
  });

  test("returns the middle value on an odd count", () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  test("returns null on an empty set, never 0", () => {
    expect(median([])).toBeNull();
  });
});

describe("joinWindsor", () => {
  const ledger = [
    { date: "2026-07-31", v: "V17", mediaId: "18088987886561276" },
    { date: "2026-08-01", v: "V24", mediaId: "18102622358234073" },
  ];

  test("media_id joins straight to our V-numbers", () => {
    const rows = joinWindsor(
      [{ media_id: "18088987886561276", media_reach: 25, media_reel_avg_watch_time: 6212 }],
      indexByMediaId(ledger),
      { V17: 23.45 },
    );

    expect(rows[0].v).toBe("V17");
    expect(rows[0].watchSeconds).toBe(6.21);
    expect(rows[0].durationSeconds).toBe(23.45);
    expect(rows[0].completion).toBe(0.265);
  });

  // 🔴 33 of our 41 posts predate the publishing ledger entirely. They must
  // still be analysable on reach and watch time — dropping them would throw
  // away every one of the mid-July winners, which are the only high-reach
  // posts we have ever had.
  test("keeps a post with no V-number and no duration", () => {
    const rows = joinWindsor(
      [{ media_id: "17947206261231553", media_reach: 2057, media_reel_avg_watch_time: 7244 }],
      indexByMediaId(ledger),
      {},
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].v).toBeNull();
    expect(rows[0].durationSeconds).toBeNull();
    expect(rows[0].completion).toBeNull();
    expect(rows[0].reach).toBe(2057);
  });
});

describe("bucketByWatchTime", () => {
  test("buckets at the 5.0 and 6.0 second boundaries", () => {
    const rows = [
      { watchSeconds: 6.5, reach: 1400 },
      { watchSeconds: 5.5, reach: 213 },
      { watchSeconds: 4.0, reach: 177 },
      { watchSeconds: 2.3, reach: 203 },
    ];
    const [a, b, c] = bucketByWatchTime(rows);

    expect(a.label).toBe(">= 6.0s");
    expect(a.n).toBe(1);
    expect(b.label).toBe("5.0-5.9s");
    expect(c.n).toBe(2);
    expect(c.medianReach).toBe(190);
  });

  test("ignores rows with no watch-time measurement", () => {
    const buckets = bucketByWatchTime([{ watchSeconds: null, reach: 999 }]);
    expect(buckets.reduce((t, x) => t + x.n, 0)).toBe(0);
  });
});

describe("splitAt", () => {
  test("puts the boundary date itself in the after group", () => {
    const rows = [
      { timestamp: "2026-07-24T03:40:02+0000", reach: 1597 },
      { timestamp: "2026-07-25T04:30:01+0000", reach: 202 },
    ];
    const { before, after } = splitAt(rows, "2026-07-25");

    expect(before).toHaveLength(1);
    expect(after).toHaveLength(1);
  });
});

describe("findWinnerClusters", () => {
  // ⭐⭐ The finding this function exists for: 6 of our 8 all-time winners
  // fall on just two days. That is the shape of a few posts getting picked
  // up, NOT of an account being healthy and then breaking — and the two
  // readings recommend completely different work.
  test("groups high-reach posts that landed within the window", () => {
    const rows = [
      { timestamp: "2026-07-17T12:30:02+0000", reach: 1571 },
      { timestamp: "2026-07-17T12:31:01+0000", reach: 1462 },
      { timestamp: "2026-07-17T12:33:01+0000", reach: 1535 },
      { timestamp: "2026-07-24T03:40:02+0000", reach: 1597 },
    ];
    const clusters = findWinnerClusters(rows, { minReach: 1000, windowHours: 24 });

    expect(clusters).toHaveLength(2);
    expect(clusters[0].posts).toHaveLength(3);
    expect(clusters[1].posts).toHaveLength(1);
  });

  test("posts below the threshold never form a cluster", () => {
    const rows = [
      { timestamp: "2026-08-06T06:30:38+0000", reach: 122 },
      { timestamp: "2026-08-07T06:30:39+0000", reach: 171 },
    ];
    expect(findWinnerClusters(rows, { minReach: 1000, windowHours: 24 })).toEqual([]);
  });
});

describe("describeAgainstBaseline", () => {
  // ⭐ Always against the account's own baseline, never as an absolute. "V29
  // reached 228" means nothing; "228 against a 171 baseline" is a reading.
  test("states the post and the baseline in one line", () => {
    const rows = [
      { v: "V29", watchSeconds: 5.81, reach: 228 },
      { v: "V28", watchSeconds: 2.02, reach: 149 },
      { v: "V27", watchSeconds: 2.89, reach: 171 },
    ];

    expect(describeAgainstBaseline(rows[0], rows)).toBe(
      "V29 avg watch 5.81s vs baseline 2.89s · reach 228 vs baseline 171",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/windsor.test.mjs`
Expected: FAIL — `Failed to resolve import "./windsor.mjs"`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib/windsor.mjs`:

```js
/**
 * Reading the Windsor.ai Instagram connector.
 *
 * ⭐⭐⭐ This connector solved a problem that had been marked permanently
 * blocked: per-post reach, saves and watch time without
 * `instagram_manage_insights` and without waiting on an App Review that
 * cannot be edited. Instagram went from our worst-instrumented platform to
 * our best in one step.
 *
 * Everything here is PURE. The fetch lives in scripts/analyze-reach.mjs, and
 * the MCP path lives in the analyzer skill — both hand rows to these
 * functions, so the analysis is identical whichever route supplied the data.
 */

/** 🪤 `media_reel_avg_watch_time` is in MILLISECONDS. 3206.0 = 3.2s. */
export const msToSeconds = (ms) =>
  typeof ms === "number" && Number.isFinite(ms) ? Number((ms / 1000).toFixed(2)) : null;

/** Median, or null on an empty set — 0 would read as "measured at zero". */
export const median = (nums) => {
  const xs = (nums ?? []).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
};

/**
 * ⭐⭐ Windsor's `media_id` IS the Graph API id our upload ledgers store, so
 * every metrics row maps onto the exact render that produced it with no
 * manual matching.
 *
 * 🪤 This is NOT true of the id shown in Instagram's own web Insights UI,
 * which is an internal id and does not match.
 */
export const indexByMediaId = (ledgerRows) =>
  new Map((ledgerRows ?? []).filter((r) => r.mediaId).map((r) => [String(r.mediaId), r.v]));

export const joinWindsor = (rows, mediaIdToV, durations) => {
  const dur = durations ?? {};
  return (rows ?? []).map((r) => {
    const v = mediaIdToV?.get(String(r.media_id)) ?? null;
    const watchSeconds = msToSeconds(r.media_reel_avg_watch_time);
    const durationSeconds = v && Number.isFinite(dur[v]) ? dur[v] : null;
    return {
      mediaId: String(r.media_id),
      v,
      timestamp: r.timestamp ?? null,
      reach: r.media_reach ?? null,
      views: r.media_views ?? null,
      likes: r.media_like_count ?? null,
      comments: r.media_comments_count ?? null,
      saves: r.media_saved ?? null,
      watchSeconds,
      durationSeconds,
      completion:
        watchSeconds !== null && durationSeconds
          ? Number((watchSeconds / durationSeconds).toFixed(3))
          : null,
    };
  });
};

const BUCKETS = [
  { label: ">= 6.0s", min: 6, max: Infinity },
  { label: "5.0-5.9s", min: 5, max: 6 },
  { label: "< 5.0s", min: -Infinity, max: 5 },
];

export const bucketByWatchTime = (rows) =>
  BUCKETS.map(({ label, min, max }) => {
    const mine = (rows ?? []).filter(
      (r) => r.watchSeconds !== null && r.watchSeconds >= min && r.watchSeconds < max,
    );
    const reaches = mine.map((r) => r.reach).filter((n) => Number.isFinite(n));
    return {
      label,
      n: mine.length,
      medianReach: median(reaches),
      minReach: reaches.length ? Math.min(...reaches) : null,
      maxReach: reaches.length ? Math.max(...reaches) : null,
    };
  });

/** Splits a run of posts at a date. The boundary date lands in `after`. */
export const splitAt = (rows, isoDate) => {
  const cut = new Date(`${isoDate}T00:00:00Z`).getTime();
  const before = [];
  const after = [];
  for (const r of rows ?? []) {
    (new Date(r.timestamp).getTime() < cut ? before : after).push(r);
  }
  return { before, after };
};

/**
 * Groups high-reach posts that landed close together in time.
 *
 * ⭐⭐ WHY THIS EXISTS. Reading our history as two eras ("healthy, then
 * broken") suggests hunting for a platform change. Reading it as clusters
 * ("6 of 8 winners fell on two days") suggests a few posts got picked up and
 * the rest never did. The two readings recommend opposite work, and the only
 * way to tell them apart is to look at how the winners are distributed in
 * time rather than at their average.
 */
export const findWinnerClusters = (rows, { minReach, windowHours }) => {
  const winners = (rows ?? [])
    .filter((r) => Number.isFinite(r.reach) && r.reach >= minReach)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const clusters = [];
  for (const post of winners) {
    const last = clusters.at(-1);
    const gapMs = last ? new Date(post.timestamp) - new Date(last.posts.at(-1).timestamp) : null;
    if (last && gapMs <= windowHours * 3_600_000) last.posts.push(post);
    else clusters.push({ start: post.timestamp, posts: [post] });
  }
  return clusters;
};

/**
 * ⭐ ALWAYS against the account's own baseline, never as an absolute.
 * Follower count and account age swamp any cross-account signal, and an
 * absolute number tells the reader nothing about whether it is good.
 */
export const describeAgainstBaseline = (row, rows) => {
  // The baseline is the account's own median across every post in the window,
  // INCLUDING this one. Excluding the subject would make the baseline shift
  // depending on which post you asked about, so two posts could never be
  // compared against the same number.
  const watchBase = median((rows ?? []).map((r) => r.watchSeconds));
  const reachBase = median((rows ?? []).map((r) => r.reach));
  return (
    `${row.v ?? row.mediaId} avg watch ${row.watchSeconds}s vs baseline ${watchBase}s · ` +
    `reach ${row.reach} vs baseline ${reachBase}`
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/windsor.test.mjs`
Expected: PASS, 13 tests.

- [ ] **Step 5: Write the CLI**

Create `scripts/analyze-reach.mjs`:

```js
#!/usr/bin/env node
/**
 * npm run analyze:reach -- [--split=YYYY-MM-DD] [--min-reach=1000]
 *
 * The Analyzer's inward read. Prints the account's own baseline, the
 * watch-time buckets, the era split and the winner clusters. Reports
 * measurements; never authors, never scores.
 *
 * 🔴 The API key lives in ~/.numevix-publish/credentials.json under
 * `windsor.api_key`, NEVER in this repo — it is public and Pages-served.
 * ⭐ Prefer the Windsor MCP inside a Claude Code session: it needs no key at
 * all. This script is the durable, unattended path.
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { loadDurations } from "./lib/duration.mjs";
import {
  bucketByWatchTime,
  findWinnerClusters,
  indexByMediaId,
  joinWindsor,
  median,
  splitAt,
} from "./lib/windsor.mjs";

const DIR = join(homedir(), ".numevix-publish");
const arg = (name, fallback) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;

const SPLIT = arg("split", "2026-07-25");
const MIN_REACH = Number(arg("min-reach", "1000"));

const readJson = (p, fallback) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback);

const creds = readJson(join(DIR, "credentials.json"), null);
const key = creds?.windsor?.api_key;
if (!key) {
  console.error(
    "No windsor.api_key in ~/.numevix-publish/credentials.json.\n" +
      "Get it from onboard.windsor.ai/app/data-preview, or run the analysis\n" +
      "through the Windsor MCP in a Claude Code session, which needs no key.",
  );
  process.exit(1);
}

const FIELDS = [
  "timestamp",
  "media_id",
  "media_type",
  "media_reach",
  "media_reel_avg_watch_time",
  "media_views",
  "media_like_count",
  "media_comments_count",
  "media_saved",
].join(",");

const url = `https://connectors.windsor.ai/instagram?api_key=${key}&date_preset=last_90d&fields=${FIELDS}`;
const res = await fetch(url);
if (!res.ok) {
  // 🪤 An invalid field returns 400 NAMING the offending field — that is the
  // cheapest way to discover the schema, so print the body rather than a code.
  console.error(`Windsor ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const raw = (await res.json()).data ?? [];
const ledger = readJson(join(DIR, "instagram-uploads.json"), []);
const rows = joinWindsor(raw, indexByMediaId(ledger), loadDurations(DIR)).sort(
  (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
);

console.log(`\n${rows.length} posts · ${rows.filter((r) => r.durationSeconds).length} with a known duration`);

console.log("\nWATCH-TIME BUCKETS");
for (const b of bucketByWatchTime(rows)) {
  console.log(`  ${b.label.padEnd(9)} n=${String(b.n).padStart(2)}  median reach ${b.medianReach}  range ${b.minReach}-${b.maxReach}`);
}

const { before, after } = splitAt(rows, SPLIT);
console.log(`\nERA SPLIT at ${SPLIT}`);
for (const [label, set] of [["before", before], ["after", after]]) {
  const over = set.filter((r) => r.reach >= MIN_REACH).length;
  console.log(`  ${label.padEnd(6)} n=${String(set.length).padStart(2)}  median reach ${median(set.map((r) => r.reach))}  over ${MIN_REACH}: ${over}`);
}

console.log(`\nWINNER CLUSTERS (reach >= ${MIN_REACH}, 24h window)`);
const clusters = findWinnerClusters(rows, { minReach: MIN_REACH, windowHours: 24 });
if (!clusters.length) console.log("  none");
for (const c of clusters) {
  console.log(`  ${c.start.slice(0, 10)}  ${c.posts.length} post(s)  reach ${c.posts.map((p) => p.reach).join(", ")}`);
}

// ⭐ The completion column only means something on posts we can measure. Print
// the count alongside it so a thin sample can never be read as a finding.
const withDuration = rows.filter((r) => r.completion !== null);
console.log(`\nSECONDS vs COMPLETION (n=${withDuration.length})`);
for (const r of withDuration) {
  console.log(`  ${(r.v ?? r.mediaId).padEnd(6)} ${String(r.durationSeconds).padStart(6)}s  watch ${String(r.watchSeconds).padStart(5)}s  ${String(Math.round(r.completion * 100)).padStart(3)}%  reach ${r.reach}`);
}
console.log();
```

- [ ] **Step 6: Add the npm script**

In `package.json` `scripts`:

```json
    "analyze:reach": "node scripts/analyze-reach.mjs",
```

- [ ] **Step 7: Write the Analyzer skill**

Create `.claude/skills/analyzer/SKILL.md`:

```markdown
---
name: analyzer
description: Use when reading how Numevix content actually performed - per-post reach, watch time, retention, or comparing a post against the account's own baseline. Also use before proposing any content change, to establish the baseline the change will be measured against.
---

# Analyzer

**The only role that touches reality. It never authors and never scores — it reports measurements.**

## Inward: our own numbers

Two routes to the same analysis. Both hand rows to `scripts/lib/windsor.mjs`.

1. **In session (preferred):** the Windsor MCP. No API key at all.
   `ToolSearch("select:mcp__claude_ai_Windsor_ai__get_fields,mcp__claude_ai_Windsor_ai__get_data")`
   🪤 `get_data` rejects guessed field names — **call `get_fields` first, it is not optional.**
2. **Unattended:** `npm run analyze:reach`, which reads the key from
   `~/.numevix-publish/credentials.json`.

Account `17841425392432041` ("numevix").

### Rules

- ⭐ **Always report against the account's own baseline**, never as an absolute.
  Use `describeAgainstBaseline`. "V29 reached 228" is not a reading; "228 against
  a 171 baseline" is.
- 🪤 **Watch time is in MILLISECONDS.** Use `msToSeconds`, never the raw field.
- 🔴 **There is no duration field.** Duration comes from `durations.json`
  (`scripts/lib/duration.mjs`). Any completion-percentage claim must state its `n`.
- 🪤 **The ledger records what we REQUESTED, not what happened.** `"privacy":
  "public"` is our own input echoed back. Ask the platform.
- 🪤 **Never read `launchctl`'s `runs` counter** — it resets on reload. Read the ledgers.
- ⭐⭐ **The owner's dashboards are the instrument.** `collect-metrics` under-reads,
  and the owner has twice found bugs that hundreds of green tests missed. When a
  number matters, verify against the real thing.

### Settled — do not re-run these

- **The ≥6s watch-time rule is confounded with era.** Before 07-28 it meant median
  reach 1,487; after, 248, with 0 of 16 posts over 1,000 — including 11.4s→498.
- **The Instagram upload route is ruled out.** 07-28/29/30 were hand-posted and
  already dead; the first publisher post is 07-31.
- **The break is after 07-24**, not 07-28. The last post over 1,000 reach is 07-24.
- **Six of the eight all-time winners fall on 07-16 and 07-17.** Read the clusters
  (`findWinnerClusters`), not just the era medians.
- **On YouTube, API upload gets zero feed distribution** (n=7, max 3 views). That
  is a YouTube/Facebook finding — Instagram is unaffected.

## Outward: the niche

Drives Chrome to study numerology and spirituality accounts. Reports what is
winning: opening structures, lengths, formats, caption mechanics.

- ⭐⭐ **Same-account control, always** (`sameAccountLift` in `scripts/lib/niche.mjs`).
  Across accounts, follower count swamps the signal.
- 🪤 **Never compare posts of different ages.** A 30-day-old post against a
  3-hour-old one once produced a false "the old format won".
- 🔴 **Never lift a numerology claim from competitor copy.** Their rulesets
  disagree with ours — of the pairs popular posts cite, only 4&9 overlaps with
  our own `friendship.ts`. **Formats are copyable. Facts are not.**
- **Keyword search, not hashtags.** Hashtag browsing surfaced noise.

## The bridge

**An outward finding is a hypothesis, never a change.** It enters the loop and is
tested against our own numbers. That discipline is what talked us out of the
conflict-framed compatibility reel — and the evidence then went the other way.
```

- [ ] **Step 8: Run the suite, lint, and the real CLI**

Run: `npm test && npm run lint`
Expected: all pass.

Run: `npm run analyze:reach`
Expected: prints the four sections. If it exits on a missing key, that is correct behaviour — record it and run the analysis through the MCP instead.

- [ ] **Step 9: Commit**

```bash
git add scripts/lib/windsor.mjs scripts/lib/windsor.test.mjs scripts/analyze-reach.mjs .claude/skills/analyzer/SKILL.md package.json
git commit -m "feat(analyzer): inward read -- buckets, era split, winner clusters

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: QA — deterministic gates

Cheap, deterministic, and they encode bugs we have already shipped. Never an opinion, never a score.

**Files:**
- Create: `src/viral/qa.ts`
- Create: `src/viral/qa.test.ts`
- Create: `scripts/lib/qa-frame.mjs`
- Create: `scripts/lib/qa-frame.test.mjs`
- Create: `scripts/qa-frame.mjs`
- Create: `.claude/skills/qa/SKILL.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: `makeActs`, `SCENE_CHANGE`, `FPS`, `sec` from `src/viral/timing.ts`.
- Produces: `PAYLOAD_BY_FRAME: number`, `checkPayloadTiming(acts) => Gate`, `checkSceneCeilings(scenes) => Gate`, `checkTraitParity(scenes, traitCount) => Gate`, `runStructuralGates({acts, scenes, traitCount}) => Gate[]`. `Gate` = `{ name: string; pass: boolean; detail: string }`. And in `scripts/lib/qa-frame.mjs`: `frameStats(buffer: Uint8Array) => {mean: number, stddev: number}`, `judgeFirstFrame(stats) => Gate`.

- [ ] **Step 1: Write the failing structural test**

Create `src/viral/qa.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import { SCENE_CHANGE, makeActs } from "./timing";
import {
  PAYLOAD_BY_FRAME,
  checkPayloadTiming,
  checkSceneCeilings,
  checkTraitParity,
  runStructuralGates,
} from "./qa";

/**
 * Every gate here encodes a bug that actually shipped. A rule that depends on
 * someone noticing is not a rule.
 */

describe("checkPayloadTiming", () => {
  // The diagnosis: the old structure put the payload at 6.4s behind a `build`
  // act specified to "open a curiosity loop, never fully resolve". We asked
  // someone who decides in under two seconds to wait nearly five on faith.
  test("fails an act structure whose payload lands after 2.0s", () => {
    const gate = checkPayloadTiming(makeActs({ hook: 1.6, build: 4.8, value: 8.6, cta: 2.4 }));

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("192");
  });

  test("passes when the payload lands on the 2.0s boundary", () => {
    const gate = checkPayloadTiming(makeActs({ hook: 1.2, build: 0.8, value: 13.0, cta: 2.4 }));

    expect(gate.pass).toBe(true);
  });

  test("the boundary is frame 60", () => {
    expect(PAYLOAD_BY_FRAME).toBe(60);
  });
});

describe("checkSceneCeilings", () => {
  // 🔴 A pair scene shows TWO traits, so exceeding SCENE_CHANGE * 2 leaves one
  // trait on screen past the 1.2s ceiling — the exact bug that once held
  // traits for 2.05s.
  test("fails a scene longer than SCENE_CHANGE * 2", () => {
    const gate = checkSceneCeilings([30, SCENE_CHANGE * 2 + 1, 30]);

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("73");
  });

  test("passes a scene exactly on the ceiling", () => {
    expect(checkSceneCeilings([SCENE_CHANGE * 2]).pass).toBe(true);
  });
});

describe("checkTraitParity", () => {
  // Shipped as a 0.47s flash: 4 traits packed into 3 scenes left the staggered
  // second bullet just 14 frames. Fixed in 00dfe8b; this is the guard.
  test("fails when there are fewer scenes than traits", () => {
    const gate = checkTraitParity([50, 50, 50], 4);

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("3 scenes");
  });

  test("passes one trait per scene", () => {
    expect(checkTraitParity([40, 40, 40, 40], 4).pass).toBe(true);
  });
});

describe("runStructuralGates", () => {
  test("returns every gate, so a render reports all its faults at once", () => {
    const gates = runStructuralGates({
      acts: makeActs({ hook: 1.6, build: 4.8, value: 8.6, cta: 2.4 }),
      scenes: [50, 50, 50],
      traitCount: 4,
    });

    expect(gates).toHaveLength(3);
    expect(gates.filter((g) => !g.pass)).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/viral/qa.test.ts`
Expected: FAIL — cannot resolve `./qa`.

- [ ] **Step 3: Write minimal implementation**

Create `src/viral/qa.ts`:

```ts
/**
 * Deterministic render gates. Blocks the render; never an opinion, never a
 * score.
 *
 * ⭐⭐ Every gate here encodes a bug that already shipped. The design rejected
 * a model grading its own output for exactly the reason these are assertions:
 * a score drifts, an assertion does not.
 */
import { SCENE_CHANGE, sec } from "./timing";

export type Gate = { name: string; pass: boolean; detail: string };

/**
 * The first payload beat must begin by 2.0 seconds.
 *
 * > The first payload beat is the first moment the viewer receives a concrete
 * > piece of the thing the hook promised — a number and its actual trait, not
 * > a restatement of the question, not a transition, not branding.
 *
 * The test is falsifiable: if a frame could be removed and the viewer would
 * lose no information they were promised, it is not the payload beat.
 */
export const PAYLOAD_BY_FRAME = sec(2.0);

export const checkPayloadTiming = (acts: { valueStart: number }): Gate => ({
  name: "payload beat lands by 2.0s",
  pass: acts.valueStart <= PAYLOAD_BY_FRAME,
  detail: `payload starts at frame ${acts.valueStart}, ceiling ${PAYLOAD_BY_FRAME}`,
});

export const checkSceneCeilings = (scenes: number[]): Gate => {
  const ceiling = SCENE_CHANGE * 2;
  const over = scenes.filter((s) => s > ceiling);
  return {
    name: "no scene exceeds SCENE_CHANGE * 2",
    pass: over.length === 0,
    detail: over.length ? `over ceiling ${ceiling}: ${over.join(", ")}` : `all within ${ceiling}`,
  };
};

/**
 * ⭐⭐ Prefer one trait per scene. Packing two traits into a scene sized for
 * one leaves the staggered second bullet a 0.47s flash and makes the pacing
 * lopsided — two traits rushed, then two dwelt on.
 */
export const checkTraitParity = (scenes: number[], traitCount: number): Gate => ({
  name: "scene count matches trait count",
  pass: scenes.length >= traitCount,
  detail: `${scenes.length} scenes for ${traitCount} traits`,
});

export const runStructuralGates = ({
  acts,
  scenes,
  traitCount,
}: {
  acts: { valueStart: number };
  scenes: number[];
  traitCount: number;
}): Gate[] => [
  checkPayloadTiming(acts),
  checkSceneCeilings(scenes),
  checkTraitParity(scenes, traitCount),
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/viral/qa.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Write the failing frame test**

Create `scripts/lib/qa-frame.test.mjs`:

```js
import { describe, expect, test } from "vitest";

import { frameStats, judgeFirstFrame } from "./qa-frame.mjs";

describe("frameStats", () => {
  test("computes mean and stddev over a raw greyscale buffer", () => {
    expect(frameStats(Uint8Array.from([0, 0, 255, 255]))).toEqual({
      mean: 127.5,
      stddev: 127.5,
    });
  });

  test("a uniform frame has zero spread", () => {
    expect(frameStats(Uint8Array.from([10, 10, 10, 10])).stddev).toBe(0);
  });
});

describe("judgeFirstFrame", () => {
  // 🔴 We shipped an invisible first frame through `useSnap` once already, and
  // the card reels open on a near-black card — M9R's thumbnail is almost
  // black. In a feed that reads as "not a video" in well under a second.
  test("fails a flat frame with no content", () => {
    const gate = judgeFirstFrame({ mean: 4, stddev: 0.4 });

    expect(gate.pass).toBe(false);
    expect(gate.detail).toContain("stddev");
  });

  test("passes a frame carrying legible contrast", () => {
    expect(judgeFirstFrame({ mean: 96, stddev: 61 }).pass).toBe(true);
  });

  // A fade-in from black produces a frame that is technically non-uniform but
  // still unreadable. Mean luminance has to clear a floor as well as spread.
  test("fails a frame that is dark overall even with some spread", () => {
    expect(judgeFirstFrame({ mean: 3, stddev: 30 }).pass).toBe(false);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run scripts/lib/qa-frame.test.mjs`
Expected: FAIL — cannot resolve `./qa-frame.mjs`.

- [ ] **Step 7: Write the frame implementation**

Create `scripts/lib/qa-frame.mjs`:

```js
/**
 * Frame 1 must be legible. Pure maths over a raw greyscale dump.
 *
 * 🔴 WHY: we shipped an invisible first frame through `useSnap` once, and the
 * card reels open on a dark, low-contrast, near-static card. Both TikTok
 * retention curves die at 0:01, and the cold-open card glimpse is the prime
 * suspect. This is the cheapest possible check on the highest-value frame.
 *
 * 🪤 The cover image is NOT the lever — 66.4% of views arrive from the Reels
 * tab, where there is no cover and the video autoplays from frame 1. Covers
 * show only on the profile grid and Explore. Judge frame 1, not the cover.
 */

/** Minimum average luminance (0-255). A fade-from-black fails this. */
export const MIN_MEAN = 12;
/** Minimum spread. A flat frame carries no text and no subject. */
export const MIN_STDDEV = 18;

export const frameStats = (buffer) => {
  const n = buffer.length;
  if (!n) return { mean: 0, stddev: 0 };
  let sum = 0;
  for (const b of buffer) sum += b;
  const mean = sum / n;
  let sq = 0;
  for (const b of buffer) sq += (b - mean) ** 2;
  return { mean: Number(mean.toFixed(2)), stddev: Number(Math.sqrt(sq / n).toFixed(2)) };
};

export const judgeFirstFrame = ({ mean, stddev }) => {
  const pass = mean >= MIN_MEAN && stddev >= MIN_STDDEV;
  return {
    name: "frame 1 is legible",
    pass,
    detail: `mean ${mean} (min ${MIN_MEAN}) · stddev ${stddev} (min ${MIN_STDDEV})`,
  };
};
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run scripts/lib/qa-frame.test.mjs`
Expected: PASS, 5 tests.

- [ ] **Step 9: Write the frame CLI**

Create `scripts/qa-frame.mjs`:

```js
#!/usr/bin/env node
/**
 * npm run qa:frame -- <path-to-mp4>
 *
 * Extracts frame 0 as raw greyscale and judges it. Exits non-zero on failure
 * so it can gate a render.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { frameStats, judgeFirstFrame } from "./lib/qa-frame.mjs";

const run = promisify(execFile);
const path = process.argv[2];
if (!path) {
  console.error("usage: npm run qa:frame -- <path-to-mp4>");
  process.exit(2);
}

// -vframes 1 on the first frame, greyscale, straight to stdout. maxBuffer is
// raised because a 1080x1920 grey frame is ~2MB and the default is 1MB.
const { stdout } = await run(
  "ffmpeg",
  ["-v", "error", "-i", path, "-vframes", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
  { encoding: "buffer", maxBuffer: 32 * 1024 * 1024 },
);

const gate = judgeFirstFrame(frameStats(new Uint8Array(stdout)));
console.log(`${gate.pass ? "PASS" : "FAIL"}  ${gate.name} — ${gate.detail}`);
process.exit(gate.pass ? 0 : 1);
```

- [ ] **Step 10: Add the npm script**

In `package.json` `scripts`:

```json
    "qa:frame": "node scripts/qa-frame.mjs",
```

- [ ] **Step 11: Run the frame gate against a real reel**

Run: `npm run qa:frame -- out/reels/moolank-2-reel.mp4`
Expected: prints PASS or FAIL with the two numbers. **Record which it is.** A FAIL here is a genuine finding about the cold open, not a broken script — it is the hypothesis this gate was written to test.

- [ ] **Step 12: Write the QA skill**

Create `.claude/skills/qa/SKILL.md`:

```markdown
---
name: qa
description: Use before rendering or shipping any Numevix video, and when a render needs to be checked against the standing structural rules - payload timing, scene ceilings, trait parity, first-frame legibility.
---

# QA

**Deterministic assertions only. Blocks the render. Never an opinion, never a score.**

## Gates

| Gate | Where | Encodes |
|---|---|---|
| Payload beat lands by 2.0s | `src/viral/qa.ts` | The 6.4s payload behind a withholding `build` act |
| No scene exceeds `SCENE_CHANGE * 2` | `src/viral/qa.ts` | A trait held on screen for 2.05s |
| Scene count matches trait count | `src/viral/qa.ts` | A 0.47s bullet flash (fixed in `00dfe8b`) |
| Frame 1 is legible | `npm run qa:frame` | An invisible first frame via `useSnap`; the near-black card cold open |

Run `npm test` for the structural gates and `npm run qa:frame -- <mp4>` for the
pixel gate.

## Rules

- ⭐⭐ **A check that cannot fail the way the real operation fails is not a
  check.** `--check` once read a Page and reported a healthy token, while the
  only permission that mattered was the one it never touched.
- ⭐⭐ **A gate over the builder cannot catch the builder being wrong** — the
  queue and the assertion call the same function, so it agrees with itself
  while the output is wrong. Assert on what actually ships.
- 🪤 **A zero exit is not evidence the work happened.**
  `import.meta.url === \`file://${process.argv[1]}\`` is ALWAYS FALSE in this
  repo (the path contains spaces), so `main()` silently never runs and the
  script exits 0. Use `pathToFileURL(process.argv[1]).href`.
- ⭐⭐⭐ **Sampling frames is not watching.** A gate proves a property; it does
  not prove the video is good. Watch it.
```

- [ ] **Step 13: Run the full suite and lint**

Run: `npm test && npm run lint`
Expected: all pass.

- [ ] **Step 14: Commit**

```bash
git add src/viral/qa.ts src/viral/qa.test.ts scripts/lib/qa-frame.mjs scripts/lib/qa-frame.test.mjs scripts/qa-frame.mjs .claude/skills/qa/SKILL.md package.json
git commit -m "feat(qa): structural and first-frame gates -- each encodes a shipped bug

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Angle

The largest measured lever, and the role the approved design had no owner for. Picks the topic and frame before anything is written.

**Files:**
- Create: `content/angles.json`
- Create: `scripts/lib/angles.mjs`
- Create: `scripts/lib/angles.test.mjs`
- Create: `.claude/skills/angle/SKILL.md`

**Interfaces:**
- Consumes: `loadState`, `REPEAT_WINDOW_DAYS` from `scripts/lib/state.mjs`.
- Produces: `ANGLE_REPEAT_DAYS: number`, `validateAngle(angle) => {ok: boolean, errors: string[]}`, `isRecentlyUsedAngle(angle, state, asOf) => boolean`, `pickAngle(angles, state, asOf) => Angle | null`. `Angle` = `{ id, frame, evidence, status: "approved"|"hypothesis"|"rejected", assertsFacts: boolean }`.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/angles.test.mjs`:

```js
import { describe, expect, test } from "vitest";

import { ANGLE_REPEAT_DAYS, isRecentlyUsedAngle, pickAngle, validateAngle } from "./angles.mjs";

const approved = {
  id: "best-match",
  frame: "positive",
  evidence: "51.9K-57.2K vs the same account's 6.8K-25.9K baseline",
  status: "approved",
  assertsFacts: false,
};

describe("validateAngle", () => {
  test("accepts an approved angle carrying evidence", () => {
    expect(validateAngle(approved)).toEqual({ ok: true, errors: [] });
  });

  // ⭐ An angle without evidence is a preference. The whole point of this
  // registry is that the frame was measured, not liked.
  test("rejects an angle with no evidence", () => {
    const { ok, errors } = validateAngle({ ...approved, evidence: "" });

    expect(ok).toBe(false);
    expect(errors).toContain("no evidence");
  });

  // 🔴 Formats are copyable. Facts are not. Popular posts cite 1-8, 2-8, 8-8;
  // derived from our own friendship.ts, only 4&9 overlaps. An angle that
  // carries its own number claims would put competitor arithmetic on screen.
  test("rejects an angle that asserts its own numerology facts", () => {
    const { ok, errors } = validateAngle({ ...approved, assertsFacts: true });

    expect(ok).toBe(false);
    expect(errors).toContain("asserts numerology facts -- derive them instead");
  });

  test("rejects an unknown status", () => {
    expect(validateAngle({ ...approved, status: "maybe" }).ok).toBe(false);
  });
});

describe("isRecentlyUsedAngle", () => {
  const state = {
    videos: [{ v: "V30", angleId: "best-match", date: "2026-08-05" }],
  };

  test("an angle used inside the window is recently used", () => {
    expect(isRecentlyUsedAngle(approved, state, "2026-08-09")).toBe(true);
  });

  test("an angle used outside the window is available again", () => {
    expect(isRecentlyUsedAngle(approved, state, "2026-09-20")).toBe(false);
  });

  test("an angle never used is not recently used", () => {
    expect(isRecentlyUsedAngle({ ...approved, id: "self-friendly" }, state, "2026-08-09")).toBe(
      false,
    );
  });
});

describe("pickAngle", () => {
  const hypothesis = { ...approved, id: "conflict", frame: "conflict", status: "hypothesis" };

  // 🔴 An outward finding is a hypothesis, never a change. It enters the loop
  // and gets tested; it does not get shipped because a competitor ran it.
  test("never picks a hypothesis or a rejected angle", () => {
    expect(pickAngle([hypothesis], { videos: [] }, "2026-08-09")).toBeNull();
  });

  test("picks the approved angle that has gone longest unused", () => {
    const older = { ...approved, id: "self-friendly" };
    const state = { videos: [{ angleId: "best-match", date: "2026-08-08" }] };

    expect(pickAngle([approved, older], state, "2026-08-09").id).toBe("self-friendly");
  });

  test("returns null rather than repeating inside the window", () => {
    const state = { videos: [{ angleId: "best-match", date: "2026-08-08" }] };

    expect(pickAngle([approved], state, "2026-08-09")).toBeNull();
  });

  test("the repeat window is 21 days, matching the hook no-repeat rule", () => {
    expect(ANGLE_REPEAT_DAYS).toBe(21);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/angles.test.mjs`
Expected: FAIL — cannot resolve `./angles.mjs`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib/angles.mjs`:

```js
/**
 * WHAT we say, chosen before HOW we say it.
 *
 * ⭐⭐⭐ WHY THIS ROLE EXISTS. The approved four-role design owned structure,
 * opening, measurement and QA — every one of them a question of delivery. But
 * the largest effect we have ever measured is the topic: on one competitor's
 * own account, compatibility posts did 51.9K-57.2K while everything else did
 * 6.8K-25.9K. Trait-per-number content — exactly what our card reels are — is
 * that format's weakest, and 205 views is what "our weakest format,
 * competently made" looks like. No amount of opening work fixes the wrong
 * subject.
 */
import { REPEAT_WINDOW_DAYS } from "./state.mjs";

/** Matches the hook no-repeat window — same reason, same rhythm. */
export const ANGLE_REPEAT_DAYS = REPEAT_WINDOW_DAYS;

const STATUSES = new Set(["approved", "hypothesis", "rejected"]);

export const validateAngle = (angle) => {
  const errors = [];
  if (!angle?.id) errors.push("no id");
  if (!angle?.evidence) errors.push("no evidence");
  if (!STATUSES.has(angle?.status)) errors.push(`unknown status: ${angle?.status}`);
  // 🔴 Formats are copyable. Facts are not.
  if (angle?.assertsFacts) errors.push("asserts numerology facts -- derive them instead");
  return { ok: errors.length === 0, errors };
};

const daysBetween = (a, b) => Math.abs(new Date(a) - new Date(b)) / 86_400_000;

const lastUse = (angle, state) =>
  (state?.videos ?? [])
    .filter((v) => v.angleId === angle.id && v.date)
    .map((v) => v.date)
    .sort()
    .at(-1) ?? null;

export const isRecentlyUsedAngle = (angle, state, asOf) => {
  const last = lastUse(angle, state);
  return last !== null && daysBetween(last, asOf) < ANGLE_REPEAT_DAYS;
};

/**
 * The approved angle that has gone longest unused, or null.
 *
 * Returning null rather than falling back to the freshest-anyway is
 * deliberate: repeating an angle inside the window is exactly the structural
 * sameness that made TikTok read our set as repeated content. An empty result
 * is a prompt to write a new angle, not a failure.
 */
export const pickAngle = (angles, state, asOf) => {
  const available = (angles ?? [])
    .filter((a) => validateAngle(a).ok)
    .filter((a) => a.status === "approved")
    .filter((a) => !isRecentlyUsedAngle(a, state, asOf));
  if (!available.length) return null;

  return available.sort((a, b) => {
    const la = lastUse(a, state);
    const lb = lastUse(b, state);
    if (la === lb) return a.id.localeCompare(b.id);
    if (la === null) return -1;
    if (lb === null) return 1;
    return la < lb ? -1 : 1;
  })[0];
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/angles.test.mjs`
Expected: PASS, 11 tests.

- [ ] **Step 5: Write the angle registry**

Create `content/angles.json`:

```json
{
  "_comment": "WHAT we say. Every angle carries the measurement that earned its status. 'evidence' is not a rationale -- it is a number from a same-account control. assertsFacts must stay false: number claims are DERIVED from friendship.ts via scripts/derive-compatibility-pairs.mjs, never written here.",
  "angles": [
    {
      "id": "best-match",
      "frame": "positive",
      "summary": "Which numbers are your best match",
      "evidence": "@numberswithrimzim same-account control: compatibility 51.9K-57.2K views vs the same account's other posts at 6.8K-25.9K. The pinned 'made for each other' post took 35K likes on a 28.6K-follower account.",
      "status": "approved",
      "assertsFacts": false
    },
    {
      "id": "self-friendly",
      "frame": "positive",
      "summary": "The numbers that get along with themselves -- and the one that does not",
      "evidence": "Derived from friendship.ts: 7 is the only number not friendly to itself, and 5 is mutual only with itself. Held back from the compatibility reel as a second post; same positive frame as best-match, which is the measured winner.",
      "status": "approved",
      "assertsFacts": false
    },
    {
      "id": "trait-per-number",
      "frame": "informational",
      "summary": "One number, its ruling planet and traits",
      "evidence": "Our own card reels. TikTok ~205 views with 1-3 likes; Instagram 122-213 reach. @vediksoul's weakest format: 3.0K-24.6K against 348K-4.4M for topic-led posts. This is what 'our weakest format, competently made' looks like.",
      "status": "rejected",
      "assertsFacts": false
    },
    {
      "id": "conflict-pairs",
      "frame": "conflict",
      "summary": "The pairs that clash",
      "evidence": "Conflict-framed posts measured 1,115-1,436 likes against the positive frame's 35K. The top-liked comment on one was a sceptic mocking the account. Also delivers a verdict ON the reader, which is why the Barnum hooks were rejected.",
      "status": "rejected",
      "assertsFacts": false
    }
  ]
}
```

- [ ] **Step 6: Write the Angle skill**

Create `.claude/skills/angle/SKILL.md`:

```markdown
---
name: angle
description: Use before writing or structuring any Numevix video, to choose WHAT the post is about and what frame it takes. Also use when a post underperformed and the question is whether the subject, rather than the execution, was wrong.
---

# Angle

**Picks the topic and the frame before anything is written.** Runs before First Second,
never after.

## Why this comes first

The largest effect we have ever measured is the topic, not the delivery. On one
account's own posts, compatibility content did **51.9K–57.2K** while everything
else did **6.8K–25.9K**. Trait-per-number content — exactly what our card reels
are — is that format's weakest. **No amount of opening work fixes the wrong subject.**

## How to pick

`pickAngle(angles, state, asOf)` from `scripts/lib/angles.mjs`, over
`content/angles.json`. It returns the approved angle longest unused, or **null**.

**Null means write a new angle, not ship a repeat.** Repeating inside the 21-day
window is the structural sameness that made TikTok read our set as repeated content.

## Rules

- ⭐⭐ **Every angle carries evidence from a same-account control.** Across
  accounts, follower count swamps the signal. An angle without a number is a
  preference.
- 🔴 **`assertsFacts` must stay false.** Number claims are DERIVED from
  `friendship.ts` via `scripts/derive-compatibility-pairs.mjs`, which exits
  non-zero on drift. Of the pairs popular posts cite, only 4&9 overlaps with our
  own ruleset — publishing theirs would visibly contradict us and invite
  "that's wrong" comments.
- 🔴 **The positive frame beats conflict**, and it is not close: 35K likes
  against 1,115–1,436. Conflict also attracts derision and leaves a verdict on
  the reader.
- ⚠️ **Never leave a verdict on the reader.** The compatibility reel's closing
  line — *"Not on the list? It doesn't mean no."* — is load-bearing, not filler:
  roughly two thirds of viewers will not find their pair.
- **A new angle enters as `hypothesis`.** It becomes `approved` only after the
  loop tests it against our own numbers. `pickAngle` will not return it before then.
- 🌐 **English on every platform.**
```

- [ ] **Step 7: Run the full suite and lint**

Run: `npm test && npm run lint`
Expected: all pass. `content-rules.test.mjs` scans content files for "Lo Shu" — `angles.json` contains none.

- [ ] **Step 8: Commit**

```bash
git add content/angles.json scripts/lib/angles.mjs scripts/lib/angles.test.mjs .claude/skills/angle/SKILL.md
git commit -m "feat(angle): choose the subject before the delivery -- topic is the biggest measured lever

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: First Second

The single change of cycle 1: move the first payload beat from 6.4s to inside 2s. **Change nothing else.**

**Files:**
- Modify: `src/viral/timing.ts:18-24`
- Modify: `src/viral/timing.test.ts`
- Modify: `scripts/lib/variation.mjs:26-31`
- Create: `.claude/skills/first-second/SKILL.md`

**Interfaces:**
- Consumes: `PAYLOAD_BY_FRAME`, `checkPayloadTiming` from `src/viral/qa.ts` (Task 3).
- Produces: no new exports. `VIRAL_TIMING` and `STRUCTURES` change value; **every `seconds` total stays identical**, so the duplicate-detection variation pool is untouched.

- [ ] **Step 1: Write the failing test**

Append to `src/viral/timing.test.ts`:

```ts
import { PAYLOAD_BY_FRAME } from "./qa";
import { STRUCTURES } from "../../scripts/lib/variation.mjs";

/**
 * Cycle 1's single change: the payload lands inside 2 seconds.
 *
 * The old structure held the payload until 6.4s behind a `build` act whose
 * written contract was "open a curiosity loop, never fully resolve". Viewers
 * read the hook — that is why they were still there at 1.6s — and then left
 * during the 4.8 seconds before anything they were promised arrived.
 */
describe("the payload lands inside 2 seconds", () => {
  test("the default structure pays off by frame 60", () => {
    expect(makeActs(VIRAL_TIMING).valueStart).toBeLessThanOrEqual(PAYLOAD_BY_FRAME);
  });

  test.each(STRUCTURES)("$id pays off by frame 60", ({ acts }) => {
    expect(makeActs(acts).valueStart).toBeLessThanOrEqual(PAYLOAD_BY_FRAME);
  });

  // 🔴 THE CONSTRAINT THAT MAKES THIS ONE CHANGE INSTEAD OF TWO. Duration is
  // the strongest signal a duplicate detector has, and a fixed 17.450667s once
  // made TikTok withhold the whole set. The act boundaries move; the totals
  // must not, or cycle 1 confounds a timing change with a duration change and
  // measures neither.
  test.each(STRUCTURES)("$id keeps its exact total duration", ({ id, seconds, acts }) => {
    const totals = { snap: 14.2, standard: 19.6, essay: 23.4, long: 27.8 };

    expect(seconds).toBe(totals[id]);
    expect(acts.hook + acts.build + acts.value + acts.cta).toBeCloseTo(seconds, 6);
  });

  test("the four structures still have four different totals", () => {
    expect(new Set(STRUCTURES.map((s) => s.seconds)).size).toBe(4);
  });

  // The hook still has to be readable. Collapsing it to nothing to win the
  // boundary would trade one failure for another — viewers read the hook, so
  // it is not the broken part.
  test.each(STRUCTURES)("$id keeps a hook of at least 1 second", ({ acts }) => {
    expect(acts.hook).toBeGreaterThanOrEqual(1.0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/viral/timing.test.ts`
Expected: FAIL — `valueStart` is 192 for the default structure, and each `STRUCTURES` entry fails the frame-60 assertion.

- [ ] **Step 3: Re-cut the default act structure**

In `src/viral/timing.ts`, replace lines 17–24:

```ts
// ── Act structure (seconds) ─────────────────────────────────────────────────
// 🔴 CYCLE 1, 2026-08-09: the payload beat moved from 6.4s to 2.0s.
//
// The `build` act's contract used to read "open a curiosity loop, never fully
// resolve", and it ran 1.6-6.4s. Viewers read the hook — which is why they
// were still present at 1.6s — and then left during the 4.8 seconds before
// anything they were promised arrived. We asked someone who decides in under
// two seconds to wait nearly five on faith.
//
// ⭐ `total` is UNCHANGED at 17.4 and every STRUCTURES total is unchanged too.
// Duration is the strongest signal a duplicate detector has, and this is one
// change per cycle: the boundaries move, the lengths do not.
export const VIRAL_TIMING = {
  hook: 1.2, // 0–1.2s      stop the scroll
  build: 0.8, // 1.2–2.0s    ONE beat of setup, then pay
  value: 13.0, // 2.0–15.0s   the payload, rapid-fire
  cta: 2.4, // 15.0–17.4s  branding is allowed ONLY here
  total: 17.4,
} as const;
```

- [ ] **Step 4: Re-cut the variation structures**

In `scripts/lib/variation.mjs`, replace the `STRUCTURES` array (lines 26–31):

```js
/**
 * Act structures. Durations are deliberately spread and deliberately exclude
 * 17.4 — the fingerprinted length. Acts sum exactly to `seconds`.
 *
 * 🔴 CYCLE 1, 2026-08-09: hook+build re-cut to 2.0s in every structure so the
 * payload lands by frame 60. **Every `seconds` total is byte-identical to what
 * it was.** Changing a total here would confound the timing change with a
 * duration change, and duration is exactly the axis that keeps TikTok's
 * duplicate detection off us.
 */
export const STRUCTURES = [
  { id: "snap", seconds: 14.2, acts: { hook: 1.2, build: 0.8, value: 10.2, cta: 2.0 } },
  { id: "standard", seconds: 19.6, acts: { hook: 1.2, build: 0.8, value: 15.2, cta: 2.4 } },
  { id: "essay", seconds: 23.4, acts: { hook: 1.2, build: 0.8, value: 18.8, cta: 2.6 } },
  { id: "long", seconds: 27.8, acts: { hook: 1.2, build: 0.8, value: 23.0, cta: 2.8 } },
];
```

- [ ] **Step 5: Run the timing tests**

Run: `npx vitest run src/viral/timing.test.ts`
Expected: PASS. The pre-existing test `"reproduces the original act structure exactly"` still passes because `ACT` is derived from `VIRAL_TIMING`.

- [ ] **Step 6: Run the whole suite and check the value act still splits legally**

Run: `npm test`
Expected: PASS. The value act is now much longer, so `makeValueScenes` produces more scenes — it adds scenes rather than seconds, and `byTime = ceil(pairBudget / (SCENE_CHANGE * 2))` keeps every pair under the ceiling.

**If `bed-usage.test.ts` or a beat-snap test fails,** that is a real consequence, not a flake: cuts snap to a tracked beat map, and the act boundaries just moved. Re-run the snap and confirm no boundary breaches `SCENE_CHANGE * 2`. Do not widen the ceiling to make a test pass.

- [ ] **Step 7: Render one video and watch it**

Run: `npm run export:viral` (or the render path `daily-viral.mjs` uses for a single V).

Then: `npm run qa:frame -- <the rendered mp4>`

⭐⭐⭐ **Sampling frames is not watching. Watch the whole thing.** Confirm the number and its first real trait are on screen by 2 seconds, and that the montage did not become a blur now that the value act is longer.

- [ ] **Step 8: Write the First Second skill**

Create `.claude/skills/first-second/SKILL.md`:

```markdown
---
name: first-second
description: Use when designing or fixing the opening of a Numevix video - frames 0-60, the hook, and when the payload arrives. Also use when a post's retention curve drops at 0-1s or viewers leave before the payoff.
---

# First Second

**Owns frames 0–60 as one indivisible unit**, with the act structure serving it.
Merged from the design's separate Opening and Structure roles, because keeping
them apart invites two changes in one cycle and destroys the measurement.

## The measured target

**The 0–1s retention drop.** Not average watch time — that target died when the
≥6s rule turned out to be confounded with era (after 07-28: 0 of 16 posts over
1,000 reach, including one at 11.4s that got 498).

The curve reads on a single post within a day, and it is mobile-only, so **ask the
owner for the screenshot** on posts where a change is being tested. Windsor's
automatic numbers are the background baseline, not the target.

## What is settled

- ⭐⭐⭐ **Length is not the variable.** Cutting 32s → 12s bought **0.4 seconds** of
  attention. Both curves die at **0:01**.
- ⭐⭐ **But shorter still helps the ranking**, and conflating the two is the trap:
  the same ~2.5s scores 7% completion on a 32s cut and 23% on a 12s cut.
  **Both are true — shortening improves the metric and does not improve the hook.**
  Never quote one as evidence for the other.
- ⭐⭐ **~95% For You / 0.0% Following.** Distribution is being granted. The hook is
  losing an audience the platform already handed us.
- 🎯 **The prime suspect is the cold-open card glimpse** — dark, low-contrast,
  near-static. In a feed that reads as "not a video" in well under a second.

## Rules

- **Frame 1 must be legible. No fade-in.** We shipped an invisible first frame
  through `useSnap` once. Gate: `npm run qa:frame`.
- 🪤 **The cover image is not the lever.** 66.4% of views come from the Reels tab,
  where there is no cover and the video autoplays from frame 1.
- 🪤 **On-screen text only.** 91.8% of viewers are non-followers watching muted.
  A spoken hook reaches almost nobody.
- **The promise must be specific and payable within 2 seconds.**
- 🔴 **Duration must keep varying.** A fixed 17.450667s made TikTok read the set
  as repeated content. `STRUCTURES` totals are the variation axis — move act
  boundaries, never totals.
- 🪤 **Cuts snap to a TRACKED beat map, not a computed BPM**, and `voltSlope` is
  not 150 BPM. Any act change must re-run the snap and must not breach
  `SCENE_CHANGE * 2`.
- 🔴 **One change per cycle.**
```

- [ ] **Step 9: Lint and commit**

Run: `npm run lint`

```bash
git add src/viral/timing.ts src/viral/timing.test.ts scripts/lib/variation.mjs .claude/skills/first-second/SKILL.md
git commit -m "feat(first-second): payload beat lands by 2.0s -- totals deliberately unchanged

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Funnel

The actual seb.ai engine. While Meta App Review is pending, this produces a queue the owner fulfils **by hand**.

**Files:**
- Create: `scripts/lib/funnel.mjs`
- Create: `scripts/lib/funnel.test.mjs`
- Create: `scripts/funnel-queue.mjs`
- Create: `.claude/skills/funnel/SKILL.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: `content/compatibility-reel.json` (derived pairs, kept honest by `scripts/derive-compatibility-pairs.mjs`).
- Produces: `parseCommentIntent(text) => {kind: "moolank"|"dob"|"pair"|"irrelevant", moolank?: number, ambiguousDayMonth?: boolean}`, `reduceToMoolank(n) => number`, `buildFunnelCta(token) => string`, `hasFunnelCta(caption) => boolean`, `buildQueue(comments, pairs) => QueueRow[]`. `QueueRow` = `{ commentId, username, intent, moolank, matches: number[], reply: string, dm: string }`.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/funnel.test.mjs`:

```js
import { describe, expect, test } from "vitest";

import {
  buildFunnelCta,
  buildQueue,
  hasFunnelCta,
  parseCommentIntent,
  reduceToMoolank,
} from "./funnel.mjs";

describe("reduceToMoolank", () => {
  test("reduces a double digit to a single", () => {
    expect(reduceToMoolank(29)).toBe(2);
    expect(reduceToMoolank(11)).toBe(2);
  });

  test("leaves a single digit alone", () => {
    expect(reduceToMoolank(7)).toBe(7);
  });
});

describe("parseCommentIntent", () => {
  test("reads a bare digit", () => {
    expect(parseCommentIntent("5")).toEqual({ kind: "moolank", moolank: 5 });
  });

  // The niche writes M5, and the 57.2K post required exactly that format so
  // the comments would be machine-parseable.
  test("reads the niche's M-prefixed form", () => {
    expect(parseCommentIntent("M5")).toEqual({ kind: "moolank", moolank: 5 });
  });

  test("reads a double digit and reduces it", () => {
    expect(parseCommentIntent("29")).toEqual({ kind: "moolank", moolank: 2 });
  });

  // 🪤🪤 THE CORRECTNESS TRAP. Moolank is the DAY reduced, so reading
  // 05/06/1990 as the 5th rather than the 6th is a coin flip on the answer.
  // When both leading fields are <= 12, nothing in the string resolves it. We
  // assume DD/MM and FLAG it -- the DM asks rather than asserts.
  test("flags an ambiguous numeric date instead of silently guessing", () => {
    expect(parseCommentIntent("05/06/1990")).toEqual({
      kind: "dob",
      moolank: 5,
      ambiguousDayMonth: true,
    });
  });

  test("a day above 12 is unambiguous", () => {
    expect(parseCommentIntent("24/11/1988")).toEqual({
      kind: "dob",
      moolank: 6,
      ambiguousDayMonth: false,
    });
  });

  test("reads a written-month date", () => {
    expect(parseCommentIntent("24 November 1988")).toEqual({
      kind: "dob",
      moolank: 6,
      ambiguousDayMonth: false,
    });
  });

  // ⭐ `irrelevant` -> send NOTHING is a first-class outcome, not a fallback.
  // Under the competitor post we studied, the single most-liked comment was a
  // sceptic mocking the account. DMing that person is the worst available move.
  test("classifies noise as irrelevant", () => {
    expect(parseCommentIntent("Test").kind).toBe("irrelevant");
    expect(parseCommentIntent("this is nonsense 😂").kind).toBe("irrelevant");
  });
});

describe("buildFunnelCta / hasFunnelCta", () => {
  test("the CTA names the parseable format and the payoff", () => {
    const cta = buildFunnelCta("your Moolank");

    expect(cta).toContain("M1");
    expect(cta).toContain("DM");
  });

  test("detects a caption that is missing the mechanic", () => {
    expect(hasFunnelCta("Screenshot the last frame and keep it.")).toBe(false);
    expect(hasFunnelCta(buildFunnelCta("your Moolank"))).toBe(true);
  });
});

describe("buildQueue", () => {
  const pairs = [
    { a: 1, b: 2 },
    { a: 1, b: 4 },
    { a: 2, b: 7 },
  ];

  test("produces a hand-fulfilment row per actionable comment", () => {
    const [row] = buildQueue(
      [{ comment_id: "c1", comment_text: "M1", username: "someone" }],
      pairs,
    );

    expect(row.moolank).toBe(1);
    expect(row.matches).toEqual([2, 4]);
    expect(row.reply).toContain("DM");
  });

  test("drops irrelevant comments entirely -- no row, nothing to send", () => {
    expect(buildQueue([{ comment_id: "c2", comment_text: "Test" }], pairs)).toEqual([]);
  });

  // ⚠️ Roughly two thirds of askers will not be on their own both-ways list
  // and must not read the DM as a refusal.
  test("every DM carries the 'ease, not permission' line", () => {
    const rows = buildQueue(
      [
        { comment_id: "c1", comment_text: "M1" },
        { comment_id: "c3", comment_text: "M7" },
      ],
      pairs,
    );

    for (const r of rows) expect(r.dm).toContain("ease, not permission");
  });

  test("an ambiguous date makes the DM ASK about day and month order", () => {
    const [row] = buildQueue([{ comment_id: "c4", comment_text: "05/06/1990" }], pairs);

    expect(row.dm).toContain("wrong way round");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/funnel.test.mjs`
Expected: FAIL — cannot resolve `./funnel.mjs`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib/funnel.mjs`:

```js
/**
 * The comment-to-DM funnel — the mechanic, not the hook.
 *
 * ⭐⭐⭐ WHAT seb.ai ACTUALLY BUILT. The carousel that prompted this whole
 * workstream ("7 AI employees, one creator") took 3.2K likes and **6.4K
 * comments**, every one of them the word "Team", each with an auto-reply. The
 * 7 agents were the CONTENT of the post; the funnel was the engine. Same shape
 * on the 57.2K compatibility post: 2,953 comments against 673 likes, a 4.4:1
 * ratio that does not happen organically.
 *
 * ⭐⭐ This is the direct fix for our 0.0% comment rate — which is real, not a
 * measurement artefact. We have been treating it as a copy problem; it is a
 * mechanism problem. Ours asks for a comment and offers nothing back.
 *
 * 🔴 STATUS: Meta App Review was submitted 2026-08-08 and takes up to 20 days.
 * Until it lands, this module builds a queue the OWNER fulfils by hand. That
 * is the plan of record, not a stopgap.
 */

/** A moolank is a single digit: reduce until it is one. */
export const reduceToMoolank = (n) => {
  let x = Math.abs(Math.trunc(n));
  while (x > 9) x = String(x).split("").reduce((t, d) => t + Number(d), 0);
  return x;
};

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Classification is a small CLOSED problem — a number, a date, a pair, or
 * noise — so it is a deterministic parser rather than a model call. It can be
 * exhaustively tested where a model call cannot, and it is instant and free.
 */
export const parseCommentIntent = (text) => {
  const s = String(text ?? "").trim();
  if (!s) return { kind: "irrelevant" };

  // ISO first: 1988-11-24. Unambiguous by construction.
  const iso = s.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    return { kind: "dob", moolank: reduceToMoolank(Number(iso[3])), ambiguousDayMonth: false };
  }

  // Written month: 24 November 1988 / November 24 1988.
  const written = s.toLowerCase().match(/\b(\d{1,2})\s+([a-z]+)\b|\b([a-z]+)\s+(\d{1,2})\b/);
  if (written) {
    const monthWord = (written[2] ?? written[3] ?? "").toLowerCase();
    const day = Number(written[1] ?? written[4]);
    if (MONTHS.some((m) => m.startsWith(monthWord.slice(0, 3)) && monthWord.length >= 3)) {
      return { kind: "dob", moolank: reduceToMoolank(day), ambiguousDayMonth: false };
    }
  }

  // Numeric date: 24/11/1988 or 05/06/1990.
  const numeric = s.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/);
  if (numeric) {
    const [, first, second] = numeric;
    // 🪤 DD/MM assumed (the audience skews India and the niche writes DD/MM),
    // and FLAGGED when nothing in the string can resolve it. Never remove the
    // flag to tidy the copy — it is a coin flip on the answer.
    return {
      kind: "dob",
      moolank: reduceToMoolank(Number(first)),
      ambiguousDayMonth: Number(first) <= 12 && Number(second) <= 12,
    };
  }

  // A pair: "5 and 7".
  const pair = s.match(/\b(\d{1,2})\s*(?:and|&|\+)\s*(\d{1,2})\b/i);
  if (pair) {
    return {
      kind: "pair",
      moolank: reduceToMoolank(Number(pair[1])),
      partner: reduceToMoolank(Number(pair[2])),
    };
  }

  // A bare number, or the niche's M-prefixed form.
  const bare = s.match(/^m?\s*(\d{1,2})$/i);
  if (bare) return { kind: "moolank", moolank: reduceToMoolank(Number(bare[1])) };

  return { kind: "irrelevant" };
};

/**
 * The caption mechanic. Four things at once: forces a comment in a PARSEABLE
 * format, requires a follow, and delivers the payoff in DM — a private channel
 * opened by someone who has just volunteered their birth number.
 */
export const buildFunnelCta = (token) =>
  `Want to know yours? Follow the page + comment ${token} (M1 / M2 / M3…) below ` +
  `and I'll send your best match in a DM 💗 Only comments in that format will get a reply.`;

export const hasFunnelCta = (caption) =>
  /M1\s*\/\s*M2/.test(String(caption ?? "")) && /\bDM\b/.test(String(caption ?? ""));

/** ⚠️ On every branch. Two thirds of askers will not be on their own list. */
const EASE_LINE = "This is about ease, not permission — a pair that isn't listed isn't a no.";

const matchesFor = (moolank, pairs) =>
  (pairs ?? [])
    .filter((p) => p.a === moolank || p.b === moolank)
    .map((p) => (p.a === moolank ? p.b : p.a))
    .sort((x, y) => x - y);

export const buildQueue = (comments, pairs) =>
  (comments ?? [])
    .map((c) => {
      const intent = parseCommentIntent(c.comment_text);
      // ⭐ Sending NOTHING is a first-class outcome. Under the competitor post
      // we studied, the most-liked comment was a sceptic mocking the account.
      if (intent.kind === "irrelevant") return null;

      const matches = matchesFor(intent.moolank, pairs);
      const dm = [
        `Your Moolank is ${intent.moolank}.`,
        matches.length
          ? `Both-ways best matches: ${matches.join(", ")}.`
          : `You're a rarer one — no both-ways match on this list.`,
        // 🪤 ASKS, never asserts. Nothing in the string can resolve the order,
        // so the copy must not pretend otherwise.
        intent.ambiguousDayMonth
          ? "One check — I read the first number as the day. Tell me if I've got the day and month the wrong way round."
          : null,
        EASE_LINE,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        commentId: c.comment_id,
        username: c.username ?? null,
        intent: intent.kind,
        moolank: intent.moolank,
        matches,
        // ⭐⭐ The public reply is LOAD-BEARING, not a nudge: a non-follower's
        // DM lands in Message Requests, not the Inbox, so without it they may
        // never see the message.
        reply: "Sent you a DM 💗",
        dm,
      };
    })
    .filter(Boolean);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/funnel.test.mjs`
Expected: PASS, 15 tests. If the ambiguous-date DM assertion fails on wording, fix the `dm` string to contain the literal phrase `wrong way round` — the test pins the phrasing on purpose.

- [ ] **Step 5: Write the queue CLI**

Create `scripts/funnel-queue.mjs`:

```js
#!/usr/bin/env node
/**
 * npm run funnel:queue -- [--media=<mediaId>]
 *
 * Builds the hand-fulfilment queue: who commented, what to reply publicly, and
 * what to send in the DM. Sends NOTHING — the owner does that by hand until
 * Meta App Review lands.
 *
 * 🔴 Every number in the DM is DERIVED from content/compatibility-reel.json,
 * which scripts/derive-compatibility-pairs.mjs re-checks against
 * vedic-numerology/lib/numerology/friendship.ts and exits non-zero on drift.
 * Run that script before trusting this output.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildQueue } from "./lib/funnel.mjs";

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? null;

const reelPath = join(process.cwd(), "content", "compatibility-reel.json");
if (!existsSync(reelPath)) {
  console.error(`No ${reelPath}. Run: node scripts/derive-compatibility-pairs.mjs`);
  process.exit(1);
}
const pairs = JSON.parse(readFileSync(reelPath, "utf8")).pairs ?? [];

// Comments arrive from the Windsor `comments` table. In a Claude Code session,
// pull them with the Windsor MCP (get_fields first, then get_data on
// comment_id, comment_text, comment_timestamp, media_id) and pipe the JSON in.
const stdin = readFileSync(0, "utf8").trim();
if (!stdin) {
  console.error(
    "Pipe Windsor comment rows in as JSON:\n" +
      "  npm run funnel:queue < comments.json\n" +
      "Fields: comment_id, comment_text, comment_timestamp, media_id",
  );
  process.exit(1);
}

const all = JSON.parse(stdin);
const media = arg("media");
const comments = media ? all.filter((c) => String(c.media_id) === media) : all;
const queue = buildQueue(comments, pairs);

console.log(`\n${comments.length} comments · ${queue.length} actionable · ${comments.length - queue.length} correctly ignored\n`);
for (const row of queue) {
  console.log(`— ${row.username ?? row.commentId} (moolank ${row.moolank})`);
  console.log(`  reply: ${row.reply}`);
  console.log(`  DM:    ${row.dm}\n`);
}
```

- [ ] **Step 6: Add the npm script**

In `package.json` `scripts`:

```json
    "funnel:queue": "node scripts/funnel-queue.mjs",
```

- [ ] **Step 7: Write the Funnel skill**

Create `.claude/skills/funnel/SKILL.md`:

```markdown
---
name: funnel
description: Use when working on the comment-to-DM mechanic - the caption CTA that asks for a parseable comment, classifying the comments that arrive, or building the DM queue the owner fulfils by hand. Also use when comment rate is the problem.
---

# Funnel

**The engine, not the content.** seb.ai's carousel took 3.2K likes and **6.4K
comments**, each one the word "Team" with an auto-reply. The 7 agents were what
the post was *about*. The funnel was what made it move.

## Status

🔴 **Meta App Review submitted 2026-08-08. Up to 20 days. It cannot be edited or
cancelled.** Until it lands, the whole comment → reply → DM flow is fulfilled
**by hand**, and that is the plan of record.

**On approval day:** swap Vercel's `META_PAGE_ACCESS_TOKEN` — it is still the old
scope-less publisher token — and redeploy, or the first real webhook fails on scope.

## Build the queue

```
npm run funnel:queue < comments.json
```

Pull comments with the Windsor MCP (`get_fields` first, then `get_data` on
`comment_id`, `comment_text`, `comment_timestamp`, `media_id`). The script sends
nothing.

## Rules

- ⭐ **`irrelevant` → send NOTHING is a first-class outcome, not a fallback.**
  Under the competitor post we studied, the single most-liked comment was a
  sceptic mocking the account. DMing that person is the worst available move.
- ⭐⭐ **The public "Sent you a DM" reply is load-bearing.** A non-follower's DM
  lands in Message Requests, not the Inbox — without the comment reply they may
  never see it.
- 🪤🪤 **Day/month order is a coin flip.** Moolank is the day reduced, so reading
  `05/06/1990` as the 5th rather than the 6th changes the answer. We assume DD/MM
  and **the DM asks** — *"tell me if I've got the day and month the wrong way
  round"*. **Never remove that flag to tidy the copy.**
- ⚠️ **Every DM carries the "ease, not permission" line.** Roughly two thirds of
  askers will not be on their own both-ways list and must not read it as a refusal.
- 🔴 **Every number is DERIVED** from `friendship.ts` via
  `scripts/derive-compatibility-pairs.mjs`, which exits non-zero on drift.
- **A deterministic parser, not an LLM call** — classification here is a small
  closed problem, so it can be exhaustively tested, and it is instant and free.
- ⭐ **If hand-fulfilment becomes unmanageable, that IS the success signal.**
```

- [ ] **Step 8: Verify the derived pairs are current, run the suite, lint**

Run: `node scripts/derive-compatibility-pairs.mjs`
Expected: exit 0. A non-zero exit means the pairs drifted from `friendship.ts` — fix that before trusting any DM copy.

Run: `npm test && npm run lint`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add scripts/lib/funnel.mjs scripts/lib/funnel.test.mjs scripts/funnel-queue.mjs .claude/skills/funnel/SKILL.md package.json
git commit -m "feat(funnel): comment-to-DM queue -- the seb.ai engine, hand-fulfilled

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Analyzer — outward

Last on purpose. It generates *hypotheses*, and hypotheses are worthless until the loop can test them.

**Files:**
- Create: `scripts/lib/niche.mjs`
- Create: `scripts/lib/niche.test.mjs`
- Modify: `.claude/skills/analyzer/SKILL.md`

**Interfaces:**
- Consumes: `median` from `scripts/lib/windsor.mjs`.
- Produces: `MAX_AGE_SKEW_DAYS: number`, `sameAccountLift(posts, {format}) => {format, n, medianFormat, medianBaseline, lift} | null`, `rejectAgeSkew(posts, asOf) => {ok: boolean, reason: string|null}`.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/niche.test.mjs`:

```js
import { describe, expect, test } from "vitest";

import { MAX_AGE_SKEW_DAYS, rejectAgeSkew, sameAccountLift } from "./niche.mjs";

describe("sameAccountLift", () => {
  // ⭐⭐ The method that produced every outward finding we trust. Across
  // accounts, follower count swamps the signal; within one account it is a
  // controlled comparison.
  const posts = [
    { format: "compatibility", views: 57200 },
    { format: "compatibility", views: 51900 },
    { format: "other", views: 13000 },
    { format: "other", views: 6878 },
    { format: "other", views: 25900 },
  ];

  test("compares a format against the SAME account's other posts", () => {
    const r = sameAccountLift(posts, { format: "compatibility" });

    expect(r.n).toBe(2);
    expect(r.medianFormat).toBe(54550);
    expect(r.medianBaseline).toBe(13000);
    expect(r.lift).toBe(4.2);
  });

  // A single post is an anecdote. Reporting a lift from n=1 is how "the old
  // format won" got believed once already.
  test("refuses to report a lift from a single post", () => {
    expect(sameAccountLift([{ format: "compatibility", views: 57200 }], { format: "compatibility" })).toBeNull();
  });

  test("returns null when the account has no baseline to compare against", () => {
    expect(
      sameAccountLift(
        [
          { format: "compatibility", views: 1 },
          { format: "compatibility", views: 2 },
        ],
        { format: "compatibility" },
      ),
    ).toBeNull();
  });
});

describe("rejectAgeSkew", () => {
  // 🪤 A 30-day-old post against a 3-hour-old one once produced a false "the
  // old format won" conclusion. The guard exists because we got this wrong.
  test("rejects a comparison spanning wildly different post ages", () => {
    const { ok, reason } = rejectAgeSkew(
      [{ timestamp: "2026-07-01T00:00:00Z" }, { timestamp: "2026-08-09T00:00:00Z" }],
      "2026-08-09",
    );

    expect(ok).toBe(false);
    expect(reason).toContain("age");
  });

  test("accepts posts of comparable age", () => {
    expect(
      rejectAgeSkew(
        [{ timestamp: "2026-08-01T00:00:00Z" }, { timestamp: "2026-08-03T00:00:00Z" }],
        "2026-08-09",
      ).ok,
    ).toBe(true);
  });

  test("the tolerated skew is 7 days", () => {
    expect(MAX_AGE_SKEW_DAYS).toBe(7);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/niche.test.mjs`
Expected: FAIL — cannot resolve `./niche.mjs`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/lib/niche.mjs`:

```js
/**
 * The outward scan's two guards, each bought with a mistake already made.
 *
 * 🔴 An outward finding is a HYPOTHESIS, never a change. It enters the loop and
 * is tested against our own numbers. That discipline is what talked us out of
 * the conflict-framed compatibility reel — and the evidence then went the other
 * way, which is exactly why it is worth keeping.
 */
import { median } from "./windsor.mjs";

/** Beyond this, two posts have had such different lifetimes they cannot be compared. */
export const MAX_AGE_SKEW_DAYS = 7;

/**
 * ⭐⭐ Same-account control, always. Across accounts, follower count swamps the
 * signal. This is the method that showed compatibility posts at 51.9–57.2K
 * against the SAME account's 6.8–25.9K baseline.
 *
 * Returns null rather than a number when the comparison cannot be made — n=1 is
 * an anecdote, and an account with no other posts has no baseline.
 */
export const sameAccountLift = (posts, { format }) => {
  const mine = (posts ?? []).filter((p) => p.format === format);
  const others = (posts ?? []).filter((p) => p.format !== format);
  if (mine.length < 2 || others.length < 1) return null;

  const medianFormat = median(mine.map((p) => p.views));
  const medianBaseline = median(others.map((p) => p.views));
  if (!medianBaseline) return null;

  return {
    format,
    n: mine.length,
    medianFormat,
    medianBaseline,
    lift: Number((medianFormat / medianBaseline).toFixed(1)),
  };
};

/**
 * 🪤 Never compare posts of different ages. A 30-day-old post against a
 * 3-hour-old one once produced a false "the old format won" conclusion — the
 * old one had simply had a month to accumulate.
 */
export const rejectAgeSkew = (posts, asOf) => {
  const ages = (posts ?? [])
    .map((p) => (new Date(asOf) - new Date(p.timestamp)) / 86_400_000)
    .filter((n) => Number.isFinite(n));
  if (ages.length < 2) return { ok: true, reason: null };

  const skew = Math.max(...ages) - Math.min(...ages);
  return skew > MAX_AGE_SKEW_DAYS
    ? { ok: false, reason: `age skew ${skew.toFixed(1)}d exceeds ${MAX_AGE_SKEW_DAYS}d` }
    : { ok: true, reason: null };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/niche.test.mjs`
Expected: PASS, 6 tests.

- [ ] **Step 5: Point the skill at the new guards**

In `.claude/skills/analyzer/SKILL.md`, under **Outward: the niche**, the two guard bullets already name `scripts/lib/niche.mjs`. Extend the same-account bullet so both functions are named:

```markdown
- ⭐⭐ **Same-account control, always** (`sameAccountLift` in `scripts/lib/niche.mjs`).
  Across accounts, follower count swamps the signal. It returns **null** rather than
  a number when n < 2 — an anecdote is not a lift.
- 🪤 **Never compare posts of different ages** (`rejectAgeSkew`, 7-day tolerance).
  A 30-day-old post against a 3-hour-old one once produced a false "the old format
  won" conclusion.
```

- [ ] **Step 6: Run the full suite and lint**

Run: `npm test && npm run lint`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/niche.mjs scripts/lib/niche.test.mjs .claude/skills/analyzer/SKILL.md
git commit -m "feat(analyzer): outward scan guards -- same-account control and age skew

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## The loop, once all seven tasks land

```
Angle picks the subject      (approved angles only; null means write a new one)
  → First Second designs frames 0-60
  → ONE change
  → render
  → QA gate (npm test + npm run qa:frame) -- blocks on failure
  → OWNER POSTS BY HAND on every platform
  → Funnel queue built from the comments; owner fulfils by hand
  → Analyzer re-reads at 24h against the account's own baseline
  → owner shares the retention curve screenshot
  → keep or revert
```

🔴 **One change per cycle.** Two simultaneous changes make the measurement meaningless and turn this into a redesign rather than a team.

**Cycle 1 is already loaded:** Task 5's payload move, measured on the 0–1s retention drop. Change nothing else.

## What this plan deliberately does not do

- **No Publisher.** API upload measured max 3 views across n=7. The owner hand-posts.
- **No Designer.** The Remotion motion vocabulary works; it is not what fails at 0:01. ⚠️ This remains the weakest call in the design — a judgement, not a measurement — and the owner was invited to push back and did not.
- **No Manager.** `scripts/daily-viral.mjs` already orchestrates the day, deterministically and free.
- **No ≥6s watch-time target.** It is confounded with era and does not currently operate.
- **No duration change.** The seconds-vs-completion question is unsettled and the two hypotheses recommend opposite actions. Task 1 makes it answerable *going forward*; do not act on it from the 7 posts we have.
