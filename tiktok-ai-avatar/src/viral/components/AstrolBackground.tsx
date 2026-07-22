import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { hash, hashRange } from "../../lib/brand";
import { Dial } from "../../components/vfx";
import { DIAL_INK, GRAD_A, GRAD_B, GRAD_MID, HALO, MOTE, VIGNETTE } from "../palette";

/**
 * Living backdrop — light sage-and-gold gradient with a slowly rotating
 * numerology dial and drifting motes.
 *
 * The background must never be a still frame; a motionless backdrop reads as a
 * paused video during a fast scroll. The gradient itself drifts, the dial
 * rotates, and the motes float.
 *
 * Motes are drawn dark-on-light here. The dark theme's bright-gold sparkles
 * are invisible against a light ground, so these are deeper and rely on a soft
 * shadow rather than a glow.
 */
export const AstrolBackground: React.FC<{
  /** Degrees per second. */
  rotationSpeed?: number;
  particleDensity?: number;
  /** Reacts to a beat/text hit — brief warmth lift. */
  pulseAt?: number[];
}> = ({ rotationSpeed = 6, particleDensity = 70, pulseAt = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const pulse = pulseAt.reduce((acc, at) => {
    const d = frame - at;
    if (d < 0 || d > 10) return acc;
    return Math.max(acc, 1 - d / 10);
  }, 0);

  // The gradient angle drifts a few degrees so the ground is never static.
  const angle = 152 + Math.sin(t * 0.18) * 6;
  const haloY = 34 + Math.cos(t * 0.3) * 5;
  const haloScale = 1 + pulse * 0.12;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${GRAD_A} 0%, ${GRAD_MID} 48%, ${GRAD_B} 100%)`,
      }}
    >
      {/* Warm halo behind the subject */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${68 * haloScale}% ${
            44 * haloScale
          }% at 50% ${haloY}%, ${HALO}, transparent 66%)`,
        }}
      />

      {/* Numerology dial, drawn in ink so it survives the light ground */}
      <AbsoluteFill style={{ color: DIAL_INK }}>
        <Dial rot={t * rotationSpeed} opacity={0.13 + pulse * 0.06} />
        <Dial rot={-t * (rotationSpeed * 0.6) + 15} opacity={0.07} />
      </AbsoluteFill>

      {/* Drifting motes */}
      <AbsoluteFill>
        {Array.from({ length: particleDensity }, (_, i) => {
          const baseX = hash(i) * width;
          const baseY = hash(i + 0.5) * height;
          const size = hashRange(i + 1, 3, 8);
          const driftY = Math.sin(t * hashRange(i + 2, 0.2, 0.6) + i) * 24;
          const driftX = Math.cos(t * hashRange(i + 3, 0.15, 0.5) + i) * 16;
          const twinkle =
            0.18 + 0.42 * (0.5 + 0.5 * Math.sin(t * hashRange(i + 4, 1.2, 3) + i));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: baseX + driftX,
                top: baseY + driftY,
                width: size,
                height: size,
                borderRadius: "50%",
                background: MOTE,
                opacity: twinkle,
                boxShadow: `0 1px 3px rgba(60,50,20,0.25)`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Warm edge darkening — anchors the frame, keeps text off the edges */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 88% 88% at 50% 50%, transparent 54%, ${VIGNETTE} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
