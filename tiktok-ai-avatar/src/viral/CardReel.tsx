import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { DISPLAY, UI, DISPLAY_HI, UI_HI } from "./fonts";
import { PALETTES } from "./palette";
import { MOOLANK_CARDS } from "./card-data";
import { InfoCard, INFO_CARD_WIDTH, INFO_CARD_HEIGHT } from "./InfoCard";

/**
 * The music-led animated card reel.
 *
 * ⭐⭐ WHY THIS FORMAT, AND NOT A TALKING HEAD
 * A sweep of #moolank and #numerology on 2026-08-05 found roughly 95% of top
 * content is a talking head — real numerologists, real faces, verified badges,
 * 200K followers. We have no face, so a voice-clone talking head would enter
 * the most saturated format with the weakest hand. What that sweep found MISSING
 * was anything saveable: almost no reference cards, nothing a viewer can keep.
 * So this is a reel whose payload is the card.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 🔴 THE 2026-08-05 REBUILD, AND THE MEASUREMENT THAT FORCED IT
 * ══════════════════════════════════════════════════════════════════════════
 * The narrated 0:31 version was measured on the phone dashboard:
 *
 *   average watch time 5s of 0:31 (16%) · skip rate 78% · reach 126
 *   retention 100% → ~25% inside the FIRST TWO SECONDS
 *   views front-loaded to ~140 in under an hour, then FLAT
 *
 * Read that flatline correctly: Instagram tested the reel fast, measured the 5s
 * watch, and refused to widen it. Every engagement rate BEAT this account's own
 * baseline (like 7.1%, save 4.7%, repost 3.9%, all "Higher"; skip rate "Lower").
 * The content converts whoever sees it. The first two seconds are what caps who
 * sees it. So this rebuild spends its whole budget on those two seconds:
 *
 *   1. A GLIMPSE of the finished card as frame one (COLD_OPEN_FRAMES). A cut is
 *      motion, and the old first frame was a static title on a dark gradient.
 *   2. A written promise that a fact is coming, paid off by its own beat before
 *      the card. See `surpriseFact` in card-data.ts.
 *   3. ~17s instead of 0:31. At a 5s average watch, 26 of the old 31 seconds
 *      were seconds nobody saw, and completion % is what the ranker reads.
 *
 * 🪤 THE COVER IS NOT THE FIX, AND DO NOT LET IT BE MISTAKEN FOR ONE. 66.4% of
 * views came from the Reels tab, where there IS no cover — the video autoplays
 * from frame one. A cover only shows on the profile grid and Explore (~12%).
 * That is why the glimpse lives INSIDE the video rather than only as a poster.
 *
 * 🪤 NO SPOKEN HOOK. 91.8% of viewers were non-followers on the Reels tab, and
 * that surface is watched muted. A promise the viewer cannot hear is not a
 * promise, so every word that has to land is burned into the frame.
 *
 * ⭐ NARRATION IS GONE, AND WITH IT THE TIMINGS FILE. The old build derived its
 * length from ElevenLabs' character alignment (content/reel-N-timings.json), so
 * only Moolanks with a generated mp3 could be registered at all. Beats are now
 * declared here, which is why all nine numbers render. The ElevenLabs budget
 * this frees is reserved for the story videos.
 */

const P = PALETTES["ink-violet"];
const GOLD = P.ACCENT;

export const REEL_FPS = 30;

/**
 * ── THE BEAT SHEET ────────────────────────────────────────────────────────
 * Durations in frames at 30fps. Edit here, not in the body — every downstream
 * offset is derived, so a beat can be retimed without touching a component.
 *
 * 🪤 COLD_OPEN IS 18 FRAMES (0.6s), NOT THE 6 FRAMES (0.2s) FIRST PROPOSED.
 * Six frames reads as a dropped frame rather than as an object. The card is far
 * too dense to READ at any speed — the job here is only to register "a detailed
 * reference card exists and it is coming", so it needs long enough to be seen
 * as a thing. 18 frames does that and still costs almost nothing.
 */
