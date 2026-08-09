import { describe, expect, test } from "vitest";

import { buildDailyTemplatesSource, compositionId } from "./templates-gen.mjs";

/**
 * The generator runs on EVERY daily-viral.mjs run, before anything is rendered.
 * A throw here is not a cosmetic failure — it stops the pipeline producing any
 * new video at all, which is exactly what the live ledger did.
 */

const viral = {
  v: "V30",
  category: "identity",
  title: "Your Number Knows",
  source: "daily",
  status: "rendered",
  props: {
    hookText: "Your number knows",
    variant: "identity",
    number: 5,
    numberLabel: "Moolank 5",
    traits: ["a", "b", "c", "d"],
    ctaText: "Follow for yours",
    music: "starlightV03",
  },
};

describe("buildDailyTemplatesSource", () => {
  test("serializes a video that has props", () => {
    const src = buildDailyTemplatesSource({ videos: [viral] });

    expect(src).toContain(compositionId(viral));
    expect(src).toContain('hookText: "Your number knows"');
  });

  // 🔴 THE CRASH THAT STOPPED THE PIPELINE. The live ledger carries ten
  // props-less rows — M1R–M9R and T369, sources "card-reel" and "one-off" —
  // which are published assets needing only a V-number and a UTM link. The
  // exclusion only listed "story", so `propsLiteral` read `v.props.hookText` on
  // a row with no props and threw "Cannot read properties of undefined". Ask for
  // what is actually needed (usable props), not for the sources known to lack it.
  test("skips props-less ledger rows instead of throwing on them", () => {
    const state = {
      videos: [
        { v: "M5R", category: "identity", title: "Card reel", source: "card-reel" },
        { v: "T369", category: "identity", title: "One off", source: "one-off" },
        viral,
      ],
    };

    expect(() => buildDailyTemplatesSource(state)).not.toThrow();

    const src = buildDailyTemplatesSource(state);
    expect(src).not.toContain("M5R");
    expect(src).not.toContain("T369");
    expect(src).toContain(compositionId(viral));
  });

  // A row with no props and an unknown source is still skipped — the guard is
  // the props, so a source nobody has thought of yet cannot reintroduce this.
  test("skips a props-less row whatever its source says", () => {
    const src = buildDailyTemplatesSource({
      videos: [{ v: "V99", category: "identity", title: "Future", source: "something-new" }, viral],
    });

    expect(src).not.toContain("V99");
  });

  // The generated file must typecheck when there is nothing to generate —
  // an unused MUSIC import fails tsc with TS6133 on a fresh clone.
  test("emits no MUSIC import when every row was skipped", () => {
    const src = buildDailyTemplatesSource({
      videos: [{ v: "M5R", category: "identity", title: "Card reel", source: "card-reel" }],
    });

    expect(src).not.toContain('import { MUSIC }');
  });
});
