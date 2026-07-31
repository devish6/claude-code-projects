#!/usr/bin/env node
/**
 * Turn ElevenLabs character-level alignment into caption phrases + scene timings.
 *
 * WHY THIS EXISTS
 * ---------------
 * Captions on a still-image video are not decoration — they ARE most of the motion.
 * That only works if they land exactly on the spoken word, and the only way to know
 * that is to ask the synthesiser. `/with-timestamps` returns per-character start/end
 * times for the very audio it just produced, so the captions cannot drift from it.
 *
 * Estimating from character counts (chars / 15.4 per second) was the alternative and
 * is wrong in a specific way: the narrator does not speak at a constant rate. It pauses
 * at full stops and em dashes, exactly where a caption change is most noticeable.
 *
 * PHRASE, NOT WORD
 * ----------------
 * Single-word karaoke captions are the short-form default but read badly for a story:
 * the eye is yanked ~3x/second and the sentence never exists as a whole. We group into
 * short phrases and break on punctuation, so each card is a readable unit.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// 🪤 Decoded-path comparison: this checkout lives under "Claude Code Projects" and
// import.meta.url percent-encodes the space, so the naive main-module idiom never matches.
const HERE = dirname(fileURLToPath(import.meta.url));

const FPS = 30;
const NARRATION = join(process.env.HOME, "Desktop/Numevix Videos/Voice Clone/narration");

/** Seconds of silence held before the narration starts in each scene. */
const LEAD_IN = 0.45;
/** Seconds held after the narration ends, so a cut never lands on the last syllable. */
const TAIL = 1.05;
/** Extra hold on the final scene for the call to action. */
const CTA_HOLD = 2.4;

const SCENES = [
  { id: "s1", audio: "s1-classroom", images: ["s1"],                 move: "pushIn" },
  { id: "s2", audio: "s2-sun",       images: ["s2"],                 move: "pullBack" },
  { id: "s3", audio: "s3-climb",     images: ["s3"],                 move: "driftLeft" },
  { id: "s4", audio: "s4-rooms",     images: ["s4a", "s4b", "s4c"],  move: "pushIn" },
  { id: "s5", audio: "s5-light",     images: ["s5"],                 move: "pushIn" },
  { id: "s6", audio: "s6-ruby",      images: ["s6"],                 move: "pushInSlow" },
];

/** Longest a single caption card may stay up. Beyond this the frame stops feeling alive. */
const MAX_PHRASE_SEC = 2.2;
/** Most words on one card. Two lines of ~3 words is the readable ceiling at this size. */
const MAX_PHRASE_WORDS = 5;

function wordsFromAlignment(al) {
  const chars = al.characters;
  const starts = al.character_start_times_seconds;
  const ends = al.character_end_times_seconds;
  const words = [];
  let cur = null;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch.trim() === "") {
      if (cur) { words.push(cur); cur = null; }
      continue;
    }
    if (!cur) cur = { text: "", start: starts[i], end: ends[i] };
    cur.text += ch;
    cur.end = ends[i];
  }
  if (cur) words.push(cur);
  return words;
}

/** True when a word ends a clause — a caption should break here rather than mid-thought. */
const BREAKS_AFTER = /[.,;:—?!]$/;

/**
 * Words that must never END a caption card.
 *
 * Breaking purely on a word count produced cards like "when the destiny number is" —
 * grammatically mid-air, and the viewer holds their breath waiting for the noun. These
 * are the words that promise something is coming: articles, prepositions, conjunctions,
 * auxiliaries. If a forced break lands on one, it gets pushed to the next card instead.
 */
const DANGLERS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "and", "or", "but", "of",
  "to", "in", "on", "at", "for", "with", "as", "that", "which", "when", "while", "if",
  "into", "from", "by", "not", "no", "it", "its", "there", "then", "so", "your", "you",
  "has", "have", "had", "does", "do", "did", "only", "never", "always", "twice", "most",
]);

