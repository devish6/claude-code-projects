import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  CARD,
  GOLD_TEXT,
  GREEN,
  INK,
  MUSIC,
  MUTED,
  SANS,
  SERIF,
} from "../lib/brand";
import {
  BrandAudio,
  BrandCTA,
  KineticLetters,
  Pop,
  useSceneFade,
} from "../components/kit";
import { Surface } from "../components/vfx";

// Category 5 — Educational. Birth Number vs Destiny Number.
export const BIRTH_VS_DESTINY_DURATION = 660;

const Hook: React.FC = () => {
  const opacity = useSceneFade(96);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 74, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 98, fontWeight: 700, color: INK, lineHeight: 1.08 }}>
        <div>MOST PEOPLE</div>
        <div>CONFUSE THESE</div>
        <div style={{ color: GOLD_TEXT }}>
          <KineticLetters text="TWO NUMBERS" delay={12} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Card: React.FC<{
  delay: number;
  tag: string;
  n: string;
  title: string;
  body: string;
  from: string;
  accent: string;
}> = ({ delay, tag, n, title, body, from, accent }) => (
  <Pop delay={delay} y={34}>
    <div
      style={{
        background: CARD,
        border: `2px solid ${accent}`,
        borderRadius: 26,
        padding: "34px 38px",
        boxShadow: "0 16px 36px -22px oklch(0.24 0.012 60 / 0.4)",
      }}
    >
      <div style={{ fontFamily: SANS, fontSize: 30, letterSpacing: 3, textTransform: "uppercase", color: accent, fontWeight: 700 }}>
        {tag}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 6 }}>
        <span style={{ fontFamily: SERIF, fontSize: 120, fontWeight: 700, color: accent, lineHeight: 1 }}>{n}</span>
        <span style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700, color: INK }}>{title}</span>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 40, color: INK, marginTop: 10, lineHeight: 1.35 }}>{body}</div>
      <div style={{ fontFamily: SANS, fontSize: 32, color: MUTED, marginTop: 12, fontStyle: "italic" }}>{from}</div>
    </div>
  </Pop>
);

const Explain: React.FC = () => {
  const opacity = useSceneFade(300);
  return (
    <AbsoluteFill style={{ opacity, padding: "150px 76px", justifyContent: "center", gap: 34 }}>
      <Card
        delay={0}
        tag="Birth Number"
        n="5"
        title="who you are"
        body="Your day of birth. Your instinct, your default wiring."
        from="From the 14th → 1+4 = 5"
        accent={GOLD_TEXT}
      />
      <Card
        delay={22}
        tag="Destiny Number"
        n="8"
        title="where you're going"
        body="Your full date of birth. The path life keeps pulling you toward."
        from="14 · 08 · 1996 → 8"
        accent={GREEN}
      />
    </AbsoluteFill>
  );
};

const Punch: React.FC = () => {
  const opacity = useSceneFade(144);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 80, textAlign: "center" }}>
      <Pop>
        <div style={{ fontFamily: SERIF, fontSize: 76, fontWeight: 700, color: INK, lineHeight: 1.2 }}>
          One is <span style={{ color: GOLD_TEXT }}>who you are.</span>
          <br />
          One is <span style={{ color: GREEN }}>where you're headed.</span>
        </div>
      </Pop>
      <Pop delay={16} y={20}>
        <div style={{ marginTop: 34, fontFamily: SANS, fontSize: 40, color: MUTED }}>
          You need both to read the full picture.
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

const CTA: React.FC = () => {
  const opacity = useSceneFade(120, 14, 10);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center", padding: 90 }}>
      <BrandCTA variant="cream" tagline="See your complete chart → numevix.com" />
    </AbsoluteFill>
  );
};

export const BirthVsDestiny: React.FC = () => (
  <AbsoluteFill>
    <BrandAudio src={MUSIC.ambientHorizon} total={BIRTH_VS_DESTINY_DURATION} start={96} fadeIn={8} vol={0.5} />
    <Surface variant="cream" />
    <Sequence durationInFrames={96}>
      <Hook />
    </Sequence>
    <Sequence from={96} durationInFrames={300}>
      <Explain />
    </Sequence>
    <Sequence from={396} durationInFrames={144}>
      <Punch />
    </Sequence>
    <Sequence from={540} durationInFrames={120}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
