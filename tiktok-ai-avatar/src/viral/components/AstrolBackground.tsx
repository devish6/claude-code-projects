import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DARK_A, DARK_B, GOLD } from "../../lib/brand";
import { Dial, ParticleField } from "../../components/vfx";

/**
 * Living backdrop. Reuses the existing brand Dial + ParticleField so the viral
 * system stays visually continuous with numevix.com and the original promos.
 *
 * Difference from `Surface`: the dial rotates faster, particles are denser, and
 * the vignette breathes — the background must never be a still frame, because a
 * motionless background reads as a paused video during a fast scroll.
 */
export const AstrolBackground: React.FC<{
  /** Degrees per second. */
  rotationSpeed?: number;
  particleDensity?: number;
  /** Reacts to a beat/text hit — brief brightness lift. */
  pulseAt?: number[];
}> = ({ rotationSpeed = 6, particleDensity = 90, pulseAt = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Brief glow lift when a text hit lands.
  const pulse = pulseAt.reduce((acc, at) => {
    const d = frame - at;
    if (d < 0 || d > 10) return acc;
    return Math.max(acc, 1 - d / 10);
  }, 0);

  const glowStrength = 0.22 + pulse * 0.28;
  const glowY = 32 + Math.cos(t * 0.35) * 6;

  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(160deg, ${DARK_A}, ${DARK_B})` }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 50% at 50% ${glowY}%, oklch(0.72 0.10 80 / ${glowStrength}), transparent 62%)`,
        }}
      />
      <AbsoluteFill style={{ color: GOLD }}>
        <Dial rot={t * rotationSpeed} opacity={0.16 + pulse * 0.1} />
        <Dial rot={-t * (rotationSpeed * 0.6) + 15} opacity={0.09} />
      </AbsoluteFill>
      <ParticleField count={particleDensity} opacity={0.95} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 52%, oklch(0.10 0.02 165 / 0.68) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
