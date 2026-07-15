import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

/**
 * Numevix TikTok promo — "Moolank 8" (Driver Number 8).
 * 1080x1920, 30fps, 900 frames (30s). Promotes Numevix.
 * All motion is Remotion-native (useCurrentFrame / interpolate / spring).
 */

// ── Brand palette ───────────────────────────────────────────────────────────
const GOLD = "#E8C879";
const GOLD_DEEP = "#C9A24B";
const CREAM = "#F5EFE0";
const GREEN = "#6FA585";
const GREEN_DEEP = "#3F6B4F";
const MUTED = "#A79CC0";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";

// ── Deterministic starfield ─────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const STARS = (() => {
  const rand = mulberry32(88);
  return new Array(70).fill(0).map(() => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 0.6 + rand() * 2.2,
    phase: rand() * Math.PI * 2,
    speed: 0.4 + rand() * 1.1,
  }));
})();

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // slow drift of the gold glow
  const glowX = 50 + Math.sin(t * 0.25) * 10;
  const glowY = 32 + Math.cos(t * 0.2) * 6;
  const ringRot = t * 6; // deg

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 28%, #2a1a52 0%, #150c30 42%, #08040f 100%)",
      }}
    >
      {/* drifting gold glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(232,200,121,0.16), transparent 45%)`,
        }}
      />
      {/* faint Saturn ring behind everything */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 1400,
            height: 1400,
            borderRadius: "50%",
            border: `2px solid rgba(232,200,121,0.06)`,
            transform: `rotate(${ringRot}deg)`,
            boxShadow: "0 0 120px rgba(111,165,133,0.06) inset",
            marginTop: -220,
          }}
        />
      </AbsoluteFill>
      {/* stars */}
      <AbsoluteFill>
        {STARS.map((s, i) => {
          const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.r,
                height: s.r,
                borderRadius: "50%",
                background: CREAM,
                opacity: tw * 0.8,
                boxShadow: `0 0 ${s.r * 2}px rgba(245,239,224,${tw * 0.6})`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
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
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - s) * y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = GOLD,
}) => (
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
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useSceneFade(130);
  const eight = spring({ frame, fps, config: { damping: 12, mass: 1.1, stiffness: 90 } });
  const ringRot = interpolate(frame, [0, 130], [0, 60]);

  return (
    <AbsoluteFill
      style={{
        opacity,
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        textAlign: "center",
      }}
    >
      {/* Big 8 with rotating ring */}
      <div style={{ position: "relative", marginBottom: 40 }}>
        <div
          style={{
            position: "absolute",
            inset: -70,
            borderRadius: "50%",
            border: `3px solid rgba(232,200,121,0.35)`,
            transform: `rotate(${ringRot}deg) scale(${0.6 + eight * 0.4})`,
            boxShadow: "0 0 60px rgba(232,200,121,0.25)",
          }}
        />
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 340,
            lineHeight: 0.9,
            fontWeight: 700,
            color: GOLD,
            transform: `scale(${0.3 + eight * 0.7})`,
            textShadow: "0 0 50px rgba(232,200,121,0.5)",
          }}
        >
          8
        </div>
      </div>
      <Pop delay={16}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 96,
            fontWeight: 700,
            color: CREAM,
            letterSpacing: 4,
          }}
        >
          MOOLANK 8
        </div>
      </Pop>
      <Pop delay={26} y={26}>
        <div style={{ marginTop: 14, color: GOLD, fontFamily: SANS, fontSize: 34, letterSpacing: 3 }}>
          Driver Number · Ruled by Saturn
        </div>
      </Pop>
      <Pop delay={40} y={22}>
        <div style={{ marginTop: 46, color: MUTED, fontFamily: SANS, fontSize: 38, lineHeight: 1.4 }}>
          Born on the <span style={{ color: CREAM, fontWeight: 700 }}>8th, 17th or 26th?</span>
          <br />
          This is your number.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ── Scene 2: Strengths ──────────────────────────────────────────────────────
const STRENGTHS = [
  "Ambitious & disciplined",
  "Born to lead and build",
  "Wired for material success",
  "Unshakable resilience",
];

