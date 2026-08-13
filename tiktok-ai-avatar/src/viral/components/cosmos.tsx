import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { hash, hashRange } from "../../lib/brand";
import { usePalette } from "../PaletteContext";
import { relativeLuminance } from "../palette";

/**
 * Cosmos — the moving parts of AstrolBackground.
 *
 * Split out of AstrolBackground so that file reads as a stack of named layers
 * rather than 200 lines of trigonometry.
 *
 * ⭐ TWO RULES BIND EVERY LAYER HERE.
 *
 * 1. **Deterministic.** Remotion renders frames in parallel across worker
 *    processes. Anything derived from Math.random()/Date.now() produces a
 *    DIFFERENT value per worker, so the video tears at chunk boundaries — and
 *    it tears invisibly on a re-render, which is worse. Every value below comes
 *    from `useCurrentFrame()`, the element index, or `hash(index)`.
 * 2. **The centre band is not ours.** Foreground copy is large centred type.
 *    Every decorative layer is wrapped by `CalmCentre`, which masks it down to
 *    ~a quarter strength across the optical centre and only lets it reach full
 *    opacity out at the edges. Motion lives in the viewer's periphery; the
 *    words stay clean. This is why the layers below can be as busy as they are.
 */

/** Wrap `v` into [min, min+span) — used so drifting motes re-enter the field. */
const wrap = (v: number, min: number, span: number) =>
  min + ((((v - min) % span) + span) % span);

/**
 * The mask that keeps type legible.
 *
 * Alpha is the multiplier applied to whatever it wraps: 0.26 over the centre
 * ellipse, ramping to 1 past 82% of the radius. Tuned against `sage-gold` (dark
 * ink on a light ground), which is the unforgiving case — on the dark palettes
 * background clutter merely competes, on the light one it eats the counters of
 * the letterforms.
 */
const CALM_MASK =
  "radial-gradient(ellipse 74% 40% at 50% 47%, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.36) 32%, rgba(0,0,0,0.74) 62%, rgba(0,0,0,1) 82%)";

export const CalmCentre: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      maskImage: CALM_MASK,
      WebkitMaskImage: CALM_MASK,
    }}
  >
    {children}
  </AbsoluteFill>
);

// ── Aurora: three huge soft colour fields on slow Lissajous paths ───────────
/**
 * The depth layer. Nothing here has an edge; they are 60–90% wide radial
 * gradients whose CENTRES wander on incommensurable periods (27s, 43s, 52s), so
 * the ground never repeats inside a 24s reel and never resolves into a
 * recognisable shape. This is the difference between "a gradient" and "weather".
 */
const AURORA = [
  { cx: 30, cy: 66, ax: 15, ay: 11, sx: 0.023, sy: 0.031, w: 66, h: 44, tok: "ACCENT", op: 0.2 },
  { cx: 74, cy: 24, ax: 13, ay: 9, sx: 0.019, sy: 0.026, w: 58, h: 38, tok: "ACCENT_GREEN", op: 0.14 },
  { cx: 52, cy: 88, ax: 18, ay: 6, sx: 0.015, sy: 0.021, w: 80, h: 30, tok: "MOTE", op: 0.12 },
] as const;

export const Aurora: React.FC = () => {
  const P = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <>
      {AURORA.map((a, i) => {
        const x = a.cx + Math.sin(t * a.sx * Math.PI * 2 + i * 1.7) * a.ax;
        const y = a.cy + Math.cos(t * a.sy * Math.PI * 2 + i * 2.3) * a.ay;
        // Each field breathes on its own period so they drift in and out of
        // dominance instead of all peaking together.
        const breath = 1 + Math.sin(t * 0.11 + i * 2) * 0.14;
        return (
          <AbsoluteFill
            key={i}
            style={{
              opacity: a.op * breath,
              background: `radial-gradient(ellipse ${a.w}% ${a.h}% at ${x}% ${y}%, ${
                P[a.tok]
              }, transparent 70%)`,
            }}
          />
        );
      })}
    </>
  );
};

// ── Light sweeps: a wide soft band traversing the frame ─────────────────────
/**
 * Two diagonal bands of the palette's own halo colour crossing at different
 * angles, speeds and directions. Periods are 13.4s and 8.9s — deliberately
 * non-harmonic, so the two never cross together twice in one video.
 *
 * The opacity envelope is `sin(pi * phase)`: zero at both ends of the travel,
 * so a band grows in and dies out rather than popping at the wrap.
 */
