#!/usr/bin/env node
/**
 * node scripts/draw-month.mjs <month-slug> [--force]
 *
 * Deals the month's nine cards and writes `content/draws/<month-slug>.json`.
 *
 * ⭐⭐⭐ RUN THIS FIRST, COMMIT IT ALONE, THEN WRITE THE COPY. The cover slide
 * claims the cards were drawn, not chosen. That claim is only checkable if the
 * draw landed in git before any slide copy existed — the commit order IS the
 * evidence. Writing copy first and dealing afterwards would produce the same
 * JSON and a false claim.
 *
 * 🔴 REFUSES TO OVERWRITE an existing draw. A re-run because the cards "don't
 * suit" the copy is exactly the thing this file exists to prevent; `--force`
 * is there for a genuine mistake before publication and nothing else.
 *
 * 🪤 `import.meta.url === "file://" + process.argv[1]` is ALWAYS FALSE in this
 * repo — the path contains spaces, so the comparison silently fails and main()
 * never runs while the script exits 0. Use pathToFileURL.
 */
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { dealMonth } from "./lib/draw.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function main(argv) {
  const args = argv.filter((a) => a !== "--force");
  const force = argv.includes("--force");
  const slug = args[0];
  if (!slug || !/^[a-z]+-\d{4}$/.test(slug)) {
    throw new Error(`usage: draw-month.mjs <month-slug like september-2026> [--force]`);
  }

  const out = resolve(ROOT, "content/draws", `${slug}.json`);
  if (existsSync(out) && !force) {
    throw new Error(
      `${slug}.json already exists. A draw is dealt ONCE — re-dealing it would make the ` +
        `cover's "drawn once" claim false. Pass --force only to fix a mistake before publication.`,
    );
  }

  const deck = JSON.parse(await readFile(resolve(ROOT, "content/tarot-deck.json"), "utf8")).cards;
  const seed = randomBytes(16).toString("hex");
  const cards = dealMonth(deck, seed);

  await mkdir(dirname(out), { recursive: true });
  await writeFile(
    out,
    `${JSON.stringify(
      {
        _comment:
          "Dealt by scripts/draw-month.mjs. The nine cards are RANDOM — no card belongs to " +
          "any Moolank, and no such rule may be stated or implied in the copy. Re-deal the " +
          "seed through scripts/lib/draw.mjs to verify these are the cards it produces.",
        month: slug,
        seed,
        drawnAt: new Date().toISOString(),
        deckSize: deck.length,
        cards,
      },
      null,
      2,
    )}\n`,
  );

  process.stderr.write(`dealt ${slug}: seed ${seed}\n`);
  for (const c of cards) process.stderr.write(`  ${c.moolank} → ${c.name}\n`);
  process.stderr.write(`wrote content/draws/${slug}.json\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((e) => {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  });
}
