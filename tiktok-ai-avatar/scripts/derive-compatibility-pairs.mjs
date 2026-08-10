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
  // `neutral` and `enemy` are captured as well as `friend` because the
  // self-friendly pin turns on WHICH kind of non-friend 7 is to itself
  // (neutral, not enemy) — publishing "7 clashes with 7" would be a claim
  // this table does not make, and would read as a verdict on every 7.
  const row =
    /(\d):\s*\{\s*friend:\s*\[([^\]]*)\],\s*neutral:\s*\[([^\]]*)\],\s*enemy:\s*\[([^\]]*)\]/g;
  const list = (s) => (s.trim() === "" ? [] : s.split(",").map((x) => Number(x.trim())));
  let m;
  while ((m = row.exec(src)) !== null) {
    table[Number(m[1])] = { friend: list(m[2]), neutral: list(m[3]), enemy: list(m[4]) };
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
    if (friendship[a].friend.includes(b) && friendship[b].friend.includes(a)) mutual.push([a, b]);
  }
}
const selfFriendly = [];
for (let n = 1; n <= 9; n++) if (friendship[n].friend.includes(n)) selfFriendly.push(n);

console.log(`Mutual best-match pairs (${mutual.length}): ${mutual.map(([a, b]) => `${a}&${b}`).join(", ")}`);
console.log(`Self-friendly numbers (${selfFriendly.length}): ${selfFriendly.join(", ")}`);
const notSelf = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !selfFriendly.includes(n));
console.log(`NOT self-friendly: ${notSelf.join(", ") || "(none)"}`);

/**
 * The `self-friendly` angle's numbers, in the shape the renderer consumes.
 *
 * WHY THIS IS EMITTED AND NOT JUST PRINTED: SelfFriendlyPin.tsx and the
 * Moolank self-friendly video both put these numbers on screen, and a printed
 * line is not a source a component can import. Writing them here keeps the pin
 * on the same drift-guarded trace as the pairs — change friendship.ts and this
 * script fails until the card is regenerated.
 *
 * `exceptionSelfStatus` exists because "7 is not friendly to itself" and
 * "7 clashes with itself" are different claims and only the first is true.
 */
const onlySelfMutual = selfFriendly.filter(
  (n) => !mutual.some(([a, b]) => a === n || b === n),
);
const selfBlock = {
  _derived: "Written by scripts/derive-compatibility-pairs.mjs. Do not hand-edit.",
  numbers: selfFriendly,
  exception: notSelf.length === 1 ? notSelf[0] : notSelf,
  exceptionSelfStatus: notSelf.length === 1
    ? (friendship[notSelf[0]].enemy.includes(notSelf[0]) ? "enemy" : "neutral")
    : null,
  exceptionMatches: notSelf.length === 1 ? friendship[notSelf[0]].friend : [],
  onlySelfMutual,
};

const reel = JSON.parse(readFileSync(REEL_JSON, "utf8"));
const inFile = reel.pairs.map((p) => `${p.a}&${p.b}`).sort().join(",");
const derived = mutual.map(([a, b]) => `${a}&${b}`).sort().join(",");
const selfInFile = JSON.stringify(reel.selfFriendlyDerived ?? null);
const selfDerived = JSON.stringify(selfBlock);

console.log(
  `Self-mutual only: ${onlySelfMutual.join(", ") || "(none)"} · ` +
    `${selfBlock.exception} is ${selfBlock.exceptionSelfStatus} to itself, matches ${selfBlock.exceptionMatches.join("/")}`,
);

if (inFile === derived && selfInFile === selfDerived) {
  console.log("\n✅ compatibility-reel.json matches the friendship table.");
  process.exit(0);
}

console.error("\n🔴 MISMATCH — compatibility-reel.json disagrees with friendship.ts");
if (inFile !== derived) {
  console.error(`  pairs file:    ${inFile}`);
  console.error(`  pairs derived: ${derived}`);
}
if (selfInFile !== selfDerived) {
  console.error(`  self file:    ${selfInFile}`);
  console.error(`  self derived: ${selfDerived}`);
}

if (!process.argv.includes("--write")) {
  console.error("\nRe-run with --write to rewrite the pairs (prose in `why` is preserved where the pair survives).");
  process.exit(1);
}

reel.selfFriendlyDerived = selfBlock;

const byKey = new Map(reel.pairs.map((p) => [`${p.a}&${p.b}`, p]));
reel.pairs = mutual.map(([a, b]) => byKey.get(`${a}&${b}`) ?? { a, b, planets: "TODO", why: "TODO — write this, do not leave it" });
writeFileSync(REEL_JSON, `${JSON.stringify(reel, null, 2)}\n`);
console.error("\n✏️  Rewritten. Any new pair carries TODO — fill it in before rendering.");
process.exit(1);
