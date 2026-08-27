import { describe, expect, it } from "vitest";
import { V43_SCENES } from "./v43-moolank-1";
import { V44_SCENES } from "./v44-name-number-1";
import { V45_SCENES } from "./v45-september-year-turn";
import { V46_SCENES } from "./v46-alphabet-no-nine";
import { V47_SCENES } from "./v47-first-letter";
import {
  V48_SCENES,
  V48_PAYOFF_INDEX,
  EXAMPLE_ROW,
  EXAMPLE_COL,
  KICKER,
} from "./v48-driver-conductor";
import { runKineticGates, totalFrames, sceneOffsets, FPS } from "./scenes";

const PRIOR = [
  { name: "V43", scenes: V43_SCENES },
  { name: "V44", scenes: V44_SCENES },
  { name: "V45", scenes: V45_SCENES },
  { name: "V46", scenes: V46_SCENES },
  { name: "V47", scenes: V47_SCENES },
];

const HOOK = V48_SCENES[0];
const PAYOFF = V48_SCENES[V48_PAYOFF_INDEX];
const CTA = V48_SCENES[V48_SCENES.length - 1];
const COPY = V48_SCENES.map((s) => `${s.headline ?? ""} ${s.sub ?? ""}`).join(" ");

/**
 * ⭐⭐⭐ RULE 1 — THE ARTEFACT IS ON SCREEN IN FRAME 0, AND IT IS THE WHOLE
 * POINT OF THIS CUT.
 *
 * Every faceless winner in the 2026-08-27 market scan puts a complete, copyable
 * artefact on screen immediately — a lookup table (3M views, 13.6K-sub channel),
 * an A–Z grid (1.3M), a two-step recipe (2.6M). Our format up to V47 put a
 * STATEMENT there, which is finished the moment it is read.
 */
describe("V48 — frame 0 carries the artefact, not a statement", () => {
  it("scene 0 carries a table", () => {
    expect(HOOK.table).toBeDefined();
  });

  it("the table is the full 9x9 — eighty-one boxes, not a sample of them", () => {
    const t = HOOK.table!;
    expect(t.rows).toHaveLength(9);
    expect(t.cols).toHaveLength(9);
    expect(t.cells.flat()).toHaveLength(81);
  });

  it("both axes are labelled in plain words, so the artefact is usable muted", () => {
    const t = HOOK.table!;
    expect(t.rowTitle).toBe("BIRTH DAY");
    expect(t.colTitle).toBe("WHOLE DATE");
  });

  /**
   * 🪤 THE POSITIVE CONTROL, AND THE REASON THIS PRIMITIVE HAD TO BE OPTIONAL.
   * If a prior cut ever grows a table, "no prior cut has one" has stopped being
   * the thing that makes frame 0 new — and, worse, V43 and V44 are the format's
   * controls and must keep rendering byte-for-byte as published.
   */
  it.each(PRIOR)("$name carries no table on any scene — the controls do not move", ({ scenes }) => {
    expect(scenes.filter((s) => s.table !== undefined)).toEqual([]);
  });
});

/**
 * ⭐⭐ RULE 2 — A CLAIM, NEVER A QUESTION.
 *
 * V47's measured curve: 44.9% lost inside second 1, then 60.1% OF THE SURVIVORS
 * inside second 2. "What is your first letter worth?" is answerable in the
 * viewer's head during second 1, so the loop CLOSES on schedule. A stated claim
 * cannot be resolved that way.
 */
describe("V48 — frame 0 states a claim", () => {
  it("the hook asks nothing", () => {
    expect(HOOK.headline).not.toContain("?");
  });

  /** 🪤 Positive control. The two cuts this rule was written against really did
   *  open on a question; if they stop, the assertion above is guarding nothing
   *  that ever happened. */
  it("V46 and V47 really did open on questions — the defect being guarded", () => {
    expect(V46_SCENES[0].headline).toContain("?");
    expect(V47_SCENES[0].headline).toContain("?");
  });

  it("addresses the viewer directly, the shape every best-holding opener has", () => {
    expect(HOOK.headline ?? "").toMatch(/\bYOUR?\b/i);
  });

  it.each(PRIOR)("does not reuse $name's hook headline", ({ scenes }) => {
    expect(HOOK.headline).not.toBe(scenes[0].headline);
  });

  /** ⭐ STANDING RULE: never reuse a published content IDEA, and it bites
   *  hardest on the ideas that worked. V44 and V46/V47 are all name/letter
   *  cuts; this one is the birth-date PAIR and must not drift back. */
  it("the hook is not another name-or-letter cut", () => {
    const h = (HOOK.headline ?? "").toUpperCase();
    for (const published of ["LETTER", "ALPHABET", "NAME", "MOOLANK"]) {
      expect(h).not.toContain(published);
    }
  });

  /**
   * 🔴 THE PALE-GROUND RULE, MEASURED OFF A REAL RENDER RATHER THAN REASONED.
   * Every scrim darkens DOWNWARD, so ink type on the dawn ground decays to
   * 1.4:1 against a 3.0:1 large-text floor. Cream on heavy is the safe pairing.
   * `dawn-a` is held because it is the only one of 13 grounds above mean luma
   * 40 (115.0 vs stone-a's 38.5) and a dark opener is the diagnosed 0–1s killer.
   */
  it("pairs the pale opening ground with a heavy scrim and light type", () => {
    const hex = (HOOK.fg ?? "").replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    expect(0.2126 * r + 0.7152 * g + 0.0722 * b).toBeGreaterThan(200);
    expect(HOOK.bg).toBe("dawn-a");
    expect(HOOK.scrim).toBe("heavy");
  });
});

