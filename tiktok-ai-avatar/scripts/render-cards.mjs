#!/usr/bin/env node
/**
 * Renders the Moolank info-cards as stills.
 *
 *   npm run cards            # all nine
 *   npm run cards -- 8       # just Moolank 8
 *   npm run cards -- 8 --jpg # and convert for Instagram
 *
 * 🔴 INSTAGRAM ACCEPTS JPEG ONLY for `image_url`. A PNG container is rejected
 * by the Graph API at container-creation time, which is a confusing place to
 * discover it — so `--jpg` writes the JPEG the publisher will actually post
 * beside the PNG, rather than leaving the conversion to whoever posts.
 *
 * 🪤 The main-module guard compares DECODED paths. `import.meta.url`
 * percent-encodes, and this checkout lives under "Claude Code Projects" — the
 * space never matches a raw process.argv[1], so the naive idiom silently exits
 * 0 having rendered nothing. That bug has already cost this repo two debugging
 * rounds (fff1b17, 03061e6).
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, existsSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "out/cards");

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const parseArgs = (argv) => {
  const jpg = argv.includes("--jpg");
  const numbers = argv
    .filter((a) => /^\d+$/.test(a))
    .map(Number)
    .filter((n) => ALL.includes(n));
  return { numbers: numbers.length ? numbers : ALL, jpg };
};

const renderOne = (n, jpg) => {
  const png = resolve(OUT, `moolank-${n}.png`);
  execFileSync(
    "npx",
    ["remotion", "still", `InfoCard-${n}`, png, "--overwrite", "--log=error"],
    { cwd: ROOT, stdio: "inherit" },
  );

  if (!existsSync(png)) throw new Error(`InfoCard-${n}: remotion exited 0 but wrote no file`);

  let out = png;
  if (jpg) {
    out = resolve(OUT, `moolank-${n}.jpg`);
    // sips ships with macOS; quality 90 keeps the gradient free of banding at
    // roughly a third of the PNG's bytes.
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", png, "--out", out], {
      stdio: "ignore",
    });
  }
  return out;
};

const main = () => {
  const { numbers, jpg } = parseArgs(process.argv.slice(2));
  mkdirSync(OUT, { recursive: true });

  for (const n of numbers) {
    const f = renderOne(n, jpg);
    console.log(`  ✓ Moolank ${n} → ${f.replace(ROOT + "/", "")}`);
  }
  console.log(`\nRendered ${numbers.length} card${numbers.length === 1 ? "" : "s"} to out/cards/`);
};

if (resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? "")) {
  main();
}
