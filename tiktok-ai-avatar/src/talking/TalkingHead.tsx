import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BrandAudio } from "../components/kit";
import {
  CREAM_ON_DARK,
  GOLD,
  GOLD_BRIGHT,
  MUTED_ON_DARK,
  MUSIC,
} from "../lib/brand";
import { DISPLAY, UI, TEXT_STROKE } from "../viral/fonts";
import {
  CLIPS,
  SAFE_SIDE,
  SAFE_TOP,
  SEGMENTS,
  SHELF_H,
  TOTAL_FRAMES,
  VIDEO_OFFSET,
  WORDS,
  XFADE,
  type Segment,
  type Word,
} from "./script";

/** Segments that show the live-site inset. The talking beats stay clear. */
const SHOWS_SITE = new Set(["04", "05"]);

/**
 * Footage layer — drawn twice per clip.
 *
 * The BACKDROP is the same clip blown up and blurred, filling the whole frame.
 * It exists so the shelf above the speaker has something real behind it: a
 * translucent panel over black is just a dark rectangle, but over a soft,
 * moving version of the room it reads as depth. It also means the top of the
 * frame is never dead space.
 *
 * The PLATE is the sharp clip, offset down so the text stack clears the head.
 *
 * Two things here kill the choppiness of the first cut:
 *
 * 1. CROSS-DISSOLVE. Each clip is held XFADE frames past its own out-point
 *    (there is trailing dead air on every source file, so this costs nothing)
 *    while the next fades in over it. Hard-cutting six clips shot in four
 *    different spots read as a slideshow; 0.3s of dissolve reads as one take.
 *    The outgoing audio ramps down across the same window so two room tones
 *    never sit at full level together.
 *
 * 2. SLOW DRIFT. Every clip scales 1.00 → 1.035 across its length, so no shot
 *    is frozen. transformOrigin is "center top": scaling from the top edge
 *    keeps the head where it was measured, where scaling from the centre would
 *    walk it upward into the graphics.
 *
 * White balance is NOT corrected here — it is baked into the mp4s. The six
 * clips ran from R−B +16 (warm wall bounce) to −5 (backlit window); they are
 * now all +4 to +6, so a dissolve no longer swings colour temperature.
 */
const Footage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0E1A15", overflow: "hidden" }}>
    {CLIPS.map((clip, i) => (
      <Sequence
        key={clip.src}
        from={clip.offset}
        durationInFrames={clip.duration + (i < CLIPS.length - 1 ? XFADE : 0)}
      >
        <ClipLayer clip={clip} isFirst={i === 0} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

const ClipLayer: React.FC<{
  clip: (typeof CLIPS)[number];
  isFirst: boolean;
}> = ({ clip, isFirst }) => {
  const frame = useCurrentFrame();

  const opacity = isFirst
    ? 1
    : interpolate(frame, [0, XFADE], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });

  const scale = interpolate(frame, [0, clip.duration], [1, 1.035], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const volume = (f: number) =>
    interpolate(f, [clip.duration - XFADE, clip.duration], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Backdrop — muted, so only one copy carries the audio. */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(clip.src)}
          startFrom={clip.trimFrom}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(34px) brightness(0.5) saturate(0.85)",
            transform: "scale(1.25)",
          }}
        />
      </AbsoluteFill>

      {/* Plate. */}
      <div
        style={{
          position: "absolute",
          top: VIDEO_OFFSET,
          left: 0,
          width: 1080,
          height: 1920,
          overflow: "hidden",
        }}
      >
        <OffthreadVideo
          src={staticFile(clip.src)}
          startFrom={clip.trimFrom}
          volume={volume}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            transformOrigin: "center top",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/**
 * The shelf. Translucent by design — you can see the blurred room through it,
 * which is what stops it reading as a title card bolted on top of a video.
 */
const Shelf: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: SHELF_H,
          background:
            "linear-gradient(180deg, rgba(14,26,21,0.90) 0%, rgba(14,26,21,0.78) 46%, rgba(14,26,21,0.42) 74%, rgba(14,26,21,0) 100%)",
        }}
      />
      <Img
        src={staticFile("brand/zodiac-dial.svg")}
        style={{
          position: "absolute",
          right: -215,
          top: -40,
          width: 560,
          height: 560,
          opacity: 0.2,
          transform: `rotate(${frame * 0.1}deg)`,
        }}
      />
    </>
  );
};

