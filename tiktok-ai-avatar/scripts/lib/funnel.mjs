/**
 * The comment-to-DM funnel — the mechanic, not the hook.
 *
 * ⭐⭐⭐ WHAT seb.ai ACTUALLY BUILT. The carousel that prompted this whole
 * workstream ("7 AI employees, one creator") took 3.2K likes and **6.4K
 * comments**, every one of them the word "Team", each with an auto-reply. The
 * 7 agents were the CONTENT of the post; the funnel was the engine. Same shape
 * on the 57.2K compatibility post: 2,953 comments against 673 likes, a 4.4:1
 * ratio that does not happen organically.
 *
 * ⭐⭐ This is the direct fix for our 0.0% comment rate — which is real, not a
 * measurement artefact. We have been treating it as a copy problem; it is a
 * mechanism problem. Ours asks for a comment and offers nothing back.
 *
 * 🔴 STATUS: Meta App Review was submitted 2026-08-08 and takes up to 20 days.
 * Until it lands, this module builds a queue the OWNER fulfils by hand. That
 * is the plan of record, not a stopgap.
 */

/** A moolank is a single digit: reduce until it is one. */
export const reduceToMoolank = (n) => {
  let x = Math.abs(Math.trunc(n));
  while (x > 9) x = String(x).split("").reduce((t, d) => t + Number(d), 0);
  return x;
};

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Classification is a small CLOSED problem — a number, a date, a pair, or
 * noise — so it is a deterministic parser rather than a model call. It can be
 * exhaustively tested where a model call cannot, and it is instant and free.
 */
export const parseCommentIntent = (text) => {
  const s = String(text ?? "").trim();
  if (!s) return { kind: "irrelevant" };

  // ISO first: 1988-11-24. Unambiguous by construction.
  const iso = s.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    const day = Number(iso[3]);
    const month = Number(iso[2]);
    // Range validation: month 1-12, day 1-31.
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { kind: "dob", moolank: reduceToMoolank(day), ambiguousDayMonth: false };
    }
    return { kind: "irrelevant" };
  }

  // Written month: 24 November 1988 / November 24 1988.
  const written = s.toLowerCase().match(/\b(\d{1,2})\s+([a-z]+)\b|\b([a-z]+)\s+(\d{1,2})\b/);
  if (written) {
    const monthWord = (written[2] ?? written[3] ?? "").toLowerCase();
    const day = Number(written[1] ?? written[4]);
    if (MONTHS.some((m) => m.startsWith(monthWord.slice(0, 3)) && monthWord.length >= 3)) {
      // 🔴 Range validation, same as the ISO and numeric branches. Without it
      // "0 November" answered with "Your Moolank is 0" and "45 November" with 9
      // — a fabricated number sent to a real stranger about themselves. The
      // month word is already proven; only the day can be out of range.
      // A day of 1-31 always reduces to 1-9, so the moolank check is a belt to
      // the range braces, never a second reading of the same failure.
      const moolank = reduceToMoolank(day);
      if (day >= 1 && day <= 31 && moolank !== 0) {
        return { kind: "dob", moolank, ambiguousDayMonth: false };
      }
      return { kind: "irrelevant" };
    }
  }

  // Numeric date: 24/11/1988 or 05/06/1990.
  const numeric = s.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/);
  if (numeric) {
    const firstVal = Number(numeric[1]);
    const secondVal = Number(numeric[2]);

    // Three mutually exclusive cases, explicitly handled and symmetrical:
    // 1. first > 12 (and second is a valid month) → DD/MM, not ambiguous.
    if (firstVal > 12 && secondVal >= 1 && secondVal <= 12) {
      return {
        kind: "dob",
        moolank: reduceToMoolank(firstVal),
        ambiguousDayMonth: false,
      };
    }
    // 2. second > 12 (and first is a valid month) → MM/DD, not ambiguous,
    //    but the day is second, not first.
    if (secondVal > 12 && firstVal >= 1 && firstVal <= 12) {
      return {
        kind: "dob",
        moolank: reduceToMoolank(secondVal),
        ambiguousDayMonth: false,
      };
    }
    // 3. Both <= 12 (and valid as day/month) → genuinely unresolvable.
    //    🪤 DD/MM assumed (the audience skews India and the niche writes DD/MM),
    //    and FLAGGED when nothing in the string can resolve it. Never remove the
    //    flag to tidy the copy — it is a coin flip on the answer.
    if (firstVal >= 1 && firstVal <= 31 && secondVal >= 1 && secondVal <= 12) {
      return {
        kind: "dob",
        moolank: reduceToMoolank(firstVal),
        ambiguousDayMonth: firstVal <= 12 && secondVal <= 12,
      };
    }
    // No valid reading in either direction.
    return { kind: "irrelevant" };
  }

  // A pair: "5 and 7".
  //
  // ⭐ Classified, deliberately NOT auto-answered — see buildQueue. Someone
  // naming two numbers is asking about two people, and nothing in the string
  // says which one is theirs. The copy for that case is a content decision the
  // owner has not made yet, so the queue skips these rather than guessing.
  const pair = s.match(/\b(\d{1,2})\s*(?:and|&|\+)\s*(\d{1,2})\b/i);
  if (pair) {
    return {
      kind: "pair",
      moolank: reduceToMoolank(Number(pair[1])),
      partner: reduceToMoolank(Number(pair[2])),
    };
  }

  // A bare number, or the niche's M-prefixed form.
  const bare = s.match(/^m?\s*(\d{1,2})$/i);
  if (bare) {
    const moolank = reduceToMoolank(Number(bare[1]));
    // A day always reduces to 1–9; 0 is not in the system.
    if (moolank === 0) return { kind: "irrelevant" };
    return { kind: "moolank", moolank };
  }

  return { kind: "irrelevant" };
};

