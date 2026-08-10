import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, UI } from "./fonts";
import { PALETTES } from "./palette";
import {
  SELF_FRIENDLY,
  NOT_SELF_FRIENDLY,
  EXCEPTION_MATCHES,
  EXCEPTION_SELF_STATUS,
  ONLY_SELF_MUTUAL,
} from "./self-friendly-data";

/** "2, 3 and 6" — an Oxford-less list, because the card is read aloud in the head. */
const andList = (ns: number[]): string =>
  ns.length < 2 ? String(ns[0] ?? "") : `${ns.slice(0, -1).join(", ")} and ${ns[ns.length - 1]}`;

/**
 * The Pinterest pin for the `self-friendly` angle — a STILL, not a video.
 *
 * ⭐ WHY PINTEREST GETS A STILL AND NOT A REEL
 * Pinterest's whole mechanic is the SAVE, and the InfoCard finding applies here
 * more strongly than anywhere else: the one reference post that earns shares is
 * a static card that withholds nothing. A pin is also re-surfaced by search for
 * months, so unlike a reel it is read by people who went looking — which is why
 * the copy is written to answer a query, not to stop a scroll.
 *
 * 📐 1000×1500 — Pinterest's 2:3, the aspect it renders without cropping.
 * Taller pins get truncated in the feed and squarer ones waste column width.
 * This is NOT the 4:5 InfoCard: reusing that one would letterbox or crop.
 *
 * 🎯 "IT LOOKS LIKE AN AD" — the same standing rule as InfoCard. The post is
 * the value; numevix.com appears once, small, in the footer, and no CTA sits
 * inside the content. On Pinterest the destination link carries the intent, so
 * the pin does not need to beg for the click.
 *
 * 🔴 EVERY NUMBER HERE IS DERIVED from vedic-numerology's friendship.ts, via
 * ./self-friendly-data. Nothing on this card is authored. `assertsFacts` for
 * this angle is false and must stay false.
 *
 * ⚠️ NEVER LEAVE A VERDICT ON THE READER. 7 is the number singled out, so the
 * card must not read as a diagnosis of 7s. Two derived facts do that work: 7
 * lists itself NEUTRAL (not an enemy), and 7 has three outward friends. Both
 * come off the same table as the headline claim, so softening it costs no
 * accuracy. ⛔ Do not cut the "7 · THE EXCEPTION" box to tidy the layout.
 */

export const PIN_WIDTH = 1000;
export const PIN_HEIGHT = 1500;

const P = PALETTES["ink-violet"];

const GOLD = P.ACCENT;
const BOX_BG = "rgba(255,255,255,0.045)";
const BOX_BORDER = "rgba(255,255,255,0.10)";

/** The small-caps label above every block. */
const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = GOLD,
}) => (
  <div
    style={{
      fontFamily: UI,
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: 2.8,
      textTransform: "uppercase",
      color,
      marginBottom: 14,
    }}
  >
    {children}
  </div>
);

/**
 * One number chip. Sized big enough to be read at Pinterest's feed width —
 * a pin renders around 236px wide in the grid, so anything under ~50px here
 * is a smudge by the time it reaches the reader.
 */
const Chip: React.FC<{ n: number; muted?: boolean }> = ({ n, muted }) => (
  <div
    style={{
      width: 96,
      height: 96,
      borderRadius: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: muted ? "rgba(255,255,255,0.05)" : "rgba(214,178,102,0.13)",
      border: `1px solid ${muted ? BOX_BORDER : "rgba(214,178,102,0.42)"}`,
      fontFamily: DISPLAY,
      fontSize: 58,
      lineHeight: 1,
      color: muted ? P.TEXT_SOFT : GOLD,
    }}
  >
    {n}
  </div>
);

const Body: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 31 }) => (
  <div style={{ fontFamily: UI, fontSize: size, lineHeight: 1.4, color: P.TEXT, fontWeight: 400 }}>
    {children}
  </div>
);

export const SelfFriendlyPin: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `
        radial-gradient(ellipse 70% 50% at 20% 8%, rgba(120,96,220,0.30), transparent 62%),
        radial-gradient(ellipse 60% 45% at 88% 96%, rgba(214,150,80,0.20), transparent 60%),
        linear-gradient(158deg, ${P.GRAD_A} 0%, ${P.GRAD_MID} 48%, ${P.GRAD_B} 100%)
      `,
      padding: "72px 56px 0",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* ── Header ───────────────────────────────────────────────────────────
        The searcher's words come first. "Numerology compatibility" is what
        people type; "moolank" is not searched outside India, so it is a
        subtitle rather than the headline. */}
    <div
      style={{
        fontFamily: UI,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 4.5,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.62)",
        marginBottom: 16,
      }}
    >
      Numerology compatibility · Birth number
    </div>

    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: 80,
        lineHeight: 1.1,
        color: P.TEXT,
        marginBottom: 22,
      }}
    >
      Eight numbers get on with their own kind.
      <br />
      One doesn’t.
    </div>

    <div style={{ fontFamily: UI, fontSize: 29, lineHeight: 1.45, color: P.TEXT_SOFT, marginBottom: 62 }}>
      Your birth number is the day of the month you were born, added down to one digit.
      Born on the 23rd? That’s 2+3 = 5.
    </div>

    {/* ── The eight ───────────────────────────────────────────────────────── */}
    <Label>At ease with their own number</Label>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 64 }}>
      {SELF_FRIENDLY.map((n) => (
        <Chip key={n} n={n} />
      ))}
    </div>

    {/* ── The exception ────────────────────────────────────────────────────
        🔴 The load-bearing box. See the header comment: this is what stops the
        card reading as a verdict on 7s. */}
    <div
      style={{
        background: "rgba(214,178,102,0.10)",
        border: "1px solid rgba(214,178,102,0.34)",
        borderRadius: 22,
        padding: "34px 34px",
        display: "flex",
        gap: 30,
        alignItems: "center",
        marginBottom: 34,
      }}
    >
      <Chip n={NOT_SELF_FRIENDLY} muted />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Label>The exception</Label>
        <Body>
          {NOT_SELF_FRIENDLY} is the one number that doesn’t list itself as a friend. It lists
          itself as <strong>{EXCEPTION_SELF_STATUS}</strong>, not an enemy — and its own matches
          are {andList(EXCEPTION_MATCHES)}.
        </Body>
      </div>
    </div>

    {/* ── The second derived fact ─────────────────────────────────────────── */}
    <div
      style={{
        background: BOX_BG,
        border: `1px solid ${BOX_BORDER}`,
        borderRadius: 22,
        padding: "34px 34px",
        marginBottom: 40,
      }}
    >
      <Label>And one more</Label>
      <Body>
        {andList(ONLY_SELF_MUTUAL)} {ONLY_SELF_MUTUAL.length === 1 ? "is the only number" : "are the only numbers"}{" "}
        whose sole both-ways match is itself. Every other number pairs outward as well.
      </Body>
    </div>

    <Body size={29}>
      <span style={{ color: P.TEXT_SOFT }}>
        Getting on with your own number is about ease, not permission — no pairing here is a
        yes or a no on anyone.
      </span>
    </Body>

    {/* ── Footer ───────────────────────────────────────────────────────────
        🎯 The ONLY place the brand appears. Small, last, after the value. */}
    <div
      style={{
        marginTop: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "26px 4px 30px",
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
