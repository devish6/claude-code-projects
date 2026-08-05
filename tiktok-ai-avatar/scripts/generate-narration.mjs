#!/usr/bin/env node
/**
 * npm run narration -- --n=9 [--force]
 *
 * Generates the Hinglish narration for an animated card reel with the cloned
 * voice, and — the part that matters — writes the CHARACTER ALIGNMENT beside it.
 *
 * ⭐⭐ WHY ALIGNMENT, NOT GUESSED TIMINGS
 * The card reveals have to land on the words that describe them. Estimating
 * "this line is about 3.2 seconds" drifts by the fourth segment and the reveal
 * ends up describing the previous field. ElevenLabs' `with-timestamps` endpoint
 * returns a start time for every character, so segment boundaries are MEASURED
 * off the real audio. Same approach as Story 01, whose duration is derived from
 * its alignment rather than hardcoded.
 *
 * 🔴 The whole script is sent as ONE request, never one per segment. Per-segment
 * requests each restart the voice's prosody, so the delivery resets to neutral
 * eight times and the result sounds like eight clips stapled together. One
 * request keeps the performance continuous; the alignment is what splits it.
 *
 * 🔴 The API key lives at ~/.numevix-publish/elevenlabs-key (0600), never in
 * this repo — it is public and Pages-served.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

/** The owner's cloned voice. */
const VOICE_ID = "kGss6o0vndZ6pzQsedLm";
const MODEL = "eleven_multilingual_v2";

const log = (...a) => process.stdout.write(a.join(" ") + "\n");
const die = (m) => { process.stderr.write(m + "\n"); process.exit(1); };

/**
 * Splits one continuous alignment into per-segment start/end times.
 *
 * 🪤 The alignment is per CHARACTER of the exact string that was sent, so the
 * offsets only line up if the joined text is reconstructed byte-identically to
 * what was submitted. Join once, send that, and walk the same string here.
 */
export const segmentTimings = (segments, joiner, alignment) => {
  const starts = alignment.character_start_times_seconds;
  const ends = alignment.character_end_times_seconds;

  const out = [];
  let cursor = 0;
  for (const seg of segments) {
    const from = cursor;
    const to = cursor + seg.text.length - 1;
    out.push({
      field: seg.field,
      text: seg.text,
      start: starts[from] ?? 0,
      end: ends[Math.min(to, ends.length - 1)] ?? 0,
    });
    cursor = to + 1 + joiner.length;
  }
  return out;
};

const main = async () => {
  const n = Number(flag("n"));
  if (!Number.isInteger(n)) die("Pass --n=9 to choose which Moolank to narrate.");

  const scripts = JSON.parse(readFileSync(join(ROOT, "content/reel-scripts.json"), "utf8"));
  const script = scripts[String(n)];
  if (!script) die(`No reel script for Moolank ${n} in content/reel-scripts.json.`);

  const outDir = join(ROOT, "public/reels", String(n));
  const mp3Path = join(outDir, "narration.mp3");
  const alignPath = join(ROOT, "content", `reel-${n}-timings.json`);

  if (existsSync(mp3Path) && !has("force")) {
    die(`${mp3Path} already exists. Pass --force to spend credits regenerating it.`);
  }

  const keyPath = join(homedir(), ".numevix-publish", "elevenlabs-key");
  if (!existsSync(keyPath)) die(`No API key at ${keyPath}.`);
  const key = readFileSync(keyPath, "utf8").trim();

  // ⭐ `narrate: false` keeps a segment on the CARD but out of the VOICEOVER.
  // Reference #3 runs 24s and the owner flagged Story 01's 46s as "a bit slow
  // for TikTok"; narrating all eight fields ran 42s. Dropping two spoken
  // segments costs nothing, because the final card still shows every field —
  // the viewer reads them instead of hearing them.
  const spoken = script.segments.filter((s) => s.narrate !== false);
  const skipped = script.segments.length - spoken.length;

  const JOINER = " ";
  const text = spoken.map((s) => s.text).join(JOINER);
  log(`\nMoolank ${n} — ${spoken.length} spoken segments${skipped ? ` (${skipped} on-card only)` : ""}, ${text.length} characters.`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        // 🪤 STABILITY 0.7 AND STYLE 0, both raised from 0.55/0.15 after the
        // first take stretched vowels ("mangaaal" for मंगल, "vaajah" for वजह).
        // Style exaggeration is what produces that elongation; on a script that
        // is already carrying its own emphasis, it only adds wobble.
        voice_settings: { stability: 0.7, similarity_boost: 0.8, style: 0 },
      }),
    },
  );

  if (!res.ok) die(`ElevenLabs ${res.status}: ${await res.text()}`);
  const payload = await res.json();

  mkdirSync(outDir, { recursive: true });
  writeFileSync(mp3Path, Buffer.from(payload.audio_base64, "base64"));

  const timings = segmentTimings(spoken, JOINER, payload.alignment);
  const duration = timings[timings.length - 1].end;
  writeFileSync(alignPath, JSON.stringify({ moolank: n, duration, segments: timings }, null, 2) + "\n");

  log(`  audio:   public/reels/${n}/narration.mp3`);
  log(`  timings: content/reel-${n}-timings.json`);
  log(`  length:  ${duration.toFixed(2)}s\n`);
  for (const t of timings) {
    log(`  ${t.start.toFixed(2).padStart(6)}s → ${t.end.toFixed(2).padStart(6)}s  ${t.field}`);
  }
};

if (resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? "")) {
  await main();
}
