/**
 * "Read from a birthday" — the first talking-head cut in the system.
 *
 * Source: six sequential clips (M1–M6) filmed 2026-07-28, 3840x2160@60fps with
 * rotation=-90 metadata, transcoded to 1080x1920@30fps in public/talking/.
 * That folder is GITIGNORED on purpose: this repo is public and Pages-served,
 * so raw footage of a person must never be committed.
 *
 * ⭐ THE FRAMING CONSTRAINT THAT SHAPES THIS WHOLE COMPOSITION.
 * The brief assumed 35–40% of open frame above the speaker's head. Measured on
 * a 10% grid, the actual headroom is 2% (M1, M5) to 17% (M2) — on two clips the
 * hair is already cropped at the top edge, and the source is natively 9:16 so
 * there is no hidden headroom to pan up into. Overlays placed in the top 35%
 * would sit on the speaker's forehead in four of six clips.
 * The fix: push the video down by VIDEO_OFFSET onto a deep-ink ground carrying
 * the graphics, then draw an ink→transparent wash back OVER the top of the
 * footage so the two never meet at a visible line. The offset is CONSTANT, so
 * the ground reads as a fixed element rather than jumping between cuts.
 *
 * Timings come from faster-whisper word timestamps. Four mishearings are
 * corrected in WORDS below and must stay corrected: "life fat number" → life
 * path, "NumMix" → Numevix, "numvix.com" → numevix.com, "End your name" →
 * Enter. A trailing "Goodbye" at 6.72s of M6 is dropped.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * How far the footage is pushed down.
 *
 * This started at 850 to fit a website card into the top shelf, which cropped
 * far too much off the bottom of the frame — the speaker's chin was leaving the
 * picture. The card moved to a lower inset (see SEGMENTS.shot) and the shelf is
 * now translucent over a blurred copy of the footage, so the offset only has to
 * clear the TEXT stack, which ends at ~370. The tightest heads (M1, M5) sit 38px
 * down in source, putting them at 508 — clear by 138px. Re-measure the footage
 * before reducing this further.
 */
export const VIDEO_OFFSET = 470;
/** Translucent shelf reaches this far down, fading to nothing. */
export const SHELF_H = 900;
/** Frames of cross-dissolve between consecutive clips. */
export const XFADE = 9;

/** Safe zone from the brief — nothing may cross these. */
export const SAFE_TOP = 150;
export const SAFE_BOTTOM = 170;
export const SAFE_SIDE = 60;

export type Clip = {
  src: string;
  /** Frames trimmed off the head of the source file. */
  trimFrom: number;
  /** Frames used from this clip. */
  duration: number;
  /** Where the clip starts on the master timeline. */
  offset: number;
};

/**
 * Trims remove dead air, the 2.5s of empty room before the speaker walks into
 * M3, and the stray "Goodbye" on M6. 32.47s of source → 25.63s of cut.
 */
export const CLIPS: Clip[] = [
  { src: "talking/M1.mp4", trimFrom: 6, duration: 76, offset: 0 },
  { src: "talking/M2.mp4", trimFrom: 0, duration: 54, offset: 76 },
  { src: "talking/M3.mp4", trimFrom: 75, duration: 198, offset: 130 },
  { src: "talking/M4.mp4", trimFrom: 0, duration: 114, offset: 328 },
  { src: "talking/M5.mp4", trimFrom: 0, duration: 134, offset: 442 },
  { src: "talking/M6.mp4", trimFrom: 0, duration: 193, offset: 576 },
];

export const TOTAL_FRAMES = 769;

export type Segment = {
  step: string;
  headline: string;
  /** Sub-points shown as a keyword row under the headline; first is accented. */
  keywords: string[];
  /** Live-site screenshot shown in the card slot (public/site/*.png). */
  shot: "home" | "birth-number";
  from: number;
  duration: number;
};