/**
 * ⭐ RULE 3 — SOMETHING MUST PHYSICALLY MOVE THAT IS NOT TEXT.
 *
 * A card that animates only its own words has no visual proposition: the
 * sentence and the picture are the same object, so the viewer is waiting on
 * their own reading speed with nothing to look at. The escalation here is
 * ROW -> COLUMN -> the single CELL where they cross.
 * ⛔ Never a face — dead-tested at ~700 views against faceless winners at
 * 1,268–2,408. Nothing in this file may reintroduce one.
 */
describe("V48 — something that is not text moves, three times", () => {
  const lit = V48_SCENES.map((s) => s.table?.highlight).filter(Boolean);

  it("lights a whole row, then a whole column, then one cell", () => {
    expect(lit).toEqual([
      { row: EXAMPLE_ROW },
      { col: EXAMPLE_COL },
      { row: EXAMPLE_ROW, col: EXAMPLE_COL },
      { row: EXAMPLE_ROW, col: EXAMPLE_COL },
    ]);
  });

  /** 🪤 FRAME 0 IS THE POSTER FRAME AND THIS REPO HAS SHIPPED IT BLANK TWICE.
   *  Scene 0 renders static, so a highlight there would be a thing that never
   *  animates — and it would spend the payoff besides. */
  it("nothing on the poster frame is waiting to animate", () => {
    expect(HOOK.table?.highlight).toBeUndefined();
    expect(HOOK.push).toBeUndefined();
  });

  it("the first light lands after the hook, not during it", () => {
    const firstLitIndex = V48_SCENES.findIndex((s) => s.table?.highlight);
    expect(firstLitIndex).toBeGreaterThan(0);
  });
});

/**
 * ⭐ RULE 4 — THE CTA IS A SAVE, NOT A COMMENT.
 *
 * Comments are dead on this account: 35 across 61 posts, and **0 on 24 of the
 * last 25**, despite a comment CTA in nearly every caption. Saves-per-reach is
 * the one rising signal — 0.95% in the era when posts reached 1,500 people,
 * 1.29% now, while reach fell ~8x.
 *
 * ⛔ RULE 5 — NO PRICE. The two posts that named ₹354 are the two lowest-reach
 * posts in the entire 61-post window (111 and 151).
 */
describe("V48 — the CTA asks for a save", () => {
  const ctaText = `${CTA.headline ?? ""} ${CTA.sub ?? ""}`;

  it("asks for a screenshot", () => {
    expect(ctaText).toMatch(/screenshot|save/i);
  });

  it("asks for no comment", () => {
    expect(ctaText).not.toMatch(/comment|drop your|type your|dm me/i);
  });

  /** 🪤 A save needs something to save. Asking for a screenshot of an artefact
   *  that has left the frame is a CTA for a blank screen. */
  it("still has the artefact on screen to be saved", () => {
    expect(CTA.table).toBeDefined();
    expect(CTA.table?.highlight).toEqual({ row: EXAMPLE_ROW, col: EXAMPLE_COL });
  });

  it("points at the profile, never a bare URL a muted viewer cannot click", () => {
    expect(ctaText).toContain("@numevix");
    expect(ctaText).not.toMatch(/numevix\.com/);
  });

  it("names no price anywhere in the cut", () => {
    expect(COPY).not.toMatch(/[₹$]\s?\d|\b\d+\s?(rs|inr|usd)\b/i);
  });
});

