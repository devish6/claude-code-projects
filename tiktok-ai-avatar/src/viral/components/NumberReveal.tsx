import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { hash } from "../../lib/brand";
import { DISPLAY, UI } from "../fonts";
import { usePalette } from "../PaletteContext";
import { Snap, useCameraDrift, useGlowPulse, useSpringAt } from "../motion";

/**
 * The centrepiece: the number lands with a radial burst of particles.
 *
 * The digit scrambles for a few frames before settling — a slot-machine tell
 * that buys attention far more cheaply than a slow scale-up, because the viewer
 * waits to see what it lands on.
 */
export const NumberReveal: React.FC<{
  number: number;
  label?: string;
  /** Frame at which the digit stops scrambling. */
  settleAt?: number;
  durationInFrames: number;
}> = ({ number, label, settleAt = 12, durationInFrames }) => {
  const P = usePalette();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = useSpringAt(settleAt, "burst");
  const scale = useCameraDrift(durationInFrames, 1.02, 1.09);
  const glow = useGlowPulse("rgba(120,88,24,0.42)", 1.3);

  const settled = frame >= settleAt;
  const shown = settled ? number : (Math.floor(hash(frame * 3.7) * 9) + 1);

  // Burst ring expands once, at settle.
  const burst = interpolate(frame - settleAt, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringSize = interpolate(burst, [0, 1], [180, 900]);
  const ringOpacity = interpolate(burst, [0, 0.15, 1], [0, 0.7, 0]);

  const cx = width / 2;
  const cy = height * 0.44;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
      }}
    >
      {/* Radiating particles, fired outward at settle */}
      {settled
        ? Array.from({ length: 34 }, (_, i) => {
            const ang = hash(i) * Math.PI * 2;
            const dist = interpolate(burst, [0, 1], [40, 380 + hash(i + 1) * 260]);
            const size = 4 + hash(i + 2) * 7;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: cx + Math.cos(ang) * dist,
                  top: cy + Math.sin(ang) * dist,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: P.MOTE,
                  opacity: interpolate(burst, [0, 0.2, 1], [0, 1, 0]),
                  boxShadow: `0 1px 4px rgba(60,50,20,0.35)`,
                }}
              />
            );
          })
        : null}

      {/* Expanding shock ring */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          borderRadius: "50%",
          border: `4px solid ${P.ACCENT}`,
          opacity: ringOpacity,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: cy,
          transform: `translateY(-50%) scale(${interpolate(s, [0, 1], [1.5, 1])})`,
          fontFamily: DISPLAY,
          fontSize: 460,
          fontWeight: 900,
          color: P.ACCENT,
          textShadow: glow,
          lineHeight: 1,
        }}
      >
        {shown}
      </div>

      {label ? (
        <Snap delay={settleAt + 6} y={26} style={{ position: "absolute", top: cy + 300 }}>
          <div
            style={{
              fontFamily: UI,
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: P.TEXT,
              textShadow: P.TEXT_SHADOW,
              textAlign: "center",
              // 🔴 Without a cap this div is auto-width and CENTRED, so a long
              // label grows past 1080 and is clipped off BOTH edges rather than
              // wrapping. Found by looking at a render — no test caught it,
              // because every label before 2026-08-07 was two or three words.
              // 920 leaves 80px each side; short labels are unaffected, so the
              // V01–V06 baseline still renders identically.
              maxWidth: 920,
            }}
          >
            {label}
          </div>
        </Snap>
      ) : null}
    </AbsoluteFill>
  );
};
