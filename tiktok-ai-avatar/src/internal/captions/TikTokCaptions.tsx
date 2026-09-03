import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";
import { UI } from "../../viral/fonts";

/**
 * The TikTok "dynamic caption" look, entirely in Remotion.
 *
 * ⛔ NO CSS transitions or animations anywhere — they do not render. Every
 * moving value comes from `useCurrentFrame()` + `interpolate()`.
 *
 * `createTikTokStyleCaptions` groups word tokens into PAGES; how many words
 * land on screen at once is `combineTokensWithinMilliseconds`. Small values
 * approach one word at a time (the loudest version of this look); larger values
 * give a readable phrase with the spoken word lit inside it.
 */

export type CaptionStyle = {
  /** Lower = closer to one word at a time. ~350 is word-by-word, ~1200 a phrase. */
  switchEveryMs: number;
  fontSize: number;
  /** Colour of the word currently being spoken. */
  highlight: string;
  /** Colour of the other words on the page. */
  base: string;
  /** How much the active word grows. 1 = no pop. */
  pop: number;
  uppercase: boolean;
};

export const CAPTION_PRESETS = {
  /**
   * What the reference video does: enormous, one or two words, hard pop.
   * ⚠️ This is the KINETIC register — the format this account measured at
   * 2,790–3,289 ms average watch against the quiet format's 7,745–7,988 ms.
   */
  loud: {
    switchEveryMs: 420,
    fontSize: 132,
    highlight: "#F4CE8E",
    base: "#FFFFFF",
    pop: 1.16,
    uppercase: true,
  },
  /**
   * The same machinery held down to this account's own register: a readable
   * phrase, the spoken word lit rather than thrown, no shouting.
   */
  quiet: {
    switchEveryMs: 1150,
    fontSize: 74,
    highlight: "#E8B36A",
    base: "#FFF6EA",
    pop: 1.04,
    uppercase: false,
  },
} as const satisfies Record<string, CaptionStyle>;

const Page: React.FC<{ page: TikTokPage; style: CaptionStyle }> = ({ page, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteMs = page.startMs + (frame / fps) * 1000;

  // The page itself arrives with a small settle, never from zero opacity — the
  // same rule the quiet renderer follows, and the one qa-frame caught us on.
  const enter = interpolate(frame, [0, 5], [0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px" }}>
      <div
        style={{
          fontFamily: UI,
          fontWeight: 800,
          fontSize: style.fontSize,
          lineHeight: 1.18,
          textAlign: "center",
          // 🪤 WHITESPACE-SENSITIVE — the leading space lives inside each token.
          whiteSpace: "pre",
          textWrap: "balance",
          letterSpacing: style.uppercase ? -1 : -0.5,
          textShadow: "0 10px 40px rgba(0,0,0,0.85)",
          transform: `scale(${enter})`,
        }}
      >
        {page.tokens.map((token) => {
          const active = token.fromMs <= absoluteMs && token.toMs > absoluteMs;
          // The pop is driven by how far INTO the word we are, so it rises and
          // settles rather than snapping on and off.
          const t = active
            ? interpolate(absoluteMs, [token.fromMs, token.toMs], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 0;
          const scale = active
            ? 1 + (style.pop - 1) * Math.sin(Math.PI * Math.min(1, t * 1.6))
            : 1;

          return (
            <span
              key={`${token.fromMs}-${token.text}`}
              style={{
                display: "inline-block",
                color: active ? style.highlight : style.base,
                transform: `scale(${scale})`,
                transformOrigin: "center bottom",
              }}
            >
              {style.uppercase ? token.text.toUpperCase() : token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const TikTokCaptions: React.FC<{ captions: Caption[]; style: CaptionStyle }> = ({
  captions,
  style,
}) => {
  const { fps } = useVideoConfig();

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: style.switchEveryMs,
      }),
    [captions, style.switchEveryMs],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        // 🔴 EACH PAGE RUNS UNTIL THE NEXT ONE STARTS — no `switchEveryMs` cap.
        //    The documented pattern caps at `startFrame + switchEveryMs`, which
        //    is correct for transcribed speech where pages abut. These captions
        //    are AUTHORED and carry deliberate pauses at punctuation, so the
        //    next page can begin LATER than the cap — and every millisecond of
        //    that difference rendered no page at all. qa-frame caught it at
        //    frame 101: twelve blank frames mid-sentence. Running to the next
        //    start is gap-free by construction.
        const endFrame = next ? (next.startMs / 1000) * fps : Infinity;
        const durationInFrames = endFrame - startFrame;
        if (durationInFrames <= 0) return null;

        // 🔴 THE LAST PAGE IS NOT CAPPED. qa-frame failed at frame 227: once
        //    the final page expired, the tail of the block was a bare dark
        //    ground with no type on it — a near-blank frame, the same defect
        //    class the quiet renderer floors its copy to avoid. Omitting
        //    durationInFrames lets the last phrase hold to the end of the
        //    parent Sequence, which is also simply better: the closing words
        //    should not evaporate before the shot does.
        const isLast = next === null;

        return (
          <Sequence
            key={i}
            from={startFrame}
            durationInFrames={isLast ? undefined : durationInFrames}
          >
            <Page page={page} style={style} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
