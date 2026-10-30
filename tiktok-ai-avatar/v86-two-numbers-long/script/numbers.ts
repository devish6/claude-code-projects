// Every number in V86, computed with the Numevix engine and asserted. Run:
//   (cd ../vedic-numerology && npx tsx ../tiktok-ai-avatar/v86-two-numbers-long/script/numbers.ts)
import assert from "node:assert/strict";
import { computeChart, computeCompound, digitsOf, buildGridDigits, RULESET_V2 } from "../../../vedic-numerology/modules/numerology-engine";

const R = RULESET_V2;
const chain = (n: number) => { const s = [n]; while (s[s.length - 1] > 9) s.push(digitsOf(s[s.length - 1]).reduce((a, b) => a + b, 0)); return s; };
const run = (day: number, month: number, year: number) => {
  const c = computeChart({ day, month, year }, R, { forecastYear: 2026 });
  return {
    dob: `${String(day).padStart(2, "0")} ${String(month).padStart(2, "0")} ${year}`,
    moolank: c.driver, moolankChain: chain(day), moolankPlanet: R.planetMap[c.driver],
    compound: c.compound, bhagyankChain: chain(c.compound), bhagyank: c.conductor, bhagyankPlanet: R.planetMap[c.conductor],
    gridDigits: buildGridDigits({ day, month, year }, c.driver, c.conductor, R.grid),
    counts: c.loShuGrid.counts, cells: c.loShuGrid.cells, missing: c.missingNumbers, repeated: c.repeatedNumbers,
  };
};

const A = run(14, 8, 1996); // main example: Bhagyank passes through 11
const B = run(29, 3, 1990); // Moolank passes through 11, Bhagyank through 33
const C = run(7, 12, 2005); // second-millennium-style date with zeros, day 1-9 (no Moolank re-add)

// A
assert.deepEqual(A.moolankChain, [14, 5]); assert.equal(A.moolankPlanet, "Mercury");
assert.equal(A.compound, 38); assert.deepEqual(A.bhagyankChain, [38, 11, 2]); assert.equal(A.bhagyankPlanet, "Moon");
assert.deepEqual(A.gridDigits, [1, 4, 8, 9, 6, 5, 2]); assert.deepEqual(A.missing, [3, 7]); assert.deepEqual(A.repeated, {});
// B
assert.deepEqual(B.moolankChain, [29, 11, 2]); assert.equal(B.moolankPlanet, "Moon");
assert.equal(B.compound, 33); assert.deepEqual(B.bhagyankChain, [33, 6]); assert.equal(B.bhagyankPlanet, "Venus");
assert.deepEqual(B.gridDigits, [2, 9, 3, 9, 2, 6]); assert.deepEqual(B.missing, [1, 4, 5, 7, 8]); assert.deepEqual(B.repeated, { 2: 2, 9: 2 });
// C
assert.equal(C.moolank, 7); assert.equal(C.compound, 0 + 7 + 1 + 2 + 2 + 0 + 0 + 5); assert.equal(C.bhagyank, 8);
assert.deepEqual(C.gridDigits, [7, 1, 2, 5, 8]);
// layout of the Vedic grid used on screen
assert.deepEqual(R.gridLayout, [[3, 1, 9], [6, 7, 5], [2, 8, 4]]);
assert.deepEqual(R.planetMap, { 1: "Sun", 2: "Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury", 6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars" });
// Moolank days, every 1..31 by its chain
const days: Record<number, number[]> = {};
for (let d = 1; d <= 31; d++) { const m = computeChart({ day: d, month: 1, year: 2000 }, R, { forecastYear: 2026 }).driver; (days[m] ??= []).push(d); }
assert.deepEqual(days[2], [2, 11, 20, 29]); assert.deepEqual(days[5], [5, 14, 23]);

console.log(JSON.stringify({ A, B, C, days, layout: R.gridLayout, planets: R.planetMap }, null, 1));
