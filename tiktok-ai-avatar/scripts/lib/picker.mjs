/**
 * Algorithmic fallback picker -- used from day 8 onward, once
 * content/weekly-plan-w1.json (the hand-authored week 1) is exhausted.
 *
 * Quality note: this produces STRUCTURALLY valid, rule-passing content
 * (correct category rotation, one comment-bait/day, 21-day no-repeat, valid
 * hook copy, on-brand trait facts pulled from content/moolank-traits.json)
 * but the prose (buildSetup/buildReveal/captions) is template-assembled, not
 * hand-crafted the way the week-1 plan is. RUN-LOG.md flags every
 * algorithmic-sourced video with `needsReview: true` -- worth a content pass
 * (by you or a fresh Claude session, same as this one) every couple of
 * weeks rather than letting it run on templates indefinitely. That's a
 * content-quality tradeoff, not a bug.
 */
import { readFileSync } from "node:fs";
import { seriesForDate } from "./series.mjs";
import { validateHook } from "./hook-rules.mjs";
import { isRecentlyUsed } from "./state.mjs";

const CATEGORY_CYCLE = ["identity", "knowledge-gap", "educational", "story"];

const CTA_BANK = [
  "Comment your birth date",
  "Comment your date — I'll break it down",
  "Drop your date below",
  "Comment below if this is you",
];

const BUILD_BANK = {
  identity: [
    ["There's a reason this keeps showing up for you...", "It traces straight back to your birth number."],
    ["People misread this trait constantly...", "It isn't what they think it is."],
  ],
  "knowledge-gap": [
    ["Most people stop at the first number they learn...", "There's more sitting in the same birth date."],
    ["This gets calculated wrong more than almost anything else...", "The fix takes one extra step."],
  ],
  educational: [
    ["This takes people years to piece together on their own...", "It's actually a short, learnable rule."],
    ["Nobody explains this part clearly...", "It's simpler than it sounds."],
  ],
  story: [
    ["A recent chart reading kept circling the same point...", "It came down to one number doing the talking."],
    ["This pattern shows up more than you'd expect...", "Once you see it, you can't unsee it."],
  ],
  "comment-bait": [
    ["Everyone reads their own chart differently...", "Let's see if this one lands."],
  ],
};

const CONCEPT_TRAIT_BANK = [
  ["Add the digits down to one", "That's the number that repeats", "Compare it to your Moolank", "Comment yours for both"],
  ["Every chart holds more than one number", "Most people only ever check one", "The rest change what the first means", "Comment your date for the full read"],
  ["The calculation takes one extra step", "Almost nobody does it by hand", "It's free on the app", "Comment your date and I'll do it"],
];

const HASHTAG_BANK = {
  identity: ["#numerology", "#vedicnumerology", "#birthnumber", "#moolank"],
  "knowledge-gap": ["#numerology", "#birthnumber", "#destinynumber", "#vedicnumerology"],
  educational: ["#numerology", "#vedicnumerology", "#numerologytok", "#birthnumber"],
  story: ["#numerology", "#vedicnumerology", "#birthnumber", "#numerologyreading"],
  "comment-bait": ["#numerology", "#vedicnumerology", "#numerologytok", "#birthnumber"],
};

const loadMoolankTraits = () => JSON.parse(readFileSync("content/moolank-traits.json", "utf8"));

const dayOf = (i) => Math.max(0, i - 8); // day 8 -> 0, day 9 -> 1, ...

const authorFallbackHook = ({ category, number, moolankTraits }) => {
  const m = number && moolankTraits[String(number)];
  const text = m ? `BORN ON THE ${m.born.split(",")[0].trim()}?` : "YOUR NUMBER SAYS";
  const accent = m ? `YOU'RE A ${number}` : "MORE THAN YOU THINK";
  const sub = m ? m.strengths[0] : "Comment your birth date";
  const hook = {
    id: `daily-${category}-${number ?? "gen"}-${Date.now().toString(36)}`,
    category,
    variant: category === "identity" ? "identity" : "mystery",
    text,
    accent,
    sub,
    number,
  };
  const errors = validateHook(hook);
  if (errors.length) throw new Error(`generated fallback hook failed copy rules: ${errors.join("; ")}`);
  return hook;
};

