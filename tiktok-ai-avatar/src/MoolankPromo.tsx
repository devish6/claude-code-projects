import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { MoolankData } from "./moolank-data";

/**
 * Numevix "Moolank N" TikTok promo — parameterized by MoolankData.
 * 1080x1920, 30fps, 900 frames (30s). Promotes Numevix.
 * Uses the Numevix brand palette (cream + antique gold + deep green,
 * oklch tokens from vedic-numerology app/globals.css). Chromium (Remotion's
 * renderer) supports oklch() directly. All motion is Remotion-native.
 */

// ── Numevix brand palette ───────────────────────────────────────────────────
const CREAM_A = "#F3F2EC"; // hero gradient cool
const CREAM_B = "#F8F2E5"; // hero gradient warm
const INK = "oklch(0.24 0.012 60)"; // foreground
const INK_SOFT = "oklch(0.34 0.012 60)";
const MUTED = "oklch(0.47 0.02 70)"; // muted-foreground
const GOLD = "oklch(0.72 0.10 80)"; // accent — large text / number / wordmark
const GOLD_TEXT = "oklch(0.56 0.11 74)"; // deeper gold for smaller text on cream (AA)
const GREEN = "oklch(0.52 0.085 158)"; // accent-2 — actions
const GREEN_FG = "oklch(0.97 0.02 155)"; // on green
const CARD = "oklch(0.995 0.004 85)";
const BORDER = "oklch(0.87 0.02 85)";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";

// ── Background: cream + rotating faint-gold numerology dial ──────────────────
const Dial: React.FC<{ rot: number; opacity: number }> = ({ rot, opacity }) => {
  const circles = [480, 372, 264, 156];
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30);
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);
  return (
    <svg
      viewBox="0 0 1000 1000"
      style={{
        position: "absolute",
        width: 1500,
        height: 1500,
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

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const glowY = 30 + Math.cos(t * 0.2) * 5;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(158deg, ${CREAM_A}, ${CREAM_B})` }}>
      {/* soft warm gold glow near the top */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% ${glowY}%, oklch(0.72 0.10 80 / 0.18), transparent 60%)`,
        }}
      />
      {/* rotating faint-gold dials (two layers, opposite spin) */}
      <AbsoluteFill style={{ color: GOLD }}>
        <Dial rot={t * 3} opacity={0.1} />
        <Dial rot={-t * 2 + 15} opacity={0.06} />
      </AbsoluteFill>
      {/* gentle warm vignette to seat the content */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 60%, oklch(0.80 0.03 80 / 0.28) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const useSceneFade = (durationInFrames: number, fadeIn = 12, fadeOut = 14) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  y?: number;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, y = 40, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ opacity, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = GOLD_TEXT }) => (
  <div
    style={{
      color,
      fontFamily: SANS,
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: 6,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

// ── Scene 1: Hook ───────────────────────────────────────────────────────────
const SceneHook: React.FC<{ data: MoolankData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useSceneFade(130);
  const big = spring({ frame, fps, config: { damping: 12, mass: 1.1, stiffness: 90 } });
  const ringRot = interpolate(frame, [0, 130], [0, 60]);

  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 80, textAlign: "center" }}>
      <div style={{ position: "relative", marginBottom: 40 }}>
        <div
          style={{
            position: "absolute",
            inset: -70,
            borderRadius: "50%",
            border: `3px solid oklch(0.72 0.10 80 / 0.5)`,
            transform: `rotate(${ringRot}deg) scale(${0.6 + big * 0.4})`,
            boxShadow: "0 0 60px oklch(0.72 0.10 80 / 0.25)",
          }}
        />
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 340,
            lineHeight: 0.9,
            fontWeight: 700,
            color: GOLD,
            transform: `scale(${0.3 + big * 0.7})`,
            textShadow: "0 6px 30px oklch(0.72 0.10 80 / 0.35)",
          }}
        >
          {data.n}
        </div>
      </div>
      <Pop delay={16}>
        <div style={{ fontFamily: SERIF, fontSize: 96, fontWeight: 700, color: INK, letterSpacing: 4 }}>
          MOOLANK {data.n}
        </div>
      </Pop>
      <Pop delay={26} y={26}>
        <div style={{ marginTop: 14, color: GOLD_TEXT, fontFamily: SANS, fontSize: 34, letterSpacing: 3, fontWeight: 600 }}>
          Driver Number · Ruled by {data.planet}
        </div>
      </Pop>
      <Pop delay={40} y={22}>
        <div style={{ marginTop: 46, color: MUTED, fontFamily: SANS, fontSize: 38, lineHeight: 1.4 }}>
          Born on the <span style={{ color: INK, fontWeight: 700 }}>{data.born}?</span>
          <br />
          This is your number.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ── Scene 2: Strengths ──────────────────────────────────────────────────────
