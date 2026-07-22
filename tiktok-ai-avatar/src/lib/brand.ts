/**
 * Numevix brand system for short-form promos.
 * Palette mirrors the vedic-numerology app tokens (app/globals.css):
 * cream + antique gold + deep green light-luxury, plus an on-brand deep-ink
 * (pine + gold) dark-luxury surface for scroll-stopping hooks.
 * Chromium (Remotion's renderer) supports oklch() directly.
 */

// ── Light-luxury (cream) surface ────────────────────────────────────────────
export const CREAM_A = "#F3F2EC";
export const CREAM_B = "#F8F2E5";
export const CARD = "oklch(0.995 0.004 85)";
export const BORDER = "oklch(0.87 0.02 85)";

// ── Ink foreground family ───────────────────────────────────────────────────
export const INK = "oklch(0.24 0.012 60)";
export const INK_SOFT = "oklch(0.34 0.012 60)";
export const MUTED = "oklch(0.47 0.02 70)";

// ── Accents ─────────────────────────────────────────────────────────────────
export const GOLD = "oklch(0.72 0.10 80)"; // primary accent — big numbers / wordmark
export const GOLD_BRIGHT = "oklch(0.84 0.12 86)"; // spark highlights on dark
export const GOLD_TEXT = "oklch(0.56 0.11 74)"; // AA gold for small text on cream
export const GREEN = "oklch(0.52 0.085 158)"; // action accent
export const GREEN_FG = "oklch(0.97 0.02 155)"; // text on green
export const ALERT = "oklch(0.58 0.15 28)"; // muted terracotta for "blocked / weak" states

// ── Dark-luxury (ink) surface — deep pine + gold, still on-brand ────────────
export const DARK_A = "oklch(0.235 0.028 162)"; // deep pine ink
export const DARK_B = "oklch(0.155 0.022 165)"; // near-black green
export const CREAM_ON_DARK = "oklch(0.95 0.012 85)"; // primary text on ink
export const MUTED_ON_DARK = "oklch(0.74 0.02 85)"; // secondary text on ink

// ── Type ────────────────────────────────────────────────────────────────────
export const SERIF = "Georgia, 'Times New Roman', serif";
export const SANS = "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";

// ── Music (public/music/*) ──────────────────────────────────────────────────
// Pixabay tracks (free, no attribution required), chosen per-video by mood.
// Files were renamed to N.mp3 by number; paths below point to the file that holds
// each video's original song (verified by duration + md5), so beat-sync stays valid.
export const MUSIC = {
  darkCinematic: "music/7.mp3", // 01 hook, dramatic (leberch dark cinematic, 186s)
  perfectMoment: "music/9.mp3", // 02 uplifting reveal (denys the perfect moment, 185s)
  darkMystical: "music/universfield-dark-mystical-background-143163.mp3", // 03 mystery (kept long name)
  miracle: "music/5.mp3", // 04 hopeful curiosity (emmraan waiting for a miracle, 60s)
  dark: "music/10.mp3", // 05 empire / builder (leberch dark, 222s)
  inspiringCorporate: "music/1.mp3", // 06 energetic (jonasblakewood inspiring corporate, 169s)
  ambientAtmosphere: "music/4.mp3", // 07 AI demo (atlasaudio ambient atmosphere, 110s)
  ambientHorizon: "music/the_mountain-ambient-horizon-159118.mp3", // 08 educational (kept long name)
  tribalRitual: "music/3.mp3", // 09 spiritual 7 (shivoham tribal ritual, 212s)
  sweetMemories: "music/2.mp3", // 10 emotional (cold_fire sweet memories, 120s)
  ambientNature: "music/musicinmedia-ambient-nature-222158.mp3", // spare
  // Viral system — driving violin, energetic from bar 1 (allworldmusic, 109s).
  // No head-trim needed: the track opens at full energy, so frame 0 of the
  // hook lands on the track's own opening statement.
  violinEnergetic: "music/violin-energetic.mp3",
  // legacy tracks (still available)
  ambient: "music/orbital-drift.mp3",
  mool1: "music/mool-1.mp3",
  mool2: "music/mool-2.mp3",
  mool3: "music/mool-3.mp3",
  mool4: "music/mool-4.mp3",
  mool5: "music/mool-5.mp3",
} as const;

// ── Deterministic pseudo-random (frame-stable; never Math.random in render) ──
export const hash = (n: number): number => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x); // 0..1
};
export const hashRange = (n: number, min: number, max: number): number =>
  min + hash(n) * (max - min);
