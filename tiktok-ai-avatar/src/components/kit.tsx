import React from "react";
import {
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  GOLD,
  GOLD_TEXT,
  GREEN,
  GREEN_FG,
  SANS,
  SERIF,
} from "../lib/brand";

// ── Scene fade (in + out) ───────────────────────────────────────────────────
export const useSceneFade = (
  durationInFrames: number,
  fadeIn = 12,
  fadeOut = 14,
) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

// ── Spring pop-in (translateY + fade) ───────────────────────────────────────
export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  y?: number;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, y = 40, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.8, stiffness: 120 },
  });
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity, transform: `translateY(${(1 - s) * y}px)`, ...style }}>
      {children}
    </div>
  );
};

// ── Uppercase tracked eyebrow ───────────────────────────────────────────────
export const Eyebrow: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
}> = ({ children, color = GOLD_TEXT, size = 30 }) => (
  <div
    style={{
      color,
      fontFamily: SANS,
      fontSize: size,
      fontWeight: 700,
      letterSpacing: 6,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

// ── Per-letter kinetic reveal (for big hook lines) ──────────────────────────
// Letters animate individually, but each WORD is kept on one line (nowrap) so a
// word can never break across lines. Line breaks only happen between words.
export const KineticLetters: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  y?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 1.6, y = 34, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  let idx = 0;
  return (
    <span style={{ display: "inline" }}>
      {words.map((word, wi) => {
        const start = idx;
        idx += word.length + 1; // +1 accounts for the space in the stagger index
        return (
          <React.Fragment key={wi}>
            {wi > 0 ? " " : null}
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {word.split("").map((ch, ci) => {
                const f = frame - delay - (start + ci) * stagger;
                const s = spring({
                  frame: f,
                  fps,
                  config: { damping: 200, stiffness: 130, mass: 0.6 },
                });
                const o = interpolate(f, [0, 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <span
                    key={ci}
                    style={{
                      display: "inline-block",
                      opacity: o,
                      transform: `translateY(${(1 - s) * y}px)`,
                      ...style,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          </React.Fragment>
        );
      })}
    </span>
  );
};

// ── Glowing ring that scales in ─────────────────────────────────────────────
export const GlowRing: React.FC<{
  size: number;
  color?: string;
  delay?: number;
  spin?: number;
}> = ({ size, color = GOLD, delay = 0, spin = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 1, stiffness: 80 },
  });
  const rot = interpolate(frame, [0, 200], [0, spin]);
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        opacity: 0.55,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${0.4 + s * 0.6})`,
        left: "50%",
        top: "50%",
        boxShadow: `0 0 70px ${color}`,
      }}
    />
  );
};

// ── Brand audio bed with head-trim + fade in/out ────────────────────────────
// `start` trims the track head (frames) so its energy entry lands on the hook.
// `fadeIn` is short on punchy hooks so transients aren't muffled.
//
// `fadeFloor` is the fraction of `vol` the bed already sits at on FRAME 0,
// before the fade-in ramp begins. It exists because the default of 0 means
// frame 0 is EXACTLY SILENT: a bed whose opening transient was deliberately
// aligned to frame 0 gets multiplied by zero, which silently defeats the
// beat-sync prep the viral beds are chosen for. Measured on the 2026-07-24
// renders: first strong onset landed at 0.070s / 0.232s / 0.627s despite every
// bed file peaking at 0.000s.
//
// Default stays 0 so the ten promo compositions render byte-identically; only
// callers that opt in change. Use a small ramp (not a hard start at 1.0) --
// beginning at full level on a discontinuity can click.
export const BrandAudio: React.FC<{
  src: string;
  total: number;
  start?: number;
  vol?: number;
  fadeIn?: number;
  fadeFloor?: number;
}> = ({ src, total, start = 0, vol = 0.5, fadeIn = 20, fadeFloor = 0 }) => (
  <Audio
    src={staticFile(src)}
    startFrom={start}
    volume={(f) =>
      interpolate(f, [0, fadeIn, total - 25, total], [vol * fadeFloor, vol, vol, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    }
  />
);

// ── Closing CTA: Numevix wordmark + numevix.com pill + tagline ───────────────
export const BrandCTA: React.FC<{
  variant?: "cream" | "ink";
  tagline?: string;
  kicker?: string;
}> = ({ variant = "cream", tagline = "Decode your numbers today →", kicker }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * 6);
  const onInk = variant === "ink";
  const wordColor = GOLD;
  const kickerColor = onInk ? "oklch(0.82 0.03 85)" : "oklch(0.47 0.02 70)";
  return (
    <>
      {kicker ? (
        <Pop>
          <div
            style={{
              color: kickerColor,
              fontFamily: SANS,
              fontSize: 42,
              lineHeight: 1.4,
              textAlign: "center",
            }}
          >
            {kicker}
          </div>
        </Pop>
      ) : null}
      <Pop delay={16} y={30}>
        <div style={{ marginTop: kicker ? 60 : 0, textAlign: "center" }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 132,
              fontWeight: 700,
              color: wordColor,
              letterSpacing: 3,
              textShadow: "0 6px 34px oklch(0.72 0.10 80 / 0.35)",
            }}
          >
            Numevix
          </div>
          <div
            style={{
              height: 5,
              width: 220,
              margin: "6px auto 0",
              borderRadius: 4,
              background: GREEN,
            }}
          />
        </div>
      </Pop>
      <Pop delay={30} y={24}>
        <div
          style={{
            marginTop: 46,
            transform: `scale(${pulse})`,
            background: GREEN,
            border: `2px solid ${GOLD}`,
            color: GREEN_FG,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: 1,
            padding: "26px 56px",
            borderRadius: 60,
            boxShadow: "0 16px 44px -14px oklch(0.52 0.085 158 / 0.6)",
            textAlign: "center",
          }}
        >
          numevix.com
        </div>
      </Pop>
      <Pop delay={44} y={18}>
        <div
          style={{
            marginTop: 30,
            color: onInk ? GOLD : GOLD_TEXT,
            fontFamily: SANS,
            fontSize: 34,
            letterSpacing: 2,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {tagline}
        </div>
      </Pop>
    </>
  );
};
