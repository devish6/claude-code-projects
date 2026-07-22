import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, UI } from "./fonts";
import { ACCENT, ACCENT_ALERT, TEXT, TEXT_SHADOW } from "./palette";
import { AstrolBackground } from "./components/AstrolBackground";
import type { HookVariant } from "./components/ViralHook";

/**
 * Static 1080x1920 cover for a viral video, in the light sage-and-gold system.
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
  accent: string;
  number: number;
  variant: HookVariant;
};

export const ViralCover: React.FC<ViralCoverProps> = ({
  kicker,
  title,
  accent,
  number,
  variant,
}) => {
  const accentColor = variant === "contrarian" ? ACCENT_ALERT : ACCENT;

  return (
    <AbsoluteFill>
      <AstrolBackground rotationSpeed={6} particleDensity={70} />

      {/* Oversized number, bled off the right edge */}
      <div
        style={{
          position: "absolute",
          right: -80,
          bottom: 150,
          fontFamily: DISPLAY,
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
            fontFamily: UI,
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
            fontFamily: DISPLAY,
            fontSize: 116,
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: -1,
            color: TEXT,
            textShadow: TEXT_SHADOW,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: DISPLAY,
            fontSize: 132,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -1,
            color: accentColor,
            textShadow: "0 0 24px rgba(120,88,24,0.30)",
          }}
        >
          {accent}
        </div>

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
            color: ACCENT,
            opacity: 0.9,
          }}
        >
          Numevix
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
