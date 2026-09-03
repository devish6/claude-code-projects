import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { UI } from "../viral/fonts";
import { captionsFromText, captionsDurationMs } from "./captions/captions-from-text";
import { TikTokCaptions, CAPTION_PRESETS } from "./captions/TikTokCaptions";

/**
 * ⚠️ INTERNAL PROOF — NOT A POST.
 *
 * One question, answered by rendering it: can we make the reference video's
 * caption animation with Remotion alone, no ElevenLabs?
 *
 * YES, and ElevenLabs was never the part that animated anything. Its only job
 * anywhere in this repo is answering *when is each word spoken*, which matters
 * only when captions sit on real narration and must not drift from it. Here
 * there is no audio at all, so the cadence is AUTHORED — see
 * `captions/captions-from-text.ts`. Nothing leaves this machine, nothing costs
 * anything, and the same file documents the two other ways to get timings
 * (Whisper.cpp locally for existing audio; ElevenLabs only when it made the
 * audio).
 *
 * The reel shows the SAME sentence twice, so the variable on screen is the
 * caption style and nothing else:
 *   A — `loud`: ~420 ms pages, 132 px, uppercase, hard pop. The reference look.
 *   B — `quiet`: ~1150 ms pages, 74 px, sentence case, barely a lift.
 *
 * ⚖️ AND THE REASON BOTH ARE HERE RATHER THAN JUST THE ONE THAT LOOKS COOL:
 * `scripts/build-story-captions.mjs` already ruled against word-by-word in this
 * repo, in writing — *"the eye is yanked ~3x/second and the sentence never
 * exists as a whole"* — and the kinetic format that register belongs to
 * measured 2,790–3,289 ms average watch against the quiet format's 7,745–7,988.
 * So A is shown to prove it is buildable, not to recommend it.
 */

const LINE =
  "You're the one everyone comes to. You always pick up. Nobody asks you the same question back.";

const LOUD = captionsFromText(LINE, { wordsPerSecond: 3.1 });
const QUIET = captionsFromText(LINE, { wordsPerSecond: 2.7 });

const FPS = 30;
const GAP = 22;
const LOUD_FRAMES = Math.ceil((captionsDurationMs(LOUD) / 1000) * FPS) + GAP;
const QUIET_FRAMES = Math.ceil((captionsDurationMs(QUIET) / 1000) * FPS) + GAP;
const LABEL_FRAMES = 46;

export const CAPTION_DEMO_FRAMES =
  LABEL_FRAMES + LOUD_FRAMES + LABEL_FRAMES + QUIET_FRAMES;

const Ground: React.FC<{ bg: string }> = ({ bg }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Img
      src={staticFile(`grounds/${bg}.jpg`)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.34) 40%, rgba(0,0,0,0.40) 66%, rgba(0,0,0,0.72) 100%)",
      }}
    />
  </AbsoluteFill>
);

/** A card naming which style is about to play. Opaque from frame 0 — qa-frame. */
const Label: React.FC<{ kicker: string; title: string; note: string }> = ({
  kicker,
  title,
  note,
}) => {
  const f = useCurrentFrame();
  const lift = interpolate(f, [0, 12], [10, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0B0B0C" }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 90px",
          textAlign: "center",
          transform: `translateY(${lift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: UI,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 3,
            color: "#E8B36A",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: UI,
            fontSize: 78,
            fontWeight: 800,
            color: "#FFF6EA",
            lineHeight: 1.15,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: UI,
            fontSize: 36,
            fontWeight: 500,
            color: "#FFF6EA",
            opacity: 0.72,
            marginTop: 26,
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          {note}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CaptionDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B0B0C" }}>
    <Sequence durationInFrames={LABEL_FRAMES}>
      <Label
        kicker="A · the reference look"
        title="Word-by-word"
        note="420 ms pages · uppercase · hard pop. No audio, no ElevenLabs — the cadence is authored."
      />
    </Sequence>

    <Sequence from={LABEL_FRAMES} durationInFrames={LOUD_FRAMES}>
      <Ground bg="night-b" />
      <TikTokCaptions captions={LOUD} style={CAPTION_PRESETS.loud} />
    </Sequence>

    <Sequence from={LABEL_FRAMES + LOUD_FRAMES} durationInFrames={LABEL_FRAMES}>
      <Label
        kicker="B · the same engine, our register"
        title="Phrase, word lit"
        note="1150 ms pages · sentence case · a 4% lift. Identical code, two numbers changed."
      />
    </Sequence>

    <Sequence from={LABEL_FRAMES + LOUD_FRAMES + LABEL_FRAMES} durationInFrames={QUIET_FRAMES}>
      <Ground bg="gold-a" />
      <TikTokCaptions captions={QUIET} style={CAPTION_PRESETS.quiet} />
    </Sequence>
  </AbsoluteFill>
);