const SWEEPS = [
  { period: 13.4, angle: 104, band: 15, dir: 1, op: 0.55, phase: 0.15 },
  { period: 8.9, angle: 68, band: 8, dir: -1, op: 0.32, phase: 0.62 },
] as const;

export const LightSweeps: React.FC = () => {
  const P = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <>
      {SWEEPS.map((s, i) => {
        const phase = wrap(t / s.period + s.phase, 0, 1);
        const travel = (phase * 2 - 1) * 130 * s.dir;
        const env = Math.sin(Math.PI * phase);
        return (
          <AbsoluteFill
            key={i}
            style={{
              opacity: s.op * env * env,
              transform: `translateX(${travel}%)`,
              background: `linear-gradient(${s.angle}deg, transparent ${
                50 - s.band
              }%, ${P.HALO} 50%, transparent ${50 + s.band}%)`,
            }}
          />
        );
      })}
    </>
  );
};

// ── Orbits: the one-way-attraction motif ────────────────────────────────────
/**
 * Four tilted elliptical orbits with bodies travelling them.
 *
 * ⭐ THIS IS THE BRIEF'S CONCEPT, drawn rather than stated. The videos are
 * about one-sided attraction — who pulls toward whom, and whether it is
 * returned. So:
 *   • Orbit 0 carries TWO bodies at a fixed 0.42-turn separation. They chase
 *     each other for the whole runtime and the gap never closes. Nobody
 *     catches anybody.
 *   • Orbit 2 has `breathe` — its radius contracts toward the centre and falls
 *     back on a 3s period. A body that drifts in, doesn't arrive, and retreats.
 *   • The others simply complete, so the frame reads as a system rather than a
 *     diagram of one idea.
 *
 * `speed` is revolutions per second: 0.055 is one lap per 18s, i.e. slower than
 * the whole video. Nothing here ever moves fast enough to pull the eye off a
 * line of type.
 */
const ORBITS = [
  { rx: 470, ry: 268, tilt: -16, speed: 0.055, phase: 0, bodies: [0, 0.42], breathe: 0 },
  { rx: 330, ry: 392, tilt: 27, speed: -0.041, phase: 0.6, bodies: [0.18], breathe: 0 },
  { rx: 226, ry: 176, tilt: -44, speed: 0.078, phase: 0.25, bodies: [0.5], breathe: 0.24 },
  { rx: 616, ry: 452, tilt: 8, speed: -0.028, phase: 0.8, bodies: [0.33, 0.71], breathe: 0 },
] as const;

const CX = 540;
const CY = 830;

