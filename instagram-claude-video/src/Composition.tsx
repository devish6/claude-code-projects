import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const COLORS = {
  bg1: "#1a1a2e",
  bg2: "#16213e",
  bg3: "#0f3460",
  red: "#e94560",
  teal: "#4ecdc4",
  white: "#ffffff",
  mute: "rgba(255,255,255,0.6)",
};

const FONT_HEADING = '"Inter", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.bg1} 0%, ${COLORS.bg2} 50%, ${COLORS.bg3} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(233,69,96,0.25) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(78,205,196,0.18) 0%, transparent 50%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      opacity: 0.04,
      mixBlendMode: "overlay",
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
    }}
  />
);

// ───────── SCENE 1 — HOOK (0–3s) ─────────
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const subFade = interpolate(frame, [15, 30], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const emojiBounce = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.15, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
        textAlign: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          fontSize: 140,
          fontFamily: FONT_HEADING,
          fontWeight: 900,
          color: COLORS.white,
          lineHeight: 1.05,
          letterSpacing: -3,
          textShadow: "0 12px 60px rgba(0,0,0,0.5)",
        }}
      >
        I built a{" "}
        <span style={{ color: COLORS.red }}>website</span>
        <br />
        in <span style={{ color: COLORS.teal }}>60 seconds</span>
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 200,
          transform: `scale(${emojiBounce})`,
          opacity: subFade,
        }}
      >
        🤯
      </div>
    </AbsoluteFill>
  );
};

