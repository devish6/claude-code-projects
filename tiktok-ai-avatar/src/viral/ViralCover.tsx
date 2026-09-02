import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, UI } from "./fonts";
import { PaletteProvider, usePalette } from "./PaletteContext";
import { AstrolBackground } from "./components/AstrolBackground";
import type { HookVariant } from "./components/ViralHook";

/**
 * Static 1080x1920 cover for a viral video, in the video's own palette.
 *
 * A cover is NOT a frame grab: the video's opening frames are mid-spring and
 * mid-aberration, so a grab lands on skewed, ghosted type. This composition
 * renders the same words at rest, with the number as a large watermark for
 * recognisability in a grid.
 *
 * Rendered via `remotion still` at frame 30, where the background dial has
 * rotated into a pleasing position and the motes have spread out.
 */
export type ViralCoverProps = {
  kicker: string;
  title: string;
  /**
   * 🪤 OPTIONAL, because one-element hooks (V52, V53, V54) have no second line
   * by design. Declared required, it made every such cover a tsc error while
   * rendering an EMPTY div that still contributed its 28px top margin — a
   * phantom gap above the wordmark on exactly the covers whose thesis is that
   * there is nothing else to read.
   */
  accent?: string;
  /**
   * The oversized watermark. A string as well as a number because the
   * announcement covers watermark "UPI" rather than a moolank — it is drawn,
   * never used in arithmetic.
   */
  number: number | string;
  variant: HookVariant;
  /** Font overrides for non-Latin covers; defaults match the Latin videos. */
  displayFont?: string;
  uiFont?: string;
  /**
   * The video's palette, so the cover matches the film it fronts.
   *
   * 🔴 THE BUG THIS FIXES, and why it went unseen for so long: when the four
   * palettes landed (`cc57cac`) the viral COMPONENTS were converted to read
   * from PaletteContext, but ViralCover was deliberately left on the static
   * sage-gold imports and recorded as "untouched". That was defensible for
   * exactly as long as nothing read the cover — and covers had been rendered
   * beside every MP4 since V01 with no publisher using them. On 2026-07-31 the
   * publishers started setting them, and the mismatch became the first thing a
   * viewer sees: V24 is ink-violet (mean frame #22213f, near-black) behind a
   * sage-gold cover (#aba57c, light khaki). The thumbnail looked like it
   * belonged to a different account.
   *
   * ⭐ THE GENERAL LESSON: "unchanged by design" stops being safe the moment
   * something new consumes the output. A default that is inert is not the same
   * as a default that is correct.
   *
   * Omitting it keeps sage-gold, so the V01–V06 baseline covers and the UPI
   * announcement covers — none of which carry a palette — render identically.
   */
  palette?: string;
};

export const ViralCover: React.FC<ViralCoverProps> = ({ palette, ...props }) => (
  <PaletteProvider name={palette}>
    <CoverBody {...props} />
  </PaletteProvider>
);

/**
 * How far the watermark hangs off the right edge.
 *
 * 🔴 THE BUG THIS FIXES. The bleed was a flat `right: -80`, tuned by eye on wide
 * numerals. At `fontSize: 640` that clips ~18% off a 7 or a 2, which still reads
 * as the digit. **"1" is far narrower than every other numeral**, so the same 80px
 * removed most of its ink and the cover rendered a grey SLAB running off the edge
 * — unrecognisable as a number at all.
 *
 * 🔴 IT DID SHIP. `Viral-04-Identity-One` ("You Hate Being Told What To Do",
 * 2026-07-17) carries a 1 and went out with the slab; it was simply never looked
 * at, because covers had no consumer until the publishers began setting them on
 * 07-31 — the same blind spot, and the same two weeks, as the sage-gold mismatch
 * documented above. ⚠️ V04's cover as POSTED therefore differs from what this
 * composition renders today. That is a fix, not a regression, but do not describe
 * the two as identical.
 * ⭐ The other 11 covers run 2, 3, 4, 7, 8 and the string "UPI" and are unchanged
 * by this — `watermarkBleed` returns the original -80 for every one of them.
 *
 * 🪤 Judge any change here by RENDERING THE STILL AND LOOKING AT IT. The glyph's
 * side bearing is a property of the display face, not something computable from the
 * character, so these numbers are measured by eye and cannot be derived.
 */
export const watermarkBleed = (n: number | string): number =>
  String(n).trim() === "1" ? -8 : -80;

const CoverBody: React.FC<Omit<ViralCoverProps, "palette">> = ({
  kicker,
  title,
  accent,
  number,
  variant,
  displayFont = DISPLAY,
  uiFont = UI,
}) => {
  const P = usePalette();
  const accentColor = variant === "contrarian" ? P.ACCENT_ALERT : P.ACCENT;

  return (
    <AbsoluteFill>
      <AstrolBackground rotationSpeed={6} particleDensity={70} />

      {/* Oversized number, bled off the right edge */}
      <div
        style={{
          position: "absolute",
          right: watermarkBleed(number),
          bottom: 150,
          fontFamily: displayFont,
          fontSize: 640,
          fontWeight: 900,
          lineHeight: 1,
          color: accentColor,
          opacity: 0.14,
        }}
      >
        {number}
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: 88,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: uiFont,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: accentColor,
            marginBottom: 40,
          }}
        >
          {kicker}
        </div>

        <div
          style={{
            fontFamily: displayFont,
            fontSize: 116,
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: -1,
            color: P.TEXT,
            textShadow: P.TEXT_SHADOW,
          }}
        >
          {title}
        </div>

        {accent ? (
          <div
            style={{
              marginTop: 28,
              fontFamily: displayFont,
              fontSize: 132,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -1,
              color: accentColor,
              textShadow: P.glowFor(0.3),
            }}
          >
            {accent}
          </div>
        ) : null}

        {/* Rule + wordmark, small — a cover still shouldn't lead with brand */}
        <div
          style={{
            marginTop: 72,
            height: 4,
            width: 180,
            borderRadius: 4,
            background: accentColor,
            opacity: 0.85,
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontFamily: DISPLAY,
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: 4,
            color: P.ACCENT,
            opacity: 0.9,
          }}
        >
          Numevix
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
