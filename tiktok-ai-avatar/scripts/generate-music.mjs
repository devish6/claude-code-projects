#!/usr/bin/env node
/**
 * npm run music:generate -- --bpm=128 --slug=pulse-v13 [--seconds=32] [--dry-run]
 *
 * Generates an original music bed with ElevenLabs `/v1/music/compose`, then
 * MEASURES what came back and refuses to keep it unless it is actually usable.
 *
 * ⭐⭐ WHY GENERATE RATHER THAN SOURCE. Three separate reasons converged:
 *   1. The pool had not gained a track since 2026-07-25 and was still serving
 *      beds from the first week, which the owner noticed on V24.
 *   2. `beatAlignedActs` needs a bed's tempo as ARITHMETIC, not as a label. On
 *      library music the tempo is whatever it is and has to be estimated; here
 *      it is requested, so the measurement only has to confirm a known answer.
 *   3. The pool has never had a bed near 128 or 165 BPM, so two of the four
 *      tempo slots in the variation engine silently resolved to a ~150 track.
 *      A third of the "variation" was not varying.
 *
 * 🔴 EVERY CALL BILLS, INCLUDING FAILED EXPERIMENTS. The project notes record
 * ~900 credits burned probing three endpoint spellings. There is ONE endpoint
 * here and `--dry-run` prints the request without sending it.
 *
 * ⭐ THE ACCEPTANCE GATE IS THE POINT OF THIS SCRIPT. A generated track that
 * sounds fine can still be unusable as a beat-synced bed, and the pool already
 * contains two proofs: `voltSlope` fits its own grid to only 32ms RMS and
 * `violinEnergetic` to 74ms, because their pulse thins out. You cannot cut to a
 * beat you cannot locate. A bed is kept only if it is percussive enough to
 * measure, at the tempo asked for, and loud from the first frame.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { beatMap, beatMapQuality, measureTempo, openingRatio, meanDb } from "./lib/tempo.mjs";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
};
const DRY_RUN = args.includes("--dry-run");
const BPM = Number(arg("bpm"));
const SLUG = arg("slug");
const SECONDS = Number(arg("seconds", "32"));

if (!BPM || !SLUG) {
  console.error("usage: npm run music:generate -- --bpm=128 --slug=pulse-v13 [--seconds=32]");
  process.exit(2);
}

/** Acceptance thresholds. Each one exists because a real bed failed it. */
export const GATE = {
  /**
   * Beat-to-beat interval spread. ⭐ THIS REPLACED A CONSTANT-FIT RESIDUAL GATE,
   * which was measuring the wrong thing and rejected a perfectly good bed: the
   * first take fit a constant grid to only 39ms because it DRIFTS, while its
   * intervals varied by 3.9ms — locally the steadiest bed we own. Cuts snap to
   * tracked beats, so drift is harmless and only jitter matters.
   */
  intervalSdMs: 12,
  /** Distance from the requested tempo. Wider than this and it missed the brief. */
  bpmTolerancePct: 1.5,
  /** Level in the first 300ms as a share of the track's own body level. */
  openingRatio: 0.6,
};

/**
 * The brief.
 *
 * 🔴 REWRITTEN 2026-08-01 AFTER THE OWNER HEARD THE FIRST BATCH: *"the beat is
 * very EDM… we are giving people numerology advice, it needs to be soft but
 * fast. The music currently is fast but not soft."*
 *
 * ⭐⭐ THE CAUSE WAS ONE CLAUSE, AND IT IS AN INSTRUCTIVE MISTAKE. The first
 * brief asked for "a strong percussive transient on every beat: tight kick,
 * crisp snare or clap, driving hi-hats". That was written to satisfy the BEAT
 * TRACKER — it locates beats from attacks, so a pad-led track cannot be cut to.
 * But it specified the transient by naming DANCE-FLOOR INSTRUMENTS, and a
 * generator asked for kick/snare/hats at 150 BPM returns hard techno. A
 * technical requirement got smuggled in as a genre.
 *
 * The tracker needs an ATTACK, not a LOUD one. A kalimba note, a plucked
 * string and a soft mallet all produce a sharp onset envelope — exactly what
 * the spectral flux detects — while sounding nothing like a club. So the
 * requirement survives verbatim in substance and the instrumentation is
 * inverted: soft, warm, acoustic-leaning sources, and an explicit ban on the
 * EDM furniture (distorted synths, drops, risers, sweeps) that the old wording
 * invited.
 *
 * ⭐ TEMPO IS DELIBERATELY UNCHANGED. The owner's note is precise — "soft but
 * fast", the pace is right and the texture is wrong. Nothing here slows the
 * pulse, and phrases like "unhurried" or "half-time" are avoided on purpose:
 * a half-time feel would also halve what the beat tracker locks onto and cut
 * every video on the off-beat.
 *
 * The remaining clauses each still encode a past failure:
 * - "no intro, no build, no fade" — the standing energy-from-frame-0 rule; a
 *   hard-cut hook over a swell reads as a broken file. `trendV02` and
 *   `readyV04` open at 0.30 and 0.22 of body level and needed hand head-trims.
 * - "identical tempo, no breakdown, no half-time" — a breakdown removes the
 *   onsets the alignment depends on. This is where `voltSlope` fails.
 * - instrumental — a vocal would compete with the on-screen copy, and these
 *   are largely watched muted anyway.
 */
