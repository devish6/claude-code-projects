import { describe, expect, test } from "vitest";

import MOOLANK from "../../content/moolank-traits.json" with { type: "json" };
import {
  buildDayTraits,
  composeDailyEnergyEntry,
  reduceFeedToWeekdays,
  toDailyEnergyProps,
} from "./daily-energy.mjs";

/**
 * A feed item shaped exactly like numevix.com/tarot/feed.json serves it,
 * verified live on 2026-07-30. Only `_numevix` is consumed here; the prose
 * `content_text` is deliberately ignored (regex-splitting our own sentences
 * is the thing Slice 6c Part 1 existed to stop).
 */
const item = (date, weekday, dayNumber, planet) => ({
  id: `https://numevix.com/tarot#${date}`,
  url: "https://numevix.com/tarot",
  title: `${weekday}, ${date} — ${planet}'s Day`,
  content_text: "prose that must never be parsed",
  date_published: `${date}T00:00:00Z`,
  _numevix: {
    weekday,
    dayNumber,
    planet,
    element: "Ether",
    tagline: "A thoughtful day, well suited to learning and honest counsel.",
    luckyColors: ["Yellow", "Gold"],
    luckyNumbers: [3, 12, 21, 30],
  },
});

const WEEK = [
  ["2026-07-30", "Thursday", 3, "Jupiter"],
  ["2026-07-31", "Friday", 6, "Venus"],
  ["2026-08-01", "Saturday", 8, "Saturn"],
  ["2026-08-02", "Sunday", 1, "the Sun"],
  ["2026-08-03", "Monday", 2, "the Moon"],
  ["2026-08-04", "Tuesday", 9, "Mars"],
  ["2026-08-05", "Wednesday", 5, "Mercury"],
];

/** 30 days, newest first — the real feed window, with each weekday recurring. */
const thirtyDayFeed = () => {
  const items = [];
  for (let i = 0; i < 30; i++) {
    const [date, weekday, dayNumber, planet] = WEEK[i % 7];
    items.push(item(`${date}#${i}`, weekday, dayNumber, planet));
  }
  return items;
};

describe("reduceFeedToWeekdays", () => {
  test("turns a 30-day feed into exactly 7 weekday entries with no gaps", () => {
    const result = reduceFeedToWeekdays(thirtyDayFeed());

    expect(Object.keys(result).sort()).toEqual(
      ["Friday", "Monday", "Saturday", "Sunday", "Thursday", "Tuesday", "Wednesday"].sort(),
    );
  });

  test("keeps the first occurrence of a weekday, so the result is stable", () => {
    const result = reduceFeedToWeekdays(thirtyDayFeed());

    expect(result.Thursday.planet).toBe("Jupiter");
    expect(result.Thursday.dayNumber).toBe(3);
  });

  test("rejects an item missing _numevix rather than producing empty props", () => {
    const feed = thirtyDayFeed();
    delete feed[0]._numevix;

    expect(() => reduceFeedToWeekdays(feed)).toThrow(/_numevix/);
  });

  test("rejects an item whose _numevix is incomplete", () => {
    const feed = thirtyDayFeed();
    delete feed[0]._numevix.planet;

    expect(() => reduceFeedToWeekdays(feed)).toThrow(/planet/);
  });

  test("rejects a feed that cannot cover all seven weekdays", () => {
    expect(() => reduceFeedToWeekdays([item("2026-07-30", "Thursday", 3, "Jupiter")])).toThrow(
      /7 weekdays/,
    );
  });
});

describe("buildDayTraits", () => {
  const entry = reduceFeedToWeekdays(thirtyDayFeed()).Thursday;

  test("emits exactly 4 traits, as ViralVideoProps requires", () => {
    expect(buildDayTraits(entry)).toHaveLength(4);
  });

  test("describes the day, using only the day's own fields", () => {
    const traits = buildDayTraits(entry);

    expect(traits.join(" ")).toContain("Jupiter");
    expect(traits.join(" ")).toContain("Ether");
    expect(traits.join(" ")).toContain("Yellow");
  });

  /**
   * The correctness constraint from the spec. moolank-traits.json describes a
   * PERSON ("A natural-born leader"); the ruling planet is a property of the
   * DATE. Borrowing those strings would assert something about the viewer that
   * /tarot's own FAQ refuses to — it frames Today's Energy as "a
   * correspondence, not a prediction".
   */
  test("never borrows a moolank personality string", () => {
    const personality = Object.entries(MOOLANK)
      .filter(([k]) => k !== "_comment")
      .flatMap(([, v]) => v.strengths);

    for (const weekday of Object.values(reduceFeedToWeekdays(thirtyDayFeed()))) {
      const traits = buildDayTraits(weekday).join(" ");
      for (const strength of personality) {
        expect(traits).not.toContain(strength);
      }
    }
  });
});

