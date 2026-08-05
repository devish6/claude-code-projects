import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { DISPLAY, UI, DISPLAY_HI, UI_HI } from "./fonts";
import { PALETTES } from "./palette";
import { MOOLANK_CARDS } from "./card-data";
import { InfoCard, INFO_CARD_WIDTH, INFO_CARD_HEIGHT } from "./InfoCard";
import TIMINGS_9 from "../../content/reel-9-timings.json";

/**
 * The voice-narrated animated card reel.
 *
 * ⭐⭐ WHY THIS FORMAT, AND NOT A TALKING HEAD
 * A sweep of #moolank and #numerology on 2026-08-05 found roughly 95% of top
 * content is a talking head — real numerologists, real faces, verified badges,
 * 200K followers. We have no face, so a voice-clone talking head would enter
 * the most saturated format with the weakest hand. What that sweep found MISSING
 * was anything saveable: almost no reference cards, nothing a viewer can keep.
 *
 * So this is a reel whose payload is the card. It earns reel distribution, it is
 * voice-led (which the references show is correct — vastu_mahamandal is 4/4 on
 * "Original audio" and ishathakkar 3/4), and it ends by holding the finished
 * card long enough to screenshot.
 *
 * ⭐ NO MUSIC BED, DELIBERATELY. The two talking-head accounts at 41K and 55K
 * likes use original audio with no track. Licensed melody appears only on the
 * account with no voice (numberswithrimzim, 6/6). Voice IS the audio here.
 * This also dissolves a constraint we have carried since day one: trending audio
 * cannot be baked into a render, and for this format that costs us nothing.
 *
 * 🔴 TIMINGS ARE MEASURED, NEVER GUESSED. content/reel-N-timings.json comes from
 * ElevenLabs' character alignment over the real mp3, so a reveal lands on the
 * words describing it. Estimated timings drift and by the fourth segment the
 * visual is describing the previous line.
 */

const P = PALETTES["ink-violet"];
const GOLD = P.ACCENT;

export const REEL_FPS = 30;
/** Seconds the finished card is held after the voice stops, so it can be screenshotted. */
const CARD_HOLD_SECONDS = 4.2;

/** How loud the music bed sits under the narration. See the note at <Audio>. */
const BED_VOLUME = 0.13;

/**
 * ⚠️ SHADOW SIDE AND CAREER HAVE NO SLIDE OF THEIR OWN, AND THAT IS A CHOICE.
 *
 * A slide is only drawn for fields that appear in the timings file, and the
 * timings file only holds NARRATED segments — so trimming those two out of the
 * voiceover silently removed their visuals too. The owner reviewed the result
 * and kept it: the reel stays at ~32s, and both fields are still readable on the
 * finished card held at the end.
 *
 * Worth knowing before "fixing" it: "do not narrate this" and "do not show this"
 * are separate decisions that happen to be coupled here. Adding silent slides
 * means appending them AFTER the narration, because inserting visual time
 * between spoken segments slides every later reveal out of sync with the voice.
 */

const TIMINGS: Record<number, typeof TIMINGS_9> = { 9: TIMINGS_9 };

export const reelDurationInFrames = (moolank: number) => {
  const t = TIMINGS[moolank];
  if (!t) throw new Error(`no timings for moolank ${moolank}`);
  return Math.round((t.duration + CARD_HOLD_SECONDS) * REEL_FPS);
};

/** A spring that snaps rather than drifts — long eases cost retention. */
const useSnap = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.5 } });
};

