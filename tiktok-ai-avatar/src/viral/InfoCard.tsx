import React from "react";
import { AbsoluteFill } from "remotion";
import { DISPLAY, UI } from "./fonts";
import { PALETTES } from "./palette";
import { MOOLANK_CARDS } from "./card-data";

/**
 * The saveable Moolank reference card — a STILL, not a video.
 *
 * ⭐ WHY A STILL AT ALL
 * Our reels reach ~180 strangers a post and earn 0–1 saves, 0 shares. The one
 * reference post that earns shares (42, on only 13 comments) is a single static
 * card of 12 labelled fields. It works because it is a KEEPSAKE — nothing is
 * withheld, so there is a reason to press save. A reel shows four traits for
 * 1.4s and is gone.
 *
 * 📐 1080×1350 — Instagram's 4:5 portrait, the tallest a feed IMAGE may be.
 * (Reels are 9:16, but this is not a reel.) 4:5 buys ~25% more vertical pixels
 * than square, which on a card of twelve fields is the difference between
 * readable and cramped.
 *
 * 🎯 "IT LOOKS LIKE AN AD" — THE STANDING RULE
 * The post is the value; the promotion is a footer. numevix.com appears once,
 * small, at the very bottom, and nowhere else. No CTA sits inside the content.
 * "Link in bio" lives in the caption, not on the card.
 *
 * 🔴 THE BORN-ON LINE IS THE HOOK and it is deliberately the second-largest
 * element on the card. It names EVERY qualifying date ("8th, 17th, 26th"), the
 * rule confirmed three times against accounts at 41K–55K likes. A reader
 * scrolling past has to be able to self-identify in one glance, or the other
 * eleven fields never get read.
 */

export const INFO_CARD_WIDTH = 1080;
export const INFO_CARD_HEIGHT = 1350;

const P = PALETTES["ink-violet"];

/** Gold, used for labels and rules. Pulled once so the boxes stay consistent. */
const GOLD = P.ACCENT;
const HAIRLINE = "rgba(214,178,102,0.28)";
const BOX_BG = "rgba(255,255,255,0.045)";
const BOX_BORDER = "rgba(255,255,255,0.10)";

/** The small caps label above every field. */
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: UI,
      fontSize: 19,
      fontWeight: 700,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      color: GOLD,
      marginBottom: 10,
    }}
  >
    {children}
  </div>
);

const Box: React.FC<{
  label: string;
  children: React.ReactNode;
  /** Grid span in columns of the 12-column track. */
  span: number;
  accent?: boolean;
}> = ({ label, children, span, accent }) => (
  <div
    style={{
      gridColumn: `span ${span}`,
      background: accent ? "rgba(214,178,102,0.10)" : BOX_BG,
      border: `1px solid ${accent ? "rgba(214,178,102,0.34)" : BOX_BORDER}`,
      borderRadius: 18,
      padding: "22px 24px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
    }}
  >
    <Label>{label}</Label>
    {children}
  </div>
);

/** Body copy inside a box. */
const Body: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 26 }) => (
  <div
    style={{
      fontFamily: UI,
      fontSize: size,
      lineHeight: 1.34,
      color: P.TEXT,
      fontWeight: 400,
    }}
  >
    {children}
  </div>
);

