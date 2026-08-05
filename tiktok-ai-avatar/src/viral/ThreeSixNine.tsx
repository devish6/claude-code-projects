import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { DISPLAY, UI } from "./fonts";
import { PALETTES } from "./palette";

/**
 * "Numerology · 3, 6, 9" — a TikTok-only one-off.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⭐⭐⭐ THIS IS BUILT ON A DIFFERENT MECHANIC FROM THE CARD REELS
 * ══════════════════════════════════════════════════════════════════════════
 * The card reel reveals one idea per beat over 17s and is read once. This is a
 * DENSE CARD ON A SHORT LOOP: everything is on screen inside a second, there is
 * deliberately more text than fits in the runtime, and the video loops.
 *
 * The reader cannot finish in one pass, so they watch it again to finish
 * reading. Two passes of a 12s video is 24s of watch time on a 12s asset —
 * completion above 100%, which is the strongest ranking signal either platform
 * has. Observed on @vediksoul (63.1K), whose whole feed is this shape.
 *
 * 🪤 SO DO NOT "FIX" THE DENSITY, AND DO NOT STAGE THE REVEALS. Both would break
 * the mechanic. Text that animates in slowly cannot be re-read on a loop,
 * because the second pass starts from an empty frame. Everything lands at once
 * and holds.
 *
 * 🔴 WHERE THIS SITS IN THE STRATEGY. The same account shows the ceiling on
 * format alone: its trait-per-number series ("Hear This Out", same dense-loop
 * shape as this) runs 3.0K–24.6K views, while its topic-led hooks run 348K–4.4M.
 * The loop mechanic is necessary and nowhere near sufficient — the TOPIC is what
 * decides reach. 3-6-9 was chosen because TikTok Creator Search Insights shows
 * "numerology meanings of 369" at 2.30M with the joint-highest growth on the
 * board, and we had nothing answering it.
 *
 * ⭐ EVERY CLAIM HERE IS CHECKED AGAINST content/moolank-cards.json.
 * 3, 6 and 9 each carry luckyNumbers of exactly [3, 6, 9]; no other number's set
 * is [3, 6, 9] and none of the other six match each other that way. That is a
 * real, verifiable property of our own ruleset, which is why the video leads
 * with it instead of the Tesla quote — that quote is popularly MISATTRIBUTED to
 * Tesla, and repeating it as his costs a numerology brand more credibility than
 * the hook is worth. It is named as "everyone quotes" and then answered.
 *
 * ⭐ THE DATE LIST IS THE HOOK, and this one is unusually strong: 3, 6 and 9
 * between them claim the 3rd, 6th, 9th, 12th, 15th, 18th, 21st, 24th, 27th and
 * 30th — TEN of 31 dates, so roughly a third of everyone watching can
 * self-identify. Naming every qualifying date is the rule confirmed three times.
 */

const P = PALETTES["ink-violet"];
const GOLD = P.ACCENT;

export const T369_FPS = 30;
/** 12s. Long enough to read most of it, short enough that finishing needs a second pass. */
export const T369_DURATION_IN_FRAMES = 360;

/**
 * 🪤 A bed of its own, not one from CardReel's BEDS map. That map is the card
 * programme's no-more-than-twice rotation and `bed-usage.test.ts` counts it;
 * a one-off borrowing a slot would make those counts lie.
 * mool-1 measured -12.2 dB over a 17s window from 0:30, so 0.49 lands it at the
 * same ~-18.9 dB the card reels were verified at.
 */
const BED = { src: "music/mool-1.mp3", startSeconds: 30, volume: 0.49 };

