#!/usr/bin/env node
/**
 * npm run qa:still -- <dir> <month-slug>
 *
 * Reads the rendered PNGs off disk and asserts that something is actually on
 * them. The counterpart to `qa:frame`, which does the same for an MP4's frame 0.
 *
 * ⭐⭐⭐ WHY THIS EXISTS AND WHY IT OUTWEIGHS THE UNIT TESTS. Every structural
 * gate in `draw/card.ts` asserts against the DECLARATION — the same objects the
 * component renders from — so it agrees with itself while the output can still
 * be wrong. 403 tests were green while frame 0 was blank; 435 were green while
 * V33 shipped a 2.13s hole. Only reading pixels off the shipped file has ever
 * caught that class of bug. ⛔ Never satisfy this gate by editing the floors.
 *
 * 🪤 It also re-derives the CARD each slide shows from the draw JSON and checks
 * the file count and names, because a set that renders beautifully in the wrong
 * ORDER is a broken carousel and no pixel statistic can see that.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { MIN_STDDEV, frameStats } from "./lib/qa-frame.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const WIDTH = 1080;
const HEIGHT = 1350;

/**
 * ⭐ THE STDDEV FLOOR IS `qa:frame`'s OWN, IMPORTED RATHER THAN RESTATED.
 * 18 is the number calibrated against the two real blank frames this repo
 * shipped (9.50 and 7.21 against 21-28 for a populated frame). Restating it
 * here would let the two drift, and the drifted copy would be the one gating
 * the newer format. ⛔ Never raise it to make a render pass.
 *
 * 🪤 The MEAN floor is NOT shared. `qa:frame`'s 12 is calibrated for 9:16 cuts
 * that are legitimately dark; a slide is ink on paper and can never be. A
 * near-black render here is a broken ground, not a mood, so the band is tight.
 */
const MIN_MEAN = 120;
const MAX_MEAN = 245;

/**
 * Decode the PNG to raw greyscale and measure it with the same function
 * `qa:frame` uses on video frames — one implementation, two formats.
 * 🪤 An earlier version parsed ffmpeg's `signalstats` text and silently
 * produced NaN, which compared false against every floor. It failed loudly by
 * luck, not by design. Reading bytes cannot go wrong that way.
 */
const stats = (file) => {
  const raw = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-f", "rawvideo", "-pix_fmt", "gray", "-"],
    { encoding: "buffer", maxBuffer: WIDTH * HEIGHT * 4 },
  );
  if (raw.length !== WIDTH * HEIGHT) {
    throw new Error(`${file}: expected ${WIDTH}x${HEIGHT} grey bytes, got ${raw.length}`);
  }
  return frameStats(new Uint8Array(raw));
};

async function main(argv) {
  const [dir, slug = "september-2026"] = argv;
  if (!dir) throw new Error("usage: qa-still.mjs <dir> <month-slug>");
  if (!existsSync(dir)) throw new Error(`no such directory: ${dir}`);

  const draw = JSON.parse(await readFile(resolve(ROOT, "content/draws", `${slug}.json`), "utf8"));

  const want = [
    "01-cover.png",
    ...draw.cards.map((c, i) => `${String(i + 2).padStart(2, "0")}-moolank-${c.moolank}.png`),
  ];
  const got = readdirSync(dir).filter((f) => f.endsWith(".png")).sort();

  const failures = [];
  if (got.join(",") !== want.join(",")) {
    failures.push(`carousel order: got [${got.join(", ")}]\n              want [${want.join(", ")}]`);
  }

  for (const f of want) {
    const p = join(dir, f);
    if (!existsSync(p)) {
      failures.push(`${f}: missing`);
      continue;
    }
    const { mean, stddev } = stats(p);
    const bad = [];
    if (!(mean >= MIN_MEAN && mean <= MAX_MEAN)) bad.push(`mean ${mean} outside ${MIN_MEAN}-${MAX_MEAN}`);
    if (!(stddev >= MIN_STDDEV)) bad.push(`stddev ${stddev} < ${MIN_STDDEV}`);
    process.stderr.write(
      `${bad.length ? "✗" : "✓"} ${f.padEnd(22)} mean ${String(mean).padStart(6)}  stddev ${String(stddev).padStart(6)}\n`,
    );
    if (bad.length) failures.push(`${f}: ${bad.join(", ")}`);
  }

  if (failures.length) {
    process.stderr.write(`\nqa:still FAILED\n${failures.map((f) => `  ✗ ${f}`).join("\n")}\n`);
    process.exit(1);
  }
  process.stderr.write(`\nqa:still passed — ${want.length} slides\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((e) => {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  });
}
