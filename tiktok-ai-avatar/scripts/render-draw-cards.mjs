#!/usr/bin/env node
/**
 * node scripts/render-draw-cards.mjs <month-slug>
 *
 * Renders the month's ten slides to `~/Desktop/POST BY HAND/<KIT>/` as PNGs
 * named `01-cover.png` … `10-moolank-9.png`, in the order they are posted.
 *
 * ⭐ THE FILENAMES ARE THE CAROUSEL ORDER. Instagram's picker sorts by name,
 * and a set uploaded out of order puts the cover in the middle. Zero-padding is
 * the whole mechanism.
 *
 * 🪤 CHECKS THE ART BEFORE RENDERING, not after. Remotion renders a missing
 * <Img> as a blank space and still exits 0 — the same shape as the blank frame
 * 0 that shipped twice. A dealt card with no .webp fails here instead.
 *
 * 🪤 `import.meta.url === "file://" + process.argv[1]` is ALWAYS FALSE in this
 * repo (spaces in the path). Use pathToFileURL.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const KITS = {
  "september-2026": "DRAW01 - September 2026 — Nine Cards Drawn Once (Carousel)",
};

async function main(argv) {
  const slug = argv[0] ?? "september-2026";
  const kit = KITS[slug];
  if (!kit) throw new Error(`no kit name registered for "${slug}"`);

  const draw = JSON.parse(await readFile(resolve(ROOT, "content/draws", `${slug}.json`), "utf8"));

  // Every dealt card must have its face on disk before a single frame renders.
  const missing = draw.cards
    .map((c) => c.image)
    .filter((f) => !existsSync(resolve(ROOT, "public/tarot", f)));
  if (missing.length) {
    throw new Error(
      `missing card art in public/tarot: ${missing.join(", ")}\n` +
        `copy them from vedic-numerology/public/tarot (public domain, see SOURCE.md)`,
    );
  }

  const dest = join(homedir(), "Desktop", "POST BY HAND", kit);
  mkdirSync(dest, { recursive: true });

  const slides = [
    { id: "Cover", file: "01-cover.png" },
    ...draw.cards.map((c, i) => ({
      id: String(c.moolank),
      file: `${String(i + 2).padStart(2, "0")}-moolank-${c.moolank}.png`,
    })),
  ];

  for (const s of slides) {
    const out = join(dest, s.file);
    execFileSync(
      "npx",
      ["remotion", "still", `Draw-Sep2026-${s.id}`, out, "--overwrite", "--log=error"],
      { cwd: ROOT, stdio: "inherit" },
    );
    if (!existsSync(out)) {
      throw new Error(`Draw-Sep2026-${s.id}: remotion exited 0 but wrote no file`);
    }
    process.stderr.write(`rendered ${s.file}\n`);
  }

  process.stderr.write(`\n${slides.length} slides → ${dest}\n`);
  process.stderr.write(`now run: npm run qa:still -- "${dest}" ${slug}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((e) => {
    process.stderr.write(`${e.message}\n`);
    process.exit(1);
  });
}