/** A bulleted list inside a box — used by Strengths and Shadow Side. */
const List: React.FC<{ items: string[]; marker: string; markerColor: string }> = ({
  items,
  marker,
  markerColor,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
    {items.map((t) => (
      <div key={t} style={{ display: "flex", gap: 11, alignItems: "baseline" }}>
        <span style={{ color: markerColor, fontSize: 20, lineHeight: 1.4, flexShrink: 0 }}>
          {marker}
        </span>
        <span
          style={{
            fontFamily: UI,
            fontSize: 25,
            lineHeight: 1.32,
            color: P.TEXT,
          }}
        >
          {t}
        </span>
      </div>
    ))}
  </div>
);

/** One of the four compact facts in the stats strip. */
const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div
      style={{
        fontFamily: UI,
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: GOLD,
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    <div style={{ fontFamily: DISPLAY, fontSize: 33, color: P.TEXT, lineHeight: 1.1 }}>{value}</div>
  </div>
);

export type InfoCardProps = {
  /** Which Moolank to render. 1–9. */
  number: number;
};

export const InfoCard: React.FC<InfoCardProps> = ({ number }) => {
  const c = MOOLANK_CARDS[number];
  if (!c) throw new Error(`no card data for moolank ${number}`);

  return (
    <AbsoluteFill
      style={{
        // Two off-centre glows keep a flat dark field from reading as a PDF.
        background: `
          radial-gradient(ellipse 70% 50% at 20% 8%, rgba(120,96,220,0.30), transparent 62%),
          radial-gradient(ellipse 60% 45% at 88% 96%, rgba(214,150,80,0.20), transparent 60%),
          linear-gradient(158deg, ${P.GRAD_A} 0%, ${P.GRAD_MID} 48%, ${P.GRAD_B} 100%)
        `,
        padding: "48px 46px 0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────
          The numeral is the anchor; the born-on line directly under it is what
          makes a stranger stop. Everything else on the card is detail. */}
      <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 22 }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 200,
            lineHeight: 0.82,
            color: GOLD,
            textShadow: "0 0 46px rgba(230,190,110,0.42)",
            flexShrink: 0,
          }}
        >
          {c.number}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: UI,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 4.5,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.62)",
              marginBottom: 7,
            }}
          >
            Moolank {c.number} · {c.archetype}
          </div>

          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 40,
              lineHeight: 1.16,
              color: P.TEXT,
              marginBottom: 12,
            }}
          >
            {c.personality}
          </div>

          {/* The hook. Every qualifying date, never just the first. */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 12,
              background: "rgba(214,178,102,0.14)",
              border: `1px solid rgba(214,178,102,0.40)`,
              borderRadius: 999,
              padding: "11px 24px",
            }}
          >
            <span
              style={{
                fontFamily: UI,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2.2,
                textTransform: "uppercase",
                color: GOLD,
              }}
            >
              Born on
            </span>
            <span style={{ fontFamily: DISPLAY, fontSize: 32, color: P.TEXT }}>{c.bornOn}</span>
          </div>
        </div>
      </div>

      {/* ── Stats strip — the four one-word facts ──────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "20px 0",
          borderTop: `1px solid ${HAIRLINE}`,
          borderBottom: `1px solid ${HAIRLINE}`,
          marginBottom: 22,
        }}
      >
        <Stat label="Ruling planet" value={c.planet} />
        <div style={{ width: 1, alignSelf: "stretch", background: HAIRLINE }} />
        <Stat label="Element" value={c.element} />
        <div style={{ width: 1, alignSelf: "stretch", background: HAIRLINE }} />
        <Stat label="Lucky day" value={c.luckyDay} />
        <div style={{ width: 1, alignSelf: "stretch", background: HAIRLINE }} />
        <Stat label="Lucky numbers" value={c.luckyNumbers.join(" · ")} />
      </div>

      {/* ── The twelve-field grid ──────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 16,
          // `start` left ~180px of bare gradient under the last box, which reads
          // as an unfinished card rather than as breathing room. `stretch` hands
          // the slack back to the rows, so the boxes grow instead of the void.
          alignContent: "stretch",
        }}
      >
        <Box label="Strengths" span={6}>
          <List items={c.strengths} marker="◆" markerColor={GOLD} />
        </Box>

        <Box label="Shadow side" span={6}>
          <List items={c.shadow} marker="◇" markerColor="rgba(255,255,255,0.45)" />
        </Box>

        <Box label="Career" span={7}>
          <Body size={25}>{c.career}</Body>
        </Box>

        <Box label="Lucky colours" span={5}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {c.luckyColours.map((col) => (
              <span
                key={col}
                style={{
                  fontFamily: UI,
                  fontSize: 23,
                  color: P.TEXT,
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${BOX_BORDER}`,
                  borderRadius: 999,
                  padding: "6px 16px",
                }}
              >
                {col}
              </span>
            ))}
          </div>
        </Box>

        <Box label="Relationships" span={6}>
          <Body>{c.relationships}</Body>
        </Box>

        <Box label="Inner world" span={6}>
          <Body>{c.innerWorld}</Body>
        </Box>

        {/* The mantra is set in the display face and gold so it reads as the
            thing being given, with the practice underneath in plain UI type.
            One block of body copy here made the whole box skim as advice. */}
        <Box label="Daily remedy" span={12} accent>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 36,
              lineHeight: 1.2,
              color: GOLD,
              marginBottom: 9,
            }}
          >
            “{c.mantra}”
          </div>
          <Body size={26}>{c.remedy}</Body>
        </Box>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────
          🎯 The ONLY place the brand appears. Small, last, after the value.
          "The post is value, the promotion is a footer." */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 4px 22px",
        }}
      >
        <span
          style={{
            fontFamily: UI,
            fontSize: 20,
            letterSpacing: 1.2,
            color: "rgba(255,255,255,0.38)",
          }}
        >
          Save this for your number
        </span>
        <span
          style={{
            fontFamily: DISPLAY,
            fontSize: 25,
            letterSpacing: 1.6,
            color: "rgba(255,255,255,0.52)",
          }}
        >
          numevix.com
        </span>
      </div>
    </AbsoluteFill>
  );
};