/** Staggered spring in, and a clean fade out before the next segment lands. */
const useBeat = (delay: number, duration: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.7, stiffness: 120 },
  });
  const opacity = interpolate(
    frame,
    [delay, delay + 10, duration - 10, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return { opacity, y: (1 - s) * 30 };
};

const Overlay: React.FC<{ seg: Segment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const numeral = useBeat(0, seg.duration);
  const head = useBeat(4, seg.duration);
  const keys = useBeat(12, seg.duration);
  const site = useBeat(18, seg.duration);

  // The screenshots are taller than the inset, so the page scrolls slowly
  // inside its frame — it reads as a live site rather than a pasted image.
  const scroll = interpolate(frame, [0, seg.duration], [0, -150], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: SAFE_SIDE - 6,
          top: SAFE_TOP - 52,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 180,
          lineHeight: 1,
          color: GOLD_BRIGHT,
          opacity: numeral.opacity * 0.17,
          transform: `translateY(${numeral.y}px)`,
        }}
      >
        {seg.step}
      </div>

      <div
        style={{
          position: "absolute",
          left: SAFE_SIDE,
          top: SAFE_TOP + 28,
          width: 1080 - SAFE_SIDE * 2,
          opacity: head.opacity,
          transform: `translateY(${head.y}px)`,
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 64,
          lineHeight: 1.1,
          color: CREAM_ON_DARK,
          textShadow: TEXT_STROKE,
        }}
      >
        {seg.headline}
      </div>

      <div
        style={{
          position: "absolute",
          left: SAFE_SIDE,
          top: 274,
          display: "flex",
          gap: 32,
          opacity: keys.opacity,
          transform: `translateY(${keys.y}px)`,
        }}
      >
        {seg.keywords.map((k, i) => (
          <span
            key={k}
            style={{
              fontFamily: UI,
              fontWeight: 700,
              fontSize: 30,
              color: i === 0 ? GOLD : MUTED_ON_DARK,
              textShadow: TEXT_STROKE,
            }}
          >
            {k}
          </span>
        ))}
      </div>

      {/*
        Live numevix.com, shown only on the two product beats.
        ⭐ ITS POSITION IS MEASURED, NOT CHOSEN. Sitting it low over the torso
        put it straight across the speaker's mouth on both of those clips. Here
        at 400–730 the only thing it ever overlaps is hair and forehead: the
        tightest head (M5) starts at 508 with eyes near 950, and on M6 the head
        starts at 771 so the card clears the face entirely. Anything below ~730
        is back on the mouth — re-measure before moving it.
      */}
      {SHOWS_SITE.has(seg.step) ? (
        <div
          style={{
            position: "absolute",
            left: SAFE_SIDE,
            top: 400,
            width: 1080 - SAFE_SIDE * 2,
            height: 330,
            borderRadius: 26,
            overflow: "hidden",
            border: "1.5px solid rgba(255,246,214,0.22)",
            boxShadow: "0 40px 90px -24px rgba(0,0,0,0.80)",
            opacity: site.opacity,
            transform: `translateY(${site.y}px)`,
          }}
        >
          <Img
            src={staticFile(`site/${seg.shot}.png`)}
            style={{
              width: "100%",
              display: "block",
              transform: `translateY(${scroll}px)`,
            }}
          />
        </div>
      ) : null}
    </>
  );
};

/**
 * "STEP N OF 5" plus a hairline that fills across the whole cut. Deliberately
 * NOT inside a per-segment Sequence — it reads the master frame, so it moves
 * continuously instead of resetting at every beat.
 */
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = SEGMENTS.filter((s) => frame >= s.from).length || 1;
  const w = 1080 - SAFE_SIDE * 2;
  const pct = interpolate(frame, [0, TOTAL_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", left: SAFE_SIDE, top: 330 }}>
      <div
        style={{
          fontFamily: UI,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 1.2,
          color: GOLD,
          marginBottom: 10,
          textShadow: TEXT_STROKE,
        }}
      >
        {`STEP ${idx} OF ${SEGMENTS.length}`}
      </div>
      <div
        style={{
          width: w,
          height: 3,
          background: "rgba(255,246,214,0.18)",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: w * pct,
            height: "100%",
            background: GOLD,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};

/** Group words into short lines so captions never wrap unpredictably. */
const LINES: Word[][] = (() => {
  const out: Word[][] = [];
  for (let i = 0; i < WORDS.length; i += 4) out.push(WORDS.slice(i, i + 4));
  return out;
})();

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = LINES.find((l) => frame >= l[0].s && frame < l[l.length - 1].e);
  if (!line) return null;

  const opacity = interpolate(frame, [line[0].s, line[0].s + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_SIDE,
        top: 1580,
        width: 1080 - SAFE_SIDE * 2,
        display: "flex",
        flexWrap: "wrap",
        gap: "0 16px",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {line.map((w) => {
        const active = frame >= w.s && frame < w.e;
        return (
          <span
            key={`${w.t}-${w.s}`}
            style={{
              fontFamily: UI,
              fontWeight: 800,
              fontSize: 44,
              lineHeight: 1.2,
              color: active ? GOLD_BRIGHT : "#FFFFFF",
              textShadow: TEXT_STROKE,
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

export const TalkingHead: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0E1A15" }}>
    <Footage />
    <Shelf />

    {SEGMENTS.map((seg) => (
      <Sequence key={seg.step} from={seg.from} durationInFrames={seg.duration}>
        <Overlay seg={seg} />
      </Sequence>
    ))}

    <Progress />
    <Captions />

    <BrandAudio
      src={MUSIC.ambientHorizon}
      total={TOTAL_FRAMES}
      fadeIn={30}
      vol={0.13}
    />
  </AbsoluteFill>
);