/**
 * Picks 3 concepts for `dateISO`, given `dayIndex` (>= 8), the parsed hook
 * index (scripts/lib/hooks-source.mjs), and current state (for no-repeat).
 * Returns { concepts, newHooks } -- newHooks are freshly authored fallback
 * hooks that the caller must append to DAILY_HOOKS in src/viral/hooks.ts.
 */
export const pickAlgorithmicBatch = (state, dateISO, dayIndex, hooksIndex) => {
  const moolankTraits = loadMoolankTraits();
  const d = dayOf(dayIndex);
  // The weekday's series decides the subject, and BOTH slots take it — the
  // day's two videos are a matched pair on one theme, not two unrelated clips.
  // The old CATEGORY_CYCLE rotation is kept below only as the fallback for a
  // date the calendar cannot resolve.
  const series = seriesForDate(dateISO);
  const slotB = series.slotB ?? "same-theme";
  // Tarot Tuesday's second video is the ruling-planet composition, produced
  // elsewhere in the pipeline, so the picker only fills slot A that day.
  const slots = slotB === "daily-energy" ? [series.category] : [series.category, series.category];

  const newHooks = [];
  const concepts = [];

  // Hooks already taken by THIS batch. isRecentlyUsed only consults saved
  // state, so without this both of the day's slots — now sharing one category
  // — resolve to the same first match, and the "pair" is one video posted
  // twice. Only "identity" escapes it by accident, because its per-slot
  // moolank number happens to disambiguate the lookup.
  const takenHookIds = new Set();

  slots.forEach((category, slotIdx) => {
    const number = category === "identity" ? (((d + slotIdx) % 9) + 1) : undefined;
    const free = (h) => !takenHookIds.has(h.id) && !isRecentlyUsed(state, { hookId: h.id }, dateISO);

    let hook = hooksIndex.all.find(
      (h) => h.category === category && (number === undefined || h.number === number) && free(h),
    );
    if (!hook) {
      hook = hooksIndex.all.find((h) => h.category === category && free(h));
    }
    if (!hook) {
      hook = authorFallbackHook({ category, number, moolankTraits });
      newHooks.push(hook);
    }
    takenHookIds.add(hook.id);

    const m = number && moolankTraits[String(number)];
    const traits = m ? m.strengths : CONCEPT_TRAIT_BANK[(d + slotIdx) % CONCEPT_TRAIT_BANK.length];
    const [setup, reveal] = BUILD_BANK[category][(d + slotIdx) % BUILD_BANK[category].length];
    const ctaText = m
      ? `Are you a ${number}? Comment below`
      : CTA_BANK[(d + slotIdx) % CTA_BANK.length];
    const numberLabel = m ? m.planetShort : "Worked example";
    const titleSource = `${hook.text} ${hook.accent}`.replace(/[^a-zA-Z0-9 ]/g, "");
    const title = titleSource
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
      .slice(0, 60);

    concepts.push({
      slot: category,
      hookId: hook.id,
      _hook: hook, // resolved inline since fallback hooks aren't in hooks.ts yet
      title,
      category,
      moolank: number ?? "general",
      buildSetup: setup,
      buildReveal: reveal,
      number: number ?? (slotIdx + 1),
      numberLabel,
      traits,
      ctaText,
      whyComment:
        "Algorithmically picked to fill the day's rotation -- structurally on-rule (category/no-repeat/hook copy), recommend a content pass to sharpen the prose.",
      // 👇 rather than "?" — every CTA above is an INSTRUCTION ("Comment your
      // birth date", "Drop your date below"), so a question mark made it read
      // as uncertainty about whether to ask. The Moolank CTA is worse: it is
      // already "Are you a 2? Comment below", so the appended mark produced
      // two in one caption. This matches both the Instagram line directly
      // below and the hand-authored week-1 captions, which all close on 👇.
      tiktokCaption: `${hook.text} ${hook.accent}. ${ctaText} 👇`,
      instagramCaption: `${hook.text} ${hook.accent} — ${hook.sub ?? ""}. ${setup} ${reveal} ${ctaText} 👇`,
      hashtags: HASHTAG_BANK[category],
      suggestedPostTime: "6:00–7:00 PM local, same evening as render",
      needsReview: true,
    });
  });

  return { concepts, newHooks };
};
