import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

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

/** Headlines, hook lines, big numbers. */
export const DISPLAY = cinzel.fontFamily;
/** Body, bullets, CTA — anything read fast. */
export const UI = inter.fontFamily;

/** 4px black outline so text survives any background. Mandatory on all text. */
export const TEXT_STROKE =
  "0 2px 0 rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.45)";