/**
 * The caption mechanic. Four things at once: forces a comment in a PARSEABLE
 * format, requires a follow, and delivers the payoff in DM — a private channel
 * opened by someone who has just volunteered their birth number.
 */
export const buildFunnelCta = (token) =>
  `Want to know yours? Follow the page + comment ${token} (M1 / M2 / M3…) below ` +
  `and I'll send your best match in a DM 💗 Only comments in that format will get a reply.`;

export const hasFunnelCta = (caption) =>
  /M1\s*\/\s*M2/.test(String(caption ?? "")) && /\bDM\b/.test(String(caption ?? ""));

/** ⚠️ On every branch. Two thirds of askers will not be on their own list. */
const EASE_LINE = "This is about ease, not permission — a pair that isn't listed isn't a no.";

const matchesFor = (moolank, pairs) =>
  (pairs ?? [])
    .filter((p) => p.a === moolank || p.b === moolank)
    .map((p) => (p.a === moolank ? p.b : p.a))
    .sort((x, y) => x - y);

export const buildQueue = (comments, pairs) =>
  (comments ?? [])
    .map((c) => {
      const intent = parseCommentIntent(c.comment_text);
      // ⭐ Sending NOTHING is a first-class outcome. Under the competitor post
      // we studied, the most-liked comment was a sceptic mocking the account.
      //
      // 🔴 A `pair` is skipped for the same reason, not because it is noise.
      // "5 and 7" is a question about two people; answering it produced "Your
      // Moolank is 5." — asserting as fact a number the commenter never
      // claimed was theirs. Recognised, queued to nobody, pending owner copy.
      if (intent.kind === "irrelevant" || intent.kind === "pair") return null;

      const matches = matchesFor(intent.moolank, pairs);
      const dm = [
        `Your Moolank is ${intent.moolank}.`,
        matches.length
          ? `Both-ways best matches: ${matches.join(", ")}.`
          : `You're a rarer one — no both-ways match on this list.`,
        // 🪤 ASKS, never asserts. Nothing in the string can resolve the order,
        // so the copy must not pretend otherwise.
        intent.ambiguousDayMonth
          ? "One check — I read the first number as the day. Tell me if I've got the day and month the wrong way round."
          : null,
        EASE_LINE,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        commentId: c.comment_id,
        username: c.username ?? null,
        intent: intent.kind,
        moolank: intent.moolank,
        matches,
        // ⭐⭐ The public reply is LOAD-BEARING, not a nudge: a non-follower's
        // DM lands in Message Requests, not the Inbox, so without it they may
        // never see the message.
        reply: "Sent you a DM 💗",
        dm,
      };
    })
    .filter(Boolean);
