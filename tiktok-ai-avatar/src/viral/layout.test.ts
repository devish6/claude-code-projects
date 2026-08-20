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
      expect(s.hookPad * 2, `${name} hook padding exceeds the frame`).toBeLessThan(WIDTH);
    }
  });

  /**
   * 🔴🔴 THE REGRESSION THIS FILE FAILED TO CATCH. `hookSize` was in the spec
   * from the start and `ViralHook` never read it — the component hardcoded
   * 112/128/52 and centre/centre, so `layout` moved the body and left frame 0
   * byte-identical on every video. The old assertion here was
   * `expect(s.hookSize).toBeGreaterThan(0)`, which passes just as happily when
   * nothing consumes the field. ⭐ A check that cannot fail the way the real
   * operation fails is not a check.
   *
   * These two tests are the positive control: `centered` must keep producing
   * the exact numbers that shipped, and some layout must actually differ.
   */
  test("centered reproduces the hook geometry that shipped in V01-V40", () => {
    const s = LAYOUT_SPECS.centered;

    expect(s.hookAlign).toBe("center");
    expect(s.hookJustify).toBe("center");
    expect(s.hookPad).toBe(70);
    expect(s.hookPadBottom).toBe(70);
    // headline 0.875x, accent 1x, subtext 0.40625x => 112 / 128 / 52.
    expect(Math.round(s.hookSize * 0.875)).toBe(112);
    expect(s.hookSize).toBe(128);
    expect(Math.round(s.hookSize * 0.40625)).toBe(52);
  });

  test("at least one layout gives the hook a different arrangement", () => {
    const c = LAYOUT_SPECS.centered;
    const differs = LAYOUTS.filter((n) => n !== "centered").filter((n) => {
      const s = LAYOUT_SPECS[n];
      return (
        s.hookAlign !== c.hookAlign ||
        s.hookJustify !== c.hookJustify ||
        s.hookSize !== c.hookSize
      );
    });

    expect(differs.length, "every layout renders the same hook frame").toBeGreaterThan(0);
  });

  test("a hook pinned low still clears the caption bar", () => {
    for (const name of LAYOUTS) {
      const s = LAYOUT_SPECS[name];
      if (s.hookJustify !== "flex-end") continue;

      expect(s.hookPadBottom, `${name} hook sits under the caption bar`).toBeGreaterThanOrEqual(
        HEIGHT * 0.16,
      );
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
      // A flex-start layout with no top padding pins text to y=0, where the
      // frame edge clips it. The split layout shipped exactly that.
      expect(s.safeTop, `${name} is flush against the top edge`).toBeGreaterThanOrEqual(
        HEIGHT * 0.08,
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
