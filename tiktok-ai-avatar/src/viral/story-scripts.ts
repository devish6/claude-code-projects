import type { StoryBeat } from "./StoryVideo";

/**
 * Story Friday scripts.
 *
 * 🔴 EVERY BEAT MUST TRACE TO THE RULESET. These are not written to be
 * dramatic and then checked; the drama comes from a rule the engine already
 * enforces. The 1·1 script below is a direct reading of
 * `modules/numerology-engine/polarity.ts` in the app repo:
 *
 *     1 : single      -> positive
 *         repeated    -> positive ONLY IF the Conductor is 1
 *
 * That is a genuine reversal — repeated 1s are a negative in almost every
 * chart, and a Conductor of 1 is the one thing that redeems them. It is also
 * why this combination was the right place to start: the turn is real.
 *
 * ⚠️ WHAT THESE MAY NOT SAY. The beats describe the SHAPE of a combination,
 * never a forecast. "This drive has nowhere to land" is a description of a
 * chart. "You will become wealthy" is an outcome claim — and a financial one —
 * which the engine does not support and /tarot's own framing rules out.
 */
export type StoryScript = {
  id: string;
  driver: number;
  conductor: number;
  title: string;
  beats: StoryBeat[];
  ctaText: string;
  tiktokCaption: string;
  instagramCaption: string;
  hashtags: string[];
};

export const STORY_SCRIPTS: Record<string, StoryScript> = {
  "1-1": {
    id: "1-1",
    driver: 1,
    conductor: 1,
    title: "When Your Number Repeats",
    beats: [
      {
        // SETUP — names the combination so the right viewer self-selects.
        text: "Born a 1. And your destiny number is a 1 too.",
        posture: "driven",
        progress: 0.2,
      },
      {
        // COMPLICATION — the cost. True of repeated 1s generally.
        text: "A repeated number usually works against you. Twice the drive, nothing to balance it.",
        posture: "burdened",
        progress: 0.35,
        ghost: true,
      },
      {
        // TURN — the actual rule, and the one beat rendered in accent.
        text: "Except for a 1. A repeated 1 only settles when the destiny number is a 1 as well.",
        posture: "burdened",
        progress: 0.5,
      },
      {
        // RESOLUTION — what the combination becomes. Still a description.
        text: "Then the doubling stops being noise. The drive finally has somewhere to point.",
        posture: "driven",
        progress: 0.72,
      },
      {
        text: "The Sun, twice over — leading because there was never anyone else to follow.",
        posture: "open",
        progress: 0.86,
      },
    ],
    ctaText: "Comment your birth date 👇",
    tiktokCaption:
      "Born a 1 with a 1 destiny? A repeated number usually works against you — 1 is the exception. Comment your birth date 👇",
    instagramCaption:
      "In almost every chart a repeated number is a problem: twice the same energy, nothing to balance it. The 1 is the exception — a repeated 1 only settles when the destiny number is a 1 as well. Then the doubling stops being noise and the drive has somewhere to point. Comment your birth date below and I'll tell you if yours repeats 👇",
    hashtags: ["#numerology", "#vedicnumerology", "#moolank1", "#birthnumber"],
  },
};

export const storyScript = (id: string): StoryScript => {
  const s = STORY_SCRIPTS[id];
  if (!s) throw new Error(`No story script "${id}". Have: ${Object.keys(STORY_SCRIPTS).join(", ")}`);
  return s;
};