export const Orbits: React.FC<{ pulse: number }> = ({ pulse }) => {
  const P = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <svg
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      {ORBITS.map((o, i) => {
        // The tilt itself drifts a few degrees, so the rings are never a fixed
        // engraving even in the seconds when a body is behind the copy.
        const tilt = o.tilt + Math.sin(t * 0.07 + i * 1.9) * 5;
        const squash = o.breathe
          ? 1 - o.breathe * (0.5 + 0.5 * Math.sin(t * 0.33 + o.phase * 6))
          : 1;
        const rx = o.rx * squash;
        const ry = o.ry * squash;
        return (
          <g key={i} transform={`translate(${CX} ${CY}) rotate(${tilt})`}>
            <ellipse
              cx={0}
              cy={0}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={P.DIAL_INK}
              strokeWidth={2}
              opacity={0.26 + pulse * 0.12}
            />
            {o.bodies.map((b, j) => {
              const th = (o.phase + b + o.speed * t) * Math.PI * 2;
              const x = Math.cos(th) * rx;
              const y = Math.sin(th) * ry;
              const col = (i + j) % 2 === 0 ? P.ACCENT : P.ACCENT_GREEN;
              // Bodies brighten as they cross the near side of the ellipse —
              // cheap parallax, no z-buffer required.
              const near = 0.5 + 0.5 * Math.sin(th);
              return (
                <g key={j} transform={`translate(${x} ${y}) rotate(${-tilt})`}>
                  <circle r={26 + near * 8} fill={col} opacity={0.06 + near * 0.06} />
                  <circle r={5 + near * 3.5} fill={col} opacity={0.34 + near * 0.3} />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

// ── Pulse ring: the background reacting to a beat ───────────────────────────
/**
 * On a pattern-interrupt frame a ring leaves the centre and expands off the
 * edge over ~26 frames (0.87s). It is the only element here that acknowledges
 * the audio, and it is what turns "a loop playing behind text" into "a
 * backdrop that heard the cut".
 *
 * It is slow and it fades as it grows, so it never registers as a flash.
 */
export const PulseRing: React.FC<{ progress: number }> = ({ progress }) => {
  const P = usePalette();
  if (progress <= 0 || progress >= 1) return null;
  const ease = 1 - Math.pow(1 - progress, 2.2);
  return (
    <svg
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <circle
        cx={CX}
        cy={CY}
        r={70 + ease * 980}
        fill="none"
        stroke={P.ACCENT}
        strokeWidth={7 - ease * 5}
        opacity={0.3 * (1 - ease)}
      />
    </svg>
  );
};

// ── Motes: three depth bands on a shared current ────────────────────────────
/**
 * The old field oscillated every mote around a fixed home with sin/cos. That is
 * why the owner called it bland: nothing ever ARRIVED anywhere, so after two
 * seconds the eye correctly classified it as texture and stopped looking.
 *
 * These flow. Every band travels a shared up-and-right current at its own
 * speed — 7 / 17 / 32 px per second — which is real parallax: over a 20s reel
 * the near band crosses 640px while the far band creeps 140. Positions wrap
 * through a field 40% larger than the frame, so the wrap itself happens off
 * screen and is never seen.
 *
 * `accent` motes (roughly one in eight of the near band) flare on a slow
 * staggered cycle, peaked with a 6th power so the flare is brief but smooth —
 * an accent, never a strobe.
 */
const BANDS = [
  { share: 0.55, speed: 7, size: [2, 4.5], op: [0.1, 0.24], glow: 0, seed: 0 },
  { share: 0.3, speed: 17, size: [3, 6.5], op: [0.16, 0.4], glow: 0, seed: 400 },
  { share: 0.15, speed: 32, size: [6, 12], op: [0.26, 0.6], glow: 2.4, seed: 800 },
] as const;

/** Shared current direction, normalised — a slow rise to the right. */
const CUR_X = 0.5;
const CUR_Y = -0.86;

export const Motes: React.FC<{ density: number; pulse: number }> = ({ density, pulse }) => {
  const P = usePalette();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const fieldW = width * 1.4;
  const fieldH = height * 1.4;
  const originX = -width * 0.2;
  const originY = -height * 0.2;

  return (
    <>
      {BANDS.map((band, b) => {
        const count = Math.max(1, Math.round(density * band.share));
        return (
          <AbsoluteFill key={b}>
            {Array.from({ length: count }, (_, i) => {
              const k = i + band.seed;
              // Slow individual wobble on top of the current, so the band is a
              // drift rather than a rigid conveyor belt.
              const wob = hashRange(k + 2, 0.14, 0.42);
              const x = wrap(
                hash(k) * fieldW +
                  t * band.speed * CUR_X +
                  Math.sin(t * wob + k) * 22,
                originX,
                fieldW,
              );
              const y = wrap(
                hash(k + 0.5) * fieldH +
                  t * band.speed * CUR_Y +
                  Math.cos(t * wob * 0.8 + k) * 16,
                originY,
                fieldH,
              );
              const size = hashRange(k + 1, band.size[0], band.size[1]);
              const twinkle =
                band.op[0] +
                (band.op[1] - band.op[0]) *
                  (0.5 + 0.5 * Math.sin(t * hashRange(k + 4, 0.5, 1.6) + k));

              // One in eight near-band motes is an accent that flares.
              const isAccent = b === 2 && i % 8 === 3;
              const flare = isAccent
                ? Math.pow(
                    Math.max(0, Math.sin(t * 0.42 + hash(k + 7) * Math.PI * 2)),
                    6,
                  )
                : 0;

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: isAccent ? P.ACCENT : P.MOTE,
                    transform: `translate3d(${x}px, ${y}px, 0) scale(${
                      1 + flare * 1.5 + pulse * 0.2
                    })`,
                    opacity: Math.min(0.85, twinkle + flare * 0.45 + pulse * 0.08),
                    boxShadow: band.glow
                      ? `0 0 ${size * band.glow}px ${isAccent ? P.ACCENT : P.MOTE}`
                      : undefined,
                  }}
                />
              );
            })}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

/* ---------------------------------------------------------------------------
 * SacredGeometry — METATRON'S CUBE BUILT OUT OF THE NUMERALS.
 *
 * 🔴🔴 SECOND ATTEMPT. The first was rejected: *"too subtle and very boring."*
 * That was a real mistake and worth naming, because the cause was not taste —
 * I stacked two dimmers in series. The art was drawn at ~0.3 alpha AND placed
 * inside `CalmCentre`, which pulls the centre band to ~26%. 0.3 x 0.26 is 0.08.
 * At eight percent nothing is a design; it is a smudge. Protecting legibility is
 * correct, but it is a REASON TO MOVE THE ART OFF THE COPY, never a reason to
 * fade it until it disappears.
 *
 * 📐 THE REFERENCE (owner, 2026-08-13, three images): Metatron's Cube on black,
 * every node a glowing gold medallion with a numeral inside, all-pairs lines
 * between nodes, concentric outer rings with fine ticks, heavy bloom.
 * ⭐ It is the right reference for THIS account because the figure is made of
 * the subject: thirteen nodes, and the copy names two or three of those digits
 * in every video.
 *
 * ⭐⭐ HOW LEGIBILITY IS KEPT WITHOUT DIMMING: the cube is drawn at full
 * strength and the DENSE PART IS MOVED, not faded. `GEO_CY` sits well above the
 * trait band, so the copy lands in the open lower field of the figure rather
 * than inside the lattice. `CalmCentre` still wraps it as a backstop, but it is
 * no longer doing the whole job alone.
 *
 * 🪤 NUMERALS ARE COUNTER-ROTATED PER NODE. The cube rotates; each medallion's
 * digit is rotated back by exactly the cube's angle so it stays upright. An
 * upside-down 6 is a 9 — on a numerology account that is not cosmetic.
 * 🪤 The glow is a WIDE LOW-ALPHA STROKE UNDER a crisp one, not an SVG filter.
 * feGaussianBlur over a lattice this dense costs real render time per frame,
 * and this repo renders the whole set on every copy change.
 * ⛔ Tune on `sage-gold` first — light ground, dark ink. Gold-on-cream is the
 * lowest-contrast pairing here, so DIAL_INK carries the lines on that palette.
 * ------------------------------------------------------------------------- */

/** Metatron's Cube: centre + inner hex (r) + outer hex (r*sqrt3, offset 30deg). */
const MET_R = 152;
const MET_NODES: { x: number; y: number; ring: 0 | 1 | 2 }[] = [
  { x: 0, y: 0, ring: 0 },
  ...Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    return { x: Math.cos(a) * MET_R, y: Math.sin(a) * MET_R, ring: 1 as const };
  }),
  ...Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 60) * Math.PI) / 180;
    const r = MET_R * Math.sqrt(3);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, ring: 2 as const };
  }),
];

/** Every node-to-node line. That all-pairs lattice IS Metatron's Cube. */
const MET_EDGES: [number, number][] = MET_NODES.flatMap((_, i) =>
  MET_NODES.slice(i + 1).map((_, j): [number, number] => [i, i + 1 + j]),
);

/** Digits on the twelve outer nodes; the centre stays open for the halo. */
const MET_DIGITS = [7, 3, 4, 9, 2, 8, 6, 1, 5, 2, 8, 6];

/**
 * Geometry centre and scale are set so the ENTIRE figure clears the trait band.
 * 🪤 Measured, not guessed: outer tick radius 344 + 20 = 364, so at GEO_CY 470
 * the lowest ink lands at y=834 and the trait line sits at ~910. The first bold
 * pass had the figure at 690 with radius 496 — its bottom edge reached 1186 and
 * a medallion sat directly on the copy. Raising opacity is what made that
 * visible; it was always there.
 * ⛔ If you enlarge MET_R or the rings, re-check GEO_CY + outer radius < 840.
 */
const GEO_CY = 470;

export const SacredGeometry: React.FC<{ pulse: number }> = ({ pulse }) => {
  const P = usePalette();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  /**
   * 🔴🔴 NOT `P.DIAL_INK`. That token carries alpha INSIDE the colour
   * (`oklch(... / 0.30)`), so using it multiplied a third dimmer onto the two
   * already in play — 0.92 opacity x 0.30 baked alpha x 0.26 centre mask is
   * about SEVEN PERCENT, which is exactly why the first attempt read as a
   * smudge. A token whose name says "ink" is not a paint colour.
   * The reference is bright gold on near-black, so the gold is explicit and
   * opaque, and it flips to a deep bronze on light grounds where a pale gold
   * would vanish into cream.
   */
  /* 🪤 BOTH gradient stops, not one. Reading GRAD_B alone called `sage-gold`
     DARK — its far stop is deep even though the palette is a light cream — so
     the light palette got the bright-gold lattice meant for black grounds plus
     near-black discs. The ground is a gradient; if EITHER end is light, the
     art has to be dark-on-light. */
  const lightGround =
    Math.max(relativeLuminance(P.GRAD_A), relativeLuminance(P.GRAD_B)) > 0.45;
  const gold = lightGround ? "oklch(0.46 0.10 74)" : "oklch(0.84 0.15 86)";
  /* Disc behind each medallion. Without it the all-pairs lattice runs straight
     through the digits and a 6 crossed by two lines stops reading as a 6. The
     reference art does the same thing — every numeral sits on its own ground. */
  const disc = lightGround ? "oklch(0.95 0.02 92)" : "oklch(0.17 0.02 60)";
  const lift = 1 + pulse * 0.6;
  const spin = t * 1.6;

  const node = (n: { x: number; y: number }) => ({
    x: CX + n.x,
    y: GEO_CY + n.y,
  });

  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <g transform={`rotate(${spin} ${CX} ${GEO_CY})`}>
        {/* lattice — wide soft pass under a crisp pass, which is the bloom */}
        <g stroke={gold} fill="none" strokeLinecap="round">
          <g opacity={0.22 * lift} strokeWidth={7}>
            {MET_EDGES.map(([a, b], i) => {
              const p1 = node(MET_NODES[a]);
              const p2 = node(MET_NODES[b]);
              return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
            })}
          </g>
          <g opacity={0.7 * lift} strokeWidth={1.6}>
            {MET_EDGES.map(([a, b], i) => {
              const p1 = node(MET_NODES[a]);
              const p2 = node(MET_NODES[b]);
              return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
            })}
          </g>
        </g>

        {/* concentric outer rings + ticks */}
        <g stroke={gold} fill="none" opacity={0.62 * lift}>
          {[294, 330, 344].map((r, i) => (
            <circle key={r} cx={CX} cy={GEO_CY} r={r} strokeWidth={i === 1 ? 2.4 : 1.2} />
          ))}
        </g>
        <g opacity={0.5 * lift}>
          {Array.from({ length: 96 }, (_, i) => {
            const a = ((i / 96) * 360 - 90) * (Math.PI / 180);
            const r1 = 344 + (i % 8 === 0 ? 20 : 9);
            return (
              <line
                key={i}
                x1={CX + 344 * Math.cos(a)}
                y1={GEO_CY + 344 * Math.sin(a)}
                x2={CX + r1 * Math.cos(a)}
                y2={GEO_CY + r1 * Math.sin(a)}
                stroke={gold}
                strokeWidth={i % 8 === 0 ? 2.2 : 1}
              />
            );
          })}
        </g>

        {/* medallions: glowing ring + upright numeral */}
        {MET_NODES.map((n, i) => {
          if (n.ring === 0) return null;
          const { x, y } = node(n);
          const outer = n.ring === 1 ? 44 : 40;
          const digit = MET_DIGITS[i - 1];
          const breathe = 0.7 + 0.3 * Math.sin(t * 1.1 + i * 1.7);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={outer - 2} fill={disc} opacity={0.88} />
              <circle cx={x} cy={y} r={outer + 7} fill="none" stroke={gold} strokeWidth={9} opacity={0.16 * breathe * lift} />
              <circle cx={x} cy={y} r={outer} fill="none" stroke={gold} strokeWidth={2.6} opacity={0.92 * breathe * lift} />
              <circle cx={x} cy={y} r={outer - 11} fill="none" stroke={gold} strokeWidth={1.1} opacity={0.5 * breathe * lift} />
              {/* counter-rotated so the digit never tumbles */}
              <g transform={`rotate(${-spin} ${x} ${y})`}>
                <text
                  x={x}
                  y={y}
                  fill={gold}
                  opacity={0.96 * breathe * lift}
                  fontSize={outer + 6}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {digit}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
