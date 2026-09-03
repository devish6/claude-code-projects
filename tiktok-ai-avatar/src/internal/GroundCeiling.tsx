import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { QUIET_DISPLAY, UI } from "../viral/fonts";

/**
 * ⚠️ INTERNAL DECISION REEL — NOT A POST. NEVER PUBLISH THIS.
 *
 * It exists to put one spend decision in front of the owner in the format he
 * already reads: the quiet cut. It asserts nothing about numerology, carries no
 * CTA, and is 36s — outside the 14–18s posting band on purpose, so it can never
 * be mistaken for a cut that is ready to go out.
 *
 * ── WHY IT EXISTS ───────────────────────────────────────────────────────────
 * The quiet format is the only thing that has ever moved this account's
 * attention (V50 7,988 ms / V55 7,745 ms IG average watch against a 3,350 ms
 * median across the eighteen other posts from 08-14 to 09-02, and the only two
 * cuts in the catalogue that skip below 0.51 while every other post skips above
 * 0.68). It is also one cut away from an asset wall:
 *
 *   13 ground photographs exist.
 *   dawn-a is locked to frame 0 — it is the ONLY light ground (luma 115) and
 *     frame 0 is the cover; opening dark measured 19.96 and was a failure.
 *   ember-b is locked to the close — the only self-lit ground.
 *   ⇒ 11 remain for 4 interior beats per cut.
 *   V50 spent 4. V55 spent 4. V56 spent 4 (reusing two of V50's, six days
 *     apart, under a gate I had to RELAX to ship it).
 *   ⇒ ember-a and gold-b are the only two never used. **A cut needs four.**
 *
 * ⭐⭐⭐ AND THE REAL COST IS NOT SCARCITY, IT IS THAT THE GROUND IS NOW CHOSEN
 * BY INVENTORY RATHER THAN BY MEANING. V56's payoff sits on `gold-a` because
 * gold-a was unused — not because gold silk is what "I'm not going to tell you
 * to ask for help" should look like. That is the wrong reason to choose the
 * most important frame in a cut, and it will get worse every cut.
 *
 * 🪤 THE THING I ALMOST TESTED, AND IT WOULD HAVE BEEN A WASTED CUT. The
 * obvious pitch for AI video here is "add motion". The format ALREADY moves —
 * `GROUND_DRIFT = 0.045`, a deliberate slow push-in, commented "the frame
 * should breathe, not move." Motion is not the gap. Supply and fit are.
 */

const FPS = 30;

const ALL_GROUNDS = [
  "dawn-a",
  "night-a",
  "night-b",
  "violet-a",
  "violet-b",
  "water-a",
  "water-b",
  "stone-a",
  "gold-a",
  "gold-b",
  "gold-c",
  "ember-a",
  "ember-b",
] as const;

/** Never used by V50, V55 or V56. The whole point of the second beat. */
const FREE = new Set(["ember-a", "gold-b"]);

const SCRIM_HEAVY =
  "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.60) 40%, rgba(0,0,0,0.66) 70%, rgba(0,0,0,0.82) 100%)";

/** The same slow breath the shipped format uses, so this reads as in-brand. */
const Ground: React.FC<{ bg: string; frames: number }> = ({ bg, frames }) => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, frames], [1, 1.045], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`grounds/${bg}.jpg`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }}
      />
      <AbsoluteFill style={{ background: SCRIM_HEAVY }} />
    </AbsoluteFill>
  );
};