/**
 * ⛔⛔ NOTHING ON SCREEN IS INVENTED, AND THIS RECOMPUTES IT RATHER THAN
 * TRUSTING THE FILE.
 *
 * Both numbers come from `vedic-numerology/modules/numerology-engine/core.ts`:
 * the birth-day number reduces the DAY, the whole-date number sums every digit
 * of day, month and year and reduces. The example is 23 April 1990.
 *
 * 🪤 A copy edit that changed the date on screen and left `EXAMPLE_ROW` alone
 * would light the wrong cell in the payoff while every other test stayed green.
 * So the indices are DERIVED here, not asserted as literals.
 */
describe("V48 — every number on screen follows from the engine", () => {
  const reduceToSingleDigit = (n: number): number => {
    let x = Math.abs(Math.trunc(n));
    while (x > 9) x = String(x).split("").reduce((a, d) => a + Number(d), 0);
    return x;
  };
  const digitsOf = (n: number) => String(Math.abs(Math.trunc(n))).split("").map(Number);
  const compound = (d: number, m: number, y: number) =>
    [d, m, y].flatMap(digitsOf).reduce((a, x) => a + x, 0);

  /** The date the cut actually puts on screen, read back out of scene 3. */
  const dateScene = V48_SCENES.find((s) => /\d{4}/.test(s.headline ?? ""))!;
  const [day, month, year] = (dateScene.headline ?? "").split("·").map((p) => Number(p.trim()));

  it("scene 3 really does carry a parseable date", () => {
    expect([day, month, year]).toEqual([23, 4, 1990]);
  });

  it("the lit ROW is the birth-day number, derived not asserted", () => {
    expect(reduceToSingleDigit(day)).toBe(5);
    expect(EXAMPLE_ROW).toBe(reduceToSingleDigit(day) - 1);
  });

  it("the lit COLUMN is the whole-date number, derived not asserted", () => {
    expect(compound(day, month, year)).toBe(28);
    expect(reduceToSingleDigit(compound(day, month, year))).toBe(1);
    expect(EXAMPLE_COL).toBe(reduceToSingleDigit(compound(day, month, year)) - 1);
  });

  /** The worked arithmetic on screen must be the arithmetic, digit for digit —
   *  the copyable procedure is the whole value of that scene. */
  it("scene 3's addends are exactly the digits of the date, and they sum to 28", () => {
    const addends = (dateScene.sub ?? "").split("·")[0].split("=")[0].split("+").map((x) => Number(x.trim()));
    expect(addends).toEqual([2, 3, 4, 1, 9, 9, 0]);
    expect(addends.reduce((a, b) => a + b, 0)).toBe(28);
  });

  it("the day-reduction shown in scene 1 is the day's own digits", () => {
    const s1 = V48_SCENES[1].sub ?? "";
    expect(s1).toContain("23rd");
    expect(s1).toContain(`${digitsOf(day)[0]} + ${digitsOf(day)[1]} = ${reduceToSingleDigit(day)}`);
  });

  /** ⭐ 81 is not a slogan. `driver-conductor-combos.ts` holds exactly 81
   *  entries, every (1..9)x(1..9) pair once, each with written interpretation —
   *  the only category in the knowledge base with prose behind it. */
  it("eighty-one is the size of the grid, and the grid is the size of the claim", () => {
    expect(PAYOFF.table!.rows.length * PAYOFF.table!.cols.length).toBe(81);
    expect(PAYOFF.headline?.toUpperCase()).toContain("EIGHTY-ONE");
  });

  /** ⛔ V43 put "4 NUMBERS" on screen in a video whose answer was 1, 2, 4 and 7
   *  and handed the viewer a wrong answer. Here the row and column ARE
   *  numerals, so the count may not be one. */
  it("the count is spelled, never set as a numeral beside the coordinates", () => {
    expect(PAYOFF.headline).not.toMatch(/\b81\b/);
    expect(`${PAYOFF.headline} ${PAYOFF.sub}`).not.toMatch(/\b9\s*(x|×)\s*9\b/i);
  });

  it("the lit cell is labelled with the pair the arithmetic produced", () => {
    expect(PAYOFF.table!.cells[EXAMPLE_ROW][EXAMPLE_COL]).toBe(
      `${reduceToSingleDigit(day)}·${reduceToSingleDigit(compound(day, month, year))}`,
    );
  });

  /** 🪤 The answer may not be sitting in frame 0. Every other cell is the inert
   *  mark, and the hook's grid carries no pair at all. */
  it("the pair is nowhere on the poster frame", () => {
    expect(new Set(HOOK.table!.cells.flat())).toEqual(new Set(["·"]));
    expect(`${HOOK.headline} ${HOOK.kicker}`.toUpperCase()).not.toContain("EIGHTY-ONE");
  });
});

