import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CREAM_ON_DARK, GOLD, GREEN, GREEN_FG } from "../../lib/brand";
import { DISPLAY, TEXT_STROKE, UI } from "../fonts";
import { Snap, useFloat, useGlowPulse } from "../motion";

/**
 * The only place branding is permitted — final ~3 seconds.
 *
 * The comment prompt comes FIRST and is the largest element; the wordmark and
 * URL are secondary. Comments are the strongest algorithmic signal available,
 * so the CTA optimises for a reply, not for a click.
 */
export const CTAEnding: React.FC<{
  /** The engagement ask, e.g. "Comment your birth date". */
  text: string;
  url?: string;
  brandName?: string;
  durationInFrames: number;
}> = ({ text, url = "numevix.com", brandName = "Numevix", durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = useGlowPulse("rgba(212,175,55,0.55)", 1.2);
  const arrowY = useFloat(14, 0.9);
  const pulse = 1 + 0.035 * Math.sin((frame / fps) * 7);

  // Underline draws itself under the URL.
  const underline = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        textAlign: "center",
      }}
    >
      <Snap y={60} from={0.75} config="burst">
        <div
          style={{
            fontFamily: UI,
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.12,
            color: CREAM_ON_DARK,
            textShadow: TEXT_STROKE,
          }}
        >
          {text}
        </div>
      </Snap>

      <div
        style={{
          marginTop: 18,
          fontSize: 82,
          transform: `translateY(${arrowY}px)`,
        }}
      >
        👇
      </div>

      <Snap delay={14} y={30}>
        <div
          style={{
            marginTop: 40,
            fontFamily: DISPLAY,
            fontSize: 104,
            fontWeight: 900,
            color: GOLD,
            letterSpacing: 3,
            textShadow: glow,
          }}
        >
          {brandName}
        </div>
      </Snap>

      <Snap delay={22} y={22}>
        <div
          style={{
            marginTop: 26,
            transform: `scale(${pulse})`,
            background: GREEN,
            border: `2px solid ${GOLD}`,
            color: GREEN_FG,
            fontFamily: UI,
            fontWeight: 900,
            fontSize: 48,
            padding: "22px 52px",
            borderRadius: 60,
            boxShadow: "0 16px 44px -14px oklch(0.52 0.085 158 / 0.6)",
          }}
        >
          {url}
        </div>
      </Snap>

      <div
        style={{
          marginTop: 14,
          height: 4,
          width: 300 * underline,
          borderRadius: 4,
          background: GOLD,
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};
