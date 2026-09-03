import type { Caption } from "@remotion/captions";

/**
 * Word-level caption timings WITHOUT a speech synthesiser, a transcriber, or an
 * API key of any kind.
 *
 * ⭐⭐⭐ THE POINT, BECAUSE IT IS EASY TO MISS: ElevenLabs never animated
 * anything. Its only job in `scripts/build-story-captions.mjs` is to answer one
 * question — *when is each word spoken* — because those captions sit on real
 * narration and must not drift from it. `Caption` is plain JSON:
 *
 *   { text, startMs, endMs, timestampMs, confidence }
 *
 * So there are exactly three ways to fill it in, and only one of them needs a
 * third party:
 *   1. THIS FILE — there is no audio, so the cadence is authored. Free, offline,
 *      deterministic, and the timings are a creative choice rather than a
 *      measurement.
 *   2. `@remotion/install-whisper-cpp` — there IS audio (a real recording, an
 *      existing clip) and Whisper transcribes it locally. Free, offline, no key.
 *   3. ElevenLabs `/with-timestamps` — only when ElevenLabs generated the audio.
 *
 * ⇒ The animation is 100% Remotion in all three cases.
 *
 * 🪤 WHITESPACE IS LOAD-BEARING. `@remotion/captions` is whitespace-sensitive:
 * the leading space belongs INSIDE each token's text, and the renderer must use
 * `whiteSpace: "pre"`. Trim it and every word runs together.
 */

/** Roughly conversational. TikTok karaoke usually sits a little faster. */
const DEFAULT_WPS = 2.9;

/**
 * Speakers do not run at a constant rate — they stop at punctuation, which is
 * exactly where a caption change is most visible. `build-story-captions.mjs`
 * says the same thing about estimating from character counts. These are the
 * extra milliseconds held AFTER a word ending in each mark.
 */
const PAUSE_MS: Record<string, number> = {
  ".": 260,
  "?": 300,
  "!": 280,
  ",": 140,
  ";": 180,
  ":": 180,
  "—": 220,
};

const trailingPause = (word: string): number => {
  const last = word.trim().slice(-1);
  return PAUSE_MS[last] ?? 0;
};

/**
 * Longer words genuinely take longer to say, so a flat per-word duration makes
 * "I" and "responsibility" equal and the highlight visibly desynchronises from
 * any rhythm the viewer imagines. Weighting by length is crude but monotonic,
 * which is all that is needed when there is no audio to be wrong about.
 */
export const captionsFromText = (
  text: string,
  opts: { startMs?: number; wordsPerSecond?: number } = {},
): Caption[] => {
  const wps = opts.wordsPerSecond ?? DEFAULT_WPS;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const meanChars = words.reduce((a, w) => a + w.length, 0) / words.length;
  const baseMs = 1000 / wps;

  let cursor = opts.startMs ?? 0;
  return words.map((word, i) => {
    // Weight between 0.6x and 1.7x of the base so one long word cannot swallow
    // a whole beat, and a one-letter word still holds long enough to be read.
    const weight = Math.min(1.7, Math.max(0.6, word.length / meanChars));
    const dur = Math.round(baseMs * weight);
    const startMs = cursor;
    const endMs = startMs + dur;
    cursor = endMs + trailingPause(word);

    return {
      // 🪤 Leading space on every word but the first — see the whitespace note.
      text: i === 0 ? word : ` ${word}`,
      startMs,
      endMs,
      // The highlight anchor. Mid-word reads better than the leading edge,
      // which otherwise lights up fractionally before the eye arrives.
      timestampMs: startMs + Math.round(dur / 2),
      confidence: null,
    };
  });
};

/** Total length in ms, so a composition can derive its own duration. */
export const captionsDurationMs = (captions: Caption[]): number =>
  captions.length === 0 ? 0 : captions[captions.length - 1].endMs;