/**
 * ⛔⛔ THE TWO THINGS THAT WERE CHECKED IN THE KNOWLEDGE BASE AND REFUSED.
 * `rulesets/v1.ts` has `planes: []` — plane data is deliberately empty, so any
 * "an empty row of the grid means X" line is unsupported. And the 18 named
 * arrow rules in `arrows.ts` have patterns but no interpretation text anywhere,
 * and 0 knowledge rows tagged with them — writing their meanings would be
 * inventing numerology. Neither may drift into the copy.
 */
describe("V48 — nothing unsourced, no jargon, and never the wrong terminology", () => {
  const upper = COPY.toUpperCase();

  it("claims nothing about planes or arrows", () => {
    for (const unsourced of ["PLANE", "ARROW", "EMPTY ROW", "EMPTY COLUMN", "BANDHAN"]) {
      expect(upper).not.toContain(unsourced);
    }
  });

  /** ⭐ STANDING RULE: the Vedic grid, never "Lo Shu". */
  it("never says Lo Shu", () => {
    expect(upper).not.toContain("LO SHU");
    expect(upper).not.toContain("LOSHU");
  });

  /** Plain language — no word the viewer must already know. "Driver" and
   *  "conductor" are the engine's names for these two numbers and neither
   *  appears on screen; "birth day" and "whole date" do. */
  it("carries no jargon on screen", () => {
    for (const w of ["DRIVER", "CONDUCTOR", "MULANK", "MOOLANK", "CHALDEAN", "DESTINY NUMBER", "MAHADASHA"]) {
      expect(upper).not.toContain(w);
    }
    expect(upper).toContain("BIRTH DAY");
  });

  /** ⭐ English everywhere — Hinglish is off, and no Hinglish cut was ever
   *  published. Latin letters, digits and the punctuation the format uses. */
  it("is English only", () => {
    expect(COPY).toMatch(/^[\x20-\x7E·—–?]*$/);
  });

  it("keeps the chip plain, and holds it", () => {
    expect(KICKER).toBe("VEDIC NUMEROLOGY");
    expect(HOOK.kicker).toBe(KICKER);
  });
});

/**
 * ⚠️ WOUND, NOT ACCUSATION — standing rule. The cut may name the ache; it may
 * not tell the viewer they got it wrong, and it may not predict an outcome.
 * The 81 combination readings in the knowledge base are full of outcome
 * language ("they will be very successful", "it is a bad combination"); none of
 * it is on screen, and this is what keeps it off.
 */
describe("V48 — the gap is placed on what the viewer was shown, never on the viewer", () => {
  it("names the withholding without blaming anyone", () => {
    expect(COPY).toContain("the half nobody shows you");
  });

  it("never puts the error on the viewer", () => {
    expect(COPY).not.toMatch(/your fault|you failed|you were wrong|you got it wrong|wrong number/i);
  });

  it("predicts no outcome", () => {
    expect(COPY).not.toMatch(/you will|will bring|guarantee|lucky|success|money|marriage/i);
  });
});

describe("V48 — structure", () => {
  it("passes every kinetic gate", () => {
    const failed = runKineticGates(V48_SCENES, V48_PAYOFF_INDEX).filter((g) => !g.ok);
    expect(failed.map((g) => `${g.name}${g.detail ? ` — ${g.detail}` : ""}`)).toEqual([]);
  });

  it("closes the loop after the 6.4s distribution gate, inside the back half", () => {
    const startS = sceneOffsets(V48_SCENES)[V48_PAYOFF_INDEX] / FPS;
    const totalS = totalFrames(V48_SCENES) / FPS;
    expect(startS).toBeGreaterThanOrEqual(6.4);
    expect(startS / totalS).toBeLessThan(0.78);
  });

  /** ⭐ Short on purpose. V45 ran 22.656s with its payoff at 17.6s, where
   *  measured retention is 4%. This runs the length V46/V47 established. */
  it("keeps the short runtime the run moved to", () => {
    expect(totalFrames(V48_SCENES)).toBe(totalFrames(V47_SCENES));
    expect(totalFrames(V48_SCENES) / FPS).toBeCloseTo(12.3, 3);
  });

  /** The gate V46 removed and every cut since has held removed: 34 of the last
   *  38 posts opened on a date filter that disqualifies ~8 of 9 viewers. */
  it("the hook contains no birthdate filter", () => {
    const opening = `${HOOK.headline ?? ""} ${HOOK.kicker ?? ""}`.toUpperCase();
    expect(opening).not.toMatch(/BORN/);
    expect(opening).not.toMatch(/\d+(ST|ND|RD|TH)\b/);
  });
});