const COLD_OPEN = 18; //  0.6s — the glimpse of the finished card
const HOOK = 90; //  3.0s — numeral, archetype, every qualifying date
const STRENGTHS = 90; //  3.0s — what this number is good at
const REMEDY = 90; //  3.0s — mantra + practice, the most saveable line
const FACT = 105; //  3.5s — the payoff the opening promise is written against
const CARD_HOLD = 117; //  3.9s — held long enough to screenshot

const BEATS = { COLD_OPEN, HOOK, STRENGTHS, REMEDY, FACT, CARD_HOLD };

/** Frame each beat starts on. */
const START = {
  coldOpen: 0,
  hook: COLD_OPEN,
  strengths: COLD_OPEN + HOOK,
  remedy: COLD_OPEN + HOOK + STRENGTHS,
  fact: COLD_OPEN + HOOK + STRENGTHS + REMEDY,
  card: COLD_OPEN + HOOK + STRENGTHS + REMEDY + FACT,
};

export const REEL_DURATION_IN_FRAMES = START.card + CARD_HOLD; // 510 = 17.0s

/**
 * ⭐ TAKES NO ARGUMENT NOW. It used to be `(moolank)` because length was derived
 * per number from that number's narration alignment. Every reel is the same
 * fixed 17s, so a per-number signature would imply a variability that no longer
 * exists — and would quietly accept a wrong number without complaint.
 */
export const reelDurationInFrames = () => REEL_DURATION_IN_FRAMES;

/**
 * ── THE MUSIC BED LIBRARY ─────────────────────────────────────────────────
 * Auditioned 2026-08-05 (12s from each track's body, not its intro). The owner
 * approved `story/01/bed.mp3`, `mool-1`, `mool-4` and `mool-5`, and rejected
 * `mool-2` and `mool-3` as wrong for a still card.
 *
 * ⚠️ `mool-3` IS HERE DESPITE BEING REJECTED. Four approved beds cover only
 * eight reels at two uses each, and the owner chose to reinstate it for the
 * ninth rather than generate a fifth track. It therefore carries EXACTLY ONE
 * slot — the fewest of any bed — and that slot is Moolank 9, whose reel already
 * went out in the old cut and so is the least exposed. If a fifth soft track is
 * ever generated, 9 is the reel to move onto it.
 *
 * 🔴 `mool-2` remains rejected and is NOT to be added without a fresh audition.
 *
 * ⭐ EACH BED CARRIES ITS OWN START AND ITS OWN LEVEL, and both are load-bearing.
 *
 *   startSeconds — several of these open on a quiet intro and would spend the
 *   whole 17s reel fading up. Measured over the exact 17s window a reel uses,
 *   `story/01/bed.mp3` runs 7.7 dB louder from 0:17 than from its own 0:00.
 *
 *   volume — the four approved beds span 4.5 dB of source loudness (mool-1 at
 *   -12.2 dB against mool-5 at -16.7 dB). One shared gain would make the reels
 *   audibly uneven post to post, which is exactly the "machine-made" tell that
 *   varying the bed is meant to avoid. Each value is solved from its measured
 *   window to land the render at ~-18.9 dB, the level verified by ear on the
 *   Moolank 9 cut.
 */
type Bed = { src: string; startSeconds: number; volume: number };

export const BED_LIBRARY = {
  bed01: { src: "story/01/bed.mp3", startSeconds: 17, volume: 0.8 }, // src -16.5 dB
  mool1: { src: "music/mool-1.mp3", startSeconds: 30, volume: 0.49 }, // src -12.2 dB
  mool4: { src: "music/mool-4.mp3", startSeconds: 30, volume: 0.57 }, // src -13.5 dB
  mool5: { src: "music/mool-5.mp3", startSeconds: 30, volume: 0.82 }, // src -16.7 dB
  // 0.85, not the 0.93 that would match the others exactly: mool-3's peaks run
  // to -0.5 dB, so matched gain would leave only ~1 dB of headroom. The 0.8 dB
  // it gives up in loudness is inaudible; a clipped peak on a phone is not.
  mool3: { src: "music/mool-3.mp3", startSeconds: 30, volume: 0.85 }, // src -17.8 dB
} satisfies Record<string, Bed>;

