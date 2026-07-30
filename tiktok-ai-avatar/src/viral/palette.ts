/**
 * Viral system palette — light sage-and-gold.
 *
 * Sampled from the user's reference gradient (2026-07-22): a warm khaki-gold
 * falling to sage green. This replaces the dark-ink surface used by the
 * original promos, so EVERY foreground colour inverts: text is dark ink, and
 * accents are deepened bronze/forest rather than the bright golds that only
 * read against near-black.
 *
 * Contrast is the constraint here. On a mid-light background (~0.65 relative
 * luminance) bright gold collapses to mush, which is why ACCENT is a deep
 * bronze rather than the brand's display gold.
 */

// ── Background gradient stops ───────────────────────────────────────────────
export const GRAD_A = "#C6B892"; // warm khaki-gold (top-left)
export const GRAD_B = "#98A483"; // sage green (bottom-right)
/** Third stop keeps the middle from going flat under the radial glow. */
export const GRAD_MID = "#B2B189";

// ── Foreground ──────────────────────────────────────────────────────────────
/** Primary text. Deep warm ink — reads as near-black without going cold. */
export const TEXT = "oklch(0.22 0.014 70)";
/** Secondary text. */
export const TEXT_SOFT = "oklch(0.34 0.016 70)";

// ── Accents (deepened so they survive a light background) ───────────────────
/** The gold accent. Deep bronze — bright gold is illegible here. */
export const ACCENT = "oklch(0.45 0.115 68)";
/** Forest green — used for markers and the CTA pill. */
export const ACCENT_GREEN = "oklch(0.40 0.085 158)";
/** Text sitting on ACCENT_GREEN. */
export const ON_GREEN = "oklch(0.97 0.02 155)";
/** Contrarian / warning accent — deepened terracotta. */
export const ACCENT_ALERT = "oklch(0.46 0.155 30)";

// ── Atmosphere ──────────────────────────────────────────────────────────────
/** Chart dial lines — dark, low opacity (light lines vanish on light ground). */
export const DIAL_INK = "oklch(0.30 0.03 90)";
/** Drifting motes. Deeper than the dark theme's bright gold. */
export const MOTE = "oklch(0.58 0.10 76)";
/** Warm haze behind the subject. */
export const HALO = "oklch(0.86 0.09 88 / 0.55)";
/** Edge darkening — warm brown, never grey. */
export const VIGNETTE = "oklch(0.42 0.05 75 / 0.34)";

// ── Shadows ─────────────────────────────────────────────────────────────────
/**
 * Dark text on light ground needs a soft drop, NOT the black outline used on
 * the dark theme — an outline on light backgrounds reads as a sticker.
 */
export const TEXT_SHADOW = "0 2px 10px rgba(52,44,18,0.30)";
/** Glow for accent type — warm, tight, low alpha. */
export const glowFor = (alpha: number) => `0 0 18px rgba(120,88,24,${alpha})`;

// ════════════════════════════════════════════════════════════════════════════
// MULTIPLE PALETTES
//
// One palette across all 14 videos was part of the duplicate fingerprint that
// got the first account's videos withheld. The tokens above remain exported
// unchanged as the "sage-gold" palette, so ViralCover, UpiLaunch and the ten
// original promos are untouched.
// ════════════════════════════════════════════════════════════════════════════

export type Palette = {
  GRAD_A: string;
  GRAD_B: string;
  GRAD_MID: string;
  TEXT: string;
  TEXT_SOFT: string;
  ACCENT: string;
  ACCENT_GREEN: string;
  ON_GREEN: string;
  ACCENT_ALERT: string;
  DIAL_INK: string;
  MOTE: string;
  HALO: string;
  VIGNETTE: string;
  TEXT_SHADOW: string;
  glowFor: (alpha: number) => string;
};