// ───────── SCENE 2 — PROBLEM (3–7s) ─────────
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const strikeProgress = interpolate(frame, [30, 60], [0, 100], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const newLineOpacity = interpolate(frame, [55, 75], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - slideIn) * 60}px)`,
          opacity: slideIn,
          fontFamily: FONT_HEADING,
          fontWeight: 800,
          fontSize: 110,
          color: COLORS.white,
          lineHeight: 1.15,
          position: "relative",
          display: "inline-block",
        }}
      >
        Learning to code
        <br />
        takes years…
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: 10,
            width: `${strikeProgress}%`,
            background: COLORS.red,
            borderRadius: 5,
            transform: "translateY(-4px)",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 60,
          fontFamily: FONT_HEADING,
          fontWeight: 900,
          fontSize: 130,
          color: COLORS.teal,
          opacity: newLineOpacity,
          letterSpacing: -2,
        }}
      >
        Not anymore.
      </div>
    </AbsoluteFill>
  );
};

// ───────── SCENE 3 — CLAUDE CODE TERMINAL (7–15s) ─────────
const TerminalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });

  const prompt =
    "Build me a landing page for my coffee shop with a hero section, menu, and contact form.";
  const charsShown = Math.min(
    prompt.length,
    Math.floor(
      interpolate(frame, [10, 130], [0, prompt.length], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      }),
    ),
  );
  const typedPrompt = prompt.slice(0, charsShown);

  const showCursor = Math.floor(frame / 12) % 2 === 0;

  const labelOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
      }}
    >
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: FONT_HEADING,
          fontWeight: 800,
          fontSize: 90,
          color: COLORS.white,
          marginBottom: 40,
          textAlign: "center",
          letterSpacing: -1,
        }}
      >
        Just <span style={{ color: COLORS.teal }}>type</span> what you want →
      </div>

      <div
        style={{
          transform: `scale(${0.85 + cardIn * 0.15})`,
          opacity: cardIn,
          width: "92%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 28,
          padding: 36,
          backdropFilter: "blur(20px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 28,
            alignItems: "center",
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#ff5f57" }} />
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#ffbd2e" }} />
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#28c840" }} />
          <div
            style={{
              marginLeft: 20,
              fontFamily: FONT_MONO,
              color: COLORS.mute,
              fontSize: 28,
            }}
          >
            claude-code
          </div>
        </div>

        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 38,
            color: COLORS.teal,
            marginBottom: 18,
          }}
        >
          ❯ claude
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 42,
            color: COLORS.white,
            lineHeight: 1.45,
            minHeight: 360,
          }}
        >
          {typedPrompt}
          <span
            style={{
              display: "inline-block",
              width: 18,
              height: 46,
              background: showCursor ? COLORS.red : "transparent",
              verticalAlign: "middle",
              marginLeft: 4,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────── SCENE 4 — CODE GENERATING (15–22s) ─────────
const CodeGenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });

  const lines = [
    { c: "#e94560", t: "<!DOCTYPE html>" },
    { c: "#ffffff", t: "<html lang=\"en\">" },
    { c: "#4ecdc4", t: "  <head>" },
    { c: "#ffd166", t: "    <title>Brew & Co</title>" },
    { c: "#4ecdc4", t: "  </head>" },
    { c: "#4ecdc4", t: "  <body>" },
    { c: "#e94560", t: "    <header class=\"hero\">" },
    { c: "#ffffff", t: "      <h1>Brew & Co Coffee ☕</h1>" },
    { c: "#ffd166", t: "      <p>Locally roasted, made with love.</p>" },
    { c: "#e94560", t: "    </header>" },
    { c: "#4ecdc4", t: "    <section class=\"menu\">…</section>" },
    { c: "#4ecdc4", t: "  </body>" },
  ];

  const linesShown = Math.min(
    lines.length,
    Math.floor(
      interpolate(frame, [10, 150], [0, lines.length], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      }),
    ),
  );

  const sparkleOpacity = interpolate(
    frame % 24,
    [0, 12, 24],
    [0.3, 1, 0.3],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
      }}
    >
      <div
        style={{
          opacity: cardIn,
          fontFamily: FONT_HEADING,
          fontWeight: 800,
          fontSize: 90,
          color: COLORS.white,
          marginBottom: 40,
          textAlign: "center",
          letterSpacing: -1,
        }}
      >
        Claude{" "}
        <span style={{ color: COLORS.red }}>writes</span> the code{" "}
        <span style={{ opacity: sparkleOpacity }}>✨</span>
      </div>

      <div
        style={{
          transform: `scale(${0.9 + cardIn * 0.1})`,
          opacity: cardIn,
          width: "92%",
          background: "rgba(10, 14, 28, 0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 28,
          padding: 40,
          fontFamily: FONT_MONO,
          fontSize: 30,
          lineHeight: 1.55,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        {lines.slice(0, linesShown).map((line, i) => (
          <div
            key={i}
            style={{
              color: line.c,
            }}
          >
            {line.t}
          </div>
        ))}
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 32,
            background: COLORS.red,
            verticalAlign: "middle",
            opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ───────── SCENE 5 — WEBSITE REVEAL (22–27s) ─────────
const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });

  const labelOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
      }}
    >
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: FONT_HEADING,
          fontWeight: 900,
          fontSize: 110,
          color: COLORS.white,
          marginBottom: 40,
          textAlign: "center",
          letterSpacing: -2,
        }}
      >
        Real website.
        <br />
        <span style={{ color: COLORS.teal }}>Real fast.</span>
      </div>

      {/* Fake browser mockup */}
      <div
        style={{
          transform: `translateY(${(1 - reveal) * 80}px) scale(${
            0.9 + reveal * 0.1
          })`,
          opacity: reveal,
          width: "92%",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            background: "#1f1f33",
            padding: "16px 24px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#ff5f57" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#ffbd2e" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#28c840" }} />
          <div
            style={{
              marginLeft: 16,
              padding: "6px 16px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              fontFamily: FONT_MONO,
              fontSize: 22,
              color: COLORS.mute,
            }}
          >
            brewandco.com
          </div>
        </div>

        {/* Hero of mocked website */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #2a1810 0%, #4a2c1a 50%, #6b3f24 100%)",
            padding: "70px 50px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 100 }}>☕</div>
          <div
            style={{
              fontFamily: FONT_HEADING,
              fontWeight: 900,
              fontSize: 76,
              color: "#fff5e1",
              marginTop: 16,
              letterSpacing: -1,
            }}
          >
            Brew &amp; Co
          </div>
          <div
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 32,
              color: "rgba(255,245,225,0.7)",
              marginTop: 12,
            }}
          >
            Locally roasted, made with love.
          </div>
          <div
            style={{
              marginTop: 36,
              display: "inline-block",
              padding: "20px 44px",
              borderRadius: 12,
              background: COLORS.red,
              color: COLORS.white,
              fontFamily: FONT_HEADING,
              fontWeight: 700,
              fontSize: 32,
            }}
          >
            View the Menu
          </div>
        </div>

        {/* Menu cards */}
        <div
          style={{
            background: "#faf3e8",
            padding: "40px 30px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {[
            { name: "Espresso", price: "$3.50" },
            { name: "Latte", price: "$4.75" },
            { name: "Cold Brew", price: "$4.25" },
            { name: "Mocha", price: "$5.00" },
          ].map((item) => (
            <div
              key={item.name}
              style={{
                background: "#fff",
                padding: 24,
                borderRadius: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  fontFamily: FONT_HEADING,
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#2a1810",
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  fontFamily: FONT_HEADING,
                  fontWeight: 700,
                  fontSize: 28,
                  color: COLORS.red,
                }}
              >
                {item.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────── SCENE 6 — CTA (27–30s) ─────────
const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popIn = spring({ frame, fps, config: { damping: 10, stiffness: 140 } });
  const pulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.08, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
        textAlign: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${popIn})`,
          fontFamily: FONT_HEADING,
          fontWeight: 900,
          fontSize: 130,
          color: COLORS.white,
          lineHeight: 1.05,
          letterSpacing: -3,
        }}
      >
        Want to{" "}
        <span style={{ color: COLORS.teal }}>build</span>
        <br />
        with AI?
      </div>

      <div
        style={{
          marginTop: 80,
          transform: `scale(${popIn * pulse})`,
          padding: "32px 60px",
          background: COLORS.red,
          borderRadius: 999,
          fontFamily: FONT_HEADING,
          fontWeight: 800,
          fontSize: 64,
          color: COLORS.white,
          boxShadow: `0 20px 60px ${COLORS.red}66`,
        }}
      >
        Follow for more →
      </div>

      <div
        style={{
          marginTop: 60,
          opacity: popIn,
          fontFamily: FONT_MONO,
          fontSize: 36,
          color: COLORS.mute,
        }}
      >
        #ClaudeCode #VibeCoding
      </div>
    </AbsoluteFill>
  );
};

// ───────── PROGRESS BAR (always on top) ─────────
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 8,
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.teal})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ───────── MAIN COMPOSITION ─────────
export const MyComposition: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background />

      <Sequence durationInFrames={3 * fps} layout="none">
        <HookScene />
      </Sequence>

      <Sequence from={3 * fps} durationInFrames={4 * fps} layout="none">
        <ProblemScene />
      </Sequence>

      <Sequence from={7 * fps} durationInFrames={8 * fps} layout="none">
        <TerminalScene />
      </Sequence>

      <Sequence from={15 * fps} durationInFrames={7 * fps} layout="none">
        <CodeGenScene />
      </Sequence>

      <Sequence from={22 * fps} durationInFrames={5 * fps} layout="none">
        <RevealScene />
      </Sequence>

      <Sequence from={27 * fps} durationInFrames={3 * fps} layout="none">
        <CtaScene />
      </Sequence>

      <Grain />
      <ProgressBar />
    </AbsoluteFill>
  );
};
