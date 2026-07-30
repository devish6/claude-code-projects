#!/usr/bin/env node
/**
 * npm run daily:viral -- [--dry-run] [--date=YYYY-MM-DD]
 *
 * Produces 3 post-ready videos/day into ~/Desktop/Numevix Videos/Viral/,
 * following the existing V01-V06 folder convention exactly (see
 * scripts/export-viral.mjs, which this script calls into for the actual
 * render/export step -- no second exporter).
 *
 * Day 1-7 content comes from the hand-authored content/weekly-plan-w1.json.
 * Day 8+ falls back to scripts/lib/picker.mjs's algorithmic rotation.
 *
 * --dry-run: computes and prints the day's picks + full caption pack, then
 *   stops. It writes NOTHING -- no state, no daily-templates.ts, no render,
 *   no Desktop, no git. Persisting V-numbers or music rotation from a preview
 *   would desync state from reality (nothing was rendered) and could make the
 *   next real run believe today already shipped. Safe to run repeatedly.
 *
 * Real run (no --dry-run): does everything --dry-run does, PLUS renders +
 *   exports each video to the Desktop folder, writes captions/POST-ORDER.md/
 *   RUN-LOG.md/Captions.md/Hook Library.md, checks the music pool, and
 *   commits + pushes the code/content changes (never the MP4s).
 *
 * Failure behaviour: one bad render does not poison the day. The other
 * videos still ship, the failure goes into RUN-LOG.md with the real error,
 * the failed video's folder is never created (or is cleaned up if partially
 * created), its V-number stays reserved (marked "failed" in state, excluded
 * from daily-templates.ts), and the process exits non-zero.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { DEST, exportOne } from "./export-viral.mjs";
import {
  DAILY_ENERGY_DESTINATION,
  composeDailyEnergyEntry,
} from "./lib/daily-energy.mjs";
import { makeHookIndex } from "./lib/hooks-source.mjs";
import { utmLinksForVideo } from "./lib/utm.mjs";
import { pickAlgorithmicBatch } from "./lib/picker.mjs";
import { findIncompleteVideos } from "./lib/reconcile.mjs";
import { syncRestockNote, poolHealthy, FAST_TRACKS, trackForTempo } from "./lib/music-pool.mjs";
import { findDuplicateFingerprints, pickVariation, structureById } from "./lib/variation.mjs";
import { addVideo, formatV, loadState, nextVNumber, saveState } from "./lib/state.mjs";
import { compositionId, writeDailyTemplates } from "./lib/templates-gen.mjs";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const RESUME = args.includes("--resume");
const dateArg = args.find((a) => a.startsWith("--date="))?.split("=")[1];
const RUN_DATE = dateArg ?? new Date().toISOString().slice(0, 10);

const WEEKLY_PLAN_PATH = "content/weekly-plan-w1.json";
const HOOKS_PATH = "src/viral/hooks.ts";
const DAILY_ENERGY_PATH = "content/daily-energy.json";

const log = (...a) => process.stdout.write(a.join(" ") + "\n");

// ── Day index ────────────────────────────────────────────────────────────
const state = loadState();
state.pipelineMeta ??= { firstRunDate: RUN_DATE };
const daysSinceStart =
  Math.round((new Date(RUN_DATE) - new Date(state.pipelineMeta.firstRunDate)) / 86_400_000) + 1;
const dayIndex = Math.max(1, daysSinceStart);

log(`daily:viral -- date=${RUN_DATE} dayIndex=${dayIndex}${DRY_RUN ? " [DRY RUN]" : ""}`);

// Idempotency guard: if this exact date already produced a real batch, don't
// silently create a second one (real runs only -- dry-run always previews).
//
// But "a batch exists" is NOT the same as "the batch is finished". A killed
// process saves state and leaves the renders undone, and this guard used to
// treat that as complete -- which is how V17 (empty folder) and V18 (no
// folder) went unnoticed while state called both "generated".
if (!DRY_RUN && !RESUME && state.videos.some((v) => v.date === RUN_DATE && v.source !== "seed-existing")) {
  const incomplete = findIncompleteVideos(state, DEST, RUN_DATE);
  log(`Already generated a batch for ${RUN_DATE}:`);
  state.videos
    .filter((v) => v.date === RUN_DATE)
    .forEach((v) => log(`  ${v.v} - ${v.title}${incomplete.includes(v) ? "   ← NOT RENDERED" : ""}`));

  if (incomplete.length) {
    log(`\n! ${incomplete.length} of them exist in state but not on disk — an interrupted run.`);
    log("  Run with --resume to render just those. State and V-numbers are kept.");
    process.exit(1);
  }
  log("Nothing to do. Use --date=YYYY-MM-DD to target a different day.");
  process.exit(0);
}

let batch;
// Declared out here because the post-branch code appends these to
// DAILY_HOOKS. A resume authors no new hooks, so it stays empty.
let newHooks = [];

if (RESUME) {
  batch = findIncompleteVideos(state, DEST, RUN_DATE);
  if (!batch.length) {
    log(`Nothing to resume for ${RUN_DATE} — every video in state is on disk.`);
    process.exit(0);
  }
  log(`Resuming ${batch.length} unrendered video(s): ${batch.map((v) => v.v).join(", ")}`);
} else {

const hooksIndex = makeHookIndex(HOOKS_PATH);

// ── Pick today's 3 concepts ─────────────────────────────────────────────
let concepts;

if (dayIndex <= 7) {
  const plan = JSON.parse(readFileSync(WEEKLY_PLAN_PATH, "utf8"));
  const day = plan.days.find((d) => d.day === dayIndex);
  if (!day) throw new Error(`weekly-plan-w1.json has no entry for day ${dayIndex}`);
  concepts = day.videos.map((c) => ({
    ...c,
    _hook: hooksIndex.get(c.hookId),
    source: "weekly-plan-w1",
    planDay: dayIndex,
  }));
  const missing = concepts.filter((c) => !c._hook);
  if (missing.length) {
    throw new Error(`hookId not found in hooks.ts: ${missing.map((c) => c.hookId).join(", ")}`);
  }
} else {
  const picked = pickAlgorithmicBatch(state, RUN_DATE, dayIndex, hooksIndex);
  concepts = picked.concepts.map((c) => ({ ...c, source: "algorithmic" }));
  newHooks = picked.newHooks;
}

// ── Assign V-numbers + music, build full props ──────────────────────────
const destForNumbering = !DRY_RUN && existsSync(homedir()) ? DEST : null;
batch = concepts.map((concept, slot) => {
  const vNum = nextVNumber(state, destForNumbering);
  const v = formatV(vNum);
  const hook = concept._hook;

  // Structural variation. Every video before 2026-07-30 shared one act
  // structure, one cut grid and one palette, and TikTok withheld the set as
  // repeated content. The bed now follows the chosen TEMPO rather than a
  // round-robin, so transients land in different places too.
  const variation = pickVariation(state, RUN_DATE, slot);
  const previousMusic = state.videos.at(-1)?.music;
  const music = trackForTempo(variation.tempo, previousMusic);

  const props = {
    hookText: hook.text,
    hookAccent: hook.accent,
    hookSub: hook.sub,
    variant: hook.variant,
    buildSetup: concept.buildSetup,
    buildReveal: concept.buildReveal,
    number: concept.number,
    numberLabel: concept.numberLabel,
    traits: concept.traits,
    ctaText: concept.ctaText,
    music,
    structure: structureById(variation.structure),
    palette: variation.palette,
    layout: variation.layout,
  };

  const entry = {
    v,
    title: concept.title,
    date: RUN_DATE,
    category: concept.category,
    moolank: concept.moolank,
    hookId: concept.hookId,
    music,
    variation,
    variant: hook.variant,
    status: "generated", // optimistic; flipped to "failed" below if render fails
    source: concept.source,
    planDay: concept.planDay,
    needsReview: concept.needsReview ?? false,
    whyComment: concept.whyComment,
    tiktokCaption: concept.tiktokCaption,
    instagramCaption: concept.instagramCaption,
    hashtags: concept.hashtags,
    suggestedPostTime: concept.suggestedPostTime,
    props,
  };

  addVideo(state, entry);
  return entry;
});

// ── Today's feed-driven daily-energy video (Slice 6c Part 2) ────────────
// Additive: the plan/algorithmic picks above are untouched, per the spec.
// A missing or unusable snapshot costs THIS video only -- never the batch.
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const todayWeekday = WEEKDAY_NAMES[new Date(`${RUN_DATE}T00:00:00Z`).getUTCDay()];

if (!existsSync(DAILY_ENERGY_PATH)) {
  log(`\n! No ${DAILY_ENERGY_PATH} — skipping the daily-energy video.`);
  log("  Run `npm run sync:daily-energy` to create it. The day's other videos are unaffected.");
} else {
  try {
    const snapshot = JSON.parse(readFileSync(DAILY_ENERGY_PATH, "utf8"));
    // Slot 3 — this video needs its own variation too, or it just adds a
    // fourth identical-length video to the pile.
    const variation = pickVariation(state, RUN_DATE, batch.length);
    const entry = composeDailyEnergyEntry({
      snapshot,
      weekday: todayWeekday,
      v: formatV(nextVNumber(state, destForNumbering)),
      music: trackForTempo(variation.tempo, state.videos.at(-1)?.music),
      date: RUN_DATE,
      structure: structureById(variation.structure),
      variation,
    });
    addVideo(state, entry);
    batch.push(entry);
  } catch (err) {
    log(`\n! daily-energy video skipped — ${String(err?.message ?? err)}`);
    log("  The day's other videos are unaffected.");
  }
}

} // end of the compose branch

// Every video carries a UTM-tagged link. This is the only join between
// platform analytics (watch time, no site data) and GA4 (sessions and
// sign-ups, no idea which video sent them). Untagged traffic is unattributable
// forever -- there is no way to backfill it later.
for (const entry of batch) {
  entry.utmLinks ??= utmLinksForVideo(DAILY_ENERGY_DESTINATION, entry.v);
}

// The guard. Reusing a structure/tempo/layout/palette combination inside the
// window is the exact condition that got the last account's videos withheld,
// so it is reported loudly rather than discovered on the platform.
const duplicates = findDuplicateFingerprints(state);
if (duplicates.length) {
  log(`\n! ${duplicates.length} duplicate variation fingerprint(s) in the last 14 days:`);
  duplicates.forEach((d) => log(`    ${d.a} and ${d.b} both use ${d.fingerprint}`));
  log("  Widen the variation pools in scripts/lib/variation.mjs before posting these.");
}

// ── Preview (dry-run stops here after this block) ───────────────────────
for (const entry of batch) {
  log(`\n${entry.v} - ${entry.title}  [${entry.category} / Moolank ${entry.moolank} / ${entry.music}]`);
  log(`  hook: ${entry.props.hookText} ${entry.props.hookAccent ?? ""}`);
  log(`  sub:  ${entry.props.hookSub ?? ""}`);
  log(`  traits: ${entry.props.traits.join(" | ")}`);
  log(`  cta: ${entry.props.ctaText}`);
  log(`  tiktok caption: ${entry.tiktokCaption}`);
  log(`  hashtags: ${(entry.hashtags ?? []).join(" ")}`);
  log(`  why it earns a comment: ${entry.whyComment}`);
  log(`  tiktok link: ${entry.utmLinks.tiktok}`);
  if (entry.variation) {
    const secs = Object.values(entry.props.structure).reduce((a, b) => a + b, 0).toFixed(1);
    log(`  variation: ${secs}s / ${entry.variation.tempo}bpm / ${entry.variation.layout} / ${entry.variation.palette}`);
  }
}

if (newHooks.length) {
  log(`\n${newHooks.length} new hook(s) authored for DAILY_HOOKS (day ${dayIndex} exhausted the library):`);
  newHooks.forEach((h) => log(`  ${h.id}: "${h.text}" / "${h.accent}"`));
}

if (DRY_RUN) {
  // Fully non-mutating: no state.json write, no daily-templates.ts write, no
  // hooks.ts write, no Desktop, no git. A dry-run that persisted V-number /
  // music-rotation state would desync from reality (nothing was actually
  // rendered) and could make the NEXT real run think today already shipped.
  log("\n[DRY RUN] Stopped here -- no files written, no render, no Desktop writes, no git.");
  process.exit(0);
}

// Regenerate repo-local files -- real run only, from here on state IS reality.
writeDailyTemplates(state);
if (newHooks.length) {
  const src = readFileSync(HOOKS_PATH, "utf8");
  const insertion = newHooks
    .map(
      (h) =>
        `  { id: ${JSON.stringify(h.id)}, category: ${JSON.stringify(h.category)}, variant: ${JSON.stringify(h.variant)}, text: ${JSON.stringify(h.text)}, accent: ${JSON.stringify(h.accent)}, sub: ${JSON.stringify(h.sub)}, ${h.number !== undefined ? `number: ${h.number}, ` : ""}},`,
    )
    .join("\n");
  const patched = src.replace(
    "export const DAILY_HOOKS: Hook[] = [];",
    `export const DAILY_HOOKS: Hook[] = [\n${insertion}\n];`,
  );
  if (patched === src) throw new Error("could not find DAILY_HOOKS insertion point in hooks.ts");
  writeFileSync(HOOKS_PATH, patched);
}
saveState(state);

// ── Real run: render + export + captions + rollups + git ────────────────
mkdirSync(DEST, { recursive: true });
const restock = syncRestockNote(DEST);
if (restock.wrote) log(`\nMusic pool below floor -- wrote ${restock.path}`);

const runLogLines = [`## ${RUN_DATE} — day ${dayIndex}`, ""];
let anyFailed = false;

for (const entry of batch) {
  // MUST come from templates-gen.mjs, the same function that writes the id
  // into daily-templates.ts. Building it a second time here drifts: an earlier
  // inline copy stripped apostrophes ("Dont") while pascalCase splits on them
  // ("DonT"), so any title with an apostrophe registered under one id and was
  // requested under another, and `remotion render` failed with "composition
  // not found". Three of the 21 week-one videos hit that, including day 1.
  const id = compositionId(entry);
  const title = `${entry.v} - ${entry.title}`;

  try {
    const { dir } = exportOne(id, title, DEST);

    const captionPath = join(dir, `${title} - caption.txt`);
    writeFileSync(
      captionPath,
      [
        `TIKTOK CAPTION`,
        entry.tiktokCaption,
        "",
        `INSTAGRAM CAPTION`,
        entry.instagramCaption,
        "",
        `HASHTAGS`,
        (entry.hashtags ?? []).join(" "),
        "",
        `SUGGESTED POST TIME`,
        entry.suggestedPostTime,
        "",
        `LINK IN BIO / PROFILE — use the one matching where you post.`,
        `Each is tagged utm_content=${entry.v}, which is what lets GA4 attribute`,
        `sessions and sign-ups back to THIS video. Posting a bare numevix.com`,
        `link instead makes that traffic permanently unattributable.`,
        ...Object.entries(entry.utmLinks).map(([platform, link]) => `  ${platform}: ${link}`),
        "",
        `WHY THIS HOOK SHOULD WORK`,
        entry.whyComment,
        "",
        `NOTE`,
        "If TikTok offers a trending sound on upload, use it -- swapping to trending audio in-app beats the baked-in bed for reach.",
      ].join("\n"),
    );

    runLogLines.push(`- ${entry.v} — ${entry.title}: OK`);
  } catch (err) {
    anyFailed = true;
    entry.status = "failed";
    const dir = join(DEST, title);
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    runLogLines.push(`- ${entry.v} — ${entry.title}: FAILED — ${String(err?.message ?? err)}`);
    log(`\n✗ ${entry.v} failed: ${String(err?.message ?? err)}`);
  }
}

// Regenerate daily-templates.ts again now that failures are marked (so
// failed compositions drop out and never get exported next time by mistake).
writeDailyTemplates(state);
saveState(state);

// Hook Library.md (existing generator already writes both copies).
execFileSync("node", ["scripts/hooks-doc.mjs"], { stdio: "inherit" });

// Captions.md / POST-ORDER.md / RUN-LOG.md — append, newest first.
const prependSection = (path, heading, body) => {
  const existing = existsSync(path) ? readFileSync(path, "utf8") : `# ${heading}\n`;
  const [firstLine, ...rest] = existing.split("\n");
  writeFileSync(path, [firstLine, "", body, ...rest.slice(1)].join("\n"));
};

const capMd = batch
  .filter((e) => e.status !== "failed")
  .map((e) =>
    [
      `## ${e.v} — ${e.title}`,
      "",
      "**TikTok**",
      `> ${e.tiktokCaption}`,
      "",
      "**Instagram**",
      `> ${e.instagramCaption}`,
      "",
      `**Hashtags:** ${(e.hashtags ?? []).join(" ")}`,
      "",
    ].join("\n"),
  )
  .join("\n");
if (capMd) prependSection(join(DEST, "Captions.md"), "Numevix — Viral Set Captions", capMd);

const postOrderMd = [
  `### ${RUN_DATE}`,
  ...batch.map((e) => `- ${e.v} — ${e.title} (${e.category}, Moolank ${e.moolank})${e.status === "failed" ? " — FAILED, not posted" : ""}`),
  "",
].join("\n");
prependSection(join(DEST, "POST-ORDER.md"), "Post order", postOrderMd);

runLogLines.push("", `Music pool: ${FAST_TRACKS.length} fast tracks (${poolHealthy() ? "healthy" : "BELOW FLOOR of 6"})`, "");
prependSection(join(DEST, "RUN-LOG.md"), "Run log", runLogLines.join("\n"));

// git commit + push (code/content only -- MP4s stay untracked per .gitignore's `out`).
//
// This runs UNATTENDED at 6pm against a PUBLIC repo, so it is deliberately
// narrow on both axes:
//   - `commit -- <paths>` commits ONLY those paths. A bare `git commit -m`
//     commits the whole staged index, so anything you happened to have staged
//     when the timer fired would be published without review.
//   - push only from `main`. Otherwise a day you spent on a feature branch
//     would silently create or advance that branch on the remote.
const TRACKED = ["content/daily-state.json", "src/viral/daily-templates.ts", "src/viral/hooks.ts"];
try {
  execFileSync("git", ["add", ...TRACKED]);
  execFileSync("git", [
    "commit",
    "-m",
    `chore(daily-viral): ${RUN_DATE} batch — ${batch.map((e) => e.v).join(", ")}\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`,
    "--",
    ...TRACKED,
  ]);
  const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
  if (branch === "main") {
    execFileSync("git", ["push"]);
  } else {
    log(`\nCommitted on "${branch}" — not pushing (auto-push only runs on main).`);
  }
} catch (err) {
  log(`\ngit commit/push failed (state is still saved locally): ${String(err?.message ?? err)}`);
}

log(`\nDone. ${anyFailed ? "Some videos FAILED -- see RUN-LOG.md." : "All videos generated."} ${DEST}`);
process.exit(anyFailed ? 1 : 0);