const Row: React.FC<{ n: string; set: string; dim?: boolean }> = ({ n, set, dim }) => (
  <div style={{ display: "flex", gap: 18, alignItems: "baseline", opacity: dim ? 0.55 : 1 }}>
    <span style={{ fontFamily: DISPLAY, fontSize: 46, color: dim ? P.TEXT : GOLD, minWidth: 46 }}>{n}</span>
    <span style={{ fontFamily: UI, fontSize: 22, color: P.TEXT, opacity: 0.5 }}>→</span>
    <span style={{ fontFamily: UI, fontSize: 42, fontWeight: dim ? 500 : 800, color: dim ? P.TEXT : GOLD }}>
      {set}
    </span>
  </div>
);

export const ThreeSixNine: React.FC = () => {
  const frame = useCurrentFrame();

  // One short fade so the first frame is not a hard flash. Everything is legible
  // by frame 8 — nothing staggers in, because a loop has to be re-readable.
  const enter = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

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
      <Audio
        src={staticFile(BED.src)}
        trimBefore={BED.startSeconds * T369_FPS}
        volume={(f) =>
          interpolate(f, [0, 10, T369_DURATION_IN_FRAMES - 24, T369_DURATION_IN_FRAMES - 4],
            [0, BED.volume, BED.volume, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        }
      />

      {/*
        🔴 TIKTOK EATS MORE OF THE FRAME THAN INSTAGRAM DOES. Its caption,
        handle and action rail cover roughly the bottom 340px and the right
        edge. The date-list box at the end is the hook — the line that makes a
        third of viewers realise this is about them — so it must clear that
        band. The first draft ran to ~1820px of a 1920 frame and put it
        squarely underneath the caption.
      */}
      <AbsoluteFill
        style={{
          padding: "180px 88px 340px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          opacity: enter,
        }}
      >
        {/* ⭐ "Numerology" and "3, 6, 9" are both here because on-screen text is a
            TikTok search signal, and dropping narration removed the transcript. */}
        <div
          style={{
            fontFamily: UI,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          Numerology · 3, 6, 9
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: 74, lineHeight: 1.1, color: P.TEXT, marginTop: 12 }}>
          The part nobody explains
        </div>

        <div
          style={{
            fontFamily: UI,
            fontSize: 38,
            lineHeight: 1.4,
            color: P.TEXT,
            marginTop: 24,
            opacity: 0.94,
          }}
        >
          Everyone quotes Tesla on 3, 6 and 9. Almost nobody checks what the numbers
          actually do.
        </div>

        <div
          style={{
            fontFamily: UI,
            fontSize: 38,
            lineHeight: 1.4,
            color: P.TEXT,
            marginTop: 22,
            opacity: 0.94,
          }}
        >
          Every birth number has a supporting set:
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 18,
            paddingLeft: 6,
          }}
        >
          <Row n="1" set="1 · 2 · 4 · 7" dim />
          <Row n="5" set="3 · 5 · 6 · 9" dim />
          <Row n="7" set="2 · 3 · 6" dim />
          <div style={{ height: 6 }} />
          <Row n="3" set="3 · 6 · 9" />
          <Row n="6" set="3 · 6 · 9" />
          <Row n="9" set="3 · 6 · 9" />
        </div>

        <div
          style={{
            fontFamily: UI,
            fontSize: 38,
            lineHeight: 1.4,
            color: P.TEXT,
            marginTop: 22,
            opacity: 0.94,
          }}
        >
          Every set is different — except three. Jupiter, Venus and Mars point only at
          each other. The only closed loop in the system.
        </div>

        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 52,
            color: GOLD,
            marginTop: 24,
          }}
        >
          3 + 6 + 9 = 18 → 1 + 8 = 9
        </div>

        <div
          style={{
            fontFamily: UI,
            fontSize: 38,
            lineHeight: 1.4,
            color: P.TEXT,
            marginTop: 22,
            padding: "22px 26px",
            borderLeft: `4px solid ${GOLD}`,
            background: "rgba(0,0,0,0.28)",
          }}
        >
          Born on the 3rd, 6th, 9th, 12th, 15th, 18th, 21st, 24th, 27th or 30th? This
          loop is your birth number.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