const bare = (w) => w.text.toLowerCase().replace(/[^a-z']/g, "");

function phrasesFromWords(words) {
  const out = [];
  let cur = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({
      text: cur.map((w) => w.text).join(" "),
      start: cur[0].start,
      end: cur[cur.length - 1].end,
    });
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    const span = cur[cur.length - 1].end - cur[0].start;
    const punctuated = BREAKS_AFTER.test(w.text);
    const forced = cur.length >= MAX_PHRASE_WORDS || span >= MAX_PHRASE_SEC;

    if (punctuated) {
      // Punctuation is a real clause end; break even if the word looks like a dangler.
      flush();
    } else if (forced) {
      // Walk back over trailing danglers so the card ends on a word that stands alone.
      // Never strip so far that the card empties — a 1-word card beats an infinite loop.
      const carry = [];
      while (cur.length > 1 && DANGLERS.has(bare(cur[cur.length - 1]))) {
        carry.unshift(cur.pop());
      }
      flush();
      cur = carry;
    }
  }
  flush();

  // Fold ORPHANS — a card holding one word, left behind when a forced break fired just
  // before the end of a sentence ("and nothing left to balance" / "it."). On screen that
  // second card is a flash of one word and reads as a bug.
  //
  // 🔴 But never merge across a sentence boundary: if the previous card already ended on
  // . ? or !, the orphan begins a NEW sentence and joining them ("twice over. Leading,")
  // would be worse than the orphan. This is why the rule tests the previous card's
  // punctuation rather than simply merging any short card backwards.
  const ENDS_SENTENCE = /[.?!]["']?$/;
  for (let i = out.length - 1; i > 0; i--) {
    const cardWords = out[i].text.split(" ");
    if (cardWords.length > 1) continue;
    const prev = out[i - 1];
    if (ENDS_SENTENCE.test(prev.text)) continue;
    // Allow one word over the normal ceiling — a slightly long card beats an orphan.
    if (prev.text.split(" ").length + 1 > MAX_PHRASE_WORDS + 1) continue;
    prev.text = `${prev.text} ${out[i].text}`;
    prev.end = out[i].end;
    out.splice(i, 1);
  }
  return out;
}

const scenes = [];
let cursor = 0;

for (const s of SCENES) {
  const raw = JSON.parse(readFileSync(join(NARRATION, `${s.audio}.json`), "utf8"));
  const al = raw.alignment;
  const words = wordsFromAlignment(al);
  const phrases = phrasesFromWords(words);
  const speech = al.character_end_times_seconds[al.character_end_times_seconds.length - 1];

  const isLast = s.id === "s6";
  const durSec = LEAD_IN + speech + TAIL + (isLast ? CTA_HOLD : 0);

  scenes.push({
    id: s.id,
    images: s.images,
    move: s.move,
    from: Math.round(cursor * FPS),
    durationInFrames: Math.round(durSec * FPS),
    audio: `story/01/audio/${s.audio}.mp3`,
    // Narration starts after the lead-in; captions are relative to the SCENE, so the
    // component never has to know where the scene sits on the global timeline.
    audioOffsetInFrames: Math.round(LEAD_IN * FPS),
    captions: phrases.map((p) => ({
      text: p.text,
      from: Math.round((LEAD_IN + p.start) * FPS),
      to: Math.round((LEAD_IN + p.end) * FPS),
    })),
  });
  cursor += durSec;
}

const totalFrames = scenes.reduce((n, s) => n + s.durationInFrames, 0);

const banner = `/**
 * GENERATED by scripts/build-story-captions.mjs — do not edit by hand.
 *
 * Caption timings come from ElevenLabs' own character alignment for these exact audio
 * files, so they cannot drift from the narration. Re-run the script if the audio is
 * regenerated; editing this file instead will desynchronise them silently.
 */`;

const ts = `${banner}
export type StoryCaption = { text: string; from: number; to: number };
export type StoryScene = {
  id: string;
  images: string[];
  move: "pushIn" | "pushInSlow" | "pullBack" | "driftLeft";
  from: number;
  durationInFrames: number;
  audio: string;
  audioOffsetInFrames: number;
  captions: StoryCaption[];
};

export const STORY_01_FPS = ${FPS};
export const STORY_01_DURATION = ${totalFrames};
export const STORY_01_SCENES: StoryScene[] = ${JSON.stringify(scenes, null, 2)};
`;

const dest = join(HERE, "..", "src", "viral", "story-01-data.ts");
writeFileSync(dest, ts);

console.log(`scenes : ${scenes.length}`);
for (const s of scenes) {
  console.log(
    `  ${s.id}  ${String(s.durationInFrames).padStart(4)}f ` +
    `(${(s.durationInFrames / FPS).toFixed(2)}s)  ${s.captions.length} captions  ` +
    `images: ${s.images.join(",")}`
  );
}
console.log(`total  : ${totalFrames}f = ${(totalFrames / FPS).toFixed(2)}s`);
console.log(`wrote  : ${dest}`);
