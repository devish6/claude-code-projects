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
