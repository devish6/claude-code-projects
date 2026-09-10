import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

import { DISPLAY, QUIET_DISPLAY, UI } from "./fonts";
import {
  ACCENT,
  INK,
  VEIL_ALPHA,
  VEIL_RGB,
  type DrawSlide,
} from "./draw/card";
import { CARD_HEIGHT, CARD_WIDTH } from "./draw/card-bands";

/**
 * One slide of the monthly draw carousel — a STILL, at Instagram's 4:5.
 *
 * ⭐ WHY A STILL, AND WHY A SET. `InfoCard`'s note already argues the keepsake
 * case: our reels reach ~180 strangers and earn 0–1 saves, while a single
 * static reference card earns 42 shares on 13 comments. This is that idea at
 * ten slides — and, separately, the first non-REELS post this account has ever
 * had live, which makes it a test of the SURFACE as much as of the content.
 *
 * 🎯 "IT LOOKS LIKE AN AD" — INHERITED FROM `InfoCard` AND NOT NEGOTIABLE.
 * The post is the value; the promotion is a footer. `numevix.com` appears once,
 * small, at the very bottom. ⛔ No CTA sits on any slide — not even the closing
 * one. The ask lives in the caption. That rule is why this set has no tenth
 * "send this to a friend" panel, which is exactly what the reference post we
 * modelled it on does and exactly where that post is weakest (450 comments on
 * 36.1K likes).
 *
 * 🔴 THE BORN-ON LINE IS THE HOOK, second-largest element after the numeral,
 * naming EVERY qualifying date. A stranger has to self-identify in one glance
 * or the paragraph never gets read.
 */

export const DRAW_CARD_WIDTH = CARD_WIDTH;
export const DRAW_CARD_HEIGHT = CARD_HEIGHT;

const rgb = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;
const INK_CSS = rgb(INK);
const ACCENT_CSS = rgb(ACCENT);
const RULE = "rgba(38, 30, 24, 0.18)";

const PAD = 68;

/** The dealt card's face. RWS scans are 600x1025, so this holds their aspect. */
const CARD_IMAGE_WIDTH = 272;
const CARD_IMAGE_HEIGHT = 465;

/** Small-caps label. Inter, because it is read at a glance, not at a pace. */
const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = ACCENT_CSS,
}) => (
  <div
    style={{
      fontFamily: UI,
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: 3.4,
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);

/**
 * The ground: the measured plate under a flat paper wash.
 *
 * 🪤 The wash is 0.25 and that number is load-bearing — see `VEIL_ALPHA`. At
 * 0.42 it lifted a near-black plate past the contrast floor on its own, which
 * left `checkTextContrast` unable to fail.
 */
const Ground: React.FC<{ bg: string }> = ({ bg }) => (
  <>
    <Img
      src={staticFile(`grounds/${bg}.jpg`)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
    <AbsoluteFill
      style={{ background: `rgba(${VEIL_RGB.join(", ")}, ${VEIL_ALPHA})` }}
    />
  </>
);

const Footer: React.FC<{ left: string }> = ({ left }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      borderTop: `1px solid ${RULE}`,
      paddingTop: 20,
    }}
  >
    <Label color="rgba(38, 30, 24, 0.45)">{left}</Label>
    <Label color="rgba(38, 30, 24, 0.45)">numevix.com</Label>
  </div>
);

const Body: React.FC<{ children: string; size?: number }> = ({ children, size = 33 }) => (
  <div
    style={{
      fontFamily: QUIET_DISPLAY,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1.5,
      color: INK_CSS,
    }}
  >
    {children}
  </div>
);

const Cover: React.FC<{ slide: DrawSlide }> = ({ slide }) => (
  <div
    style={{
      position: "absolute",
      inset: PAD,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Label>September 2026</Label>

    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: QUIET_DISPLAY,
          fontWeight: 600,
          fontSize: 96,
          lineHeight: 1.08,
          color: INK_CSS,
          marginBottom: 14,
        }}
      >
        Nine cards.
      </div>
      <div
        style={{
          fontFamily: QUIET_DISPLAY,
          fontWeight: 600,
          fontSize: 96,
          lineHeight: 1.08,
          color: ACCENT_CSS,
          marginBottom: 40,
        }}
      >
        Drawn once.
      </div>
      <div style={{ width: 120, height: 2, background: RULE, marginBottom: 40 }} />
      <Body size={34}>{slide.body}</Body>
    </div>

    <Footer left="One for every birth number" />
  </div>
);

const NumberSlide: React.FC<{ slide: DrawSlide }> = ({ slide }) => (
  <div
    style={{
      position: "absolute",
      inset: PAD,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    {/* ── Header: the numeral, the date list, and the card that was dealt ── */}
    <div style={{ display: "flex", gap: 44, alignItems: "flex-start" }}>
      {/* 🪤 THE LEFT COLUMN IS PINNED TO THE CARD'S HEIGHT. Left to size itself
          it ran ~380px short of the card beside it, and the slide read as an
          unfinished layout with a hole in it — invisible to every gate, obvious
          the moment the PNG was opened. */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: CARD_IMAGE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 300,
            lineHeight: 0.78,
            color: ACCENT_CSS,
          }}
        >
          {slide.moolank}
        </div>

        <div>
          <Label color="rgba(38, 30, 24, 0.5)">{slide.title}</Label>

          {/* The hook. Second-largest thing on the slide, by design. */}
          <div
            style={{
              fontFamily: QUIET_DISPLAY,
              fontWeight: 600,
              fontSize: 46,
              lineHeight: 1.2,
              color: INK_CSS,
              marginTop: 14,
            }}
          >
            {slide.bornOn}
          </div>
        </div>
      </div>

      <div style={{ width: CARD_IMAGE_WIDTH, flexShrink: 0 }}>
        <Img
          src={staticFile(`tarot/${slide.cardId}.webp`)}
          style={{
            width: CARD_IMAGE_WIDTH,
            height: CARD_IMAGE_HEIGHT,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid rgba(38, 30, 24, 0.22)",
            boxShadow: "0 18px 40px rgba(38, 30, 24, 0.20)",
            display: "block",
          }}
        />
        <div
          style={{
            fontFamily: QUIET_DISPLAY,
            fontWeight: 600,
            fontSize: 34,
            lineHeight: 1.15,
            color: INK_CSS,
            marginTop: 18,
          }}
        >
          {slide.cardName}
        </div>
        {/* 🪤 One keyword per line rather than " · " joined: the joined string
            wrapped mid-list and left separators stranded at the line ends. */}
        <div style={{ marginTop: 10 }}>
          {slide.keywords?.map((k) => (
            <div
              key={k}
              style={{
                fontFamily: UI,
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: "rgba(38, 30, 24, 0.52)",
                lineHeight: 1.6,
              }}
            >
              {k}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ borderTop: `1px solid ${RULE}`, paddingTop: 30 }}>
      <Body>{slide.body}</Body>
    </div>

    <Footer left="Drawn for September 2026" />
  </div>
);

export const DrawCard: React.FC<{ slide: DrawSlide }> = ({ slide }) => (
  <AbsoluteFill style={{ backgroundColor: rgb(VEIL_RGB) }}>
    <Ground bg={slide.bg} />
    {slide.moolank === 0 ? <Cover slide={slide} /> : <NumberSlide slide={slide} />}
  </AbsoluteFill>
);
