import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Dial } from "../../components/vfx";
import { usePalette } from "../PaletteContext";
import { Aurora, CalmCentre, LightSweeps, Motes, Orbits, PulseRing, SacredGeometry } from "./cosmos";

/**
 * Living backdrop.
 *
 * 🔴 REBUILT 2026-08-13 on the owner's verdict of V35–V37: *"The background is
 * very boring… people don't have anything to watch. All the videos are very
 * bland."* He was right, and the reason was specific rather than a matter of
 * taste. The old backdrop was a gradient whose ANGLE wobbled six degrees, two
 * concentric dials at a constant spin, and a mote field where every particle
 * oscillated around a fixed home. Nothing travelled anywhere. Within about two
 * seconds the eye classifies that as texture and stops looking at it — which is
 * precisely the second where retention is decided.
 *
 * What replaces it is a stack of layers moving at DIFFERENT speeds on
 * non-harmonic periods, so the frame never repeats inside a 24s reel:
 *
 *   0. ground gradient — drifting angle, breathing stops
 *   1. Aurora — three huge soft colour fields wandering on 27/43/52s paths
 *   2. LightSweeps — two soft bands crossing the frame on 13.4s and 8.9s
 *   3. Orbits — tilted ellipses with travelling bodies (the concept layer)
 *   4. Dials — the numerology motif, kept, now breathing and counter-rotating
 *   5. SacredGeometry — nested polygons, rings and the 1-9 numeral ring
 *   6. Motes — three depth bands flowing on a shared current (real parallax)
 *   7. PulseRing — the one layer that reacts to a beat
 *
 * ⭐⭐ LEGIBILITY IS NOT NEGOTIATED WITH, IT IS ENFORCED STRUCTURALLY. Layers
 * 1–6 are all children of `CalmCentre`, which masks them to ~26% strength
 * across the optical centre ellipse and only lets them reach full opacity past
 * 82% of the radius. So the busier the periphery gets, the more the centre band
 * reads as deliberate negative space. The ground gradient, the halo behind the
 * subject and the vignette stay UNMASKED — they carry contrast, not clutter.
 *
 * 🪤 The mask, not per-layer opacity, is what makes `sage-gold` survive. It is
 * the light palette with dark ink type; anything drawn dark across the centre
 * fills the counters of the letterforms and the copy turns to mud. Tune motion
 * on sage-gold first, never on ember.
 *
 * ⭐ Everything is driven by `useCurrentFrame()` and `hash(index)`. CSS
 * keyframes do not advance under a frame-by-frame render, and Math.random()
 * tears across Remotion's parallel workers.
 */
export const AstrolBackground: React.FC<{
  /** Degrees per second. */
  rotationSpeed?: number;
  particleDensity?: number;
  /** Reacts to a beat/text hit — brief warmth lift. */
  pulseAt?: number[];
}> = ({ rotationSpeed = 6, particleDensity = 70, pulseAt = [] }) => {
  const P = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const pulse = pulseAt.reduce((acc, at) => {
    const d = frame - at;
    if (d < 0 || d > 10) return acc;
    return Math.max(acc, 1 - d / 10);
  }, 0);

  // The expanding ring runs longer than the warmth lift — 26 frames rather than
  // 10 — so the reaction reads as a swell rather than a blink.
  const ringProgress = pulseAt.reduce((acc, at) => {
    const d = frame - at;
    if (d < 0 || d >= 26) return acc;
    return Math.max(acc, d / 26);
  }, 0);

  // The ground itself is never still: the gradient angle drifts, and the two
  // colour stops slide against each other on a slower period so the midtone
  // band travels across the frame.
  const angle = 152 + Math.sin(t * 0.18) * 6;
  const midStop = 48 + Math.sin(t * 0.09 + 1.2) * 9;

  // Halo breathes on a 4.2s cycle whatever else happens, and jumps on a beat.
  const breath = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 4.2);
  const haloY = 34 + Math.cos(t * 0.3) * 5;
  const haloScale = 1 + breath * 0.05 + pulse * 0.12;

  // Vignette breathes in counter-phase to the halo — the frame appears to
  // inhale. Small numbers on purpose; this must never be visible as a flicker.
  const vig = 88 - breath * 4;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${P.GRAD_A} 0%, ${P.GRAD_MID} ${midStop}%, ${P.GRAD_B} 100%)`,
      }}
    >
      {/* Warm halo behind the subject — UNMASKED, it is what lifts the centre
          away from the surrounding motion. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${68 * haloScale}% ${
            44 * haloScale
          }% at 50% ${haloY}%, ${P.HALO}, transparent 66%)`,
        }}
      />

      {/* ── Everything decorative lives inside the calm-centre mask ───────── */}
      <CalmCentre>
        <Aurora />
        <LightSweeps />

        {/* The numerology dial, kept — it is the series' visual signature.
            Now breathing and slightly de-emphasised, because the orbits carry
            the movement the dial used to have to fake on its own. */}
        <AbsoluteFill
          style={{
            color: P.DIAL_INK,
            transform: `scale(${1 + breath * 0.035})`,
          }}
        >
          <Dial rot={t * rotationSpeed} opacity={0.11 + pulse * 0.05} />
          <Dial rot={-t * (rotationSpeed * 0.6) + 15} opacity={0.06} />
        </AbsoluteFill>

        <Orbits pulse={pulse} />
        <SacredGeometry pulse={pulse} />
        <Motes density={particleDensity} pulse={pulse} />
        <PulseRing progress={ringProgress} />
      </CalmCentre>

      {/* Warm edge darkening — anchors the frame, keeps text off the edges.
          Outside the mask: this is contrast, not decoration. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${vig}% ${vig}% at 50% 50%, transparent 54%, ${P.VIGNETTE} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
