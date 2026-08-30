import { describe, it, expect } from "vitest";
import reel from "../../content/compatibility-reel.json";
import { assertRenderable, planViralVideo } from "./plan";
import { MARRIAGE_NOT_THE_LOVE } from "./templates";
import { MUSIC } from "../lib/brand";

/**
 * V51's guards. The point of every test here is that it FAILS when the thing it
 * describes stops being true — a guard that cannot fail has shipped in this
 * codebase five times.
 */

/** Lowercase, strip punctuation and collapse spaces, so casing and a trailing
 *  period do not count as drift but a REWORDING does. */
const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** The claim half of a bullet — everything after the "2 and 7 — " prefix. */
const claimOf = (trait: string) => {
  const i = trait.indexOf("\u2014");
  return i === -1 ? trait : trait.slice(i + 1);
};

const pair = (a: number, b: number) =>
  (reel.pairs as { a: number; b: number; why: string }[]).find(
    (p) => (p.a === a && p.b === b) || (p.a === b && p.b === a),
  );

describe("V51 — marriage, wound hook + positive payoff", () => {
  it("renders: passes every structural gate", () => {
    expect(() => assertRenderable("MARRIAGE_NOT_THE_LOVE", MARRIAGE_NOT_THE_LOVE)).not.toThrow();
  });

  it("gives every value scene a trait — no blank scene (the V33 bug)", () => {
    const { scenes } = planViralVideo(MARRIAGE_NOT_THE_LOVE);
    expect(scenes.pairs.length).toBe(MARRIAGE_NOT_THE_LOVE.traits.length);
    expect(scenes.pairs.length).toBe(4);
  });

  it("is 430 frames / 14.333s — fast, and a duration this account has not shipped", () => {
    const { acts } = planViralVideo(MARRIAGE_NOT_THE_LOVE);
    expect(acts.total).toBe(430);
    // The two durations duplicate-detection has already flagged or used.
    expect(acts.total).not.toBe(Math.round(17.450667 * 30));
    expect(acts.total).not.toBe(696); // V33/V34's 23.198s
  });

  it("uses the bed from the reel the owner pointed at", () => {
    expect(MARRIAGE_NOT_THE_LOVE.music).toBe(MUSIC.starlightV03);
  });

  // ── The derivation guard. If someone rewords a pair in the JSON, or edits a
  // bullet by hand, these fail rather than letting an UNDERIVED numerological
  // claim reach a viewer.
  // ⭐ DIRECTION MATTERS. The risk is a bullet SAYING SOMETHING THE SOURCE DOES
  // NOT — not a bullet that shortens it. So the source must contain the bullet,
  // never the reverse. (Asserted the reverse first; it failed, correctly, because
  // pair 2&7's `why` carries a second clause the bullet has no room for.)
  it("beat 1 says nothing pair 3&6 does not say", () => {
    const why = pair(3, 6)?.why;
    expect(why).toBeTruthy();
    expect(norm(why!)).toContain(norm(claimOf(MARRIAGE_NOT_THE_LOVE.traits[0])));
  });

  it("beat 2 says nothing pair 6&9 does not say", () => {
    const why = pair(6, 9)?.why;
    expect(why).toBeTruthy();
    expect(norm(why!)).toContain(norm(claimOf(MARRIAGE_NOT_THE_LOVE.traits[1])));
  });

  it("that derivation guard can actually fail", () => {
    // Positive control: an ADDED claim must break it, or the two tests above
    // are decoration.
    const invented = " each keeps the other honest about money";
    expect(norm(pair(6, 9)!.why)).not.toContain(norm(invented));
  });

  it("names ONLY 6's real mutual partners — no invented pair reaches a viewer", () => {
    const mutual = (reel.pairs as { a: number; b: number }[])
      .filter((p) => p.a === 6 || p.b === 6)
      .map((p) => (p.a === 6 ? p.b : p.a))
      .sort();
    expect(mutual).toEqual([3, 9]);
    // A positive control: the label must name them, so a silent renumbering fails.
    for (const n of mutual) expect(MARRIAGE_NOT_THE_LOVE.numberLabel).toContain(String(n));
    // And must NOT name a number that is not a mutual partner of 2.
    for (const n of [1, 2, 4, 5, 7, 8]) {
      expect(MARRIAGE_NOT_THE_LOVE.numberLabel).not.toContain(String(n));
    }
  });

  it("keeps the EASE LINE last, verbatim — without it the video is a verdict", () => {
    const traits = MARRIAGE_NOT_THE_LOVE.traits;
    expect(traits[traits.length - 1]).toBe(reel.closing.line);
  });

  // ── The payoff must stay POSITIVE. The conflict frame measured an order of
  // magnitude worse and leaves a verdict on a reader whose marriage is struggling.
  it("never delivers a clash verdict", () => {
    const body = MARRIAGE_NOT_THE_LOVE.traits.join(" ").toLowerCase();
    for (const word of ["clash", "toxic", "worst", "avoid", "incompatible", "never work", "doomed"]) {
      expect(body).not.toContain(word);
    }
    // Positive control: the guard above is vacuous unless it can fail, so prove
    // the same check DOES fire on a clash line.
    const hostile = "moolank 1 and 8 are toxic together".toLowerCase();
    expect(hostile).toContain("toxic");
  });

  it("draws no arrow in the CTA copy — CTAEnding draws its own", () => {
    expect(MARRIAGE_NOT_THE_LOVE.ctaText).not.toMatch(/[👇👉]/u);
  });
});