/**
 * ⭐ NO BED IS USED MORE THAN TWICE — the standing rule, and `bed-usage.test.ts`
 * fails the build if an edit here breaks it. Five beds over nine reels lands at
 * four beds twice and `mool3` once.
 *
 * 🪤 THERE IS NO FALLBACK ON PURPOSE. An `?? bed01` would silently hand one bed
 * a third use and break the rule with nothing on screen to show it. A missing
 * entry throws instead — loudly, at render time, naming what to do.
 */
export const BEDS: Record<number, keyof typeof BED_LIBRARY> = {
  1: "bed01",
  2: "mool1",
  3: "mool4",
  4: "mool5",
  5: "bed01",
  6: "mool1",
  7: "mool4",
  8: "mool5",
  9: "mool3",
};

/**
 * ── WHY A BED IS TRIMMED INTO RATHER THAN TURNED UP ───────────────────────
 * The old volume was 0.13 because the bed had to duck ~13 dB under a voice.
 * With no voice the bed IS the audio and has to carry the reel alone.
 *
 * 🪤 THESE TRACKS OPEN QUIET. `story/01/bed.mp3` measured across the file:
 *     0–14s  mean -24.2 dB   ← the intro
 *    17–31s  mean -16.7 dB   ← the body
 *    34–48s  mean -18.1 dB
 * It was written to fade up under a narrator, so a 17s reel starting at its
 * frame zero gets ONLY the intro. The first attempt (volume 0.45, no trim)
 * rendered at mean -31.2 dB — 7 dB QUIETER than the old reel's speech.
 *
 * ⭐ Trimming into the body beats raising the gain: raising an intro amplifies
 * its noise floor too, and its dynamics still read as a fade-in exactly where
 * the cold open needs to feel like something starting.
 *
 * Verified on the Moolank 9 render: mean -18.9 dB, max -3.6 dB.
 */
const bedFor = (moolank: number): Bed => {
  const key = BEDS[moolank];
  if (!key) {
    throw new Error(
      `No music bed assigned for Moolank ${moolank}. Four approved beds cover ` +
        `eight reels at the two-uses-each limit; the ninth needs a fifth soft ` +
        `track. Generate one, add it to BED_LIBRARY with its measured start and ` +
        `volume, then map ${moolank} to it in BEDS.`,
    );
  }
  return BED_LIBRARY[key];
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
 * The card, sized to the frame. Shared by the cold-open glimpse and the held
 * ending so the viewer recognises the payoff as the thing they were shown.
 */
const CardPlate: React.FC<{ number: number; scale: number }> = ({ number, scale }) => (
  <div
    style={{
      width: INFO_CARD_WIDTH,
      height: INFO_CARD_HEIGHT,
      transform: `scale(${scale})`,
      borderRadius: 34,
      overflow: "hidden",
      boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
      position: "relative",
    }}
  >
    <InfoCard number={number} />
  </div>
);

/**
 * ── BEAT 1 · THE COLD OPEN ────────────────────────────────────────────────
 * Frame one is the finished card, pushing in. This is the single highest-value
 * change in the rebuild: it replaces a static title with (a) motion and (b) a
 * visible reason to keep watching.
 *
 * 🪤 It deliberately does NOT carry the promise text. Three messages inside two
 * seconds — glimpse, promise, number — is how all three get missed. The promise
 * rides the hook instead, where it has room to be read.
 */
const ColdOpen: React.FC<{ number: number }> = ({ number }) => {
  const frame = useCurrentFrame();
  // Push in slightly so the plate reads as arriving, not as a held still.
  const scale = interpolate(frame, [0, COLD_OPEN], [1.06, 0.98], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <CardPlate number={number} scale={scale * 0.96} />
    </AbsoluteFill>
  );
};

/**
 * The written promise. Rides the hook and the strengths beat, then clears out
 * before the remedy so it never competes with the card's best line.
 *
 * ⭐ WORDED AS A WITHHOLD, NOT AS AN INSTRUCTION. "Stay till the end" alone is a
 * command with nothing behind it; naming that a specific unknown fact exists is
 * what makes staying worth it. The number is named so the right viewer knows
 * the withheld thing is about THEM.
 *
 * 🪤 IT IS MOUNTED ONCE, SPANNING TWO BEATS — NOT RENDERED INSIDE EACH SCENE.
 * Nested in both HookScene and StrengthsScene it would sit in two different
 * <Sequence>s, so `useSnap` would restart at each one and the strip would
 * re-animate on a cut where nothing about it had changed. That reads as a
 * glitch. Mounted once it stays put while the scenes cut underneath it, which
 * is also what makes it feel like a pinned promise rather than page furniture.
 */
const PromiseStrip: React.FC<{ number: number; delay?: number }> = ({ number, delay = 10 }) => {
  const s = useSnap(delay);
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 90,
        right: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "22px 34px",
        borderRadius: 22,
        border: `2px solid ${GOLD}`,
        background: "rgba(0,0,0,0.34)",
        opacity: s,
        transform: `translateY(${(1 - s) * -16}px)`,
      }}
    >
      <div
        style={{
          fontFamily: UI,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: GOLD,
        }}
      >
        Stay till the end
      </div>
      <div style={{ fontFamily: UI, fontSize: 30, color: P.TEXT, textAlign: "center" }}>
        one thing about {number}s almost nobody knows
      </div>
    </div>
  );
};

