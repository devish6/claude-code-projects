import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DISPLAY, UI } from "../fonts";
import { ACCENT, ACCENT_GREEN, ON_GREEN, TEXT, TEXT_SHADOW } from "../palette";
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
  /**
   * Part of the contract every caller passes, but unused: this card's motion
   * is all delay-driven off frame 0, so it needs no knowledge of the scene
   * length. Deliberately not destructured — it was previously the last
   * parameter, where the lint rule's `args: after-used` hid the fact.
   */
  durationInFrames: number;
  /**
   * Font override for non-Latin cuts. Only the ask is translated — the
   * wordmark and URL stay in DISPLAY/UI, because a brand name rendered in a
   * different face per language stops being one brand.
   */
  uiFont?: string;
}> = ({ text, url = "numevix.com", brandName = "Numevix", uiFont = UI }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = useGlowPulse("rgba(120,88,24,0.36)", 1.2);
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
            fontFamily: uiFont,
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.12,
            color: TEXT,
            textShadow: TEXT_SHADOW,
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
            color: ACCENT,
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
            background: ACCENT_GREEN,
            border: `2px solid ${ACCENT}`,
            color: ON_GREEN,
            fontFamily: UI,
            fontWeight: 900,
            fontSize: 48,
            padding: "22px 52px",
            borderRadius: 60,
            boxShadow: "0 16px 40px -14px rgba(40,60,45,0.55)",
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
          background: ACCENT,
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};