const promptFor = (bpm) =>
  [
    `Gentle, warm, instrumental music bed at exactly ${bpm} BPM.`,
    "Soft, calm and reassuring in character — it sits underneath spoken numerology and astrology guidance, so it must feel reflective and trustworthy, never aggressive and never like club or dance music.",
    "Instrumentation: warm analogue pads, soft plucked strings and harp, kalimba and marimba mallets, light shakers and softly brushed percussion, gentle rounded sub bass.",
    "Strictly avoid distorted or supersaw synths, hard techno or hardstyle kicks, heavy snares, EDM drops, risers, white-noise sweeps and sirens.",
    "Keep a clear and steady rhythmic pulse — a soft mallet, pluck or gently muted kick lands on every single beat, so the rhythm is easy to follow — but keep every one of those hits soft-edged and low in impact rather than punchy.",
    "Flowing and gently energetic, never frantic.",
    "Begins immediately at full level on a downbeat: no intro, no build, no fade-in, no silence at the start.",
    `Absolutely constant tempo of ${bpm} BPM from the first beat to the last — no breakdown, no half-time section, no ritardando, no tempo change of any kind.`,
    "Mystical, warm and slightly cinematic in mood.",
    "Purely instrumental — no vocals, no spoken word, no lyrics.",
    "Consistent loudness throughout with no long quiet passages.",
  ].join(" ");

const prompt = promptFor(BPM);
const body = { prompt, music_length_ms: Math.round(SECONDS * 1000) };

console.log(`bed: ${SLUG}   target ${BPM} BPM   ${SECONDS}s`);
if (DRY_RUN) {
  console.log("\n[dry run — nothing sent, nothing billed]\nPOST /v1/music/compose");
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const keyPath = join(homedir(), ".numevix-publish", "elevenlabs-key");
if (!existsSync(keyPath)) {
  console.error(`! no API key at ${keyPath}`);
  process.exit(1);
}
const key = readFileSync(keyPath, "utf8").trim();

const OUT_DIR = "public/music";
/** Rejected takes live outside public/ so the pool can never load one. */
const REJECT_DIR = join(homedir(), ".numevix-publish", "music-rejects");
const finalPath = join(OUT_DIR, `${SLUG}.mp3`);
// Written to a temp name first: a track that fails the gate must never be left
// in public/music/ where the pool might later be pointed at it.
const tmpPath = join(OUT_DIR, `.pending-${SLUG}.mp3`);

const res = await fetch("https://api.elevenlabs.io/v1/music/compose", {
  method: "POST",
  headers: { "xi-api-key": key, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error(`! compose failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}

writeFileSync(tmpPath, Buffer.from(await res.arrayBuffer()));

// ── Acceptance ────────────────────────────────────────────────────────────
const m = measureTempo(tmpPath, { targetBpm: BPM });
const q = beatMapQuality(beatMap(tmpPath, { targetBpm: BPM }));
const open = openingRatio(tmpPath);
const db = meanDb(tmpPath);
const bpmErr = m.bpm === null ? Infinity : Math.abs((m.bpm - BPM) / BPM) * 100;

console.log(
  `\n  measured ${m.bpm === null ? "n/a" : m.bpm.toFixed(2)} BPM (${bpmErr.toFixed(2)}% off target)` +
    `\n  phase    ${m.phaseMs}ms from file zero` +
    `\n  beats    ${q.beats} tracked, interval spread ${q.intervalSdMs}ms (this is the gate)` +
    `\n  residual ${m.residualMs}ms against a CONSTANT grid — high just means it drifts` +
    `\n  opening  ${open.toFixed(2)} of body level` +
    `\n  level    ${db.toFixed(1)} dBFS mean`,
);

const failures = [];
if (bpmErr > GATE.bpmTolerancePct) failures.push(`tempo is ${bpmErr.toFixed(2)}% off the requested ${BPM}`);
if (q.intervalSdMs === null || q.intervalSdMs > GATE.intervalSdMs)
  failures.push(`beat intervals vary by ${q.intervalSdMs}ms — the pulse cannot be located reliably`);
if (open < GATE.openingRatio) failures.push(`opens at ${open.toFixed(2)} of body level — it fades in`);

if (failures.length) {
  // 🪤 QUARANTINE, DO NOT DELETE. The first version deleted rejects, and the
  // very first take was thrown away before anyone could ask the obvious next
  // question — whether its tempo genuinely drifted or the gate was simply too
  // tight. A reject is the only evidence available for tuning the gate, and it
  // has already been paid for. It goes outside public/music/ so the pool can
  // never pick it up.
  const quarantine = join(REJECT_DIR, `${SLUG}-${Date.now()}.mp3`);
  mkdirSync(REJECT_DIR, { recursive: true });
  renameSync(tmpPath, quarantine);
  console.error(`\n! REJECTED — ${failures.join("; ")}`);
  console.error(`  Kept for inspection at ${quarantine}`);
  process.exit(1);
}

// Normalise to the pool's existing encoding (192k CBR), matching the 2026-07-25 restock.
execFileSync("ffmpeg", ["-v", "error", "-i", tmpPath, "-b:a", "192k", "-ar", "44100", finalPath, "-y"]);
unlinkSync(tmpPath);

// Re-measure the ENCODED file — that is the one the renderer will load, and the
// registered numbers have to describe it rather than the pre-encode original.
const f = measureTempo(finalPath, { targetBpm: BPM });
console.log(`\n✓ ACCEPTED -> ${finalPath}`);
console.log(`  register in BEDS: { file: "${SLUG}.mp3", bpm: ${f.bpm.toFixed(2)}, phaseMs: ${f.phaseMs} }`);
console.log("  then run: npm run music:beatmaps");
