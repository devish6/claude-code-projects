import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CREAM_A,
  CREAM_B,
  DARK_A,
  DARK_B,
  GOLD,
  GOLD_BRIGHT,
  GREEN,
  hash,
  hashRange,
} from "../lib/brand";

// ── Rotating numerology dial (concentric rings + spokes + ticks) ────────────
export const Dial: React.FC<{ rot: number; opacity: number; scale?: number }> = ({
  rot,
  opacity,
  scale = 1,
}) => {
  const circles = [480, 372, 264, 156];
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);
  return (
    <svg
      viewBox="0 0 1000 1000"
      style={{
        position: "absolute",
        width: 1500 * scale,
        height: 1500 * scale,
        left: "50%",
        top: "42%",
        transform: `translate(-50%, -50%) rotate(${rot}deg)`,
        opacity,
      }}
    >
      <g stroke="currentColor" fill="none" strokeWidth={1.4}>
        {circles.map((r) => (
          <circle key={r} cx={500} cy={500} r={r} />
        ))}
        {spokes.map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={`s${a}`}
              x1={500}
              y1={500}
              x2={500 + 480 * Math.cos(rad)}
              y2={500 + 480 * Math.sin(rad)}
              strokeWidth={0.9}
            />
          );
        })}
        {ticks.map((a) => {
          const rad = (a * Math.PI) / 180;
          const r1 = a % 30 === 0 ? 452 : 468;
          return (
            <line
              key={`t${a}`}
              x1={500 + r1 * Math.cos(rad)}
              y1={500 + r1 * Math.sin(rad)}
              x2={500 + 480 * Math.cos(rad)}
              y2={500 + 480 * Math.sin(rad)}
              strokeWidth={1.6}
            />
          );
        })}
      </g>
    </svg>
  );
};

// ── Drifting gold particle field (twinkling dust) ───────────────────────────
export const ParticleField: React.FC<{
  count?: number;
  color?: string;
  opacity?: number;
  seed?: number;
}> = ({ count = 60, color = GOLD, opacity = 1, seed = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const k = i + seed * 1000;
        const baseX = hash(k) * width;
        const baseY = hash(k + 0.5) * height;
        const size = hashRange(k + 1, 2, 7);
        const driftY = Math.sin(t * hashRange(k + 2, 0.2, 0.6) + k) * 26;
        const driftX = Math.cos(t * hashRange(k + 3, 0.15, 0.5) + k) * 18;
        const twinkle =
          0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * hashRange(k + 4, 1.2, 3) + k));
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
              background: color,
              opacity: twinkle,
              boxShadow: `0 0 ${size * 2.5}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── Particles that converge toward centre (progress 0→1) ────────────────────
export const ConvergingParticles: React.FC<{
  progress: number;
  count?: number;
  color?: string;
}> = ({ progress, count = 44, color = GOLD_BRIGHT }) => {
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.42;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <AbsoluteFill>
      {Array.from({ length: count }, (_, i) => {
        const ang = hash(i) * Math.PI * 2;
        const rad = hashRange(i + 1, 380, 780);
        const startX = cx + Math.cos(ang) * rad;
        const startY = cy + Math.sin(ang) * rad;
        const ease = 1 - Math.pow(1 - p, 3);
        const x = interpolate(ease, [0, 1], [startX, cx]);
        const y = interpolate(ease, [0, 1], [startY, cy]);
        const size = hashRange(i + 2, 3, 8) * (1 - p * 0.5);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: interpolate(p, [0, 0.15, 0.9, 1], [0, 1, 1, 0]),
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── AI neural network (nodes + firing links) ────────────────────────────────
export const NeuralNet: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const cols = 4;
  const rows = 6;
  const nodes = Array.from({ length: cols * rows }, (_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = width * (0.16 + (c / (cols - 1)) * 0.68) + Math.sin(t + i) * 10;
    const y = height * (0.2 + (r / (rows - 1)) * 0.58) + Math.cos(t + i) * 10;
    return { x, y, c };
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {nodes.map((n, i) =>
          nodes
            .filter((m) => m.c === n.c + 1)
            .map((m, j) => {
              const fire = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.3 + j);
              return (
                <line
                  key={`${i}-${j}`}
                  x1={n.x}
                  y1={n.y}
                  x2={m.x}
                  y2={m.y}
                  stroke={GOLD}
                  strokeWidth={1.2}
                  opacity={0.12 + fire * 0.32}
                />
              );
            }),
        )}
        {nodes.map((n, i) => {
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + i);
          return (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={5 + pulse * 4}
              fill={i % 3 === 0 ? GREEN : GOLD}
              opacity={0.5 + pulse * 0.5}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ── Full-frame brand surface (cream or ink), with dials, glow, particles ────
export const Surface: React.FC<{
  variant?: "cream" | "ink";
  particles?: boolean;
}> = ({ variant = "cream", particles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const glowY = 30 + Math.cos(t * 0.2) * 5;

  if (variant === "ink") {
    return (
      <AbsoluteFill
        style={{ background: `linear-gradient(160deg, ${DARK_A}, ${DARK_B})` }}
      >
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 75% 50% at 50% ${glowY}%, oklch(0.72 0.10 80 / 0.22), transparent 62%)`,
          }}
        />
        <AbsoluteFill style={{ color: GOLD }}>
          <Dial rot={t * 3} opacity={0.14} />
          <Dial rot={-t * 2 + 15} opacity={0.08} />
        </AbsoluteFill>
        <ParticleField count={70} opacity={0.9} />
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, oklch(0.10 0.02 165 / 0.6) 100%)",
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(158deg, ${CREAM_A}, ${CREAM_B})` }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% ${glowY}%, oklch(0.72 0.10 80 / 0.18), transparent 60%)`,
        }}
      />
      <AbsoluteFill style={{ color: GOLD }}>
        <Dial rot={t * 3} opacity={0.1} />
        <Dial rot={-t * 2 + 15} opacity={0.06} />
      </AbsoluteFill>
      {particles ? <ParticleField count={34} opacity={0.5} /> : null}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 60%, oklch(0.80 0.03 80 / 0.28) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Count / scramble a number up to a target ────────────────────────────────
export const CountUp: React.FC<{
  to: number;
  frames: number;
  style?: React.CSSProperties;
}> = ({ to, frames, style }) => {
  const frame = useCurrentFrame();
  const v = Math.round(
    interpolate(frame, [0, frames], [0, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return <span style={style}>{v}</span>;
};

// Scramble single digit, settle on `to` after `settleAt` frames.
export const DigitScramble: React.FC<{
  to: number;
  settleAt: number;
  style?: React.CSSProperties;
}> = ({ to, settleAt, style }) => {
  const frame = useCurrentFrame();
  const settled = frame >= settleAt;
  const shown = settled ? to : Math.floor(hash(frame * 3.7) * 9) + 1;
  return <span style={style}>{shown}</span>;
};
