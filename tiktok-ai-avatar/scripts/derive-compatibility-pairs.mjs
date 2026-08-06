#!/usr/bin/env node
/**
 * Derives the compatibility reel's pair list from the app's OWN friendship
 * table and checks content/compatibility-reel.json still agrees with it.
 *
 * WHY THIS EXISTS: an outside rewrite once mis-mapped anger to 8 (it is 9 —
 * Mars; 8 is Saturn/delay). Numerology copy read off the internet is wrong
 * often enough that any claim we publish about numbers has to be traceable to
 * lib/numerology/friendship.ts, which itself carries a drift-guard against the
 * prompt prose. This script is that trace.
 *
 * A pair qualifies only when BOTH rows list the other as a friend. One-way
 * entries are excluded on purpose: 1 lists 7 as a friend but 7's friends are
 * [2,3,6], so "1 & 7 are a match" would be true from one side only.
 *
 *   node scripts/derive-compatibility-pairs.mjs          # print + verify
 *   node scripts/derive-compatibility-pairs.mjs --write  # rewrite the pairs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FRIENDSHIP_TS = resolve(HERE, "../../vedic-numerology/lib/numerology/friendship.ts");
const REEL_JSON = resolve(HERE, "../content/compatibility-reel.json");

/** Parse the FRIENDSHIP literal out of the TS source. Reading the real file
 *  rather than re-typing the table is the whole point — a copy would drift. */
function readFriendship() {
  let src;
  try {
    src = readFileSync(FRIENDSHIP_TS, "utf8");
  } catch {
    console.error(`Cannot read ${FRIENDSHIP_TS}`);
    console.error("The vedic-numerology repo must be checked out beside this one.");
    process.exit(2);
  }
  const table = {};
  const row = /(\d):\s*\{\s*friend:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = row.exec(src)) !== null) {
    const nums = m[2].trim() === "" ? [] : m[2].split(",").map((s) => Number(s.trim()));
    table[Number(m[1])] = nums;
  }
  if (Object.keys(table).length !== 9) {
    console.error(`Parsed ${Object.keys(table).length} rows, expected 9. Has friendship.ts been reformatted?`);
    process.exit(2);
  }
  return table;
}

const friendship = readFriendship();

const mutual = [];
for (let a = 1; a <= 9; a++) {
  for (let b = a + 1; b <= 9; b++) {
    if (friendship[a].includes(b) && friendship[b].includes(a)) mutual.push([a, b]);
  }
}
const selfFriendly = [];
for (let n = 1; n <= 9; n++) if (friendship[n].includes(n)) selfFriendly.push(n);

console.log(`Mutual best-match pairs (${mutual.length}): ${mutual.map(([a, b]) => `${a}&${b}`).join(", ")}`);
console.log(`Self-friendly numbers (${selfFriendly.length}): ${selfFriendly.join(", ")}`);
const notSelf = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !selfFriendly.includes(n));
console.log(`NOT self-friendly: ${notSelf.join(", ") || "(none)"}`);

const reel = JSON.parse(readFileSync(REEL_JSON, "utf8"));
const inFile = reel.pairs.map((p) => `${p.a}&${p.b}`).sort().join(",");
const derived = mutual.map(([a, b]) => `${a}&${b}`).sort().join(",");

if (inFile === derived) {
  console.log("\n✅ compatibility-reel.json matches the friendship table.");
  process.exit(0);
}

console.error("\n🔴 MISMATCH — compatibility-reel.json disagrees with friendship.ts");
console.error(`  file:    ${inFile}`);
console.error(`  derived: ${derived}`);

if (!process.argv.includes("--write")) {
  console.error("\nRe-run with --write to rewrite the pairs (prose in `why` is preserved where the pair survives).");
  process.exit(1);
}

const byKey = new Map(reel.pairs.map((p) => [`${p.a}&${p.b}`, p]));
reel.pairs = mutual.map(([a, b]) => byKey.get(`${a}&${b}`) ?? { a, b, planets: "TODO", why: "TODO — write this, do not leave it" });
writeFileSync(REEL_JSON, `${JSON.stringify(reel, null, 2)}\n`);
console.error("\n✏️  Rewritten. Any new pair carries TODO — fill it in before rendering.");
process.exit(1);
