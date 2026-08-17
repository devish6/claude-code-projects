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

/**
 * Every publishable entry carries hashtags.
 *
 * 🔴🔴 WHY. `buildInstagramMedia`, `buildFacebookReel`, `buildYouTubeMetadata`
 * and `buildTikTokCaption` all compose the tag line as `entry.hashtags ?? []`.
 * An entry with no `hashtags` key therefore does not fail — it emits a caption
 * ending in an EMPTY LINE, silently, on all four platforms.
 *
 * That is exactly what happened to V35, V36 and V37: the batch that created
 * them (`902bf12`) dropped the field that V33 and V34 both had, so the whole
 * one-way-match set went out tagless and the owner hand-typed tags at post
 * time. On V37 the hand-typed tags collided with the footer and the live
 * TikTok caption reads "#numerology Link in bio 🔗#vedicnumerology".
 *
 * ⭐ `?? []` is the shape of the bug. A default that turns a missing required
 * field into a valid-but-empty output cannot be caught downstream, because
 * nothing downstream can tell "no tags wanted" from "tags forgotten". The only
 * place it can be caught is here, against the ledger.
 *
 * 🪤 HASHTAG_BANK in picker.mjs has no `compatibility` key, so the picker can
 * never supply tags for that category — every compatibility entry must carry
 * them explicitly. That is why this is a ledger rule and not a picker default.
 */
describe("publishable entries carry hashtags", () => {
  const state = JSON.parse(readFileSync("content/daily-state.json", "utf8"));

  /**
   * Already published without tags. ⛔ CLOSED — nothing may be added. Recording
   * tags on these now would misstate what the builders actually produced, and
   * the owner's call on 2026-08-16 was to fix this from V38 onward rather than
   * rewrite the record of three live posts.
   */
  const LEGACY_TAGLESS = new Set(["V35", "V36", "V37"]);

  const publishable = state.videos.filter(
    (v) => (v.handPostTo?.length || v.platforms?.length) && v.instagramCaption,
  );

  test("there is something to check", () => {
    expect(publishable.length).toBeGreaterThan(0);
  });

  test.each(publishable.filter((v) => !LEGACY_TAGLESS.has(v.v)).map((v) => [v.v ?? v.title, v]))(
    "%s has at least one hashtag",
    (_id, entry) => {
      expect(entry.hashtags?.length ?? 0).toBeGreaterThan(0);
    },
  );

  test("the tagless legacy list is exactly the three published reels", () => {
    expect([...LEGACY_TAGLESS].sort()).toEqual(["V35", "V36", "V37"]);
  });

  /** ⭐ Positive control: the rule reaches the newest entry, not just old ones. */
  test("V38 is under the rule and tagged", () => {
    const v38 = state.videos.find((v) => v.v === "V38");
    expect(v38, "V38 missing from the ledger").toBeDefined();
    expect(LEGACY_TAGLESS.has("V38")).toBe(false);
    expect(v38.hashtags.length).toBeGreaterThan(0);
  });
});
