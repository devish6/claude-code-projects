import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadNotoSerifDev } from "@remotion/google-fonts/NotoSerifDevanagari";
import { loadFont as loadNotoSansDev } from "@remotion/google-fonts/NotoSansDevanagari";

/**
 * Viral system typography.
 *
 * The original promos used system Georgia, which reads thin and generic at the
 * 100px+ sizes short-form demands. Cinzel is a Roman-inscription serif — it
 * carries the mystical/premium register without costing legibility at speed.
 * Inter is the workhorse for anything the viewer must read in under a second.
 */
// Only the weights/subsets actually used — the default load fires 100+ network
// requests per render and slows every frame.
const cinzel = loadCinzel("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});
const inter = loadInter("normal", {
  weights: ["700", "800", "900"],
  subsets: ["latin"],
});

// Devanagari counterparts. Cinzel and Inter carry no Devanagari glyphs at all,
// so a Hindi string set in them renders as tofu boxes rather than falling back
// to something legible — the script needs its own pair, not a weight variant.
// Same weight/subset pinning applies; the "devanagari" subset is the point.
const notoSerifDev = loadNotoSerifDev("normal", {
  weights: ["700"],
  subsets: ["devanagari"],
});
const notoSansDev = loadNotoSansDev("normal", {
  weights: ["700", "800"],
  subsets: ["devanagari"],
});

/** Headlines, hook lines, big numbers. */
export const DISPLAY = cinzel.fontFamily;
/** Body, bullets, CTA — anything read fast. */
export const UI = inter.fontFamily;

/**
 * Hindi equivalents of DISPLAY / UI.
 *
 * ⚠️ ORDER IS LOAD-BEARING, and it is the opposite of what reads naturally:
 * the LATIN face goes first. Hindi copy here is always mixed script — "UPI",
 * "GPay", "₹354" sit inside Devanagari sentences — and the browser picks the
 * first family in the stack that has each glyph. Cinzel/Inter have no
 * Devanagari, so Devanagari falls through to Noto; Latin and digits stay in
 * the same faces the English videos use. Put Noto first and every Latin run
 * silently changes weight mid-sentence.
 */
export const DISPLAY_HI = `${cinzel.fontFamily}, ${notoSerifDev.fontFamily}`;
export const UI_HI = `${inter.fontFamily}, ${notoSansDev.fontFamily}`;

/** 4px black outline so text survives any background. Mandatory on all text. */
export const TEXT_STROKE =
  "0 2px 0 rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.45)";