const Label: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const s = useSnap(delay);
  return (
    <div
      style={{
        fontFamily: UI,
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: GOLD,
        opacity: s,
        transform: `translateY(${(1 - s) * 18}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Big value type. The reel is watched on a phone at arm's length — nothing small. */
const Value: React.FC<{ children: React.ReactNode; delay?: number; size?: number }> = ({
  children,
  delay = 0,
  size = 96,
}) => {
  const s = useSnap(delay);
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 1.1,
        color: P.TEXT,
        opacity: s,
        transform: `translateY(${(1 - s) * 26}px)`,
        textShadow: "0 0 40px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </div>
  );
};

const Scene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      // Safe area: Instagram's own UI eats the bottom ~260px and the right rail.
      padding: "300px 90px 320px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 30,
    }}
  >
    {children}
  </AbsoluteFill>
);

/**
 * The remedy scene.
 *
 * 🪤 THIS HAS TO BE ITS OWN COMPONENT. Written inline in CardReel's body, its
 * `useSnap` calls would run in CardReel's render and read ABSOLUTE frames, while
 * everything rendered inside a <Sequence> reads sequence-relative ones — so the
 * mantra would have finished animating long before its scene began. Label and
 * Value are already components, which is why they were unaffected.
 */
const RemedyScene: React.FC<{ mantra: string; practice: string }> = ({ mantra, practice }) => {
  const mantraIn = useSnap(4);
  const practiceIn = useSnap(26);
  return (
    <Scene>
      <Label>Daily remedy</Label>
      <div
        style={{
          fontFamily: DISPLAY_HI,
          fontSize: 92,
          lineHeight: 1.32,
          color: GOLD,
          marginTop: 10,
          opacity: mantraIn,
          transform: `translateY(${(1 - mantraIn) * 24}px)`,
          textShadow: "0 0 46px rgba(230,190,110,0.4)",
        }}
      >
        {mantra}
      </div>
      <div
        style={{
          fontFamily: UI_HI,
          fontSize: 54,
          lineHeight: 1.34,
          color: P.TEXT,
          marginTop: 34,
          opacity: practiceIn,
        }}
      >
        {practice}
      </div>
    </Scene>
  );
};

export type CardReelProps = { number: number };

export const CardReel: React.FC<CardReelProps> = ({ number }) => {
  const card = MOOLANK_CARDS[number];
  const timings = TIMINGS[number];
  if (!card || !timings) throw new Error(`no card or timings for moolank ${number}`);

  const frame = useCurrentFrame();
  const at = (s: number) => Math.round(s * REEL_FPS);
  const seg = (field: string) => timings.segments.find((x) => x.field === field);

  const narrationEnd = at(timings.duration);
  const total = reelDurationInFrames(number);

  // The card slides up over the last spoken beat rather than cutting in, so the
  // viewer sees it arrive and knows there is something to stop on.
  const cardIn = interpolate(frame, [narrationEnd - 18, narrationEnd + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scene = (field: string, node: React.ReactNode) => {
    const s = seg(field);
    if (!s) return null;
    const from = at(s.start);
    // Each scene runs to the next one's start; the last runs to the narration end.
    const idx = timings.segments.indexOf(s);
    const next = timings.segments[idx + 1];
    const to = next ? at(next.start) : narrationEnd;
    return (
      <Sequence from={from} durationInFrames={Math.max(1, to - from)}>
        {node}
      </Sequence>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse 75% 45% at 18% 6%, rgba(120,96,220,0.32), transparent 62%),
          radial-gradient(ellipse 65% 45% at 88% 94%, rgba(214,150,80,0.22), transparent 60%),
          linear-gradient(160deg, ${P.GRAD_A} 0%, ${P.GRAD_MID} 48%, ${P.GRAD_B} 100%)
        `,
      }}
    >
      <Audio src={staticFile(`reels/${number}/narration.mp3`)} />

      {/*
        ── The bed ────────────────────────────────────────────────────────────
        Reused from Story 01, which is the one bed we own that was built to sit
        UNDER a voice rather than to carry a video on its own. The 150 BPM
        hardstyle/techno beds in MUSIC would fight the narration; the Instagram
        study on 2026-08-05 put the whole reference field on soft, slow melody
        and nothing percussive, which is the same conclusion from the other side.

        🔴 VOLUME IS THE WHOLE POINT. Measured in the rendered mix at 0.09: the
        speech window (5-15s) reads -24.1 dB mean, and the bed-only tail (27-30s,
        after the voice has stopped) reads -37.2 dB — so the bed rides about 13 dB
        under the voice. Present enough to kill the dead-room feel, quiet enough
        that it never competes with a consonant. Raising this is the fastest way
        to make speech unintelligible on a phone speaker.

        ⭐ The check that proves the bed is really there: the narration mp3 is
        only 26.10s long, so ANY signal past that in the render can only be the
        bed. Measuring the tail is a positive control, not a guess.
      */}
      <Audio
        src={staticFile("story/01/bed.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 24, total - 40, total - 6],
            [0, BED_VOLUME, BED_VOLUME, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      {/* ── 1. Hook — the numeral and EVERY qualifying date ──────────────────
          The date list is the whole hook: a stranger has to self-identify in the
          first second or nothing else gets watched. Confirmed three times
          against accounts at 41K-55K likes. */}
      {scene(
        "hook",
        <Scene>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <Value size={300} delay={0}>{card.number}</Value>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Label delay={4}>Moolank {card.number}</Label>
              <Value size={78} delay={7}>{card.archetype}</Value>
            </div>
          </div>
          <div style={{ marginTop: 26 }}>
            <Label delay={16}>Born on</Label>
            <Value size={104} delay={20}>{card.bornOn}</Value>
          </div>
        </Scene>,
      )}

      {/* ── 2. Planet + element ─────────────────────────────────────────────── */}
      {scene(
        "planet",
        <Scene>
          <div>
            <Label>Ruling planet</Label>
            <Value size={150} delay={4}>{card.planet}</Value>
          </div>
          <div style={{ marginTop: 40 }}>
            <Label delay={20}>Element</Label>
            <Value size={150} delay={24}>{card.element}</Value>
          </div>
        </Scene>,
      )}

      {/* ── 3. Strengths ────────────────────────────────────────────────────── */}
      {scene(
        "strengths",
        <Scene>
          <Label>Strengths</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 12 }}>
            {card.strengths.map((t, i) => (
              <div key={t} style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
                <span style={{ color: GOLD, fontSize: 40 }}>◆</span>
                {/* 54, not 62: at 62 the longest strength ("Takes a stand and
                    holds it") wrapped and orphaned its last word onto a line. */}
                <Value size={54} delay={6 + i * 7}>{t}</Value>
              </div>
            ))}
          </div>
        </Scene>,
      )}

      {/* ── 4. Lucky numbers, colour, day ───────────────────────────────────── */}
      {scene(
        "lucky",
        <Scene>
          <div>
            <Label>Lucky numbers</Label>
            <Value size={170} delay={4}>{card.luckyNumbers.join(" · ")}</Value>
          </div>
          <div style={{ display: "flex", gap: 90, marginTop: 46 }}>
            <div>
              <Label delay={18}>Colour</Label>
              <Value size={86} delay={22}>{card.luckyColours[0]}</Value>
            </div>
            <div>
              <Label delay={26}>Day</Label>
              <Value size={86} delay={30}>{card.luckyDay}</Value>
            </div>
          </div>
        </Scene>,
      )}

      {/* ── 5. The remedy — the most saveable line on the card ───────────────
          🔴 The mantra is set in the Devanagari-capable stack. The Latin face
          leads the family list on purpose: Cinzel has no Devanagari so it falls
          through, but put Noto first and every Latin run changes weight
          mid-sentence. */}
      {scene("remedy", <RemedyScene mantra={card.mantra} practice={card.remedy} />)}

      {/* ── 6. The finished card, held ──────────────────────────────────────
          The whole point of the reel. It is the SAME card posted as a still, so
          the format reinforces itself, and it stays on screen long enough to
          screenshot — that is the save this reel is optimising for. */}
      <Sequence from={narrationEnd - 18} durationInFrames={total - narrationEnd + 18}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: cardIn,
          }}
        >
          <div
            style={{
              width: INFO_CARD_WIDTH,
              height: INFO_CARD_HEIGHT,
              // Fit the 4:5 card inside 9:16 with room for the prompt below.
              // 0.96 rather than 0.88: this frame exists to be screenshotted, so
              // the card wants every pixel the 1920 height can spare.
              transform: `scale(${0.96 * (0.96 + 0.04 * cardIn)})`,
              borderRadius: 34,
              overflow: "hidden",
              boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
              position: "relative",
            }}
          >
            <InfoCard number={number} />
          </div>
          <div
            style={{
              fontFamily: UI,
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: 2,
              color: GOLD,
              marginTop: 18,
              opacity: interpolate(frame, [narrationEnd + 8, narrationEnd + 24], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Screenshot this 👆
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
