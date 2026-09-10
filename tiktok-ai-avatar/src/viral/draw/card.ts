/**
 * The monthly draw carousel — types and the gates that block a bad render.
 *
 * ⭐⭐⭐ THE GATE IS HANDED ITS OWN INPUTS ON PURPOSE. The viral gates spent
 * weeks advisory because `acts`/`scenes` were computed inside the component's
 * render body, so nothing outside could reproduce them (see `plan.ts`). Every
 * value a gate here reads is a plain field on `DrawSlide`, declared in
 * `september-2026.ts`, so `Root.tsx`'s calculateMetadata can throw before frame
 * one and a unit test can assert the same numbers the component renders.
 *
 * ⚠️ AND THE LIMIT OF THAT: these gates assert against the DECLARATION, never
 * against a rendered pixel. `scripts/qa-still.mjs` is the one that reads the
 * PNG, and it carries more weight than everything here — a blank frame 0
 * shipped twice past a fully green suite.
 */
import { CARD_GROUND_BANDS } from "./card-bands";

export type DrawSlide = {
  /** 0 for the cover, 1-9 for a Moolank. */
  moolank: number;
  /** Ground plate under this slide. Every slide in a set uses the same one. */
  bg: string;
  /** Card id from content/draws/<month>.json. Absent on the cover. */
  cardId?: string;
  cardName?: string;
  /** The card's own keywords, shown verbatim. Absent on the cover. */
  keywords?: string[];
  /** "4th, 13th, 22nd, 31st" — every qualifying date. Absent on the cover. */
  bornOn?: string;
  /** The large line. Cover only carries a title; slides carry the number. */
  title: string;
  /** The paragraph. 60-150 words. */
  body: string;
};

export type Gate = { name: string; ok: boolean; detail?: string };

/* ── The paper veil ───────────────────────────────────────────────────────
   A flat white wash over the plate. It does two things the plate alone does
   not: lifts the darkest band away from the ink, and COMPRESSES THE SPAN, so
   ten slides in a row read as one set rather than a gradient.
   ⭐ V59's lesson, applied at 4:5: when an accent fails on a light plate,
   reach for flatness, not brightness. */
export const VEIL_RGB: [number, number, number] = [255, 251, 244];
/**
 * 🪤🪤 0.42 MADE THE CONTRAST GATE VACUOUS. Measured: at that alpha the veil
 * lifts `night-a` — a near-black plate, mean sRGB 13.3 — to 3.19:1 against the
 * ink, so it PASSED. A gate that cannot fail the way the real operation fails
 * is not a gate. At 0.25 the plate still decides: linen-b reads 7.10:1 and
 * night-a 1.68:1. ⛔ Do not raise this to make a plate pass.
 */
export const VEIL_ALPHA = 0.25;

export const veiled = (
  band: [number, number, number],
  alpha = VEIL_ALPHA,
): [number, number, number] =>
  [0, 1, 2].map((i) => band[i] * (1 - alpha) + VEIL_RGB[i] * alpha) as [number, number, number];

/* ── Contrast ─────────────────────────────────────────────────────────────
   Same WCAG maths as the quiet format, deliberately duplicated rather than
   imported: quiet/scenes.ts reads GROUND_BANDS (9:16) and pulling it in here
   would invite someone to pass a 4:5 band into a 9:16 gate. */
const lin = (c: number): number => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export const relLuminance = ([r, g, b]: [number, number, number]): number =>
  0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

export const contrastRatio = (a: number, b: number): number =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Body ink and the accent, as rendered. Kept here so the gate reads what ships. */
export const INK: [number, number, number] = [38, 30, 24];
export const ACCENT: [number, number, number] = [124, 45, 18];

/** Body copy floor. The same 3.0 the quiet format uses. */
export const MIN_TEXT_CONTRAST = 3.0;
/** The accent has to clear body text, not merely be legible. */
export const MIN_ACCENT_CONTRAST = 3.0;
/**
 * Ten slides seen in sequence must look like one set. Measured in mean sRGB
 * across the covered frame's bands, POST-VEIL.
 * 🪤 chalk-g reads 13.1 in the 9:16 copy strip and 79.1 across the 4:5 frame —
 * the very plate V59 shipped fails this. Measure the frame you are rendering.
 */
export const MAX_GROUND_SPAN = 40;

export const groundBands = (bg: string): [number, number, number][] | null =>
  CARD_GROUND_BANDS[bg] ?? null;