const fadeIn = (f: number, at = 0, over = 14) =>
  interpolate(f, [at, at + over], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Copy: React.FC<{
  line: string;
  accent?: string;
  accentWord?: string;
  under?: string;
  size?: number;
}> = ({ line, accent = "#E8B36A", accentWord, under, size }) => {
  const f = useCurrentFrame();
  const o = fadeIn(f);
  const lift = interpolate(f, [0, 18], [16, 0], { extrapolateRight: "clamp" });
  const at = accentWord ? line.indexOf(accentWord) : -1;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 86px",
        textAlign: "center",
        opacity: o,
        transform: `translateY(${lift}px)`,
      }}
    >
      <div
        style={{
          fontFamily: QUIET_DISPLAY,
          fontWeight: 600,
          fontSize: size ?? (line.length > 46 ? 96 : line.length > 30 ? 112 : 126),
          lineHeight: 1.16,
          color: "#FFF6EA",
          textWrap: "balance",
          textShadow: "0 14px 48px rgba(0,0,0,0.72)",
        }}
      >
        {at >= 0 ? (
          <>
            {line.slice(0, at)}
            <span style={{ color: accent, whiteSpace: "nowrap" }}>{accentWord}</span>
            {line.slice(at + (accentWord as string).length)}
          </>
        ) : (
          line
        )}
      </div>
      {under && (
        <div
          style={{
            fontFamily: UI,
            fontSize: 42,
            fontWeight: 500,
            lineHeight: 1.45,
            color: "#FFF6EA",
            opacity: 0.34 + 0.56 * fadeIn(f, 12, 20),
            marginTop: 32,
            maxWidth: 840,
            textShadow: "0 8px 30px rgba(0,0,0,0.72)",
          }}
        >
          {under}
        </div>
      )}
    </AbsoluteFill>
  );
};

/**
 * The contact sheet. Thirteen grounds, the two free ones lit, the eleven spent
 * ones dimmed and struck. ⭐ The argument is visual because a table of names
 * would not land: the owner should SEE how little is left.
 */
const ContactSheet: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0B0B0C" }}>
      <AbsoluteFill style={{ padding: "230px 56px 430px", justifyContent: "center" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 13,
          }}
        >
          {ALL_GROUNDS.map((g, i) => {
            const free = FREE.has(g);
            // Reveal in order, then the spent ones drop away.
            const appear = fadeIn(f, 4 + i * 3, 10);
            const dim = free ? 1 : interpolate(f, [78, 104], [1, 0.16], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={g}
                style={{
                  position: "relative",
                  aspectRatio: "9 / 13",
                  borderRadius: 10,
                  overflow: "hidden",
                  opacity: appear * dim,
                  outline: free ? "4px solid #E8B36A" : "none",
                  outlineOffset: -4,
                }}
              >
                <Img
                  src={staticFile(`grounds/${g}.jpg`)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {free && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.66)",
                      color: "#E8B36A",
                      fontFamily: UI,
                      fontSize: 17,
                      fontWeight: 700,
                      padding: "6px 0",
                      textAlign: "center",
                      letterSpacing: 0.4,
                    }}
                  >
                    FREE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 66 }}>
        <div
          style={{
            fontFamily: QUIET_DISPLAY,
            fontWeight: 600,
            fontSize: 84,
            color: "#FFF6EA",
            opacity: fadeIn(f, 0, 12),
            textShadow: "0 10px 34px rgba(0,0,0,0.8)",
          }}
        >
          Thirteen grounds.
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 130 }}>
        <div
          style={{
            fontFamily: UI,
            fontSize: 44,
            fontWeight: 600,
            lineHeight: 1.42,
            color: "#FFF6EA",
            textAlign: "center",
            maxWidth: 880,
            opacity: fadeIn(f, 92, 20),
            textShadow: "0 8px 30px rgba(0,0,0,0.8)",
          }}
        >
          Two are locked. V50, V55 and V56 spent the rest.
          <br />
          <span style={{ color: "#E8B36A" }}>Two have never been used. A cut needs four.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** V56's actual payoff frame, re-rendered, with the reason it was chosen. */
