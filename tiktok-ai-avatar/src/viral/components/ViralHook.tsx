import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DISPLAY, UI } from "../fonts";
import { ACCENT, ACCENT_ALERT, TEXT, TEXT_SHADOW } from "../palette";
import { Burst, useAberration, useCameraDrift, useGlowPulse } from "../motion";

export type HookVariant = "identity" | "contrarian" | "mystery";

/**
 * Frame 0 of every video. There is no intro, no logo, no fade — the first
 * rendered frame already contains large readable text that is already moving.
 *
 * `accent` is the word that carries the curiosity gap; it gets the gold + glow
 * so the eye lands on it before reading the rest of the line.
 */
export const ViralHook: React.FC<{
  text: string;
  accent?: string;
  subtext?: string;
  variant?: HookVariant;
  durationInFrames?: number;
  /**
   * Font overrides for non-Latin cuts. Cinzel and Inter carry no Devanagari,
   * so Hindi copy set in them renders as tofu boxes. Defaults reproduce the
   * previous hardcoded values exactly, so every existing video is unchanged.
   */
  displayFont?: string;
  uiFont?: string;
}> = ({
  text,
  accent,
  subtext,
  variant = "identity",
  durationInFrames = 60,
  displayFont = DISPLAY,
  uiFont = UI,
}) => {
  const frame = useCurrentFrame();
  const scale = useCameraDrift(durationInFrames, 1, 1.08);
  const ab = useAberration(0, 8, 10);
  const glow = useGlowPulse(
    variant === "contrarian" ? "rgba(150,40,20,0.35)" : "rgba(120,88,24,0.38)",
    1.2,
  );

  const accentColor = variant === "contrarian" ? ACCENT_ALERT : ACCENT;

  // Hard cut: text is at full size on frame 0, then settles. No opacity ramp.
  const settle = interpolate(frame, [0, 5], [1.12, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: 70,
        textAlign: "center",
        transform: `scale(${scale})`,
      }}
    >
      <Burst>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 112,
            fontWeight: 900,
            lineHeight: 1.02,
            color: TEXT,
            letterSpacing: -1,
            textShadow: TEXT_SHADOW,
            transform: `scale(${settle})`,
          }}
        >
          {/* Chromatic aberration: offset colour ghosts that decay in ~8 frames */}
          {ab > 0 ? (
            <>
              <span
                style={{
                  position: "absolute",
                  left: `calc(50% - ${ab}px)`,
                  transform: "translateX(-50%)",
                  color: "rgba(150,40,30,0.32)",
                  width: "100%",
                }}
                aria-hidden
              >
                {text}
              </span>
              <span
                style={{
                  position: "absolute",
                  left: `calc(50% + ${ab}px)`,
                  transform: "translateX(-50%)",
                  color: "rgba(30,90,120,0.32)",
                  width: "100%",
                }}
                aria-hidden
              >
                {text}
              </span>
            </>
          ) : null}
          <span style={{ position: "relative" }}>{text}</span>
        </div>
      </Burst>

      {accent ? (
        <Burst delay={5}>
          <div
            style={{
              marginTop: 26,
              fontFamily: displayFont,
              fontSize: 128,
              fontWeight: 900,
              lineHeight: 1,
              color: accentColor,
              letterSpacing: -1,
              textShadow: glow,
            }}
          >
            {accent}
          </div>
        </Burst>
      ) : null}

      {subtext ? (
        <Burst delay={10}>
          <div
            style={{
              marginTop: 34,
              fontFamily: uiFont,
              fontSize: 52,
              fontWeight: 700,
              color: TEXT,
              opacity: 0.9,
              textShadow: TEXT_SHADOW,
            }}
          >
            {subtext}
          </div>
        </Burst>
      ) : null}
    </AbsoluteFill>
  );
};