/**
 * ── BEAT 2 · THE HOOK ─────────────────────────────────────────────────────
 * ⭐⭐⭐ THE DATE LIST IS THE HOOK. Every qualifying date, never just the first —
 * confirmed three times. V28 named only "the 4th" and cut its audience to about
 * a quarter. A stranger has to self-identify here or nothing else gets watched.
 */
const HookScene: React.FC<{ number: number }> = ({ number }) => {
  const card = MOOLANK_CARDS[number];
  return (
    <Scene>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <Value size={300} delay={0}>{card.number}</Value>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Label delay={4}>Moolank {card.number}</Label>
          <Value size={78} delay={7}>{card.archetype}</Value>
          <Label delay={11}>Ruled by {card.planet}</Label>
        </div>
      </div>
      <div style={{ marginTop: 26 }}>
        <Label delay={16}>Born on</Label>
        <Value size={104} delay={20}>{card.bornOn}</Value>
      </div>
    </Scene>
  );
};

/** ── BEAT 3 · STRENGTHS ───────────────────────────────────────────────── */
const StrengthsScene: React.FC<{ number: number }> = ({ number }) => {
  const card = MOOLANK_CARDS[number];
  return (
    <Scene>
      <Label>Strengths</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 12 }}>
        {card.strengths.map((t, i) => (
          <div key={t} style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
            <span style={{ color: GOLD, fontSize: 40 }}>◆</span>
            {/* 54, not 62: at 62 the longest strength ("Takes a stand and
                holds it") wrapped and orphaned its last word onto a line. */}
            <Value size={54} delay={6 + i * 5}>{t}</Value>
          </div>
        ))}
      </div>
    </Scene>
  );
};

/**
 * ── BEAT 4 · THE REMEDY ───────────────────────────────────────────────────
 * 🔴 The mantra is set in the Devanagari-capable stack. The Latin face leads the
 * family list on purpose: Cinzel has no Devanagari so it falls through, but put
 * Noto first and every Latin run changes weight mid-sentence.
 *
 * 🪤 THIS HAS TO BE ITS OWN COMPONENT — as does every scene here. Written inline
 * in CardReel's body, `useSnap` would run in CardReel's render and read ABSOLUTE
 * frames, while anything inside a <Sequence> reads sequence-relative ones, so
 * each reveal would have finished animating before its scene began.
 */