const SceneStrengths: React.FC<{ data: MoolankData }> = ({ data }) => {
  const opacity = useSceneFade(300);
  return (
    <AbsoluteFill style={{ opacity, padding: "150px 90px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow>The strengths of {data.n}</Eyebrow>
      </Pop>
      <Pop delay={6}>
        <div style={{ fontFamily: SERIF, fontSize: 84, fontWeight: 700, color: INK, marginTop: 14, lineHeight: 1.05 }}>
          {data.titlePlain} <span style={{ color: GOLD_TEXT }}>{data.titleGold}</span>
        </div>
      </Pop>
      <div style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 34 }}>
        {data.strengths.map((s, i) => (
          <Pop key={s} delay={28 + i * 22} y={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: "oklch(0.52 0.085 158 / 0.14)",
                  border: `2px solid ${GREEN}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: GREEN,
                  fontSize: 32,
                  fontFamily: SANS,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <div style={{ color: INK, fontFamily: SANS, fontSize: 46, fontWeight: 600 }}>{s}</div>
            </div>
          </Pop>
        ))}
      </div>
      <Pop delay={124} y={18}>
        <div style={{ marginTop: 64, color: GOLD_TEXT, fontFamily: SERIF, fontStyle: "italic", fontSize: 40 }}>
          "{data.quote}"
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ── Scene 3: The flip side (reframed) ───────────────────────────────────────
const SceneFlip: React.FC<{ data: MoolankData }> = ({ data }) => {
  const opacity = useSceneFade(290);
  return (
    <AbsoluteFill style={{ opacity, padding: "150px 90px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow color={GREEN}>The flip side → your edge</Eyebrow>
      </Pop>
      <Pop delay={6}>
        <div style={{ fontFamily: SERIF, fontSize: 84, fontWeight: 700, color: INK, marginTop: 14, lineHeight: 1.05 }}>
          Your <span style={{ color: GOLD_TEXT }}>weakness</span> is
          <br />
          your <span style={{ color: GREEN }}>weapon.</span>
        </div>
      </Pop>
      <div style={{ marginTop: 58, display: "flex", flexDirection: "column", gap: 30 }}>
        {data.flips.map(([bad, good], i) => (
          <Pop key={bad} delay={26 + i * 24} y={34}>
            <div
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 22,
                padding: "26px 30px",
                boxShadow: "0 10px 30px -18px oklch(0.24 0.012 60 / 0.35)",
              }}
            >
              <div style={{ color: MUTED, fontFamily: SANS, fontSize: 38, fontWeight: 600 }}>{bad}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
                <span style={{ color: GOLD_TEXT, fontSize: 40, fontFamily: SANS }}>→</span>
                <span style={{ color: INK, fontFamily: SANS, fontSize: 42, fontWeight: 700 }}>{good}</span>
              </div>
            </div>
          </Pop>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Numevix promo ──────────────────────────────────────────────────
const ScenePromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useSceneFade(180, 14, 10);
  const pulse = 1 + 0.03 * Math.sin((frame / fps) * 6);

  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90, textAlign: "center" }}>
      <Pop>
        <div style={{ color: MUTED, fontFamily: SANS, fontSize: 42, lineHeight: 1.4 }}>
          Your numbers hold
          <br />
          <span style={{ color: INK, fontWeight: 700 }}>far more than one digit.</span>
        </div>
      </Pop>
      <Pop delay={20} y={30}>
        <div style={{ marginTop: 70 }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 132,
              fontWeight: 700,
              color: GOLD,
              letterSpacing: 3,
              textShadow: "0 6px 30px oklch(0.72 0.10 80 / 0.3)",
            }}
          >
            Numevix
          </div>
          <div style={{ height: 5, width: 220, margin: "6px auto 0", borderRadius: 4, background: GREEN }} />
        </div>
      </Pop>
      <Pop delay={34} y={22}>
        <div style={{ marginTop: 40, color: INK_SOFT, fontFamily: SANS, fontSize: 42, lineHeight: 1.4 }}>
          AI numerology readings,
          <br />
          <span style={{ color: GOLD_TEXT, fontWeight: 700 }}>reviewed by real experts.</span>
        </div>
      </Pop>
      <Pop delay={50} y={24}>
        <div
          style={{
            marginTop: 66,
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
            boxShadow: "0 16px 40px -14px oklch(0.52 0.085 158 / 0.6)",
          }}
        >
          numevix.com
        </div>
      </Pop>
      <Pop delay={64} y={18}>
        <div style={{ marginTop: 34, color: GOLD_TEXT, fontFamily: SANS, fontSize: 34, letterSpacing: 2, fontWeight: 600 }}>
          Decode your Moolank today →
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ── Main composition ────────────────────────────────────────────────────────
export const MoolankPromo: React.FC<{ data: MoolankData }> = ({ data }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM_A }}>
      {data.music ? (
        <Audio
          src={staticFile(data.music)}
          startFrom={data.musicStartFrame ?? 0}
          volume={(f) =>
            interpolate(f, [0, 30, 860, 900], [0, 0.55, 0.55, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
      <Background />
      <Sequence durationInFrames={130}>
        <SceneHook data={data} />
      </Sequence>
      <Sequence from={130} durationInFrames={300}>
        <SceneStrengths data={data} />
      </Sequence>
      <Sequence from={430} durationInFrames={290}>
        <SceneFlip data={data} />
      </Sequence>
      <Sequence from={720} durationInFrames={180}>
        <ScenePromo />
      </Sequence>
    </AbsoluteFill>
  );
};
