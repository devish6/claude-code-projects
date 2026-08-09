import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

/**
 * Standing content rules, enforced rather than remembered.
 *
 * The Vedic-grid rule was caught only because a YouTube dry run printed the
 * description and "#loshugrid" was sitting in it, one flag away from being
 * published. A rule that depends on someone noticing is not a rule.
 */

const SOURCES = [
  "content/daily-state.json",
  "content/weekly-plan-w1.json",
  "content/hook-library.md",
  "src/viral/hooks.ts",
  "src/viral/templates.ts",
  "src/viral/daily-templates.ts",
  // The two viewer-facing prose sources this branch added. `funnel.mjs` is the
  // more important of the two: it is not a template but the literal copy sent
  // to real people — buildFunnelCta, the ease line, the DM body. A hardcoded
  // SOURCES list only enforces the rule over the files someone remembered to
  // add, which is the same "a rule that depends on someone noticing" failure
  // this file exists to close.
  "content/angles.json",
  "scripts/lib/funnel.mjs",
];

describe("Vedic grid, never Lo Shu", () => {
  test.each(SOURCES)("%s carries no viewer-facing 'Lo Shu'", (file) => {
    const text = readFileSync(file, "utf8");

    // `ed-lo-shu` is an internal hookId that links state entries to hooks.ts
    // and drives picker.mjs's 21-day no-repeat. It is never displayed, and
    // renaming it would break that match for existing state.
    const withoutIds = text.replaceAll("ed-lo-shu", "");

    expect(withoutIds).not.toMatch(/lo ?shu/i);
  });
});
