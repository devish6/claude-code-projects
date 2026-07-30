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
    safeTop: SAFE_TOP,
    safeBottom: SAFE_BOTTOM,
    justify: "center",
    align: "center",
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
