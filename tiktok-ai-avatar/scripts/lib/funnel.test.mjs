import { describe, expect, test } from "vitest";

import {
  buildFunnelCta,
  buildQueue,
  hasFunnelCta,
  parseCommentIntent,
  reduceToMoolank,
} from "./funnel.mjs";

describe("reduceToMoolank", () => {
  test("reduces a double digit to a single", () => {
    expect(reduceToMoolank(29)).toBe(2);
    expect(reduceToMoolank(11)).toBe(2);
  });

  test("leaves a single digit alone", () => {
    expect(reduceToMoolank(7)).toBe(7);
  });
});

describe("parseCommentIntent", () => {
  test("reads a bare digit", () => {
    expect(parseCommentIntent("5")).toEqual({ kind: "moolank", moolank: 5 });
  });

  // The niche writes M5, and the 57.2K post required exactly that format so
  // the comments would be machine-parseable.
  test("reads the niche's M-prefixed form", () => {
    expect(parseCommentIntent("M5")).toEqual({ kind: "moolank", moolank: 5 });
  });

  test("reads a double digit and reduces it", () => {
    expect(parseCommentIntent("29")).toEqual({ kind: "moolank", moolank: 2 });
  });

  // 🪤🪤 THE CORRECTNESS TRAP. Moolank is the DAY reduced, so reading
  // 05/06/1990 as the 5th rather than the 6th is a coin flip on the answer.
  // When both leading fields are <= 12, nothing in the string resolves it. We
  // assume DD/MM and FLAG it -- the DM asks rather than asserts.
  test("flags an ambiguous numeric date instead of silently guessing", () => {
    expect(parseCommentIntent("05/06/1990")).toEqual({
      kind: "dob",
      moolank: 5,
      ambiguousDayMonth: true,
    });
  });

  test("a day above 12 is unambiguous", () => {
    expect(parseCommentIntent("24/11/1988")).toEqual({
      kind: "dob",
      moolank: 6,
      ambiguousDayMonth: false,
    });
  });

  test("reads a written-month date", () => {
    expect(parseCommentIntent("24 November 1988")).toEqual({
      kind: "dob",
      moolank: 6,
      ambiguousDayMonth: false,
    });
  });

  // ⭐ `irrelevant` -> send NOTHING is a first-class outcome, not a fallback.
  // Under the competitor post we studied, the single most-liked comment was a
  // sceptic mocking the account. DMing that person is the worst available move.
  test("classifies noise as irrelevant", () => {
    expect(parseCommentIntent("Test").kind).toBe("irrelevant");
    expect(parseCommentIntent("this is nonsense 😂").kind).toBe("irrelevant");
  });

  // 🔴 CRITICAL FIX: second > 12 PROVES MM/DD order. The parser must recognize
  // when the second field is too large to be a month, flipping the reading.
  test("recognizes MM/DD when second field exceeds 12", () => {
    // "12/13/1988" → Dec 13 → 1+3 = 4, not Dec 1 → 1+2 = 3
    expect(parseCommentIntent("12/13/1988")).toEqual({
      kind: "dob",
      moolank: 4,
      ambiguousDayMonth: false,
    });
    // "01/25/1990" → Jan 25 → 2+5 = 7, not Jan 1 → 1
    expect(parseCommentIntent("01/25/1990")).toEqual({
      kind: "dob",
      moolank: 7,
      ambiguousDayMonth: false,
    });
    // "6/25/1990" → Jun 25 → 2+5 = 7
    expect(parseCommentIntent("6/25/1990")).toEqual({
      kind: "dob",
      moolank: 7,
      ambiguousDayMonth: false,
    });
    // "11/13/1990" → Nov 13 → 1+3 = 4, not Nov 11 → 1+1 = 2
    expect(parseCommentIntent("11/13/1990")).toEqual({
      kind: "dob",
      moolank: 4,
      ambiguousDayMonth: false,
    });
  });

  // Guards the DD/MM direction — if only first > 12, it must be the day.
  test("guards DD/MM when first field exceeds 12", () => {
    expect(parseCommentIntent("24/11/1988")).toEqual({
      kind: "dob",
      moolank: 6,
      ambiguousDayMonth: false,
    });
  });

  // Guards the genuinely-ambiguous case — both <= 12, flag it.
  test("guards ambiguous dates when both fields are <= 12", () => {
    expect(parseCommentIntent("05/06/1990")).toEqual({
      kind: "dob",
      moolank: 5,
      ambiguousDayMonth: true,
    });
  });

  // 🔴 IMPORTANT: Range validation. A day must be 1–31, month 1–12.
  // Neither ordering yields a valid date → irrelevant.
  test("rejects dates where neither ordering is valid", () => {
    // "40/40/1990" — 40 is neither a valid day nor month in any order.
    expect(parseCommentIntent("40/40/1990").kind).toBe("irrelevant");
    // "24/13/1988" — 13 is not a month, and 24 is not a month either.
    expect(parseCommentIntent("24/13/1988").kind).toBe("irrelevant");
  });

  // 🔴 IMPORTANT: Moolank 0 does not exist. Days reduce to 1–9.
  // A bare 0 or M0 is a fabricated claim.
  test("rejects moolank 0 as irrelevant", () => {
    expect(parseCommentIntent("0")).toEqual({ kind: "irrelevant" });
    expect(parseCommentIntent("M0")).toEqual({ kind: "irrelevant" });
  });
});

describe("buildFunnelCta / hasFunnelCta", () => {
  test("the CTA names the parseable format and the payoff", () => {
    const cta = buildFunnelCta("your Moolank");

    expect(cta).toContain("M1");
    expect(cta).toContain("DM");
  });

  test("detects a caption that is missing the mechanic", () => {
    expect(hasFunnelCta("Screenshot the last frame and keep it.")).toBe(false);
    expect(hasFunnelCta(buildFunnelCta("your Moolank"))).toBe(true);
  });
});

describe("buildQueue", () => {
  const pairs = [
    { a: 1, b: 2 },
    { a: 1, b: 4 },
    { a: 2, b: 7 },
  ];

  test("produces a hand-fulfilment row per actionable comment", () => {
    const [row] = buildQueue(
      [{ comment_id: "c1", comment_text: "M1", username: "someone" }],
      pairs,
    );

    expect(row.moolank).toBe(1);
    expect(row.matches).toEqual([2, 4]);
    expect(row.reply).toContain("DM");
  });

  test("drops irrelevant comments entirely -- no row, nothing to send", () => {
    expect(buildQueue([{ comment_id: "c2", comment_text: "Test" }], pairs)).toEqual([]);
  });

  // ⚠️ Roughly two thirds of askers will not be on their own both-ways list
  // and must not read the DM as a refusal.
  test("every DM carries the 'ease, not permission' line", () => {
    const rows = buildQueue(
      [
        { comment_id: "c1", comment_text: "M1" },
        { comment_id: "c3", comment_text: "M7" },
      ],
      pairs,
    );

    for (const r of rows) expect(r.dm).toContain("ease, not permission");
  });

  test("an ambiguous date makes the DM ASK about day and month order", () => {
    const [row] = buildQueue([{ comment_id: "c4", comment_text: "05/06/1990" }], pairs);

    expect(row.dm).toContain("wrong way round");
  });
});
