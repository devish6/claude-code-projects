import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { hash } from "../lib/brand";

/**
 * Viral motion primitives.
 *
 * Every entrance here is spring-driven and overshoots. Nothing in this file
 * uses a linear opacity ramp longer than ~6 frames — a slow fade is the single
 * most retention-destroying thing in short-form.
 *
 * Remotion rule: CSS transitions/animations never render. All motion is
 * derived from useCurrentFrame().
 */

// ── Spring configs ──────────────────────────────────────────────────────────
export const SPRING = {
  /** Explosive snap — default for body text. */
  snap: { damping: 15, stiffness: 400, mass: 0.8 },
  /** Hook entrance — the most violent one, overshoots hard. */
  burst: { damping: 12, stiffness: 500, mass: 0.9 },
  /** Slide from the side. */
  slide: { damping: 20, stiffness: 300, mass: 1 },
  /** Settled, no overshoot — used only for the final brand card. */
  settle: { damping: 200, stiffness: 120, mass: 0.8 },
} as const;

type SpringName = keyof typeof SPRING;

/** Spring value 0→1 starting at `delay`. */
export const useSpringAt = (delay = 0, config: SpringName = "snap"): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: SPRING[config] });
};

/** Fast opacity ramp — deliberately capped so it reads as an appearance, not a fade. */
export const useSnapOpacity = (delay = 0, frames = 4): number => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

// ── Snap: scale-overshoot entrance ──────────────────────────────────────────
export const Snap: React.FC<{
  delay?: number;
  y?: number;
  from?: number;
  config?: SpringName;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, y = 40, from = 0.6, config = "snap", style, children }) => {
  const s = useSpringAt(delay, config);
  const opacity = useSnapOpacity(delay);
  const scale = interpolate(s, [0, 1], [from, 1]);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - s) * y}px) scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── Burst: the hook entrance. Scales DOWN from oversize + slight rotation ────
export const Burst: React.FC<{
  delay?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, style, children }) => {
  const s = useSpringAt(delay, "burst");
  const opacity = useSnapOpacity(delay, 2); // 2 frames — effectively a hard cut
  const scale = interpolate(s, [0, 1], [1.45, 1]);
  const rotate = interpolate(s, [0, 1], [-4, 0]);
  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── Slide: enters from reading direction ────────────────────────────────────
export const SlideIn: React.FC<{
  delay?: number;
  x?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, x = -100, style, children }) => {
  const s = useSpringAt(delay, "slide");
  const opacity = useSnapOpacity(delay);
  return (
    <div
      style={{
        opacity,
        transform: `translateX(${(1 - s) * x}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── Continuous float — keeps "static" text alive ────────────────────────────
export const useFloat = (amplitude = 6, cycleSeconds = 2.5, phase = 0): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.sin((frame / fps) * ((Math.PI * 2) / cycleSeconds) + phase) * amplitude;
};

export const Float: React.FC<{
  amplitude?: number;
  phase?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ amplitude = 6, phase = 0, style, children }) => {
  const y = useFloat(amplitude, 2.5, phase);
  return <div style={{ transform: `translateY(${y}px)`, ...style }}>{children}</div>;
};

// ── Glow pulse — returns a textShadow string ────────────────────────────────
export const useGlowPulse = (color: string, cycleSeconds = 1.5): string => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = 0.5 + 0.5 * Math.sin((frame / fps) * ((Math.PI * 2) / cycleSeconds));
  const blur = interpolate(t, [0, 1], [10, 34]);
  return `0 0 ${blur}px ${color}`;
};

// ── Camera punch — subtle continuous zoom so no frame is ever truly static ──
export const useCameraDrift = (
  durationInFrames: number,
  from = 1,
  to = 1.06,
): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateRight: "clamp",
  });
};

// ── Shake — pattern interrupt, deterministic (never Math.random in render) ──
export const useShake = (startFrame: number, frames = 12, amount = 6): number => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0 || local > frames) return 0;
  const decay = 1 - local / frames;
  return (hash(local * 7.3) * 2 - 1) * amount * decay;
};

// ── Chromatic aberration offset (px) that decays after a hit ────────────────
export const useAberration = (startFrame: number, frames = 10, amount = 8): number => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0 || local > frames) return 0;
  return amount * (1 - local / frames);
};