const RemedyScene: React.FC<{ mantra: string; practice: string }> = ({ mantra, practice }) => {
  const mantraIn = useSnap(4);
  const practiceIn = useSnap(22);
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

/**
 * ── BEAT 5 · THE PAYOFF ───────────────────────────────────────────────────
 * The beat that makes the opening promise honest. It is its own scene, BEFORE
 * the card, on purpose: if the card were the only payoff then the promise of a
 * *fact* would go unpaid, and an unpaid hook trains the viewer to skip the next
 * one. The label calls the debt in so the viewer registers that it was settled.
 */
const FactScene: React.FC<{ number: number }> = ({ number }) => {
  const card = MOOLANK_CARDS[number];
  const factIn = useSnap(6);
  return (
    <Scene>
      <Label>The part almost nobody knows</Label>
      {/*
        🔴 SET IN THE UI SANS, NOT THE DISPLAY SERIF, AND THIS IS DELIBERATE.
        Cinzel is small-caps and beautiful for three or four words; a 20-word
        sentence in it takes measurably longer to parse. This beat has 3.5s to
        deliver the payoff the whole hook was written against — if it is not read
        in time, the promise reads as unpaid and the retention loop inverts. The
        remedy's practice line already proves the sans reads fast at this size.
      */}
      <div
        style={{
          fontFamily: UI,
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.32,
          color: P.TEXT,
          marginTop: 18,
          opacity: factIn,
          transform: `translateY(${(1 - factIn) * 26}px)`,
          textShadow: "0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        {card.surpriseFact}
      </div>
    </Scene>
  );
};

/**
 * ── BEAT 6 · THE CARD, HELD ───────────────────────────────────────────────
 * The whole point of the reel, and the same card posted as a still so the format
 * reinforces itself. It stays on screen long enough to screenshot — that is the
 * save this reel optimises for, and saves are the one metric this account
 * already wins on (4.7%, "Higher" than its own baseline).
 */
const CardScene: React.FC<{ number: number }> = ({ number }) => {
  const frame = useCurrentFrame();
  const cardIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: cardIn }}>
      {/* 0.96 rather than 0.88: this frame exists to be screenshotted, so the
          card wants every pixel the 1920 height can spare. */}
      <CardPlate number={number} scale={0.96 * (0.96 + 0.04 * cardIn)} />
      <div
        style={{
          fontFamily: UI,
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: 2,
          color: GOLD,
          marginTop: 18,
          opacity: interpolate(frame, [16, 32], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Screenshot this 👆
      </div>
    </AbsoluteFill>
  );
};

export type CardReelProps = { number: number };

export const CardReel: React.FC<CardReelProps> = ({ number }) => {
  const card = MOOLANK_CARDS[number];
  if (!card) throw new Error(`no card for moolank ${number}`);

  const bed = bedFor(number);
  const total = REEL_DURATION_IN_FRAMES;

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
      {/*
        The bed now carries the reel alone. It fades in fast — a beat of silence
        under the cold open would read as a broken upload on a muted-first feed
        where sound arrives only when the viewer unmutes.
      */}
      <Audio
        src={staticFile(bed.src)}
        trimBefore={bed.startSeconds * REEL_FPS}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, total - 30, total - 4],
            [0, bed.volume, bed.volume, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      <Sequence from={START.coldOpen} durationInFrames={BEATS.COLD_OPEN}>
        <ColdOpen number={number} />
      </Sequence>

      <Sequence from={START.hook} durationInFrames={BEATS.HOOK}>
        <HookScene number={number} />
      </Sequence>

      <Sequence from={START.strengths} durationInFrames={BEATS.STRENGTHS}>
        <StrengthsScene number={number} />
      </Sequence>

      {/* Pinned across the hook and strengths, then cleared so it never competes
          with the remedy — the card's most saveable line. */}
      <Sequence from={START.hook} durationInFrames={BEATS.HOOK + BEATS.STRENGTHS}>
        <PromiseStrip number={number} />
      </Sequence>

      <Sequence from={START.remedy} durationInFrames={BEATS.REMEDY}>
        <RemedyScene mantra={card.mantra} practice={card.remedy} />
      </Sequence>

      <Sequence from={START.fact} durationInFrames={BEATS.FACT}>
        <FactScene number={number} />
      </Sequence>

      <Sequence from={START.card} durationInFrames={BEATS.CARD_HOLD}>
        <CardScene number={number} />
      </Sequence>
    </AbsoluteFill>
  );
};
