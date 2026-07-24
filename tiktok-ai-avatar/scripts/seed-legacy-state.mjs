/**
 * ONE-TIME bootstrap script. Not part of the daily pipeline (that's
 * scripts/daily-viral.mjs). This just seeds content/daily-state.json with
 * V01-V06 (already-shipped baseline, for no-repeat history) and generates
 * V07-V09 (today's first batch, day 1 of content/weekly-plan-w1.json) using
 * the exact same hook-resolution / numbering / music-rotation code the real
 * pipeline uses -- so today's daily-templates.ts is produced by the same
 * code path production runs will use, not hand-transcribed separately.
 *
 * Re-running this script is NOT idempotent (it always seeds from scratch) --
 * it's meant to be run once, by me, to produce this delivery. Do not wire it
 * into `npm run daily:viral`.
 */
import { readFileSync } from "node:fs";
import { makeHookIndex } from "./lib/hooks-source.mjs";
import { nextVNumber, formatV, saveState } from "./lib/state.mjs";
import { nextTrack } from "./lib/music-pool.mjs";
import { writeDailyTemplates } from "./lib/templates-gen.mjs";

const TODAY = "2026-07-24";

// V01-V06: the hand-authored baseline already shipped from src/viral/templates.ts.
// Dates are backfilled placeholders (the repo has no record of real post dates) --
// flagged so the user can correct them; they only matter for 21-day no-repeat math.
const seedExisting = [
  { v: "V01", title: "Born On The 7th, 16th or 25th", date: "2026-07-08", category: "identity", moolank: 7, hookId: "id-7-room", music: "violinEnergetic" },
  { v: "V02", title: "Most People Calculate This Wrong", date: "2026-07-11", category: "knowledge-gap", moolank: 8, hookId: "kg-calculate-wrong", music: "trendV02" },
  { v: "V03", title: "Number 8 Is Not Unlucky", date: "2026-07-14", category: "story", moolank: 8, hookId: null, music: "starlightV03" },
  { v: "V04", title: "You Hate Being Told What To Do", date: "2026-07-17", category: "identity", moolank: 1, hookId: "id-1-authority", music: "readyV04" },
  { v: "V05", title: "Everyone Wants To Be A Number 3", date: "2026-07-20", category: "knowledge-gap", moolank: 3, hookId: "kg-everyone-wants-3", music: "perfectMoment" },
  { v: "V06", title: "Number 9 Is Not Angry", date: "2026-07-22", category: "story", moolank: 9, hookId: null, music: "darkCinematic" },
].map((v) => ({ ...v, status: "shipped", source: "seed-existing" }));

const state = {
  _comment:
    "Ledger for npm run daily:viral. V01-V06 are source:'seed-existing' -- history only, never regenerated as compositions (they live in src/viral/templates.ts, hand-authored, locked). Everything V07+ is source:'weekly-plan-w1' (days 1-7, hand-authored) or 'algorithmic' (day 8+, picked by scripts/daily-viral.mjs). Dates for V01-V06 are backfilled placeholders -- correct them if you have the real post dates, it only affects 21-day no-repeat math.",
  pipelineMeta: { firstRunDate: TODAY },
  videos: seedExisting,
};

const plan = JSON.parse(readFileSync("content/weekly-plan-w1.json", "utf8"));
const hooks = makeHookIndex();

const day1 = plan.days.find((d) => d.day === 1);

for (const concept of day1.videos) {
  const hook = hooks.get(concept.hookId);
  if (!hook) throw new Error(`hook not found: ${concept.hookId}`);

  const vNum = nextVNumber(state, null); // no Desktop in sandbox -- state-only
  const v = formatV(vNum);
  const music = nextTrack(state);

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
  };

  state.videos.push({
    v,
    title: concept.title,
    date: TODAY,
    category: concept.category,
    moolank: concept.moolank,
    hookId: concept.hookId,
    music,
    variant: hook.variant,
    status: "generated",
    source: "weekly-plan-w1",
    planDay: 1,
    whyComment: concept.whyComment,
    tiktokCaption: concept.tiktokCaption,
    instagramCaption: concept.instagramCaption,
    hashtags: concept.hashtags,
    suggestedPostTime: concept.suggestedPostTime,
    props,
  });
}

saveState(state);
writeDailyTemplates(state);
console.log("Seeded state with", state.videos.length, "videos (", state.videos.filter(v=>v.source!=="seed-existing").length, "generated )");
console.log("Today's batch:", state.videos.filter(v => v.date === TODAY).map(v => `${v.v} - ${v.title}`).join("\n  "));
