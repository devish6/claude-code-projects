import React from "react";
import { AbsoluteFill } from "remotion";

import {
  CREAM_ON_DARK,
  DARK_A,
  DARK_B,
  GOLD_BRIGHT,
  MUTED_ON_DARK,
} from "../lib/brand";
import { DISPLAY, TEXT_STROKE, UI } from "./fonts";

/**
 * The 9:16 backdrop for a TikTok LIVE — a STILL, not a video.
 *
 * 📐 1080×1920, the frame the platform composites the stream into.
 *
 * ⭐⭐⭐ A LIVE BACKDROP IS NOT A POSTER. Two things sit on top of it that no
 * poster has to survive: the HOST, who occupies the middle of the frame, and
 * the platform's own overlays — avatar and viewer count at the top, a comment
 * stream stacking up from the bottom-left, gift and share icons on the right
 * rail. Anything readable placed in those regions is not "behind" them, it is
 * GONE. So the frame is built as bands, and the middle band is deliberately
 * empty: it is where the host goes, and the only thing in it is a halo that
 * lights their outline.
 *
 * 🎯 DARK, NOT CREAM. The brand's light surface would flatten a lit face into
 * the background. The deep-pine ink surface (still a brand token) makes the
 * host pop and lets the gold read at the size a phone actually shows.
 *
 * 🪤 THE BAND EDGES BELOW ARE ESTIMATES OF PLATFORM CHROME, and the platform
 * moves them between app versions and between phone aspect ratios. That is why
 * `guides` exists — render the guides variant, look at where the real UI lands
 * on your own phone, and move these numbers rather than trusting them.
 */
export const LIVE_WIDTH = 1080;
export const LIVE_HEIGHT = 1920;

/**
 * Vertical bands, top to bottom. `keepClear` bands carry no readable content:
 * either the platform draws over them or the host stands in them.
 */
export const BANDS = {
  /** Host avatar, viewer count, top-right controls. */
  chrome: { top: 0, bottom: 150, keepClear: true },
  /** The headline — the highest place the platform leaves alone. */
  header: { top: 150, bottom: 560, keepClear: false },
  /** The HOST. Halo only, nothing to read. */
  presenter: { top: 560, bottom: 1120, keepClear: true },
  /** The offer — sits above the comment stream, below the host's shoulders. */
  offer: { top: 1120, bottom: 1440, keepClear: false },
  /** Comments stack up from here on the left; caption bar at the very bottom. */
  comments: { top: 1440, bottom: 1920, keepClear: true },
} as const;

export type BandName = keyof typeof BANDS;

/**
 * Every readable block on the frame, with the band it belongs to and the box it
 * occupies. The component POSITIONS FROM THIS — the test asserting each block
 * stays inside its band is checking the render, not a parallel description of
 * it. ⛔ Do not hardcode a `top` in the JSX; add it here.
 */
export const BLOCKS = [
  { id: "eyebrow", band: "header", top: 178, height: 40 },
  { id: "headline", band: "header", top: 246, height: 210 },
  { id: "sub", band: "header", top: 476, height: 44 },
  { id: "giveaway", band: "offer", top: 1146, height: 92 },
  { id: "rule", band: "offer", top: 1258, height: 2 },
  { id: "code", band: "offer", top: 1284, height: 96 },
  { id: "site", band: "offer", top: 1392, height: 40 },
] as const satisfies readonly {
  id: string;
  band: BandName;
  top: number;
  height: number;
}[];

const box = (id: (typeof BLOCKS)[number]["id"]): React.CSSProperties => {
  const b = BLOCKS.find((x) => x.id === id);

  if (!b) throw new Error(`no block "${id}"`);

  return { position: "absolute", top: b.top, height: b.height, left: 0, width: "100%" };
};

/** The copy. Kept here so the test can assert the code and the domain survive. */
export const COPY = {
  eyebrow: "LIVE · NUMEVIX",
  headline: ["A PEEK INTO", "YOUR 2027"],
  sub: "LOVE · CAREER · MONEY",
  giveawayLead: "3 FREE ANNUAL REPORTS",
  giveawayTail: "picked live, on this stream",
  offer: "50% OFF THE ANNUAL FORECAST",
  code: "LIVE50",
  site: "numevix.com",
} as const;

/**
 * The 3×3 Vedic grid, drawn as a watermark behind the host.
 * ⚠️ Vedic grid — never "Lo Shu". Same figure, wrong tradition's name.
 */
