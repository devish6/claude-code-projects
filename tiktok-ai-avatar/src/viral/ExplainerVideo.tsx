import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
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
  /**
   * The live site, scrolling behind the copy.
   *
   * ⭐ WHY A SCROLL RATHER THAN A STILL (owner, 2026-08-12: "have a nice motion
   * in the background like scrolling etc"). A promoted explainer that never
   * shows the product asks the viewer to take every bullet on trust; the actual
   * page moving behind the words turns each claim into proof, and motion reads
   * as a live product rather than a flat backdrop.
   *
   * 🔴 `wash` IS NOT DECORATION — WITHOUT IT THE FRAME IS UNREADABLE. numevix.com's
   * hero is big dark serif type and so is this video's hook: same typeface, same
   * weight, same colour. Overlaid raw they are two headlines fighting, not a
   * background. The wash drops the page to texture so the copy stays crisp.
   * ⛔ Do not lower it below ~0.7 without re-running `qa:frame` AND looking —
   * frame-0 legibility is the one hard gate and this is the only thing in the
   * composition that can quietly destroy it.
   *
   * 🪤 Feed the tallest capture available. `backgroundPositionY` walks 0%→100% of
   * the IMAGE, so a short image crawls and a tall one glides; the motion is
   * framed by the asset, not by a pixel constant.
   */
  backdrop?: {
    src: string;
    wash?: number;
    /**
     * How far down the image to travel, in percent, over the whole video.
     *
     * 🪤 DEFAULTING TO 100 IS WRONG FOR A TALL CAPTURE and this is the knob that
     * fixes it. A full mobile page can be 4000px+; walking all of it in 14s is a
     * blur, not a scroll. Set it so the page drifts at reading pace — the motion
     * should read as someone browsing, not as a seek bar being dragged.
     */
    travel?: number;
  };
  music: string;
  structure?: ActSeconds;
  palette?: string;
  layout?: string;
};

export const ExplainerVideo: React.FC<ExplainerVideoProps> = (props) => {
  const { hookText, hookAccent, hookSub, heroText, heroSub, traits, ctaText, ctaUrl, music, backdrop } =
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
          {backdrop ? <ScrollingBackdrop {...backdrop} /> : <AstrolBackground />}
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
 * The live site, scrolling top to bottom for the whole video, behind a wash.
 *
 * ⭐ `backgroundPositionY` 0%→100% with `backgroundSize: "100% auto"` scrolls the
 * WHOLE image regardless of its height, so this never needs the asset's pixel
 * dimensions — swap in a taller capture and the motion simply slows to fit.
 * Doing it with a translated <Img> would have required measuring the file.
 *
 * 🪤 Linear, not eased. An eased scroll accelerates mid-video, which reads as a
 * flick rather than a page being browsed — and the point is that it looks like
 * someone using the site.
 */
const ScrollingBackdrop: React.FC<{ src: string; wash?: number; travel?: number }> = ({
  src,
  wash = 0.82,
  travel = 100,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const P = usePalette();
  const y = interpolate(frame, [0, durationInFrames - 1], [0, travel], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    // 🪤 The base fill is NOT redundant. The image is width-fitted, so the frame
    // is uncovered wherever the asset is shorter than 16:9 — and the wash over
    // nothing renders as flat grey, which looks like a broken render. Proved with
    // a landscape stand-in. A tall capture never exposes it; this is the guard for
    // when someone feeds a short one.
    <AbsoluteFill style={{ background: P.GRAD_B, overflow: "hidden" }}>
      {/* 🔴🔴 `<Img>`, NOT a CSS `background-image`. Remotion does not wait for a
          background-image before encoding a frame, so the backdrop can render
          EMPTY on the frames it has not loaded yet — the exact blank-frame class
          of defect this project has now shipped three times. `<Img>` participates
          in the render's asset wait. @remotion/no-background-image says the same.

          🪤 translateY in PERCENT is what makes this dimension-free: a percentage
          transform resolves against the ELEMENT's own height, so the scroll adapts
          to whatever capture is dropped in without measuring the file. */}
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "auto",
          transform: `translateY(-${y}%)`,
        }}
      />
      {/* 🔴 The readability layer. See `backdrop` on the props type. */}
      <AbsoluteFill style={{ background: P.GRAD_A, opacity: wash }} />
    </AbsoluteFill>
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