describe("toDailyEnergyProps", () => {
  const entry = reduceFeedToWeekdays(thirtyDayFeed()).Thursday;

  test("maps the day onto the existing ViralVideo props", () => {
    const props = toDailyEnergyProps(entry, { music: "bed.mp3" });

    expect(props.number).toBe(3);
    expect(props.numberLabel).toBe("Ruled by Jupiter");
    expect(props.hookText).toContain("THURSDAY");
    expect(props.traits).toHaveLength(4);
    expect(props.music).toBe("bed.mp3");
  });

  test("points the CTA at the page the content came from", () => {
    expect(toDailyEnergyProps(entry, { music: "bed.mp3" }).ctaText.toLowerCase()).toContain("tarot");
  });

  test("is deterministic — two calls on one entry are byte-identical", () => {
    const a = toDailyEnergyProps(entry, { music: "bed.mp3" });
    const b = toDailyEnergyProps(entry, { music: "bed.mp3" });

    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test("truncates a long tagline to the hook's line budget", () => {
    const wordy = {
      ...entry,
      tagline:
        "A thoughtful day well suited to learning and guidance and honest counsel and much else besides",
    };

    expect(toDailyEnergyProps(wordy, { music: "bed.mp3" }).hookSub.length).toBeLessThanOrEqual(60);
  });
});

describe("composeDailyEnergyEntry", () => {
  const snapshot = { weekdays: reduceFeedToWeekdays(thirtyDayFeed()) };
  const make = (over = {}) =>
    composeDailyEnergyEntry({
      snapshot,
      weekday: "Thursday",
      v: "V15",
      music: "hardstyleV10",
      date: "2026-07-30",
      ...over,
    });

  test("builds a state entry the existing pipeline can render", () => {
    const entry = make();

    expect(entry.v).toBe("V15");
    expect(entry.date).toBe("2026-07-30");
    expect(entry.props.number).toBe(3);
    expect(entry.props.music).toBe("hardstyleV10");
    expect(entry.title).toContain("Thursday");
  });

  /**
   * picker.mjs's 21-day no-repeat is keyed on hookId. A daily-energy entry
   * must not collide with a real hook id or it would suppress that hook for
   * three weeks — the spec requires the picker be left completely alone.
   */
  test("uses a hookId no real hook can claim", () => {
    expect(make().hookId).toBe("daily-energy");
  });

  test("carries a caption pack, like every other entry", () => {
    const entry = make();

    expect(entry.tiktokCaption).toBeTruthy();
    expect(entry.instagramCaption).toBeTruthy();
    expect(entry.hashtags.length).toBeGreaterThan(0);
    expect(entry.suggestedPostTime).toBeTruthy();
  });

  test("tags every caption link with the video id, so traffic is attributable", () => {
    const entry = make();

    for (const link of Object.values(entry.utmLinks)) {
      expect(new URL(link).searchParams.get("utm_content")).toBe("V15");
    }
  });

  test("refuses a weekday the snapshot does not hold, rather than guessing", () => {
    expect(() => make({ snapshot: { weekdays: {} } })).toThrow(/Thursday/);
  });
});

describe("composeDailyEnergyEntry — structural variation", () => {
  const snapshot = { weekdays: reduceFeedToWeekdays(thirtyDayFeed()) };
  const structure = { hook: 1.2, build: 3.6, value: 7.4, cta: 2.0 };

  test("carries the act structure onto the props, so it is not another 17.45s video", () => {
    const entry = composeDailyEnergyEntry({
      snapshot,
      weekday: "Thursday",
      v: "V15",
      music: "hardstyleV10",
      date: "2026-07-30",
      structure,
      variation: { structure: "snap", tempo: 128, layout: "split", palette: "ember" },
    });

    expect(entry.props.structure).toEqual(structure);
    expect(entry.variation.layout).toBe("split");
  });
});
