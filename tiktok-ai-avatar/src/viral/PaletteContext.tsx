import React, { createContext, useContext } from "react";

import { PALETTES, type Palette } from "./palette";

/**
 * Per-video palette.
 *
 * The viral components used to import TEXT/ACCENT/… as module constants, so
 * every video shared one look — part of the duplicate fingerprint that got the
 * first account's videos withheld. They now read the palette from context, and
 * ViralVideo supplies whichever one scripts/lib/variation.mjs picked.
 *
 * The default is "sage-gold", the original, so any component rendered outside
 * a provider (ViralCover, UpiLaunch, the ten original promos) is unchanged.
 */
const PaletteContext = createContext<Palette>(PALETTES["sage-gold"]);

export const usePalette = (): Palette => useContext(PaletteContext);

export const PaletteProvider: React.FC<{
  name?: string;
  children: React.ReactNode;
}> = ({ name, children }) => (
  <PaletteContext.Provider value={PALETTES[name ?? "sage-gold"] ?? PALETTES["sage-gold"]}>
    {children}
  </PaletteContext.Provider>
);
