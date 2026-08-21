import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, UI } from "./fonts";
import { PALETTES } from "./palette";
import { MUTUAL_PAIRS, CLOSING_LINE } from "./mutual-pairs-data";

/**
 * PIN02 — the `best-match` angle as a Pinterest pin. A STILL, not a reel.
 *
 * ⭐ WHY THIS PIN EXISTS AND WHY IT IS A CHART
 * Pinterest's mechanic is the SAVE, and a save is earned by a reference — a
 * thing worth coming back to — not by a claim that stops a scroll. That is the
 * opposite of the Instagram problem: on Reels the payload landing too early
 * kills the watch, whereas here withholding anything just costs the save. So
 * this pin gives the WHOLE table: all seven pairs, both planets, and the reason.
 *
 * 📐 1000×1500 — Pinterest's 2:3. ⛔ Not the 4:5 InfoCard; reusing it crops.
 *
 * 🔴 EVERY PAIR IS DERIVED from vedic-numerology's friendship.ts via
 * ./mutual-pairs-data. A pair appears only when BOTH rows name the other.
 *
 * ⚠️ NEVER LEAVE A VERDICT ON THE READER. Seven pairs cover 8 of 9 numbers and
 * most readers will not find theirs, so the closing box is load-bearing: it
 * says a missing pair is not a no. ⛔ Do not cut it to tidy the layout.
 *
 * 🎯 "IT LOOKS LIKE AN AD" — numevix.com appears once, small, in the footer,
 * after the value. No CTA sits inside the content.
 */

export const PIN_WIDTH = 1000;
export const PIN_HEIGHT = 1500;

const P = PALETTES["ink-violet"];
const GOLD = P.ACCENT;
const BOX_BG = "rgba(255,255,255,0.045)";
const BOX_BORDER = "rgba(255,255,255,0.10)";

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: UI,
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: 2.8,
      textTransform: "uppercase",
      color: GOLD,
      marginBottom: 14,
    }}
  >
    {children}
  </div>
);

/**
 * One number chip. 72px here rather than the self-friendly pin's 96 because
 * this card carries SEVEN stacked rows instead of one wrapped row — the
 * vertical budget, not the horizontal one, is what is tight. A pin renders
 * ~236px wide in the Pinterest grid, so 72px is still ~17px on screen and
 * legible; going under ~60 would smudge.
 */
const Chip: React.FC<{ n: number }> = ({ n }) => (
  <div
    style={{
      width: 72,
      height: 72,
      borderRadius: 20,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(214,178,102,0.13)",
      border: "1px solid rgba(214,178,102,0.42)",
      fontFamily: DISPLAY,
      fontSize: 44,
      lineHeight: 1,
      color: GOLD,
    }}
  >
    {n}
  </div>
);

const PairRow: React.FC<{ a: number; b: number; planets: string; why: string }> = ({
  a,
  b,
  planets,
  why,
}) => (
  // 🪤 minHeight, NOT height. Two of the seven `why` lines wrap to two lines, and
  // a fixed 92px let them overflow their own row and crowd the row beneath —
  // found by rendering the pin and looking at it, not by a test.
  <div style={{ display: "flex", alignItems: "center", gap: 18, minHeight: 92, paddingBlock: 4 }}>
    <Chip n={a} />
    <span style={{ fontFamily: DISPLAY, fontSize: 30, color: "rgba(255,255,255,0.40)" }}>&amp;</span>
    <Chip n={b} />
    <div style={{ flex: 1, minWidth: 0, paddingLeft: 12 }}>
      <div
        style={{
          fontFamily: UI,
          fontSize: 19,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "rgba(214,178,102,0.85)",
          marginBottom: 5,
        }}
      >
        {planets}
      </div>
      <div style={{ fontFamily: UI, fontSize: 25, lineHeight: 1.3, color: P.TEXT }}>{why}</div>
    </div>
  </div>
);

export const MutualPairsPin: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `
        radial-gradient(ellipse 70% 50% at 20% 8%, rgba(120,96,220,0.30), transparent 62%),
        radial-gradient(ellipse 60% 45% at 88% 96%, rgba(214,150,80,0.20), transparent 60%),
        linear-gradient(158deg, ${P.GRAD_A} 0%, ${P.GRAD_MID} 48%, ${P.GRAD_B} 100%)
      `,
      padding: "64px 56px 0",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* The searcher's words first — "numerology compatibility" is what people
        type into Pinterest; "moolank" is not searched outside India. */}
    <div
      style={{
        fontFamily: UI,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 4.5,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.62)",
        marginBottom: 14,
      }}
    >
      Numerology compatibility · Birth number
    </div>

    <div style={{ fontFamily: DISPLAY, fontSize: 74, lineHeight: 1.1, color: P.TEXT, marginBottom: 18 }}>
      Only seven pairs
      <br />
      match both ways.
    </div>

    <div style={{ fontFamily: UI, fontSize: 27, lineHeight: 1.45, color: P.TEXT_SOFT, marginBottom: 30 }}>
      Your birth number is the day of the month you were born, added down to one digit.
      Born on the 23rd? That’s 2+3 = 5.
    </div>

    <Label>The mutual pairs</Label>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
      {MUTUAL_PAIRS.map((p) => (
        <PairRow key={`${p.a}&${p.b}`} a={p.a} b={p.b} planets={p.planets} why={p.why} />
      ))}
    </div>

    {/* 🔴 LOAD-BEARING — see the header comment. Most readers will not find
        their pair here, and without this the pin reads as a verdict. */}
    <div
      style={{
        background: BOX_BG,
        border: `1px solid ${BOX_BORDER}`,
        borderRadius: 22,
        padding: "26px 30px",
      }}
    >
      <Label>{CLOSING_LINE}</Label>
      <div style={{ fontFamily: UI, fontSize: 25, lineHeight: 1.4, color: P.TEXT_SOFT }}>
        A pair only counts here when both numbers name each other. Plenty of numbers get on
        one way round — that is a different list, not a smaller one.
      </div>
    </div>

    <div
      style={{
        marginTop: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 4px 26px",
      }}
    >
      <span style={{ fontFamily: UI, fontSize: 22, letterSpacing: 1.2, color: "rgba(255,255,255,0.38)" }}>
        Save this for your number
      </span>
      <span style={{ fontFamily: DISPLAY, fontSize: 27, letterSpacing: 1.6, color: "rgba(255,255,255,0.52)" }}>
        numevix.com
      </span>
    </div>
  </AbsoluteFill>
);