const InventoryNotMeaning: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Ground bg="gold-a" frames={200} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 86px" }}>
        <div
          style={{
            fontFamily: QUIET_DISPLAY,
            fontWeight: 600,
            fontSize: 92,
            lineHeight: 1.16,
            color: "#F3F1EC",
            textAlign: "center",
            opacity: fadeIn(f, 0, 14),
            textShadow: "0 14px 48px rgba(0,0,0,0.7)",
          }}
        >
          I'm not going to tell you to{" "}
          <span style={{ color: "#E0A855" }}>ask for help.</span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 190 }}>
        <div
          style={{
            fontFamily: UI,
            fontSize: 44,
            fontWeight: 600,
            lineHeight: 1.42,
            color: "#FFF6EA",
            textAlign: "center",
            maxWidth: 880,
            opacity: fadeIn(f, 46, 22),
            textShadow: "0 8px 30px rgba(0,0,0,0.85)",
          }}
        >
          This ground was chosen because it was{" "}
          <span style={{ color: "#E8B36A" }}>unused</span> —
          <br />
          not because it means anything.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Closing: React.FC = () => {
  const f = useCurrentFrame();
  const rows = [
    ["The ask", "Authenticate Higgsfield. Generate 4 grounds for ONE cut."],
    ["The cost", "One cut's worth of credits. Not a subscription, not a pipeline."],
    ["The test", "V57 quiet, generated grounds. IG avg watch ≥ 7,000 ms."],
    ["The rule", "Below 7,000 ms we stop and never spend again."],
  ];
  return (
    <AbsoluteFill>
      <Ground bg="ember-b" frames={210} />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 82px" }}>
        <div
          style={{
            fontFamily: QUIET_DISPLAY,
            fontWeight: 600,
            fontSize: 82,
            color: "#FFF0E4",
            textAlign: "center",
            marginBottom: 54,
            opacity: fadeIn(f, 0, 14),
            textShadow: "0 12px 40px rgba(0,0,0,0.75)",
          }}
        >
          Generate the ground <span style={{ color: "#FF9152" }}>for the wound.</span>
        </div>
        {rows.map(([k, v], i) => (
          <div
            key={k}
            style={{
              opacity: fadeIn(f, 22 + i * 16, 18),
              marginBottom: 30,
              paddingLeft: 22,
              borderLeft: "4px solid rgba(255,145,82,0.75)",
            }}
          >
            <div
              style={{
                fontFamily: UI,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 1.6,
                color: "#FF9152",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {k}
            </div>
            <div
              style={{
                fontFamily: UI,
                fontSize: 39,
                fontWeight: 500,
                lineHeight: 1.36,
                color: "#FFF0E4",
                textShadow: "0 6px 24px rgba(0,0,0,0.8)",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const B = (s: number) => Math.round(s * FPS);

export const GROUND_CEILING_FRAMES = B(4.6 + 6.4 + 4.4 + 6.2 + 5.4 + 7.4);

export const GroundCeiling: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B0B0C" }}>
    <Sequence durationInFrames={B(4.6)}>
      <Ground bg="dawn-a" frames={B(4.6)} />
      <Copy
        line="The format that works is running out of pictures."
        accentWord="running out of pictures"
        under="internal — not for posting"
      />
    </Sequence>

    <Sequence from={B(4.6)} durationInFrames={B(6.4)}>
      <ContactSheet />
    </Sequence>

    <Sequence from={B(11.0)} durationInFrames={B(4.4)}>
      <Ground bg="gold-b" frames={B(4.4)} />
      <Copy
        line="So today I weakened the gate to ship V56."
        accentWord="weakened the gate"
        under="it now binds against the neighbour only, not the whole format"
      />
    </Sequence>

    <Sequence from={B(15.4)} durationInFrames={B(6.2)}>
      <InventoryNotMeaning />
    </Sequence>

    <Sequence from={B(21.6)} durationInFrames={B(5.4)}>
      <Ground bg="ember-a" frames={B(5.4)} />
      <Copy
        line="Motion is not the gap. The format already breathes."
        accentWord="already breathes"
        under="GROUND_DRIFT = 0.045, shipped. Supply and fit are the gap."
      />
    </Sequence>

    <Sequence from={B(27.0)} durationInFrames={B(7.4)}>
      <Closing />
    </Sequence>
  </AbsoluteFill>
);