/** Every band of the veiled plate clears the ink floor — the WORST band, not the mean. */
export const checkTextContrast = (slides: DrawSlide[]): Gate => {
  const ink = relLuminance(INK);
  const bad: string[] = [];
  for (const bg of new Set(slides.map((s) => s.bg))) {
    const bands = groundBands(bg);
    if (!bands) return { name: "text contrast", ok: false, detail: `unmeasured ground "${bg}"` };
    bands.forEach((b, i) => {
      const r = contrastRatio(relLuminance(veiled(b)), ink);
      if (r < MIN_TEXT_CONTRAST) bad.push(`${bg} band ${i} ${r.toFixed(2)}:1`);
    });
  }
  return bad.length
    ? { name: "text contrast", ok: false, detail: `${bad.join(", ")} < ${MIN_TEXT_CONTRAST}` }
    : { name: "text contrast", ok: true };
};

export const checkAccentContrast = (slides: DrawSlide[]): Gate => {
  const accent = relLuminance(ACCENT);
  const bad: string[] = [];
  for (const bg of new Set(slides.map((s) => s.bg))) {
    const bands = groundBands(bg);
    if (!bands) return { name: "accent contrast", ok: false, detail: `unmeasured ground "${bg}"` };
    bands.forEach((b, i) => {
      const r = contrastRatio(relLuminance(veiled(b)), accent);
      if (r < MIN_ACCENT_CONTRAST) bad.push(`${bg} band ${i} ${r.toFixed(2)}:1`);
    });
  }
  return bad.length
    ? { name: "accent contrast", ok: false, detail: `${bad.join(", ")} < ${MIN_ACCENT_CONTRAST}` }
    : { name: "accent contrast", ok: true };
};

export const checkGroundFlatness = (slides: DrawSlide[]): Gate => {
  const bad: string[] = [];
  for (const bg of new Set(slides.map((s) => s.bg))) {
    const bands = groundBands(bg);
    if (!bands) return { name: "ground flatness", ok: false, detail: `unmeasured ground "${bg}"` };
    const means = bands.map((b) => veiled(b).reduce((a, c) => a + c, 0) / 3);
    const span = Math.max(...means) - Math.min(...means);
    if (span > MAX_GROUND_SPAN) bad.push(`${bg} span ${span.toFixed(1)}`);
  }
  return bad.length
    ? { name: "ground flatness", ok: false, detail: `${bad.join(", ")} > ${MAX_GROUND_SPAN}` }
    : { name: "ground flatness", ok: true };
};

/** One ground for the whole set. A ladder is a video device; a carousel is a set. */
export const checkOneGround = (slides: DrawSlide[]): Gate => {
  const grounds = new Set(slides.map((s) => s.bg));
  return grounds.size === 1
    ? { name: "one ground", ok: true }
    : { name: "one ground", ok: false, detail: `${grounds.size} grounds: ${[...grounds].join(", ")}` };
};

export const words = (s: string): number => s.trim().split(/\s+/).filter(Boolean).length;

export const MIN_WORDS = 60;
export const MAX_WORDS = 150;

export const checkBodyLength = (slides: DrawSlide[]): Gate => {
  const bad = slides
    .map((s) => [s.moolank, words(s.body)] as const)
    .filter(([, n]) => n < MIN_WORDS || n > MAX_WORDS)
    .map(([m, n]) => `slide ${m}: ${n}w`);
  return bad.length
    ? { name: "body length", ok: false, detail: `${bad.join(", ")} outside ${MIN_WORDS}-${MAX_WORDS}` }
    : { name: "body length", ok: true };
};

/**
 * 🔴 THE ETHICS_BLOCK, ON A SLIDE. Shipped to production 2026-09-09: a reading
 * may not promise an outcome or a date. A card that is going to be read by
 * someone born on that date is exactly where that matters.
 */
const PROMISE = [
  /\bwill happen\b/i,
  /\byou will\b/i,
  /\bis going to\b/i,
  /\bguarantee/i,
  /\bdestined\b/i,
  /\bby the end of\b/i,
  /\bwithin (?:days|weeks|months)\b/i,
  /\bthis month you'll\b/i,
];

export const checkNoPromise = (slides: DrawSlide[]): Gate => {
  const bad: string[] = [];
  for (const s of slides) {
    for (const re of PROMISE) {
      const m = s.body.match(re);
      if (m) bad.push(`slide ${s.moolank}: "${m[0]}"`);
    }
  }
  return bad.length
    ? { name: "no promised outcome", ok: false, detail: bad.join(", ") }
    : { name: "no promised outcome", ok: true };
};

/**
 * 🔴🔴 THE LOAD-BEARING ONE. There is no card-to-number rule anywhere in the
 * product, on purpose — `vedic-numerology/lib/tarot/closing-lines.ts` calls
 * such a rule invented numerology. A slide may say a card WAS DRAWN for a
 * number. It may never say the card BELONGS to it.
 */
