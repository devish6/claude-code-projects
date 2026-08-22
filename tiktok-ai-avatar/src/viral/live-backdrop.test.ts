import { describe, expect, test } from "vitest";

import { BANDS, BLOCKS, COPY, LIVE_HEIGHT, LIVE_WIDTH } from "./LiveBackdrop";

/**
 * ⭐ THE ONE THING THIS FRAME CAN GET WRONG is putting something readable where
 * the host or the platform's own UI will cover it. The component positions
 * every block from BLOCKS, so asserting BLOCKS is asserting the render.
 */
describe("LiveBackdrop layout", () => {
  test("is the frame the platform composites into", () => {
    expect(LIVE_WIDTH / LIVE_HEIGHT).toBeCloseTo(9 / 16, 5);
  });

  test("the bands tile the frame with no gap and no overlap", () => {
    const ordered = Object.values(BANDS).sort((a, b) => a.top - b.top);

    expect(ordered[0].top).toBe(0);
    expect(ordered[ordered.length - 1].bottom).toBe(LIVE_HEIGHT);

    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].top).toBe(ordered[i - 1].bottom);
    }
  });

  test("every readable block sits fully inside the band it claims", () => {
    for (const b of BLOCKS) {
      const band = BANDS[b.band];

      expect(b.top, `${b.id} starts above its band`).toBeGreaterThanOrEqual(band.top);
      expect(b.top + b.height, `${b.id} runs past its band`).toBeLessThanOrEqual(band.bottom);
    }
  });

  /**
   * The assertion the whole file exists for. A block landing in `chrome`,
   * `presenter` or `comments` is a block nobody watching will ever read.
   */
  test("no readable block lands in a keep-clear band", () => {
    for (const b of BLOCKS) {
      expect(BANDS[b.band].keepClear, `${b.id} is in the keep-clear band "${b.band}"`).toBe(
        false,
      );
    }
  });

  test("readable blocks do not stack on top of each other", () => {
    const ordered = [...BLOCKS].sort((a, b) => a.top - b.top);

    for (let i = 1; i < ordered.length; i++) {
      expect(
        ordered[i].top,
        `${ordered[i].id} overlaps ${ordered[i - 1].id}`,
      ).toBeGreaterThanOrEqual(ordered[i - 1].top + ordered[i - 1].height);
    }
  });
});

/**
 * The frame exists to carry three facts off the stream. Losing one to a copy
 * edit costs the live its conversion and nothing else would fail.
 */
describe("LiveBackdrop copy", () => {
  test("carries the discount code, the domain and the year", () => {
    expect(COPY.code).toBe("LIVE50");
    expect(COPY.site).toBe("numevix.com");
    expect(COPY.headline.join(" ")).toContain("2027");
  });

  test("names the giveaway and the discount as separate offers", () => {
    expect(COPY.giveawayLead).toMatch(/3 FREE/);
    expect(COPY.offer).toMatch(/50% OFF/);
  });
});
