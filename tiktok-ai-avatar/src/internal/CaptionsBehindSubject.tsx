import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { UI } from "../viral/fonts";
import { captionsFromText } from "./captions/captions-from-text";
import { TikTokCaptions, CAPTION_PRESETS } from "./captions/TikTokCaptions";

/**
 * ⚠️ INTERNAL PROOF — NOT A POST.
 *
 * Can the captions go BEHIND the person? Yes, and it is not a caption feature
 * at all — it is a compositing ORDER that Remotion already does:
 *
 *   1. the footage            <OffthreadVideo>       — the full frame
 *   2. the captions           <TikTokCaptions>       — drawn over it
 *   3. the person, cut out    <Img> RGBA per frame   — drawn over THEM
 *
 * Layer 3 is the same pixels as layer 1 with everything that is not the person
 * made transparent, so the body occludes the text while the background does
 * not. Nothing in the caption code changed — the identical component from
 * `CaptionDemo` is reused, at the identical settings.
 *
 * ⭐⭐⭐ THE ONLY HARD PART IS THE MATTE, AND IT IS NOT A REMOTION PROBLEM.
 * `scripts/build-person-matte.py` writes one RGBA PNG per frame using
 * MediaPipe's Selfie Segmenter — 244 KB, runs locally, no API key, no
 * per-frame cost. 104 frames of M1.mp4 took seconds.
 *
 * 🪤 AND THE LIMIT, STATED WHERE IT CANNOT BE SKIPPED. That model is the CHEAP
 * end of matting. It is built for one upper body facing a camera, which is
 * exactly this shot — but hair against a busy background, a hand crossing the
 * face, or a second person will show a crunchy or swimming edge. The script
 * erodes the mask by a pixel and blurs it slightly to kill the background halo
 * that otherwise rides along a shoulder; that is a mitigation, not a fix. For a
 * hero shot the answer is a better matter (RVM, BiRefNet, SAM 2) or a real roto
 * pass, and the pipeline below does not change — only the PNGs do.
 *
 * ⛔ SEPARATELY, AND NOT A TECHNICAL POINT: this account measured the owner's
 * face at ~700 views against 1,268–2,408 faceless. This file proves the
 * capability. It does not argue for using it here.
 */

const CLIP = "talking/M1.mp4";
const MATTE_WEBM = "talking/matte-m1.webm";
const MATTE_FRAMES = 104;

export const BEHIND_SUBJECT_FRAMES = MATTE_FRAMES;

const LINE = "You're the one everyone comes to. You always pick up.";
const CAPTIONS = captionsFromText(LINE, { wordsPerSecond: 3.2 });

/**
 * The cut-out person, drawn on top of everything.
 *
 * ⭐⭐⭐ A VP9 ALPHA WEBM, NOT A PNG SEQUENCE, AND THE NUMBERS ARE THE REASON.
 * `build-person-matte.py` writes PNGs because they are easy to inspect and
 * lossless — but 104 frames of them is **201 MB**, roughly 57 MB per second of
 * footage, so a 16-second cut would be about 900 MB of intermediate. The same
 * frames as `-c:v libvpx-vp9 -pix_fmt yuva420p` are **1.5 MB**: 128x smaller,
 * with alpha intact. Generate PNGs, convert once, keep the WebM.
 *
 * 🪤 `-auto-alt-ref 0` is required. VP9's alternate reference frames are not
 * alpha-aware, and with them on the transparency degrades unpredictably part
 * way through the clip rather than failing outright.
 *
 * 🪤 MUST be wrapped in AbsoluteFill. A bare media element becomes a FLEX CHILD
 * of the parent AbsoluteFill (display:flex, column) rather than an overlay, so
 * it does not cover the frame and the occlusion silently does nothing — the
 * captions render straight over the face and the effect looks like it failed.
 * That is exactly what the first render of this file did.
 */
const CutOut: React.FC = () => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(MATTE_WEBM)}
      transparent
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

/** A small caption so it is obvious which layer is which. */
const Legend: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10], [0.55, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 62 }}>
      <div
        style={{
          fontFamily: UI,
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: 1.6,
          color: "#E8B36A",
          textTransform: "uppercase",
          opacity: o,
          textShadow: "0 6px 22px rgba(0,0,0,0.9)",
        }}
      >
        footage → captions → cut-out person
      </div>
    </AbsoluteFill>
  );
};

export const CaptionsBehindSubject: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* 1 — the footage */}
    <OffthreadVideo src={staticFile(CLIP)} muted />

    {/* 2 — the captions, over the footage */}
    <TikTokCaptions captions={CAPTIONS} style={CAPTION_PRESETS.loud} />

    {/* 3 — the person again, cut out, over the captions */}
    <CutOut />

    <Legend />
  </AbsoluteFill>
);