const GridWatermark: React.FC = () => {
  const cell = 150;
  const size = cell * 3;

  return (
    <div
      style={{
        position: "absolute",
        left: (LIVE_WIDTH - size) / 2,
        top: BANDS.presenter.top + (BANDS.presenter.bottom - BANDS.presenter.top - size) / 2,
        width: size,
        height: size,
        opacity: 0.09,
      }}
    >
      {[1, 2].map((i) => (
        <React.Fragment key={i}>
          <div
            style={{
              position: "absolute",
              left: cell * i,
              top: 0,
              width: 2,
              height: size,
              background: GOLD_BRIGHT,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: cell * i,
              left: 0,
              height: 2,
              width: size,
              background: GOLD_BRIGHT,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

/** The translucent overlay that shows where the platform's UI lands. */
const Guides: React.FC = () => (
  <>
    {(Object.keys(BANDS) as BandName[])
      .filter((name) => BANDS[name].keepClear)
      .map((name) => {
        const b = BANDS[name];

        return (
          <div
            key={name}
            style={{
              position: "absolute",
              top: b.top,
              height: b.bottom - b.top,
              left: 0,
              width: "100%",
              background: "rgba(233,69,96,0.22)",
              border: "2px dashed rgba(233,69,96,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: UI,
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#fff",
            }}
          >
            {name} — keep clear
          </div>
        );
      })}
  </>
);

export const LiveBackdrop: React.FC<{ guides?: boolean }> = ({ guides = false }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(168deg, ${DARK_A} 0%, ${DARK_B} 62%, #07120F 100%)`,
    }}
  >
    {/* Halo in the presenter band — lights the host's outline off the ground. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(58% 34% at 50% ${
          ((BANDS.presenter.top + BANDS.presenter.bottom) / 2 / LIVE_HEIGHT) * 100
        }%, rgba(214,178,102,0.20) 0%, rgba(214,178,102,0.06) 45%, transparent 72%)`,
      }}
    />

    <GridWatermark />

    {/* Edge darkening, so the type never sits on the brightest part of the ground. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(78% 62% at 50% 50%, transparent 40%, rgba(0,0,0,0.42) 100%)",
      }}
    />

    {/* ── HEADER ───────────────────────────────────────────────────────────── */}
    <div
      style={{
        ...box("eyebrow"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        fontFamily: UI,
        fontSize: 27,
        fontWeight: 800,
        letterSpacing: 7,
        color: GOLD_BRIGHT,
        textShadow: TEXT_STROKE,
      }}
    >
      <span
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: "#E94560",
          boxShadow: "0 0 18px rgba(233,69,96,0.9)",
        }}
      />
      {COPY.eyebrow}
    </div>

    <div
      style={{
        ...box("headline"),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: 96,
        lineHeight: 1.08,
        letterSpacing: 1,
        color: CREAM_ON_DARK,
        textShadow: TEXT_STROKE,
      }}
    >
      <div>{COPY.headline[0]}</div>
      <div style={{ color: GOLD_BRIGHT }}>{COPY.headline[1]}</div>
    </div>

    <div
      style={{
        ...box("sub"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: UI,
        fontSize: 33,
        fontWeight: 700,
        letterSpacing: 6,
        color: MUTED_ON_DARK,
        textShadow: TEXT_STROKE,
      }}
    >
      {COPY.sub}
    </div>

    {/* ── OFFER ────────────────────────────────────────────────────────────── */}
    <div
      style={{
        ...box("giveaway"),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: UI,
          fontSize: 46,
          fontWeight: 900,
          letterSpacing: 2,
          color: CREAM_ON_DARK,
          textShadow: TEXT_STROKE,
        }}
      >
        {COPY.giveawayLead}
      </div>
      <div
        style={{
          fontFamily: UI,
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: MUTED_ON_DARK,
        }}
      >
        {COPY.giveawayTail}
      </div>
    </div>

    <div
      style={{
        ...box("rule"),
        left: "50%",
        width: 340,
        transform: "translateX(-50%)",
        background:
          "linear-gradient(90deg, transparent, rgba(214,178,102,0.75), transparent)",
      }}
    />

    <div
      style={{
        ...box("code"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
      }}
    >
      <div
        style={{
          fontFamily: UI,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: 2,
          textAlign: "right",
          maxWidth: 330,
          lineHeight: 1.18,
          color: CREAM_ON_DARK,
          textShadow: TEXT_STROKE,
        }}
      >
        {COPY.offer}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 96,
          padding: "0 34px",
          borderRadius: 20,
          background: GOLD_BRIGHT,
          boxShadow: "0 0 46px rgba(214,178,102,0.42)",
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 62,
          letterSpacing: 4,
          color: "#12251F",
        }}
      >
        {COPY.code}
      </div>
    </div>

    <div
      style={{
        ...box("site"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: UI,
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: 5,
        color: GOLD_BRIGHT,
        textShadow: TEXT_STROKE,
      }}
    >
      {COPY.site}
    </div>

    {guides ? <Guides /> : null}
  </AbsoluteFill>
);
