// Captions for V80–V84. Line 1 carries the site link (from V79, every caption's first line does);
// the last lines are the brief's fixed sign-off + hashtags. Writes CAPTION.md + CAPTION-TIKTOK.md
// next to each cut, numevix_reels/<file>.txt, and numevix_reels/captions.md.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SIGN = "Your full chart is free at numevix.com — link in bio.";
const BASE = "#numerology #vedicnumerology #moolank";

const CAPS = [
  { v: 80, slug: "two-numbers", file: "v1_two_numbers", hook: "You have TWO numbers. Not one.",
    body: `Your numbers, free: numevix.com/ + your Moolank (born on the 23rd → numevix.com/5)

You have TWO numbers. Not one.

Moolank (Driver) comes from the day you were born: 23rd → 2 + 3 = 5, Mercury.
Bhagyank (Conductor) comes from the whole date: 23 08 1993 → 35 → 8, Saturn.

One is how you drive. The other is where the road goes.

Comment your birth date (DD MM YYYY) and I'll reply with your TWO numbers.`,
    tags: "#bhagyank #drivernumber #conductornumber" },
  { v: 81, slug: "western-planet", file: "v2_western_wrong", hook: "Your life path number is missing a planet.",
    body: `Your Vedic numbers, free: numevix.com/ + your Moolank

Your life path number is missing a planet.

Born 19 06 1993. A Western site says Life Path 11, "a master number".
Vedic numerology reduces the same date: 38 → 11 → 2. Bhagyank 2, the Moon.
And the birth day is read on its own: 19 → 10 → 1. Moolank 1, the Sun.

The West gave you a number. India gave you two planets.

Comment your birth date (DD MM YYYY). I'll send your Vedic numbers next to the Western one, so you can compare.`,
    tags: "#vedicvswestern #lifepathnumber #bhagyank" },
  { v: 82, slug: "moolank8", file: "v3_moolank8", hook: "Born on the 8th, 17th or 26th?",
    body: `Moolank 8, free chart: numevix.com/8

Born on the 8th, 17th or 26th? This is for you.

8. 1 + 7 = 8. 2 + 6 = 8. Moolank 8, ruled by Saturn (Shani).
The number of the long game. Underestimated early.
Everyone told you to hurry. Saturn doesn't hurry. Saturn compounds.

If this is you, comment 8. And send it to the 8 in your life.`,
    tags: "#moolank8 #saturn #shani" },
  { v: 83, slug: "name-number", file: "v4_name_number", hook: "Your name has a number.",
    body: `Your numbers, free: numevix.com/ + your Moolank

Your name has a number. It might be fighting your birth chart.

In Chaldean numerology every letter carries a value. R A H U L → 2 + 1 + 5 + 6 + 3 = 17 → 8.
Your name adds up to one number. Your birth date gives you two. When they clash, it's driving with the handbrake on: nothing's broken, everything costs more.

Comment your first name + birth date (DD MM YYYY) and I'll tell you whether your name number helps or fights your chart.`,
    tags: "#namenumerology #chaldean #namecorrection" },
  { v: 84, slug: "personal-year", file: "v5_2026_forecast", hook: "November & December 2026, by your numbers.",
    body: `Your numbers, free: numevix.com/ + your Moolank

November & December 2026, by your numbers.

Your Personal Year doesn't start on January 1st. It starts on your birthday.
Born 23 August: the year (26) + Moolank (5) + month (8) + your birthday's weekday planet (it fell on a Sunday, Sun = 1) = 40 → 4. Personal Year 4: careful groundwork.
Birthday still to come this year? You're still in last year's number.

Comment your birth date (DD MM YYYY) and I'll reply with your Personal Year for the rest of 2026.`,
    tags: "#personalyear #2026forecast #annualforecast" },
];

const OUT = join(ROOT, "numevix_reels");
mkdirSync(OUT, { recursive: true });
let index = "# Numevix reels V80–V84: captions\n\nPaste the block under each video as-is. Line 1 is the site link; the last three lines are the sign-off, the voice credit (ElevenLabs free plan requires it) and hashtags.\n";
for (const c of CAPS) {
  const text = `${c.body}\n\n${SIGN}\nVoice: ElevenLabs\n${BASE} ${c.tags} #numevix\n`;
  const dir = join(ROOT, `v${c.v}-${c.slug}`);
  writeFileSync(join(dir, "CAPTION.md"), text);
  writeFileSync(join(dir, "CAPTION-TIKTOK.md"), text);
  writeFileSync(join(OUT, `${c.file}.txt`), text);
  index += `\n## V${c.v} · ${c.file}.mp4 · "${c.hook}"\n\n\`\`\`\n${text}\`\`\`\n`;
}
writeFileSync(join(OUT, "captions.md"), index);
console.log("captions written for", CAPS.map((c) => "V" + c.v).join(" "));
