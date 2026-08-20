import React, { createContext, useContext } from "react";

import { HEIGHT } from "./timing";

/**
 * Per-video layout.
 *
 * Varying duration and tempo changed how long a video ran and where its cuts
 * fell, but every frame still shared one arrangement: everything centred, one
 * type scale, one rhythm. That is the visible half of the duplicate
 * fingerprint, and it is what a human scrolling actually notices.
 *
 * Each spec is pure geometry. Components read it and arrange themselves; no
 * layout needs its own composition, so this adds no new render code.
 */
export const LAYOUTS = ["centered", "split", "fullbleed", "grid", "stack"] as const;

export type LayoutName = (typeof LAYOUTS)[number];

export type LayoutSpec = {
  /** Horizontal padding. Also keeps type clear of TikTok's right rail. */
  padX: number;
  /** Reserved space at the bottom for the platform's caption bar. */
  safeBottom: number;
  /**
   * Reserved space at the top.
   *
   * 🔴 Not cosmetic. A `flex-start` layout with no top padding pins text to
   * y=0, where it is clipped by the frame edge and sits under the platform's
   * own top chrome. The split layout shipped exactly that until a frame was
   * pulled from a render and looked at.
   */
  safeTop: number;
  /** Where the block sits vertically. */
  justify: "flex-start" | "center" | "flex-end";
  /** Text alignment within the block. */
  align: "left" | "center";
  /**
   * Where the HOOK block sits. The hook is its own composition — it renders no
   * traits, so it does not share the body's safe box and gets its own geometry.
   *
   * 🔴🔴 THESE EXIST BECAUSE `hookSize` WAS DEAD FOR THE WHOLE V-SERIES.
   * `ViralHook` hardcoded `alignItems/justifyContent: center`, `padding: 70`
   * and `fontSize: 112/128/52`, and never called `useLayout()`. So the
   * `layout` prop moved the BODY and left the FIRST FRAME identical on every
   * video — V35-V40 all shipped the same centred hook, and V40 shipped
   * `layout: "stack"` while still rendering dead-centre. The only field that
   * described the hook, `hookSize`, was read by nothing but a test asserting
   * it was greater than zero. Measured consequence: four consecutive posts
   * pinned at a 54.9-56.5% 1s hold while the team varied palette, tempo and
   * duration and believed it was varying the composition.
   * ⭐ `centered`'s values below reproduce the old hardcoded rendering EXACTLY
   * (70px padding, centre/centre, 112/128/52), so every published video
   * re-renders unchanged and stays usable as a control.
   */
  hookJustify: "flex-start" | "center" | "flex-end";
  hookAlign: "left" | "center";
  /** Hook padding on left, right and top. */
  hookPad: number;
  /** Hook padding at the bottom — larger where `hookJustify` pins text low. */
  hookPadBottom: number;
  /**
   * Accent size. The headline is 0.875x this and the subtext 0.40625x, which
   * at the `centered` value of 128 is exactly the 112 / 128 / 52 that shipped.
   */
  hookSize: number;
  traitSize: number;
  /** Space between trait lines. */
  gap: number;
  /** Traits laid out as rows, or as a 2-column grid. */
  traitFlow: "column" | "grid";
};

/** TikTok's caption bar and action rail eat roughly the bottom 15%. */
const SAFE_BOTTOM = Math.round(HEIGHT * 0.16);
/** Clears the frame edge and the platform's top chrome. */
const SAFE_TOP = Math.round(HEIGHT * 0.12);

export const LAYOUT_SPECS: Record<LayoutName, LayoutSpec> = {
  /** The original: everything centred, generous gaps. */
  centered: {
    padX: 80,
    /**
     * 🔴 DELIBERATELY DEEPER THAN `SAFE_TOP`. `justify: "center"` centres the
     * block between safeTop and safeBottom, so this is the knob that sets the
     * copy's height. The backdrop's Metatron's Cube occupies the upper field
     * (lowest ink at y=834); at the shared SAFE_TOP the text centred at ~921
     * and sat right on the figure's lower arc. 0.25 puts it at ~1046, clear of
     * the cube and still well above the platform caption bar.
     * ⛔ If the cube's GEO_CY or radii change, re-check this against it.
     */
    safeTop: Math.round(HEIGHT * 0.25),
    safeBottom: SAFE_BOTTOM,
    justify: "center",
    align: "center",
    hookJustify: "center",
    hookAlign: "center",
    hookPad: 70,
    hookPadBottom: 70,
    hookSize: 128,
    traitSize: 72,
    gap: 64,
    traitFlow: "column",
  },

  /** Content pinned high, so the lower third stays clear of the UI entirely. */
  split: {
    padX: 96,
    safeTop: Math.round(HEIGHT * 0.2),
    safeBottom: Math.round(HEIGHT * 0.3),
    justify: "flex-start",
    align: "left",
    hookJustify: "flex-start",
    hookAlign: "left",
    hookPad: 96,
    hookPadBottom: Math.round(HEIGHT * 0.3),
    hookSize: 116,
    traitSize: 66,
    gap: 44,
    traitFlow: "column",
  },

  /** Oversized type running edge to edge. Loud, minimal margin. */
  fullbleed: {
    padX: 48,
    safeTop: SAFE_TOP,
    safeBottom: SAFE_BOTTOM,
    justify: "center",
    align: "left",
    hookJustify: "center",
    hookAlign: "left",
    hookPad: 48,
    hookPadBottom: 48,
    hookSize: 164,
    traitSize: 88,
    gap: 32,
    traitFlow: "column",
  },

  /** Traits in two columns — echoes the Vedic grid the app itself draws. */
  /**
   * Two columns. Type is the smallest of the set because each cell is only
   * half the frame wide — at the default 64px a four-word trait wrapped to one
   * word per line, which a render check caught.
   */
  grid: {
    padX: 56,
    safeTop: SAFE_TOP,
    safeBottom: SAFE_BOTTOM,
    justify: "center",
    align: "left",
    hookJustify: "center",
    hookAlign: "left",
    hookPad: 56,
    hookPadBottom: 56,
    hookSize: 120,
    traitSize: 48,
    gap: 28,
    traitFlow: "grid",
  },

  /** Editorial: left-aligned, tight, sitting low above the safe area. */
  stack: {
    padX: 88,
    safeTop: SAFE_TOP,
    safeBottom: Math.round(HEIGHT * 0.22),
    justify: "flex-end",
    align: "left",
    hookJustify: "flex-end",
    hookAlign: "left",
    hookPad: 88,
    hookPadBottom: Math.round(HEIGHT * 0.2),
    hookSize: 104,
    traitSize: 62,
    gap: 28,
    traitFlow: "column",
  },
};

const LayoutContext = createContext<LayoutSpec>(LAYOUT_SPECS.centered);

export const useLayout = (): LayoutSpec => useContext(LayoutContext);

export const LayoutProvider: React.FC<{
  name?: string;
  children: React.ReactNode;
}> = ({ name, children }) => (
  <LayoutContext.Provider
    value={LAYOUT_SPECS[(name as LayoutName) ?? "centered"] ?? LAYOUT_SPECS.centered}
  >
    {children}
  </LayoutContext.Provider>
);
