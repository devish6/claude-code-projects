import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BrandAudio } from "../components/kit";
import { AstrolBackground } from "./components/AstrolBackground";
import {
  ApproveScreen,
  MethodsScreen,
  PaidScreen,
  PricingScreen,
} from "./components/CheckoutScreens";
import { CinematicTransition } from "./components/CinematicTransition";
import { CTAEnding } from "./components/CTAEnding";
import { CuriosityGap } from "./components/CuriosityGap";
import { PatternInterrupt } from "./components/PatternInterrupt";
import { PhoneCaption, PhoneFrame } from "./components/PhoneFrame";
import { ViralHook, type HookVariant } from "./components/ViralHook";
import { DISPLAY, DISPLAY_HI, UI, UI_HI } from "./fonts";
import { useShake } from "./motion";
import { TEXT, TEXT_SHADOW } from "./palette";
import { ACT } from "./timing";

/**
 * The announcement composition — an event, not a numerology lesson.
 *
 * ViralVideo's act structure is deliberately fixed around a number reveal plus
 * four moolank traits, which is exactly what makes hook A/B testing cheap
 * there. An announcement has neither, so it gets its own body while reusing
 * every shared part: same background, same hook component, same curiosity gap,
 * same interrupts, same CTA, same 17.4s act grid from timing.ts.
 *
 * Both language cuts are this component with different props. There is no
 * locale flag and no branching inside — a `lang` switch would grow a second
 * layout the day someone adds a third language.
 */

/** The four product screens, in order. Fixed — only the captions vary. */
const SCREENS = [PricingScreen, MethodsScreen, ApproveScreen, PaidScreen] as const;

/**
 * ⭐ CUT GRID — every value beat starts on a MULTIPLE OF 12 FRAMES.
 *
 * The bed (hardstyleV10) is 149.9 BPM, which at 30fps is a 12-frame beat, so
 * beats land on frames 0/12/24/… A cut on a non-multiple of 12 is a cut that
 * misses the music. 192, 252, 324 and 384 are 16, 21, 27 and 32 beats in.
 *
 * ACT.valueStart is 192 and ACT.ctaStart is 450, so these four tile the value
 * act exactly: 60 + 72 + 60 + 66 = 258 frames. upi-templates.test.ts asserts
 * both properties, so an editorial nudge to one of these numbers fails a test
 * rather than quietly drifting off the beat.
 */
export const VALUE_BEATS = [192, 252, 324, 384] as const;

/** Attention resets. Gaps of 60/72/60 frames — inside INTERRUPT_EVERY (84). */
const INTERRUPTS = VALUE_BEATS;

export type UpiLaunchProps = {
  hookText: string;
  hookAccent: string;
  hookSub: string;
  variant: HookVariant;
  buildSetup: string;
  buildReveal: string;
  /** Exactly 4 — one per product screen, in SCREENS order. */
  captions: string[];
  ctaText: string;
  music: string;
  /** Hindi cut swaps the font stacks. Screen copy inside the phone never changes. */
  hindi?: boolean;
};

export const UpiLaunch: React.FC<UpiLaunchProps> = ({
  hookText,
  hookAccent,
  hookSub,
  variant,
  buildSetup,
  buildReveal,
  captions,
  ctaText,
  music,
  hindi = false,
}) => {
  const shake = useShake(VALUE_BEATS[0], 10, 7);
  // One decision, applied everywhere text is set. The screens INSIDE the phone
  // are excluded on purpose — they stay English in both cuts.
  const displayFont = hindi ? DISPLAY_HI : DISPLAY;
  const captionFont = hindi ? UI_HI : UI;

  return (
    <AbsoluteFill>
      {/* fadeFloor: hardstyleV10 opens on a hard transient sitting inside frame
          0. The old 0-floor fade multiplied exactly that transient by zero,
          defeating the beat-sync prep in the render. */}
      <BrandAudio src={music} total={ACT.total} start={0} fadeIn={2} vol={0.46} fadeFloor={0.85} />

      <AstrolBackground
        rotationSpeed={7}
        particleDensity={95}
        pulseAt={[ACT.buildStart, ...INTERRUPTS]}
      />

      {/* ── HOOK 0–1.6s — the price, at full size on frame 0 ─────────────── */}
      <Sequence durationInFrames={ACT.hookEnd}>
        <ViralHook
          text={hookText}
          accent={hookAccent}
          subtext={hookSub}
          variant={variant}
          durationInFrames={ACT.hookEnd}
          displayFont={displayFont}
          uiFont={captionFont}
        />
      </Sequence>

      {/* ── BUILD 1.6–6.4s — what the price actually buys ────────────────── */}
      <Sequence from={ACT.buildStart} durationInFrames={ACT.valueStart - ACT.buildStart}>
        <CinematicTransition type="zoomIn">
          <CuriosityGap
            setup={buildSetup}
            reveal={buildReveal}
            durationInFrames={ACT.valueStart - ACT.buildStart}
            displayFont={displayFont}
            uiFont={captionFont}
          />
        </CinematicTransition>
      </Sequence>
      <Sequence from={ACT.buildStart} durationInFrames={10}>
        <PatternInterrupt type="flash" />
      </Sequence>

      {/* ── VALUE 6.4–15.0s — the product, inside a phone ────────────────── */}
      {SCREENS.map((ScreenComponent, i) => {
        const from = VALUE_BEATS[i];
        const to = VALUE_BEATS[i + 1] ?? ACT.ctaStart;
        const duration = to - from;
        // First beat is the reveal of the product itself, so it punches in;
        // the rest alternate so consecutive screens never share a move.
        const type = i === 0 ? "zoomIn" : i % 2 === 1 ? "slide" : "zoomOut";

        return (
          <Sequence key={from} from={from} durationInFrames={duration}>
            <AbsoluteFill
              style={i === 0 ? { transform: `translateX(${shake}px)` } : undefined}
            >
              <CinematicTransition type={type}>
                <PhoneFrame durationInFrames={duration}>
                  <ScreenComponent />
                </PhoneFrame>
                <PhoneCaption
                  text={captions[i]}
                  fontFamily={captionFont}
                  color={TEXT}
                  shadow={TEXT_SHADOW}
                />
              </CinematicTransition>
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {INTERRUPTS.map((at, i) => (
        <Sequence key={at} from={at} durationInFrames={i === 0 ? 9 : 8}>
          <PatternInterrupt type={i === 0 ? "colorShift" : "flash"} />
        </Sequence>
      ))}

      {/* ── CTA 15.0–17.4s — the only branded frames ─────────────────────── */}
      <Sequence from={ACT.ctaStart} durationInFrames={ACT.total - ACT.ctaStart}>
        <CinematicTransition type="zoomIn">
          <CTAEnding
            text={ctaText}
            durationInFrames={ACT.total - ACT.ctaStart}
            uiFont={captionFont}
          />
        </CinematicTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
