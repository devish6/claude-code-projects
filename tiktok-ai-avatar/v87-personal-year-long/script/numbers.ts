// Every number in V87 (Personal Year), computed with the Numevix engine and asserted. Run:
//   (cd ../vedic-numerology && npx tsx ../tiktok-ai-avatar/v87-personal-year-long/script/numbers.ts > ../tiktok-ai-avatar/v87-personal-year-long/script/numbers.json)
import assert from "node:assert/strict";
import { computeChart, weekdayPlanet, digitsOf, reduceToSingleDigit, RULESET_V2 } from "../../../vedic-numerology/modules/numerology-engine";

const R = RULESET_V2;
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const py = (d: number, m: number, y: number, year: number) => {
  const c = computeChart({ day: d, month: m, year: y }, R, { forecastYear: year });
  const dow = new Date(Date.UTC(year, m - 1, d)).getUTCDay();
  const wp = weekdayPlanet(year, m, d, R.weekdayPlanetMap);
  const yy = year % 100, mr = reduceToSingleDigit(m), sum = yy + c.driver + mr + wp;
  assert.equal(reduceToSingleDigit(sum), c.personalYear);
  return { year, yy, moolank: c.driver, month: m, monthReduced: mr, weekday: DAY[dow], weekdayPlanet: wp, sum, chain: chainOf(sum), py: c.personalYear,
           pyPlanet: R.planetMap[c.personalYear], starts: `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
           periods: c.extra.pratayandar.map((p) => ({ n: p.number, planet: p.planet, days: p.days, start: p.start, end: p.end })) };
};
function chainOf(n: number) { const s = [n]; while (s[s.length - 1] > 9) s.push(digitsOf(s[s.length - 1]).reduce((a, b) => a + b, 0)); return s; }
// "Western" style personal year people often use: birth day + birth month + the calendar year, all digits
const western = (d: number, m: number, year: number) => { const s = [d, m, year].flatMap(digitsOf).reduce((a, b) => a + b, 0); return { sum: s, chain: chainOf(s), n: reduceToSingleDigit(s) }; };

const A27 = py(14, 8, 1996, 2027), A26 = py(14, 8, 1996, 2026);
const B27 = py(29, 3, 1990, 2027), B26 = py(29, 3, 1990, 2026);
const AW = western(14, 8, 2027);
const weekdayMap = Object.fromEntries(DAY.map((d, i) => [d, R.weekdayPlanetMap[i]]));
assert.deepEqual(weekdayMap, { Sunday: 1, Monday: 2, Tuesday: 9, Wednesday: 5, Thursday: 3, Friday: 6, Saturday: 8 });
// sub-periods: nine, 8 x n days each, 360 days total, start on the birthday
for (const X of [A27, B27]) { assert.equal(X.periods.length, 9); assert.equal(X.periods.reduce((a, p) => a + p.days, 0), 360); assert.equal(X.periods[0].start, X.starts); assert.equal(X.periods[0].n, X.py); }
console.log(JSON.stringify({ A27, A26, B27, B26, AW, weekdayMap, planets: R.planetMap }, null, 1));