const SceneStrengths: React.FC = () => {
  const opacity = useSceneFade(300);
  return (
    <AbsoluteFill style={{ opacity, padding: "150px 90px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow>The strengths of 8</Eyebrow>
      </Pop>
      <Pop delay={6}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 84,
            fontWeight: 700,
            color: CREAM,
            marginTop: 14,
            lineHeight: 1.05,
          }}
        >
          Saturn's <span style={{ color: GOLD }}>chosen builder.</span>
        </div>
      </Pop>
      <div style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 34 }}>
        {STRENGTHS.map((s, i) => (
          <Pop key={s} delay={28 + i * 22} y={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: "rgba(111,165,133,0.18)",
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
              <div style={{ color: CREAM, fontFamily: SANS, fontSize: 46, fontWeight: 600 }}>{s}</div>
            </div>
          </Pop>
        ))}
      </div>
      <Pop delay={124} y={18}>
        <div style={{ marginTop: 64, color: GOLD, fontFamily: SERIF, fontStyle: "italic", fontSize: 40 }}>
          "Saturn rewards the patient."
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ── Scene 3: The flip side (reframed) ───────────────────────────────────────
const FLIPS: [string, string][] = [
  ["Seen as cold?", "It's deep focus — aim it at one goal."],
  ["Workaholic?", "Set limits, and stay unstoppable."],
  ["Too stubborn?", "That's conviction. Point it right."],
  ["Delays test you?", "They forge your empire."],
];

const SceneFlip: React.FC = () => {
  const opacity = useSceneFade(290);
  return (
    <AbsoluteFill style={{ opacity, padding: "150px 90px", justifyContent: "flex-start" }}>
      <Pop>
        <Eyebrow color={GREEN}>The flip side → your edge</Eyebrow>
      </Pop>
      <Pop delay={6}>
        <div style={{ fontFamily: SERIF, fontSize: 84, fontWeight: 700, color: CREAM, marginTop: 14, lineHeight: 1.05 }}>
          Your <span style={{ color: GOLD }}>weakness</span> is
          <br />
          your <span style={{ color: GREEN }}>weapon.</span>
        </div>
      </Pop>
      <div style={{ marginTop: 58, display: "flex", flexDirection: "column", gap: 30 }}>
        {FLIPS.map(([bad, good], i) => (
          <Pop key={bad} delay={26 + i * 24} y={34}>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(232,200,121,0.18)",
                borderRadius: 22,
                padding: "26px 30px",
              }}
            >
              <div style={{ color: MUTED, fontFamily: SANS, fontSize: 38, fontWeight: 600 }}>{bad}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
                <span style={{ color: GOLD, fontSize: 40, fontFamily: SANS }}>→</span>
                <span style={{ color: CREAM, fontFamily: SANS, fontSize: 42, fontWeight: 700 }}>{good}</span>
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
    <AbsoluteFill
      style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90, textAlign: "center" }}
    >
      <Pop>
        <div style={{ color: MUTED, fontFamily: SANS, fontSize: 42, lineHeight: 1.4 }}>
          Your numbers hold
          <br />
          <span style={{ color: CREAM, fontWeight: 700 }}>far more than one digit.</span>
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
              textShadow: "0 0 50px rgba(232,200,121,0.45)",
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

      <Pop delay={34} y={22}>
        <div style={{ marginTop: 40, color: CREAM, fontFamily: SANS, fontSize: 42, lineHeight: 1.4 }}>
          AI numerology readings,
          <br />
          <span style={{ color: GOLD }}>reviewed by real experts.</span>
        </div>
      </Pop>

      <Pop delay={50} y={24}>
        <div
          style={{
            marginTop: 66,
            transform: `scale(${pulse})`,
            background: GREEN_DEEP,
            border: `2px solid ${GOLD}`,
            color: CREAM,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: 1,
            padding: "26px 56px",
            borderRadius: 60,
            boxShadow: "0 12px 40px rgba(63,107,79,0.5)",
          }}
        >
          numevix.com
        </div>
      </Pop>

      <Pop delay={64} y={18}>
        <div style={{ marginTop: 34, color: GOLD, fontFamily: SANS, fontSize: 34, letterSpacing: 2 }}>
          Decode your Moolank today →
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

// ── Main composition ────────────────────────────────────────────────────────
export const TikTokPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#08040f" }}>
      <Background />
      <Sequence durationInFrames={130}>
        <SceneHook />
      </Sequence>
      <Sequence from={130} durationInFrames={300}>
        <SceneStrengths />
      </Sequence>
      <Sequence from={430} durationInFrames={290}>
        <SceneFlip />
      </Sequence>
      <Sequence from={720} durationInFrames={180}>
        <ScenePromo />
      </Sequence>
    </AbsoluteFill>
  );
};
