import { describe, expect, test } from "vitest";

import { HEIGHT, WIDTH } from "./timing";
import { LAYOUTS, LAYOUT_SPECS } from "./layout";

/**
 * Layout is the axis that decides whether two videos LOOK alike frame to
 * frame. Varying duration alone left every video sharing one arrangement,
 * which is the visible half of the duplicate fingerprint.
 */
describe("LAYOUT_SPECS", () => {
  test("covers every layout the variation engine can pick", () => {
    for (const name of LAYOUTS) {
      expect(LAYOUT_SPECS[name], `no spec for layout "${name}"`).toBeTruthy();
    }
  });

  test("no two layouts are the same arrangement", () => {
    const shapes = LAYOUTS.map((n) => JSON.stringify(LAYOUT_SPECS[n]));

    expect(new Set(shapes).size).toBe(shapes.length);
  });

  test("every layout keeps its content inside the frame", () => {
    for (const name of LAYOUTS) {
      const s = LAYOUT_SPECS[name];

      expect(s.padX * 2, `${name} padding exceeds the frame`).toBeLessThan(WIDTH);
      expect(s.hookSize).toBeGreaterThan(0);
      expect(s.traitSize).toBeGreaterThan(0);
    }
  });

  /**
   * TikTok's UI overlays the bottom ~15% and the right rail. Content parked
   * there is unreadable regardless of contrast, so every layout must keep its
   * safe area clear — this is the "safe-area verification" QA rule.
   */
  test("every layout respects the platform safe area", () => {
    for (const name of LAYOUTS) {
      const s = LAYOUT_SPECS[name];

      expect(s.padX, `${name} sits under the right rail`).toBeGreaterThanOrEqual(48);
      expect(s.safeBottom, `${name} sits under the caption bar`).toBeGreaterThanOrEqual(
        HEIGHT * 0.15,
      );
    }
  });

  test("type stays large enough to read on a phone", () => {
    for (const name of LAYOUTS) {
      // Below ~48px on a 1080-wide frame is unreadable at phone size.
      expect(LAYOUT_SPECS[name].traitSize, `${name} trait type is too small`).toBeGreaterThanOrEqual(48);
    }
  });
});
