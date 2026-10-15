// V80–V84 — the Muse brief, five "midnight library" cuts from one template.
//
// The owner relayed a brief (written with Muse) on 2026-10-15: the NUMBER is the hook in the first
// two seconds, every cut ends on a comment CTA, the look is "midnight library, not neon psychic".
// This file computes every number shown on screen (V67 shipped a wrong Conductor; nothing else
// checks arithmetic), asserts it against the engine's values, and writes one Hyperframes
// composition per cut into ../v8N-<slug>/composition/.
//
//   node muse-series/build.mjs        then render each with hyperframes@0.8.46
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const LIB = join(ROOT, "public/elevenlabs-library");

// ── numerology, the engine's rules (modules/numerology-engine) ──────────────────────────────
const PLANET = ["", "Sun", "Moon", "Jupiter", "Rahu", "Mercury", "Venus", "Ketu", "Saturn", "Mars"];
const THE = (p) => (p === "Sun" || p === "Moon" ? "the " + p : p);
const digitSum = (n) => String(n).split("").reduce((a, c) => a + +c, 0);
const chain = (n) => { const c = [n]; while (n > 9) { n = digitSum(n); c.push(n); } return c; };
const reduce = (n) => chain(n).at(-1);
const steps = (c) => c.slice(0, -1).map((n, i) => (n > 9 ? `${String(n).split("").join(" + ")} = ${c[i + 1]}` : null)).filter(Boolean);
// Western life path: reduce day, month, year separately, keep 11/22/33 (how the Western sites do it).
const redMaster = (n) => { while (n > 9 && ![11, 22, 33].includes(n)) n = digitSum(n); return n; };
const westernLifePath = (d, m, y) => redMaster(redMaster(d) + redMaster(m) + redMaster(digitSum(y)));
const CHALDEAN = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4, N: 5,
  O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7 };
const WEEKDAY_PLANET = [1, 2, 9, 5, 3, 6, 8]; // Sun..Sat → planet number (ruleset v1/v2)
const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const assert = (ok, msg) => { if (!ok) throw new Error("arithmetic drift: " + msg); };

// V80 — one person, both numbers.
const D1 = { d: 23, m: 8, y: 1993 };
const D1S = "23081993";
const m1 = chain(D1.d), b1 = chain(digitSum(D1S));
assert(m1.at(-1) === 5 && b1.at(-1) === 8, `V80 ${m1} ${b1}`); // engine: driver 5, conductor 8

// V81 — Western 11 vs Vedic 2 + 1.
const D2 = { d: 19, m: 6, y: 1993 };
const D2S = "19061993";
const w2 = westernLifePath(D2.d, D2.m, D2.y), b2 = chain(digitSum(D2S)), m2 = chain(D2.d);
assert(w2 === 11 && b2.at(-1) === 2 && m2.at(-1) === 1, `V81 W${w2} B${b2} M${m2}`); // engine: driver 1, conductor 2

// V83 — a name, summed.
const NAME = "RAHUL";
const nameVals = [...NAME].map((c) => CHALDEAN[c]);
const nameSum = nameVals.reduce((a, b) => a + b, 0), nameChain = chain(nameSum);
assert(nameSum === 17 && nameChain.at(-1) === 8, `V83 ${nameSum}`);

// V84 — Personal Year = yy + Moolank + month(reduced) + planet of the birthday's weekday (forecast.ts).
const PY_YEAR = 2026;
const bdayDow = new Date(Date.UTC(PY_YEAR, D1.m - 1, D1.d)).getUTCDay();
const wp = WEEKDAY_PLANET[bdayDow];
const pyRaw = (PY_YEAR % 100) + m1.at(-1) + reduce(D1.m) + wp;
const py = chain(pyRaw);
assert(DOW[bdayDow] === "Sunday" && wp === 1 && pyRaw === 40 && py.at(-1) === 4, `V84 ${DOW[bdayDow]} ${pyRaw}`); // engine: 4

