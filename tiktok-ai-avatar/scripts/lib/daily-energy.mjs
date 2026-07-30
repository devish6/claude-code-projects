/**
 * The daily-energy video's data source: the `_numevix` extension object that
 * Slice 6c Part 1 added to https://numevix.com/tarot/feed.json.
 *
 * Lives here rather than in src/ because content/daily-state.json holds full
 * props per video and templates-gen.mjs serializes them into TypeScript --
 * so props are built on the .mjs side, and .mjs cannot import .ts. A second
 * copy in src/ would be dead code that drifts; the compositionId duplication
 * already broke three renders that way.
 *
 * @typedef {{ weekday: string, dayNumber: number, planet: string,
 *   element: string, tagline: string, luckyColors: string[],
 *   luckyNumbers: number[] }} DayEnergy
 */

import { utmLinksForVideo } from "./utm.mjs";

const REQUIRED = [
  "weekday",
  "dayNumber",
  "planet",
  "element",
  "tagline",
  "luckyColors",
  "luckyNumbers",
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Reduces the feed's 30-day window to one entry per weekday.
 *
 * The day's energy depends only on the weekday, so the seven entries are
 * identical by construction wherever they recur and the first occurrence
 * wins. A half-built entry throws rather than passing through: composing a
 * video from empty props would ship a blank overlay to TikTok, which is worse
 * than shipping the day's other two videos and reporting this one as failed.
 *
 * @param {Array<{ _numevix?: Partial<DayEnergy> }>} items
 * @returns {Record<string, DayEnergy>}
 */
export const reduceFeedToWeekdays = (items) => {
  const byWeekday = {};

  for (const item of items) {
    if (!item._numevix) {
      throw new Error("feed item is missing _numevix — refusing to build props from prose");
    }
    for (const key of REQUIRED) {
      if (item._numevix[key] === undefined) {
        throw new Error(`feed item's _numevix is missing ${key}`);
      }
    }
    byWeekday[item._numevix.weekday] ??= item._numevix;
  }

  const missing = WEEKDAYS.filter((d) => !byWeekday[d]);
  if (missing.length) {
    throw new Error(`feed does not cover all 7 weekdays — missing ${missing.join(", ")}`);
  }

  return byWeekday;
};

/**
 * 🔴 The day's traits come from the day's own fields, and never from
 * content/moolank-traits.json.
 *
 * That file maps a number to a PERSON's strengths ("A natural-born leader").
 * The ruling planet is a property of the DATE. Borrowing those strings for a
 * Thursday video would assert something about whoever is watching that the
 * site deliberately never says -- /tarot's own FAQ frames Today's Energy as
 * "a correspondence, not a prediction", and the numerology source it draws on
 * explicitly rejects daily prediction. A test fails if any of those strings
 * ever appears here.
 *
 * @param {DayEnergy} day
 */
export const buildDayTraits = (day) => [
  `${day.planet} rules the day`,
  `Element: ${day.element}`,
  `Colours: ${day.luckyColors.join(" & ")}`,
  `Numbers: ${day.luckyNumbers.join(", ")}`,
];

/** The hook's third line is one line on a 1080-wide frame. */
const SUB_BUDGET = 60;

const truncate = (text, budget) => {
  if (text.length <= budget) return text;
  const cut = text.slice(0, budget - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

/**
 * Maps a day onto the EXISTING ViralVideo composition. Slice 6c deliberately
 * adds no new Remotion code -- the daily-energy video is a new generated
 * entry, not a new renderer.
 *
 * Deterministic: the same entry and bed produce byte-identical props, so two
 * runs on one day cannot drift.
 *
 * @param {DayEnergy} day
 * @param {{ music: string }} opts
 */
export const toDailyEnergyProps = (day, { music }) => ({
  hookText: `${day.weekday.toUpperCase()} RUNS ON`,
  hookAccent: day.planet.toUpperCase(),
  hookSub: truncate(day.tagline, SUB_BUDGET),
  variant: "mystery",
  buildSetup: "Every weekday answers to a different planet…",
  buildReveal: "Today's is the one people misread most.",
  number: day.dayNumber,
  numberLabel: `Ruled by ${day.planet}`,
  traits: buildDayTraits(day),
  ctaText: "Today's energy, free — numevix.com/tarot",
  music,
});

/** Where the daily-energy video sends people — the page the content came from. */
export const DAILY_ENERGY_DESTINATION = "https://numevix.com/tarot";

/**
 * Builds the state entry for the day's feed-driven video, in the same shape
 * every other entry uses, so it renders through the existing templates-gen
 * path with no new Remotion code.
 *
 * @param {{ snapshot: { weekdays: Record<string, DayEnergy> }, weekday: string,
 *   v: string, music: string, date: string }} args
 */
export const composeDailyEnergyEntry = ({ snapshot, weekday, v, music, date }) => {
  const day = snapshot?.weekdays?.[weekday];
  if (!day) {
    // Treated as unreachable, not half-built: the caller skips this one video
    // and still ships the day's others.
    throw new Error(`daily-energy snapshot has no entry for ${weekday}`);
  }

  const props = toDailyEnergyProps(day, { music });

  return {
    v,
    title: `${weekday} Runs On ${day.planet}`,
    date,
    category: "educational",
    // picker.mjs keys its 21-day no-repeat on hookId; "general" and this
    // reserved id keep a feed-driven video from suppressing a real hook or
    // disturbing moolank coverage. The spec requires the picker be untouched.
    moolank: "general",
    hookId: "daily-energy",
    music,
    variant: props.variant,
    status: "generated",
    source: "daily-energy",
    needsReview: false,
    whyComment: "Asks which weekday they were born on — a one-word, zero-effort reply.",
    tiktokCaption: `${weekday} runs on ${day.planet}. ${day.tagline} Which day were you born on?`,
    instagramCaption: `${day.tagline}\n\n${weekday} is ruled by ${day.planet} — element ${day.element}, colours ${day.luckyColors.join(" and ")}.\n\nToday's energy is free at numevix.com/tarot`,
    hashtags: ["#numerology", "#vedicnumerology", "#dailyenergy", `#${day.planet.replace(/^the /, "").toLowerCase()}`],
    suggestedPostTime: "7:30am",
    utmLinks: utmLinksForVideo(DAILY_ENERGY_DESTINATION, v),
    props,
  };
};