export const PALETTES: Record<string, Palette> = {
  /** The original light sage-and-gold. Dark ink on a mid-light ground. */
  "sage-gold": {
    GRAD_A, GRAD_B, GRAD_MID,
    TEXT, TEXT_SOFT, ACCENT, ACCENT_GREEN, ON_GREEN, ACCENT_ALERT,
    DIAL_INK, MOTE, HALO, VIGNETTE, TEXT_SHADOW, glowFor,
  },

  /** Deep indigo night. Inverts the whole look — near-white type, bright gold. */
  "ink-violet": {
    GRAD_A: "#1B1733",
    GRAD_B: "#0E1226",
    GRAD_MID: "#17162E",
    TEXT: "oklch(0.97 0.008 280)",
    TEXT_SOFT: "oklch(0.84 0.02 280)",
    ACCENT: "oklch(0.86 0.15 88)",
    ACCENT_GREEN: "oklch(0.80 0.13 165)",
    ON_GREEN: "oklch(0.16 0.02 165)",
    ACCENT_ALERT: "oklch(0.75 0.17 25)",
    DIAL_INK: "oklch(0.85 0.04 280 / 0.35)",
    MOTE: "oklch(0.88 0.11 85)",
    HALO: "oklch(0.55 0.16 290 / 0.45)",
    VIGNETTE: "oklch(0.10 0.03 285 / 0.55)",
    // Dark ground: a soft drop vanishes, so type carries a tight glow instead.
    TEXT_SHADOW: "0 0 22px rgba(120,110,255,0.45)",
    glowFor: (alpha: number) => `0 0 26px rgba(240,200,110,${alpha})`,
  },

  /** Charcoal falling to ember. Warm, high-heat, cream type. */
  ember: {
    GRAD_A: "#2A1410",
    GRAD_B: "#140A0B",
    GRAD_MID: "#231110",
    TEXT: "oklch(0.96 0.018 70)",
    TEXT_SOFT: "oklch(0.82 0.03 60)",
    ACCENT: "oklch(0.80 0.16 55)",
    ACCENT_GREEN: "oklch(0.78 0.12 150)",
    ON_GREEN: "oklch(0.16 0.02 150)",
    ACCENT_ALERT: "oklch(0.72 0.19 32)",
    DIAL_INK: "oklch(0.80 0.05 50 / 0.30)",
    MOTE: "oklch(0.82 0.15 58)",
    HALO: "oklch(0.55 0.18 45 / 0.42)",
    VIGNETTE: "oklch(0.12 0.04 40 / 0.58)",
    TEXT_SHADOW: "0 0 20px rgba(255,140,60,0.40)",
    glowFor: (alpha: number) => `0 0 24px rgba(255,150,70,${alpha})`,
  },

  /** Near-monochrome with a single cold accent. The quietest of the four. */
  mono: {
    GRAD_A: "#F2F2F0",
    GRAD_B: "#D9D9D6",
    GRAD_MID: "#E8E8E5",
    TEXT: "oklch(0.20 0 0)",
    TEXT_SOFT: "oklch(0.42 0 0)",
    ACCENT: "oklch(0.48 0.14 230)",
    ACCENT_GREEN: "oklch(0.44 0.10 160)",
    ON_GREEN: "oklch(0.97 0.01 160)",
    ACCENT_ALERT: "oklch(0.50 0.18 28)",
    DIAL_INK: "oklch(0.35 0 0 / 0.28)",
    MOTE: "oklch(0.55 0.02 240)",
    HALO: "oklch(0.90 0.02 240 / 0.50)",
    VIGNETTE: "oklch(0.40 0.01 240 / 0.28)",
    TEXT_SHADOW: "0 2px 8px rgba(30,30,32,0.22)",
    glowFor: (alpha: number) => `0 0 18px rgba(40,90,160,${alpha})`,
  },
};

export const PALETTE_NAMES = Object.keys(PALETTES);

// ── Colour maths, for the deterministic contrast gate ───────────────────────

const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

/** oklch → linear sRGB, via oklab. Standard published matrices. */
const oklchToLinearRgb = (L: number, C: number, hDeg: number) => {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};

/**
 * WCAG relative luminance. Accepts the two notations these palettes use — hex
 * for gradient stops, oklch for foregrounds — and ignores any alpha suffix.
 */
export const relativeLuminance = (color: string): number => {
  let rgb: number[];

  const oklch = color.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+\s*)?\)/i,
  );
  if (oklch) {
    rgb = oklchToLinearRgb(Number(oklch[1]), Number(oklch[2]), Number(oklch[3]));
  } else {
    const hex = color.replace("#", "").trim();
    if (!/^[0-9a-f]{6}$/i.test(hex)) throw new Error(`unsupported colour: ${color}`);
    rgb = [0, 2, 4].map((i) => srgbToLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  }

  const [r, g, b] = rgb.map((c) => Math.min(1, Math.max(0, c)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio, 1:1 to 21:1. */
export const contrastRatio = (a: string, b: string): number => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
