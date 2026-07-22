#!/usr/bin/env node
/**
 * Generate a human-readable index of the hook library from src/viral/hooks.ts.
 *
 * Generated, not written by hand — a hand-kept copy drifts from the source the
 * first time a hook is edited, and then you are shooting from a stale list.
 *
 * Usage: npm run hooks:doc
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const src = readFileSync("src/viral/hooks.ts", "utf8");

/** Pull each object literal out of the arrays. */
const parse = () => {
  const out = [];
  const re =
    /\{\s*id:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*variant:\s*"([^"]+)",\s*text:\s*"((?:[^"\\]|\\.)*)",\s*accent:\s*"((?:[^"\\]|\\.)*)",(?:\s*sub:\s*"((?:[^"\\]|\\.)*)",)?(?:\s*number:\s*(\d+),)?\s*\}/g;
  let m;
  while ((m = re.exec(src))) {
    out.push({
      id: m[1],
      category: m[2],
      variant: m[3],
      text: m[4].replace(/\\"/g, '"'),
      accent: m[5].replace(/\\"/g, '"'),
      sub: m[6]?.replace(/\\"/g, '"'),
      number: m[7] ? Number(m[7]) : undefined,
    });
  }
  return out;
};

const all = parse();
const isTest = (h) => h.id.startsWith("t7-");
const library = all.filter((h) => !isTest(h));
const tests = all.filter(isTest);

const TITLES = {
  identity: "1. Personal Identity — “this is about you”",
  "knowledge-gap": "2. Curiosity / Knowledge Gap",
  "comment-bait": "3. Interactive / Comment Bait",
  educational: "4. Educational (Fast)",
  story: "5. Story / Transformation",
};

const row = (h) =>
  `| \`${h.id}\` | **${h.text}** ${h.accent} | ${h.sub ?? "—"} | ${
    h.number ?? "—"
  } | ${h.variant} |`;

const section = (cat) =>
  [
    `## ${TITLES[cat]}`,
    "",
    "| id | hook | sub | № | variant |",
    "|---|---|---|---|---|",
    ...library.filter((h) => h.category === cat).map(row),
    "",
  ].join("\n");

const doc = [
  "# Numevix — Hook Library",
  "",
  `**${library.length} hooks across 5 categories**, plus a ${tests.length}-hook A/B set.`,
  "Generated from `src/viral/hooks.ts` — run `npm run hooks:doc` after editing.",
  "",
  "The bold part is line 1, the rest is the accent line rendered in colour.",
  "`variant` sets the accent colour: `contrarian` is red, `identity` and",
  "`mystery` are bronze.",
  "",
  "> The spec's sixth category — celebrity analysis — is deliberately absent.",
  "> Numerology claims about named real people carry defamation and likeness",
  "> exposure and are the one content type that risks the account itself.",
  "",
  ...Object.keys(TITLES).map(section),
  "## A/B test set — Moolank 7",
  "",
  "Ten hooks on an identical body, so the only variable is the first 1.6s.",
  "Composition ids are `HookTest-7A…7J`.",
  "",
  "| id | hook | sub | variant |",
  "|---|---|---|---|",
  ...tests.map(
    (h) => `| \`${h.id}\` | **${h.text}** ${h.accent} | ${h.sub ?? "—"} | ${h.variant} |`,
  ),
  "",
  "### How to run the test",
  "",
  "1. Ship **2–3 variants at a time, a few days apart.** Posting ten",
  "   near-identical videos at once reads as repetitive and splits your own",
  "   audience across them.",
  "2. Judge on **3-second view rate**, not likes. Below ~70% the hook is dead.",
  "3. When one wins, **keep the hook and change the body** — then the next test",
  "   is measuring content, not the opening.",
  "4. Never change two things between variants. That's the whole reason the act",
  "   structure is fixed.",
  "",
].join("\n");

writeFileSync("content/hook-library.md", doc);

const DEST = join(homedir(), "Desktop", "Numevix Videos", "Viral");
if (existsSync(join(homedir(), "Desktop", "Numevix Videos"))) {
  mkdirSync(DEST, { recursive: true });
  writeFileSync(join(DEST, "Hook Library.md"), doc);
}

process.stdout.write(
  `Wrote ${library.length} hooks + ${tests.length} test variants\n` +
    `  content/hook-library.md\n  ${join(DEST, "Hook Library.md")}\n`,
);
