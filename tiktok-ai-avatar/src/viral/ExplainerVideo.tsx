import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BrandAudio } from "../components/kit";
import { AstrolBackground } from "./components/AstrolBackground";
import { CinematicTransition } from "./components/CinematicTransition";
import { CTAEnding } from "./components/CTAEnding";
import { PatternInterrupt } from "./components/PatternInterrupt";
import { TraitBullet } from "./components/TraitBullet";
import { ViralHook } from "./components/ViralHook";
import { Montage } from "./ViralVideo";
import { LayoutProvider } from "./layout";
import { PaletteProvider, usePalette } from "./PaletteContext";
import { DISPLAY, UI } from "./fonts";
import { planViralVideo } from "./plan";
import { spreadTraits, type ActSeconds } from "./timing";

/**
 * The PROMOTED consumer explainer. One composition, deliberately not a ViralVideo.
 *
 * ⭐⭐ WHY THIS IS A SEPARATE COMPONENT AND NOT A BENT `ViralVideo`.
 * A ViralVideo is a moolank: hook → NUMBER REVEAL → traits → CTA. An explainer has
 * no moolank and no angle from `content/angles.json`, so running it through that
 * template would mean either a meaningless digit on screen or an empty slot where
 * `NumberReveal` should be — and an empty slot is the exact defect that shipped
 * 2.13s of blank screen on V33. The hero statement below fills that beat honestly.
 *
 * 🔴 IT DOES NOT GET A V-NUMBER (owner, 2026-08-12). V-numbers are coupled to the
 * angle registry — `pickAngle`'s 21-day window and the no-recycled-ideas rule both
 * key off `angleId`. A video with no angle in that sequence pollutes the machinery
 * that keeps the content set honest. Own prefix, like PIN01 got for Pinterest.
 *
 * ⭐⭐ IT LEADS WITH THE OFFER, WHICH WOULD BE WRONG FOR ANY ORGANIC POST.
 * An organic video that reads as an ad gets scrolled. This one is bought — TikTok
 * labels it as promoted before a frame plays — so disguising the offer only spends
 * the first second we already know is the weak point. ⛔ Do not "soften" the hook
 * into a numerology tease for consistency with the V-series; the distribution model
 * is different and that is the whole reason this file exists.
 *
 * 🔴 EVERY CLAIM IS THE PRODUCT'S OWN COPY, verified against the live app, not
 * memory: `app/try/page.tsx` says "One free chart per day, no account needed", and
 * `app/try/anon-chart.tsx` renders exactly Driver/Basic, Conductor/Destiny,
 * Compound, Missing, Combinations/Yogas, the grid and the forecast.
 * ⛔ NEVER imply the AI reading is free — it is behind `/api/claim`, a free account.
 * ⛔ "Vedic grid", never "Lo Shu" — standing brand rule.
 */
export type ExplainerVideoProps = {
  /** 5–8 words. On screen at full size on frame 0. No fade-in. */
  hookText: string;
  hookAccent?: string;
  hookSub?: string;
  /** Fills the beat `NumberReveal` occupies in a ViralVideo. */
  heroText: string;
  heroSub?: string;
  /** What the viewer gets. One per scene; ≤26 characters each. */
  traits: string[];
  ctaText: string;
  ctaUrl?: string;
  music: string;
  structure?: ActSeconds;
  palette?: string;
  layout?: string;
};

export const ExplainerVideo: React.FC<ExplainerVideoProps> = (props) => {
  const { hookText, hookAccent, hookSub, heroText, heroSub, traits, ctaText, ctaUrl, music } =
    props;

  // ⭐⭐ THE SAME planner and therefore the SAME blocking gates as every
  // ViralVideo — payload by 2.0s, no scene past SCENE_CHANGE * 2, and every
  // scene actually receiving a trait. Widened to `PlannableVideo` for this.
  const { acts, scenes } = planViralVideo(props);
  const traitChunks = spreadTraits(traits, scenes.pairs.length);

  return (
    <PaletteProvider name={props.palette}>
      <LayoutProvider name={props.layout}>
        <AbsoluteFill>
          <AstrolBackground />
          <BrandAudio src={music} total={acts.total} />

          {/* ── HOOK — legible on frame 0, no entrance ramp ─────────────── */}
          <Sequence durationInFrames={acts.buildEnd}>
            <ViralHook
              text={hookText}
              accent={hookAccent}
              subtext={hookSub}
              variant="mystery"
              durationInFrames={acts.buildEnd}
            />
          </Sequence>
          <Sequence from={acts.buildStart} durationInFrames={10}>
            <PatternInterrupt type="flash" />
          </Sequence>

          {/* ── HERO — the beat NumberReveal owns in a ViralVideo ───────── */}
          <Sequence from={acts.valueStart} durationInFrames={scenes.number}>
            <HeroStatement text={heroText} sub={heroSub} />
          </Sequence>
          <Sequence from={acts.valueStart} durationInFrames={9}>
            <PatternInterrupt type="colorShift" />
          </Sequence>

          {/* ── WHAT YOU GET ───────────────────────────────────────────── */}
          {traitChunks.map((chunk, i) => (
            <Sequence
              key={i}
              from={
                acts.valueStart +
                scenes.number +
                scenes.pairs.slice(0, i).reduce((a, b) => a + b, 0)
              }
              durationInFrames={scenes.pairs[i]}
            >
              <CinematicTransition type={i % 2 === 0 ? "slide" : "zoomOut"}>
                <AbsoluteFill
                  style={{ justifyContent: "center", alignItems: "center", padding: 80 }}
                >
                  {chunk.map((t, j) => (
                    <TraitBullet key={j} text={t} index={j} />
                  ))}
                </AbsoluteFill>
              </CinematicTransition>
            </Sequence>
          ))}

          {/* ── RECAP ────────────────────────────────────────────────────
              🔴 NOT optional. `makeValueScenes` RESERVES `scenes.montage` frames
              at the end of the value act; a component that does not render them
              leaves a hole. EXP01's first cut omitted this and shipped 1.73s of
              blank screen — found by scanning frames, not by any gate. */}
          <Sequence from={acts.valueEnd - scenes.montage} durationInFrames={scenes.montage}>
            <Montage traits={traits} total={scenes.montage} />
          </Sequence>

          {/* ── CTA — the only branded frames, and the only URL ─────────── */}
          <Sequence from={acts.ctaStart} durationInFrames={acts.total - acts.ctaStart}>
            <CinematicTransition type="zoomIn">
              <CTAEnding
                text={ctaText}
                url={ctaUrl}
                durationInFrames={acts.total - acts.ctaStart}
              />
            </CinematicTransition>
          </Sequence>
        </AbsoluteFill>
      </LayoutProvider>
    </PaletteProvider>
  );
};

/**
 * One line, full frame, at reveal size.
 *
 * 🪤 NO ENTRANCE RAMP. `NumberReveal` can afford its 12-frame scramble because it
 * lands on an already-populated frame; this lands on a cut from the hook, so a
 * ramp here would be a hole, not a transition — the `<Burst>`-on-frame-0 lesson.
 */
const HeroStatement: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => {
  const P = usePalette();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 132,
          fontWeight: 700,
          color: P.ACCENT,
          textAlign: "center",
          lineHeight: 1.05,
          letterSpacing: -2,
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            marginTop: 28,
            fontFamily: UI,
            fontSize: 44,
            fontWeight: 600,
            color: P.TEXT,
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