/** Five topic beats. M1+M2 are one hook, so six clips map to five overlays. */
export const SEGMENTS: Segment[] = [
  { step: "01", headline: "A birthday is enough", keywords: ["Date of birth", "That's it"], shot: "home", from: 0, duration: 130 },
  { step: "02", headline: "Your life path number", keywords: ["Traits", "Challenges", "Strengths"], shot: "birth-number", from: 130, duration: 198 },
  { step: "03", headline: "Centuries of pattern", keywords: ["Studied", "Not guesswork"], shot: "birth-number", from: 328, duration: 114 },
  { step: "04", headline: "Your chart in seconds", keywords: ["Your own chart", "In seconds"], shot: "home", from: 442, duration: 134 },
  { step: "05", headline: "numevix.com", keywords: ["Name", "Birthday", "Your numbers"], shot: "home", from: 576, duration: 193 },
];

export type Word = { t: string; s: number; e: number };

/** Word-level captions, frame-based, with the four transcript fixes applied. */
export const WORDS: Word[] = [
  { t: "I", s: 5, e: 16 },
  { t: "can", s: 16, e: 19 },
  { t: "tell", s: 19, e: 24 },
  { t: "you", s: 24, e: 27 },
  { t: "more", s: 27, e: 32 },
  { t: "about", s: 32, e: 37 },
  { t: "yourself", s: 37, e: 46 },
  { t: "by", s: 46, e: 54 },
  { t: "just", s: 54, e: 58 },
  { t: "a", s: 58, e: 62 },
  { t: "birthday.", s: 62, e: 70 },
  { t: "And", s: 76, e: 96 },
  { t: "I", s: 96, e: 99 },
  { t: "don't", s: 99, e: 104 },
  { t: "know", s: 104, e: 108 },
  { t: "your", s: 108, e: 116 },
  { t: "name.", s: 116, e: 123 },
  { t: "Your", s: 136, e: 155 },
  { t: "birthday", s: 155, e: 165 },
  { t: "can", s: 165, e: 174 },
  { t: "reveal", s: 174, e: 186 },
  { t: "your", s: 186, e: 198 },
  { t: "life", s: 198, e: 205 },
  { t: "path", s: 205, e: 211 },
  { t: "number,", s: 211, e: 220 },
  { t: "your", s: 232, e: 234 },
  { t: "traits,", s: 234, e: 248 },
  { t: "your", s: 272, e: 274 },
  { t: "challenges,", s: 274, e: 287 },
  { t: "and", s: 297, e: 305 },
  { t: "your", s: 305, e: 309 },
  { t: "strengths.", s: 309, e: 317 },
  { t: "For", s: 328, e: 351 },
  { t: "centuries,", s: 351, e: 362 },
  { t: "numerologists", s: 371, e: 389 },
  { t: "have", s: 389, e: 403 },
  { t: "studied", s: 403, e: 413 },
  { t: "these", s: 413, e: 422 },
  { t: "patterns.", s: 422, e: 433 },
  { t: "Now", s: 442, e: 464 },
  { t: "Numevix", s: 464, e: 477 },
  { t: "lets", s: 477, e: 486 },
  { t: "you", s: 486, e: 491 },
  { t: "discover", s: 491, e: 502 },
  { t: "your", s: 502, e: 509 },
  { t: "own", s: 509, e: 518 },
  { t: "chart", s: 518, e: 527 },
  { t: "and", s: 527, e: 537 },
  { t: "numerology", s: 537, e: 552 },
  { t: "in", s: 552, e: 558 },
  { t: "seconds.", s: 558, e: 566 },
  { t: "So", s: 576, e: 592 },
  { t: "what", s: 592, e: 596 },
  { t: "are", s: 596, e: 598 },
  { t: "you", s: 598, e: 601 },
  { t: "waiting", s: 601, e: 608 },
  { t: "for?", s: 608, e: 619 },
  { t: "Enter", s: 628, e: 640 },
  { t: "your", s: 640, e: 644 },
  { t: "name", s: 644, e: 656 },
  { t: "and", s: 656, e: 661 },
  { t: "your", s: 661, e: 664 },
  { t: "birthday", s: 664, e: 674 },
  { t: "at", s: 674, e: 691 },
  { t: "numevix.com", s: 691, e: 704 },
  { t: "and", s: 717, e: 728 },
  { t: "see", s: 728, e: 733 },
  { t: "what", s: 733, e: 739 },
  { t: "your", s: 739, e: 742 },
  { t: "numbers", s: 742, e: 749 },
  { t: "reveal.", s: 749, e: 760 }
];