// ── the five cuts ───────────────────────────────────────────────────────────────────────────
// Scene items: kick (small gold label), ln (serif line), work (arithmetic), big (numeral + label),
// small (quiet line), url. `at` is seconds after the scene starts; at 0 = lit on the scene's first frame.
const CTA_URL = (n) => ({ k: "url", n, at: 0.9 });
const fmtDate = (s) => `${s.slice(0, 2)} · ${s.slice(2, 4)} · ${s.slice(4)}`;

const CUTS = [
  {
    v: 80, slug: "two-numbers", file: "v1_two_numbers", title: "You Have Two Numbers",
    bed: "Midnight_Reverie.mp3", dur: 27, bedVol: 1.0, bedGainDb: 6, // this bed sits ~10 dB under the others
    scenes: [
      { t: 0, items: [{ k: "kick", s: "Vedic numerology" }, { k: "ln", s: "You have <b>TWO</b> numbers.", at: 0, cls: "xl" }, { k: "ln", s: "Not one.", at: 0, cls: "xl gold" }] },
      { t: 2.6, items: [{ k: "ln", s: "Most sites give you one.", at: 0 }, { k: "ln", s: "Vedic numerology", at: 0.9 }, { k: "ln", s: "has always used two.", at: 1.2, cls: "gold" }] },
      { t: 5.6, bell: 1.3, items: [{ k: "kick", s: "1 · Moolank · from your birth day" }, { k: "work", s: `Born on the ${D1.d}rd`, at: 0 },
        { k: "work", s: steps(m1).join("   →   "), at: 0.6 }, { k: "big", n: m1.at(-1), lbl: `${PLANET[m1.at(-1)]} · how you drive`, at: 1.3 }] },
      { t: 10.0, bell: 1.6, items: [{ k: "kick", s: "2 · Bhagyank · from your full date" }, { k: "work", s: fmtDate(D1S), at: 0 },
        { k: "work", s: `${D1S.split("").join("+")} = ${b1[0]}`, at: 0.6 }, { k: "work", s: steps(b1).join("   →   "), at: 1.0 },
        { k: "big", n: b1.at(-1), lbl: `${PLANET[b1.at(-1)]} · where the road goes`, at: 1.6 }] },
      { t: 15.0, items: [{ k: "ln", s: "One is how you drive.", at: 0 }, { k: "ln", s: "The other is", at: 1.0 }, { k: "ln", s: "where the road goes.", at: 1.3, cls: "gold" }] },
      { t: 18.4, items: [{ k: "ln", s: "When they pull apart,", at: 0 }, { k: "ln", s: "that's the tension", at: 1.0 }, { k: "ln", s: "you've felt all your life", at: 1.4 }, { k: "ln", s: "and never had a word for.", at: 2.0, cls: "gold" }] },
      { t: 22.0, cta: true, items: [{ k: "kick", s: "Your turn" }, { k: "ln", s: "Comment your birth date.", at: 0 }, { k: "work", s: "DD MM YYYY", at: 0.3 },
        { k: "ln", s: "I'll reply with", at: 0.6 }, { k: "ln", s: "your <b>TWO</b> numbers.", at: 0.8, cls: "gold" }, CTA_URL()] },
    ],
  },
  {
    v: 81, slug: "western-planet", file: "v2_western_wrong", title: "Your Life Path Number Is Missing A Planet",
    bed: "Two_AM_Stillness.mp3", dur: 27,
    scenes: [
      { t: 0, items: [{ k: "kick", s: "Vedic vs Western" }, { k: "ln", s: "Your life path number", at: 0, cls: "xl" }, { k: "ln", s: "is missing a planet.", at: 0, cls: "xl gold" }] },
      { t: 2.8, bell: 1.2, items: [{ k: "work", s: `Born ${fmtDate(D2S)}`, at: 0 }, { k: "ln", s: "A Western site says:", at: 0.5 },
        { k: "big", n: w2, lbl: "Life Path 11 · “a master number”", at: 1.2, cls: "pale" }] },
      { t: 6.6, bell: 2.0, items: [{ k: "ln", s: "Same date. Vedic numerology:", at: 0 }, { k: "work", s: `${D2S.split("").join("+")} = ${b2[0]}`, at: 0.5 },
        { k: "work", s: steps(b2).join("   →   "), at: 1.0 }, { k: "big", n: b2.at(-1), lbl: `Bhagyank · ${THE(PLANET[b2.at(-1)])}`, at: 2.0 }] },
      { t: 11.0, bell: 1.4, items: [{ k: "ln", s: "And the day you were born", at: 0 }, { k: "ln", s: "is read on its own:", at: 0.3 },
        { k: "work", s: steps(m2).join("   →   "), at: 0.8 }, { k: "big", n: m2.at(-1), lbl: `Moolank · ${THE(PLANET[m2.at(-1)])}`, at: 1.4 }] },
      { t: 15.4, items: [{ k: "ln", s: "The West gave you", at: 0 }, { k: "ln", s: "a number.", at: 0.3 }, { k: "ln", s: "India gave you", at: 1.3 }, { k: "ln", s: "two planets.", at: 1.6, cls: "gold" }] },
      { t: 19.0, items: [{ k: "ln", s: "A number is a trait.", at: 0 }, { k: "ln", s: "A planet has friends,", at: 1.0 }, { k: "ln", s: "rivals, and a weekday.", at: 1.4, cls: "gold" }] },
      { t: 22.2, cta: true, items: [{ k: "kick", s: "Compare yours" }, { k: "ln", s: "Comment your birth date.", at: 0 }, { k: "work", s: "DD MM YYYY", at: 0.3 }, { k: "ln", s: "I'll send your Vedic numbers", at: 0.6 },
        { k: "ln", s: "next to the Western one.", at: 0.8, cls: "gold" }, CTA_URL()] },
    ],
  },
  {
    v: 82, slug: "moolank8", file: "v3_moolank8", title: "Born On The 8th 17th Or 26th",
    bed: "Late_Night_Whisper.mp3", dur: 23, moolank: 8,
    scenes: [
      { t: 0, items: [{ k: "kick", s: "Moolank 8 · Saturn" }, { k: "ln", s: "Born on the", at: 0, cls: "xl" }, { k: "ln", s: "8th, 17th or 26th?", at: 0, cls: "xl gold" }] },
      { t: 2.6, bell: 1.2, items: [{ k: "ln", s: "This is for you.", at: 0 }, { k: "work", s: `8   ·   ${steps(chain(17))[0]}   ·   ${steps(chain(26))[0]}`, at: 0.6 },
        { k: "big", n: 8, lbl: "Saturn · Shani", at: 1.2 }] },
      { t: 6.0, items: [{ k: "ln", s: "The number of the long game.", at: 0 }, { k: "ln", s: "Underestimated early.", at: 1.2, cls: "gold" }] },
      { t: 9.6, items: [{ k: "ln", s: "Everyone told you to hurry.", at: 0 }, { k: "ln", s: "Saturn doesn't hurry.", at: 1.4 }, { k: "ln", s: "Saturn compounds.", at: 2.6, cls: "gold xl" }] },
      { t: 14.2, items: [{ k: "ln", s: "You'd rather do it slowly", at: 0 }, { k: "ln", s: "than do it twice.", at: 0.8, cls: "gold" }] },
      { t: 17.8, cta: true, items: [{ k: "kick", s: "If this is you" }, { k: "ln", s: "Comment <b>8</b>.", at: 0, cls: "xl" }, { k: "ln", s: "And send this to", at: 0.7 },
        { k: "ln", s: "the 8 in your life.", at: 0.9, cls: "gold" }, CTA_URL(8)] },
    ],
  },
  {
    v: 83, slug: "name-number", file: "v4_name_number", title: "Your Name Has A Number",
    bed: "Midnight_Murmurs.mp3", dur: 28,
    scenes: [
      { t: 0, items: [{ k: "kick", s: "Chaldean name number" }, { k: "ln", s: "Your name has a number.", at: 0, cls: "xl" }, { k: "ln", s: "It might be fighting", at: 0, cls: "gold" }, { k: "ln", s: "your birth chart.", at: 0, cls: "gold" }] },
      { t: 3.0, bell: 2.0, items: [{ k: "ln", s: "Every letter carries a value.", at: 0 }, { k: "letters", s: NAME, vals: nameVals, at: 0.5 },
        { k: "work", s: `${nameVals.join(" + ")} = ${nameSum}   →   ${steps(nameChain).join("")}`, at: 1.4 }, { k: "big", n: nameChain.at(-1), lbl: "Name number", at: 2.0 }] },
      { t: 7.8, items: [{ k: "ln", s: "Your name adds up", at: 0 }, { k: "ln", s: "to one number.", at: 0.2 }, { k: "ln", s: "Your birth date", at: 1.0, cls: "gold" }, { k: "ln", s: "gives you two.", at: 1.2, cls: "gold" }] },
      { t: 11.0, items: [{ k: "ln", s: "When they clash,", at: 0 }, { k: "ln", s: "it's driving", at: 0.2 }, { k: "ln", s: "with the handbrake on.", at: 0.5, cls: "gold" },
        { k: "ln", s: "Nothing's broken.", at: 1.6 }, { k: "ln", s: "Everything costs more.", at: 2.2 }] },
      { t: 16.0, items: [{ k: "ln", s: "Two people. Same birthday.", at: 0 }, { k: "ln", s: "Different names.", at: 1.0 }, { k: "ln", s: "Different lives.", at: 1.5, cls: "gold" }] },
      { t: 19.6, items: [{ k: "ln", s: "Sometimes one letter", at: 0 }, { k: "ln", s: "changes the whole sum.", at: 0.3, cls: "gold" },
        { k: "small", s: "That's what a name correction reading checks.", at: 1.4 }] },
      { t: 23.0, cta: true, items: [{ k: "kick", s: "Your turn" }, { k: "ln", s: "Comment your first name", at: 0 }, { k: "ln", s: "+ birth date.", at: 0.2 }, { k: "work", s: "DD MM YYYY", at: 0.4 },
        { k: "ln", s: "I'll tell you if your name", at: 0.7, cls: "gold" }, { k: "ln", s: "helps or fights.", at: 0.9, cls: "gold" }, CTA_URL()] },
    ],
  },
  {
    v: 84, slug: "personal-year", file: "v5_2026_forecast", title: "November And December 2026 By Your Numbers",
    bed: "Resonant_Stillness.mp3", dur: 29,
    scenes: [
      { t: 0, items: [{ k: "kick", s: "Personal Year · 2026" }, { k: "ln", s: "November & December 2026,", at: 0, cls: "xl" }, { k: "ln", s: "by your numbers.", at: 0, cls: "xl gold" }] },
      { t: 2.8, items: [{ k: "ln", s: "Your year doesn't start", at: 0 }, { k: "ln", s: "on January 1st.", at: 0.3 }, { k: "ln", s: "It starts on your birthday.", at: 1.3, cls: "gold" }] },
      { t: 6.4, bell: 4.4, items: [{ k: "kick", s: `Born ${D1.d} ${MONTH[D1.m]}` },
        { k: "row", a: "The year · 2026", b: String(PY_YEAR % 100), at: 0 },
        { k: "row", a: `Moolank · the ${D1.d}rd`, b: String(m1.at(-1)), at: 0.7 },
        { k: "row", a: `Month · ${MONTH[D1.m]}`, b: String(reduce(D1.m)), at: 1.4 },
        { k: "row", a: `Birthday fell on a ${DOW[bdayDow]} · ${PLANET[wp]}`, b: String(wp), at: 2.1 },
        { k: "work", s: `${PY_YEAR % 100} + ${m1.at(-1)} + ${reduce(D1.m)} + ${wp} = ${pyRaw}   →   ${steps(py).join("")}`, at: 3.2 },
        { k: "big", n: py.at(-1), lbl: "Personal Year · careful groundwork", at: 4.4, cls: "mid" }] },
      { t: 13.4, items: [{ k: "ln", s: "Birthday still to come", at: 0 }, { k: "ln", s: "this year?", at: 0.2 }, { k: "ln", s: "You're still in", at: 1.2, cls: "gold" }, { k: "ln", s: "last year's number.", at: 1.4, cls: "gold" }] },
      { t: 16.8, items: [{ k: "kick", s: "Three of the nine" }, { k: "pair", a: "1", b: "Beginnings. Start it.", at: 0 },
        { k: "pair", a: "4", b: "Groundwork. Build the base.", at: 1.2 }, { k: "pair", a: "9", b: "Decisive action. Move.", at: 2.4 }] },
      { t: 21.6, items: [{ k: "ln", s: "The Annual Forecast reads", at: 0 }, { k: "ln", s: "all 12 months", at: 0.2 }, { k: "ln", s: "through your Mahadasha.", at: 0.4 }, { k: "ln", s: "This was the trailer.", at: 1.3, cls: "gold" }] },
      { t: 24.6, cta: true, items: [{ k: "kick", s: "Your turn" }, { k: "ln", s: "Comment your birth date.", at: 0 }, { k: "work", s: "DD MM YYYY", at: 0.3 }, { k: "ln", s: "I'll reply with your", at: 0.6 },
        { k: "ln", s: "Personal Year for 2026.", at: 0.7, cls: "gold" }, CTA_URL()] },
    ],
  },
];
// The V84 label names the engine's title for Personal Year 4 ("A year for careful groundwork").
assert(py.at(-1) === 4, "V84 label is the PY4 title");

