/**
 * The cover accent must say what the video says.
 *
 * 🔴🔴 WHY THIS TEST EXISTS. The same sentence lives in two places — the video's
 * `hookAccent` and the thumbnail's `accent` — and on 2026-08-13 commit
 * `7145f0d` ("say the feeling, not the data structure") rewrote one and missed
 * the other. V35, V36 and V37 all shipped a video reading "THEY WANT YOU BACK"
 * behind a cover reading "THEY LIST YOU BACK": the exact database-language
 * wording the owner had just rejected, on every still surface there is.
 *
 * ⭐ It was not caught by anything. tsc, lint and the whole suite were green,
 * `qa:frame` passed, and the video frames were checked — but the COVER is a
 * separate composition, so looking at the video could never surface it. It was
 * found only by reading the published Instagram thumbnails a week later.
 *
 * ⭐⭐ A duplicated string with no equality assertion is not a convention, it is
 * a latent divergence waiting for the next edit. This is the assertion.
 */
import { describe, expect, test } from "vitest";

import { VIRAL_COVERS, VIRAL_TEMPLATES } from "./templates";

/**
 * Concepts published BEFORE the rule existed, deliberately left as the record
 * of what actually went out. The owner's call on 2026-08-16 was to fix this
 * from the next video rather than re-render and re-post three live reels.
 *
 * ⛔ NOTHING MAY BE ADDED TO THIS LIST. It is closed. A new mismatch is a bug,
 * not an exception — if a cover has to differ from its hook, the reason belongs
 * in a comment on the cover and a deliberate change to this test, reviewed.
 */
const LEGACY_ACCENT_MISMATCH = new Set([
  "Viral-14-OneWayMatch-Nine",
  "Viral-15-OneWayMatch-Eight",
  "Viral-16-OneWayMatch-Seven",
]);

/**
 * Covers whose accent is a DIFFERENT KIND OF LINE from the hook by design, not
 * by drift — the payload, or half of a sentence the title starts.
 *
 * These are structural, and each is documented at its definition:
 *  - best-match / self-friendly covers put the ANSWER in the accent, because on
 *    those angles the answer is the topic ("1 AUR 8", "8 YES · 1 NO").
 *  - belief-correction titles end in "YOU'RE" and the accent completes the
 *    sentence ("NOT WEAK"), so the two halves are one line broken over a split.
 */
const ACCENT_IS_NOT_THE_HOOK = new Set([
  "Viral-01-Identity-Seven",
  "Viral-02-Curiosity-Hidden",
  "Viral-03-Contrarian-Eight",
  "Viral-04-Identity-One",
  "Viral-05-Curiosity-Three",
  "Viral-06-Contrarian-Nine",
  "Viral-07-Contrarian-Thirteen",
  "Viral-08-BestMatch-Four",
  "Viral-09-BestMatch-Four-EN",
  "Viral-10-SelfFriendly-Three",
  "Viral-11-BeliefCorrection-Two",
  "Viral-12-BeliefCorrection-Seven",
  "Viral-13-BeliefCorrection-One",
]);

const EXEMPT = new Set([...LEGACY_ACCENT_MISMATCH, ...ACCENT_IS_NOT_THE_HOOK]);

describe("cover accents", () => {
  const ids = Object.keys(VIRAL_TEMPLATES) as (keyof typeof VIRAL_TEMPLATES)[];

  test("every template has a cover", () => {
    for (const id of ids) expect(VIRAL_COVERS[id], `no cover for ${id}`).toBeDefined();
  });

  test.each(ids.filter((id) => !EXEMPT.has(id)))(
    "%s — cover accent equals the video's hookAccent",
    (id) => {
      expect(VIRAL_COVERS[id].accent).toBe(VIRAL_TEMPLATES[id].hookAccent);
    },
  );

  /**
   * ⭐ POSITIVE CONTROL. Without this, the test above would still pass if the
   * exemption sets ever swallowed every concept — a vacuous green. It asserts
   * the rule is actually being applied to something, and names the video that
   * introduced it.
   */
  test("the rule covers at least one real concept, and V38 is under it", () => {
    const enforced = ids.filter((id) => !EXEMPT.has(id));
    expect(enforced.length).toBeGreaterThan(0);
    expect(enforced).toContain("Viral-17-OneWayMatch-Six");
  });

  /**
   * ⭐ The legacy list is closed. If someone "fixes" a failing new cover by
   * adding it here, this fails and says so.
   */
  test("the legacy mismatch list is exactly the three published reels", () => {
    expect([...LEGACY_ACCENT_MISMATCH].sort()).toEqual([
      "Viral-14-OneWayMatch-Nine",
      "Viral-15-OneWayMatch-Eight",
      "Viral-16-OneWayMatch-Seven",
    ]);
  });

  /**
   * 🪤 And the legacy three really are mismatched — if a later commit repairs
   * them, this test fails and tells you to shrink the list rather than leaving
   * a stale exemption that would hide a fresh drift.
   */
  test.each([...LEGACY_ACCENT_MISMATCH])(
    "%s is still a known mismatch (shrink the list if this fails)",
    (id) => {
      const key = id as keyof typeof VIRAL_TEMPLATES;
      expect(VIRAL_COVERS[key].accent).not.toBe(VIRAL_TEMPLATES[key].hookAccent);
    },
  );
});