const MAPPING = [
  /\bbelongs to\b/i,
  /\bis assigned\b/i,
  /\byour card is\b/i,
  /\bthe card (?:of|for) (?:moolank|number|the)\b/i,
  /\bruled by (?:the )?(?:king|queen|page|knight|ace|two|three|four|five|six|seven|eight|nine|ten)\b/i,
  /\bcorresponds to\b/i,
  /\balways draws?\b/i,
];

/**
 * 🪤 THE GATE MUST NOT CATCH THE DENIAL. The cover's whole job is to say "no
 * card belongs to any number" — the exact phrase the list above forbids. A
 * plain match flagged it, which would have forced the one sentence that keeps
 * the set honest to be deleted to make a test green. So a hit is cleared when
 * a negator sits just in front of it.
 */
const NEGATED = /\b(?:no|not|never|nothing|neither|nor)\b|n[''’]t\b/i;
const NEGATION_WINDOW = 40;

export const checkNoMapping = (slides: DrawSlide[]): Gate => {
  const bad: string[] = [];
  for (const s of slides) {
    for (const re of MAPPING) {
      const m = s.body.match(re);
      if (!m || m.index === undefined) continue;
      const before = s.body.slice(Math.max(0, m.index - NEGATION_WINDOW), m.index);
      if (NEGATED.test(before)) continue;
      bad.push(`slide ${s.moolank}: "${m[0]}"`);
    }
  }
  return bad.length
    ? { name: "no card-to-number rule", ok: false, detail: bad.join(", ") }
    : { name: "no card-to-number rule", ok: true };
};

/**
 * The cover must SAY the cards were drawn at random. Without this the whole
 * set silently reads as an assignment, which is the claim we refuse to make —
 * and no other gate can see the difference.
 */
export const checkDrawDisclosed = (slides: DrawSlide[]): Gate => {
  const cover = slides.find((s) => s.moolank === 0);
  if (!cover) return { name: "draw disclosed", ok: false, detail: "no cover slide" };
  const t = `${cover.title} ${cover.body}`.toLowerCase();
  const saysDrawn = /\bdrawn\b|\bdrew\b/.test(t);
  const saysRandom = /\brandom\b|\bshuffle|\bno card belongs\b|\bnot chosen\b/.test(t);
  return saysDrawn && saysRandom
    ? { name: "draw disclosed", ok: true }
    : {
        name: "draw disclosed",
        ok: false,
        detail: `cover must state the draw${saysDrawn ? "" : " (missing 'drawn')"}${
          saysRandom ? "" : " (missing the randomness)"
        }`,
      };
};

/** The born-on line is the hook — a stranger must self-identify in one glance. */
export const checkBornOn = (slides: DrawSlide[]): Gate => {
  const bad = slides
    .filter((s) => s.moolank !== 0 && !s.bornOn?.trim())
    .map((s) => `slide ${s.moolank}`);
  return bad.length
    ? { name: "born-on line", ok: false, detail: `${bad.join(", ")} missing bornOn` }
    : { name: "born-on line", ok: true };
};

/** Cover + 1..9, each exactly once, in order. */
export const checkSetShape = (slides: DrawSlide[]): Gate => {
  const got = slides.map((s) => s.moolank);
  const want = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return got.length === want.length && got.every((m, i) => m === want[i])
    ? { name: "set shape", ok: true }
    : { name: "set shape", ok: false, detail: `got [${got.join(", ")}], want [${want.join(", ")}]` };
};

/** No card may appear twice — the draw deals nine distinct, so a repeat is a copy bug. */
export const checkDistinctCards = (slides: DrawSlide[]): Gate => {
  const ids = slides.filter((s) => s.moolank !== 0).map((s) => s.cardId);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  return dupes.length
    ? { name: "distinct cards", ok: false, detail: `repeated: ${[...new Set(dupes)].join(", ")}` }
    : { name: "distinct cards", ok: true };
};

export const runCardGates = (slides: DrawSlide[]): Gate[] => [
  checkSetShape(slides),
  checkOneGround(slides),
  checkGroundFlatness(slides),
  checkTextContrast(slides),
  checkAccentContrast(slides),
  checkBodyLength(slides),
  checkBornOn(slides),
  checkDistinctCards(slides),
  checkNoPromise(slides),
  checkNoMapping(slides),
  checkDrawDisclosed(slides),
];

export const assertCardRenderable = (id: string, slides: DrawSlide[]): void => {
  const failed = runCardGates(slides).filter((g) => !g.ok);
  if (failed.length) {
    throw new Error(
      `${id} is not renderable:\n${failed.map((g) => `  ✗ ${g.name}: ${g.detail ?? ""}`).join("\n")}`,
    );
  }
};