// ── the template ────────────────────────────────────────────────────────────────────────────
const html = (cut) => {
  const id = `v${cut.v}`;
  const flips = cut.scenes.slice(1).map((s, i) => `<audio id="f${i}" src="assets/flip.mp3" data-start="${s.t}" data-duration="1.2" data-volume="0.22"></audio>`);
  const bells = cut.scenes.filter((s) => s.bell != null).map((s, i) => `<audio id="b${i}" src="assets/bell.mp3" data-start="${(s.t + s.bell).toFixed(2)}" data-duration="2.5" data-volume="0.32"></audio>`);
  const cta = cut.scenes.find((s) => s.cta);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>V${cut.v} — ${cut.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <!-- Real faces only, never a generic keyword (V68: ui-monospace became a sans). -->
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Manrope:wght@500;700&display=swap" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      /* Generated by muse-series/build.mjs, do not hand-edit. V${cut.v}: "${cut.title}".
         Midnight library: ink-blue dark, shelves of book spines out of focus, candle glow,
         film grain, vignette. Parchment serif, gold for the turn. Hard swaps between scenes;
         every scene is lit on its first frame. */
      :root { --ink: #0b0d18; --parch: #efe3c8; --gold: #d9b56f; --muted: #a3967c; }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--ink); font-variant-numeric: lining-nums; }
      #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: var(--ink); }
      #bg { position: absolute; inset: 0;
            background: radial-gradient(ellipse 70% 42% at 50% 46%, rgba(217,160,90,.16), rgba(217,160,90,0) 70%),
                        linear-gradient(180deg, #121428 0%, #0d0f1d 45%, #120e1c 100%); }
      #shelves { position: absolute; inset: 0; filter: blur(3px); opacity: .8; }
      #motes { position: absolute; inset: 0; }
      .mote { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: rgba(240,215,160,.55); filter: blur(1px); }
      #vig { position: absolute; inset: 0; background: radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,.78) 100%); }
      #grain { position: absolute; inset: 0; opacity: .13; mix-blend-mode: overlay; }
      #brand { position: absolute; left: 0; right: 0; top: 232px; text-align: center; font-family: "Manrope", sans-serif; font-weight: 700;
               font-size: 26px; letter-spacing: .32em; color: rgba(217,181,111,.62); text-transform: uppercase; }
      .scene { position: absolute; left: 70px; right: 70px; top: 330px; height: 1180px; display: none;
               flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; }
      .it { white-space: nowrap; will-change: transform, opacity; font-variant-numeric: lining-nums; }
      .kick { font-family: "Manrope", sans-serif; font-weight: 700; font-size: 32px; letter-spacing: .2em; text-transform: uppercase;
              color: var(--gold); margin-bottom: 26px; padding: 10px 26px; border: 2px solid rgba(217,181,111,.45); border-radius: 40px; }
      .ln { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: 100px; line-height: 1.06; color: var(--parch);
            text-shadow: 0 2px 24px rgba(0,0,0,.6); }
      .ln.xl { font-size: 124px; font-weight: 700; }
      .ln.gold, .ln .gold { color: var(--gold); font-style: italic; }
      .ln b { color: var(--gold); font-weight: 700; }
      .work { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: 66px; color: var(--muted); font-variant-numeric: lining-nums tabular-nums; }
      .big { display: flex; flex-direction: column; align-items: center; margin-top: 10px; }
      .big .n { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 380px; line-height: 1; color: var(--gold);
                text-shadow: 0 0 60px rgba(217,160,90,.45), 0 0 140px rgba(217,160,90,.25); }
      .big.mid .n { font-size: 250px; }
      .big.pale .n { color: #b9b4c6; text-shadow: 0 0 40px rgba(185,180,198,.25); }
      .big .l { font-family: "Manrope", sans-serif; font-weight: 700; font-size: 40px; letter-spacing: .06em; color: var(--parch); margin-top: 22px; }
      .small { font-family: "Manrope", sans-serif; font-weight: 500; font-size: 44px; color: var(--muted); margin-top: 24px; }
      .letters { display: flex; gap: 22px; margin: 20px 0 6px; }
      .letters .c { width: 128px; display: flex; flex-direction: column; align-items: center; border: 2px solid rgba(217,181,111,.4); border-radius: 12px; padding: 10px 0 8px; }
      .letters .c span:first-child { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 104px; line-height: 1; color: var(--parch); }
      .letters .c span:last-child { font-family: "Manrope", sans-serif; font-weight: 700; font-size: 44px; color: var(--gold); }
      .row { width: 940px; display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(217,181,111,.25); padding: 8px 6px; }
      .row span:first-child { font-family: "Manrope", sans-serif; font-weight: 500; font-size: 44px; color: var(--parch); }
      .row span:last-child { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 84px; color: var(--gold); }
      .pair { width: 920px; display: flex; align-items: center; gap: 34px; text-align: left; padding: 18px 0; }
      .pair span:first-child { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 150px; line-height: .9; color: var(--gold); width: 110px; text-align: center; }
      .pair span:last-child { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: 66px; color: var(--parch); white-space: nowrap; line-height: 1.1; }
      .url { margin-top: 46px; font-family: "Manrope", sans-serif; font-weight: 700; font-size: 44px; color: var(--parch);
             padding: 18px 34px; border: 2px solid rgba(217,181,111,.6); border-radius: 16px; background: rgba(11,13,24,.6); }
      .url .q { color: var(--gold); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="${id}" data-start="0" data-width="1080" data-height="1920" data-duration="${cut.dur}">
      <audio id="bed" src="assets/bed.mp3" data-start="0" data-duration="${cut.dur}" data-volume="${cut.bedVol ?? 0.42}"></audio>
      ${flips.join("\n      ")}
      ${bells.join("\n      ")}
      <audio id="wh" src="assets/whoosh.mp3" data-start="${cta.t}" data-duration="2.0" data-volume="0.3"></audio>
      <div id="bg"></div>
      <svg id="shelves" viewBox="0 0 1080 1920" preserveAspectRatio="none"></svg>
      <div id="motes"></div>
      <div id="stage"></div>
      <div id="brand">Numevix · Vedic numerology</div>
      <div id="vig"></div>
      <svg id="grain" viewBox="0 0 1080 1920"><filter id="gf"><feTurbulence id="turb" type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="1" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1080" height="1920" filter="url(#gf)"/></svg>
    </div>
    <script>
      const SCENES = ${JSON.stringify(cut.scenes)};
      const DUR = ${cut.dur}, MOOLANK = ${cut.moolank ?? "null"};
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const ease = (x) => 1 - Math.pow(1 - x, 3);
      // Deterministic PRNG, so every render draws the same shelves and motes.
      let seed = ${cut.v * 7919};
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

      // Shelves: two bands of book spines, top and bottom, out of focus.
      const svg = document.getElementById("shelves"), NS = "http://www.w3.org/2000/svg";
      const SPINE = ["#2a1e2c", "#1f2638", "#33241c", "#1c2a26", "#2d2a3e", "#3a2a22", "#232032"];
      const band = (y0, h) => {
        let x = -10;
        while (x < 1090) {
          const w = 26 + rnd() * 34, bh = h * (0.72 + rnd() * 0.28), r = document.createElementNS(NS, "rect");
          r.setAttribute("x", x); r.setAttribute("y", y0 + h - bh); r.setAttribute("width", w - 3); r.setAttribute("height", bh);
          r.setAttribute("fill", SPINE[Math.floor(rnd() * SPINE.length)]); svg.appendChild(r);
          if (rnd() < 0.5) { const g = document.createElementNS(NS, "rect"); g.setAttribute("x", x + 4); g.setAttribute("y", y0 + h - bh + 30 + rnd() * 40);
            g.setAttribute("width", w - 11); g.setAttribute("height", 4); g.setAttribute("fill", "rgba(217,181,111,.35)"); svg.appendChild(g); }
          x += w;
        }
        const shelf = document.createElementNS(NS, "rect"); shelf.setAttribute("x", 0); shelf.setAttribute("y", y0 + h); shelf.setAttribute("width", 1080);
        shelf.setAttribute("height", 18); shelf.setAttribute("fill", "#1a1220"); svg.appendChild(shelf);
      };
      band(-40, 210); band(1650, 250);

      const motes = [...Array(36)].map(() => { const d = document.createElement("div"); d.className = "mote"; document.getElementById("motes").appendChild(d);
        return { d, x: rnd() * 1080, y: rnd() * 1920, vx: (rnd() - .5) * 14, vy: -6 - rnd() * 14, ph: rnd() * 6.28, s: .5 + rnd() }; });

      // Scenes → DOM.
      const stage = document.getElementById("stage");
      const els = SCENES.map((sc) => {
        const box = document.createElement("div"); box.className = "scene"; stage.appendChild(box);
        const items = sc.items.map((it) => {
          const e = document.createElement("div"); e.className = "it " + it.k + (it.cls ? " " + it.cls : "");
          if (it.k === "big") e.innerHTML = '<span class="n">' + it.n + '</span><span class="l">' + it.lbl + "</span>";
          else if (it.k === "letters") e.innerHTML = it.s.split("").map((c, i) => '<div class="c"><span>' + c + "</span><span>" + it.vals[i] + "</span></div>").join("");
          else if (it.k === "row" || it.k === "pair") e.innerHTML = "<span>" + it.a + "</span><span>" + it.b + "</span>";
          else if (it.k === "url") e.innerHTML = "Free chart: numevix.com/" + (it.n ? it.n : '<span class="q">[your Moolank]</span>');
          else e.innerHTML = it.s;
          box.appendChild(e); return { e, it };
        });
        return { box, items, sc };
      });

      // Fit every line to the frame after fonts load (measured with its scene shown).
      const fit = () => els.forEach(({ box, items }) => {
        const was = box.style.display; box.style.display = "flex";
        items.forEach(({ e, it }) => {
          if (it.k === "pair" || it.k === "row") return;
          e.style.fontSize = ""; e.style.transform = "none";
          let fs = parseFloat(getComputedStyle(e).fontSize);
          while (e.scrollWidth > 940 && fs > 24) { fs -= 2; e.style.fontSize = fs + "px"; }
        });
        box.style.display = was;
      });
      fit();

      const at = (t) => { let k = 0; for (let i = 0; i < SCENES.length; i++) if (t >= SCENES[i].t) k = i; return k; };
      const turb = document.getElementById("turb");
      function render(t) {
        const k = at(t);
        els.forEach(({ box, items, sc }, i) => {
          if (i !== k) { box.style.display = "none"; return; }
          box.style.display = "flex";
          const dt = t - sc.t;
          items.forEach(({ e, it }) => {
            const a = it.at || 0;
            // at 0 = lit on the scene's first frame (no fade from empty at a boundary).
            const r = a === 0 ? 1 : ease(clamp((dt - a) / 0.38, 0, 1));
            e.style.opacity = r;
            const settle = a === 0 ? ease(clamp(dt / 0.3, 0, 1)) : r;
            const sc0 = it.k === "big" ? 0.82 + 0.18 * r : 1;
            e.style.transform = "translateY(" + (1 - settle) * (a === 0 && sc.t === 0 ? 0 : 22) + "px) scale(" + sc0 + ")";
          });
        });
        motes.forEach((m) => { const x = (m.x + m.vx * t + Math.sin(t * .6 + m.ph) * 20 + 1080) % 1080, y = ((m.y + m.vy * t) % 1920 + 1920) % 1920;
          m.d.style.transform = "translate(" + x + "px," + y + "px) scale(" + m.s + ")"; m.d.style.opacity = .35 + .35 * Math.sin(t * 1.3 + m.ph); });
        turb.setAttribute("seed", 1 + Math.floor(t * 12));
      }
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      const clock = { t: 0 };
      tl.to(clock, { t: DUR, duration: DUR, ease: "none", onUpdate: () => render(clock.t) }, 0);
      render(0);
      if (document.fonts) document.fonts.ready.then(() => { fit(); render(clock.t); });
      window.__timelines["${id}"] = tl;
    </script>
  </body>
</html>
`;
};

for (const cut of CUTS) {
  const dir = join(ROOT, `v${cut.v}-${cut.slug}`, "composition");
  mkdirSync(join(dir, "assets"), { recursive: true });
  writeFileSync(join(dir, "index.html"), html(cut));
  if (cut.bedGainDb) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", join(LIB, "music", cut.bed), "-af", `volume=${cut.bedGainDb}dB,alimiter=limit=0.9`, join(dir, "assets/bed.mp3")]);
  else copyFileSync(join(LIB, "music", cut.bed), join(dir, "assets/bed.mp3"));
  copyFileSync(join(LIB, "sfx", "Fast_flipping_throug_take2.mp3"), join(dir, "assets/flip.mp3"));
  copyFileSync(join(LIB, "sfx", "Large_temple_bell_st_take2.mp3"), join(dir, "assets/bell.mp3"));
  copyFileSync(join(LIB, "sfx", "Cinematic_whoosh_tra_take1.mp3"), join(dir, "assets/whoosh.mp3"));
  console.log(`V${cut.v} → v${cut.v}-${cut.slug}  ${cut.dur}s  ${cut.scenes.length} scenes  bed ${cut.bed}`);
}
writeFileSync(join(HERE, "cuts.json"), JSON.stringify(CUTS.map(({ v, slug, file, title, dur, bed }) => ({ v, slug, file, title, dur, bed })), null, 2));
