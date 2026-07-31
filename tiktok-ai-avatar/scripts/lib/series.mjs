/**
 * The weekly series calendar.
 *
 * ⭐ WHY A FIXED WEEKDAY MAP beats the old rotating category cycle: a viewer
 * cannot form a habit around a rotation they cannot predict. "Moolank Monday"
 * is a promise — it tells someone when to come back, and it gives the account
 * an identity rather than a stream of unrelated clips. It also makes the day's
 * content decision deterministic, which is the same reason the rest of this
 * pipeline avoids runtime AI.
 *
 * Each day produces TWO videos, not the previous four, and BOTH carry the
 * day's theme — a matched pair, not two unrelated clips. Slot B is a second
 * angle on the same subject unless the series names a different `slotB`.
 *
 * 🔴 THE ONE CASUALTY, recorded rather than hidden: the daily-energy video
 * ("Friday runs on Venus") is only TRUE on its own day, so it cannot be made
 * to fit a Moolank Monday. It moves to Tarot Tuesday, where the ruling planet
 * genuinely is the subject. The cost is that six of seven weekday-energy
 * videos are no longer produced — that content still exists on the website
 * feed, it simply stops being filmed daily. Reversible by giving any other day
 * `slotB: "daily-energy"`.
 *
 * Two rather than four is also deliberate. The music pool holds 10 fast beds,
 * so at four a day a track repeated every ~2.5 days — and a repeating audio
 * bed is part of the duplicate fingerprint that got the previous account
 * withheld. At two a day the same pool lasts five days.
 */

/**
 * `format` decides which composition renders the video.
 *
 * "cartoon" is the Story Friday format. Until that composition exists the
 * renderer falls back to "viral", so adding the day to the calendar cannot
 * break a Friday — the series ships copy-first and gains its animation later.
 */
export const SERIES = [
  {
    day: 0,
    id: "ask-me-sunday",
    name: "Ask Me Sunday",
    category: "comment-bait",
    format: "viral",
  },
  {
    day: 1,
    id: "moolank-monday",
    name: "Moolank Monday",
    category: "identity",
    format: "viral",
  },
  {
    day: 2,
    id: "tarot-tuesday",
    name: "Tarot Tuesday",
    category: "educational",
    format: "viral",
    // The only day where the ruling-planet video is on-theme, so it keeps it.
    slotB: "daily-energy",
  },
  {
    day: 3,
    id: "vedic-grid-wednesday",
    name: "Vedic Grid Wednesday",
    category: "educational",
    format: "viral",
  },
  {
    day: 4,
    id: "two-numbers-thursday",
    name: "Two Numbers Thursday",
    category: "knowledge-gap",
    format: "viral",
  },
  {
    day: 5,
    id: "story-friday",
    name: "Story Friday",
    category: "story",
    format: "cartoon",
  },
  {
    day: 6,
    id: "name-number-saturday",
    name: "Name Number Saturday",
    category: "knowledge-gap",
    format: "viral",
  },
];

/**
 * Weekday for a "YYYY-MM-DD" string.
 *
 * Built through Date.UTC from the parsed parts rather than `new Date(str)`.
 * The string form is parsed as UTC midnight and then read back in local time,
 * so anywhere west of Greenwich `getDay()` returns the PREVIOUS day — which
 * would silently run Sunday's series on a Monday for the owner in Detroit.
 */
export const weekdayOf = (dateISO) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) throw new Error(`Not a YYYY-MM-DD date: ${dateISO}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
};

/** The series that owns a given date. Never null — every weekday has one. */
export const seriesForDate = (dateISO) => {
  const day = weekdayOf(dateISO);
  const found = SERIES.find((s) => s.day === day);
  if (!found) throw new Error(`No series for weekday ${day}`);
  return found;
};

/** Videos produced per day. Both carry the day's theme. */
export const VIDEOS_PER_DAY = 2;

/**
 * What the day's second video should be.
 *
 * "daily-energy" means the ruling-planet composition; anything else is a
 * second angle drawn from the same category as slot A, so the pair reads as
 * one subject explored twice rather than two unrelated videos.
 */
export const slotBFor = (dateISO) => seriesForDate(dateISO).slotB ?? "same-theme";
