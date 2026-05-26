# TikTok AI Avatar Video — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 15-second TikTok (9:16) Remotion video that wraps a D-ID talking-head avatar clip with animated hook badge, line-by-line captions, and a pulsing CTA button.

**Architecture:** Remotion project scaffolded inside the monorepo at `tiktok-ai-avatar/`. Five single-responsibility components compose into one `TikTokAIAvatar` composition. Assets (the D-ID video) live in `public/` and are referenced via `staticFile()`. No CSS transitions — all animation via `interpolate()` + `useCurrentFrame()`.

**Tech Stack:** Remotion 4.x, React 19, TypeScript, FFmpeg (CLI, pre-installed on macOS), sips (macOS built-in)

---

## File Map

| File | Created/Modified | Responsibility |
|------|-----------------|----------------|
| `tiktok-ai-avatar/src/index.ts` | Replace | Remotion entry — calls `registerRoot` |
| `tiktok-ai-avatar/src/Root.tsx` | Replace | Registers `TikTokAIAvatar` composition (1080×1920, 30fps, 450 frames) |
| `tiktok-ai-avatar/src/Composition.tsx` | Replace | Orchestrates all five components + global fade-out |
| `tiktok-ai-avatar/src/components/Background.tsx` | Create | Full-screen dark gradient (`#0d0d1a → #0f3460`) |
| `tiktok-ai-avatar/src/components/HookBadge.tsx` | Create | `MADE WITH AI 🤖` badge — slides in from top at frame 0 |
| `tiktok-ai-avatar/src/components/AvatarVideo.tsx` | Create | Wraps D-ID `avatar-video.mp4` — fades in at frame 15 |
| `tiktok-ai-avatar/src/lib/captions.ts` | Create | Caption lines array with `{ text, startFrame, endFrame }` |
| `tiktok-ai-avatar/src/components/Captions.tsx` | Create | Renders active caption line, fades in per line |
| `tiktok-ai-avatar/src/components/CTAButton.tsx` | Create | Springy entrance at frame 300, continuous scale pulse |
| `tiktok-ai-avatar/public/avatar-video.mp4` | Drop in (manual) | D-ID output — creator places this after D-ID step |
| `assets/voice.mp3` | Generated (Task 1) | Extracted audio uploaded to D-ID |
| `assets/avatar.jpg` | Generated (Task 1) | HEIC → JPEG for D-ID upload |

---

## Task 1: Prepare Assets for D-ID

**Files:**
- Create: `assets/voice.mp3` (FFmpeg output)
- Create: `assets/avatar.jpg` (sips conversion)

> These files are uploaded to D-ID manually. They are NOT committed to git.

- [ ] **Step 1: Extract audio from the voice MOV**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
mkdir -p assets
ffmpeg -i "/Users/devishlaroiya/Downloads/IMG_1795.MOV" \
  -vn -acodec libmp3lame -q:a 2 \
  assets/voice.mp3
```

Expected output ends with: `size=... time=00:00:04.6... bitrate=...`

> **Important:** This clip is only ~4.6 seconds. The full script is ~12 seconds. Before uploading to D-ID, you have two options:
> - **Option A (recommended):** Record a new voice clip saying the full script and replace `assets/voice.mp3`
> - **Option B:** In D-ID Studio, use the script text with D-ID's built-in TTS — use this clip only as a voice style reference

- [ ] **Step 2: Convert the HEIC photo to JPEG**

```bash
sips -s format jpeg \
  "/Users/devishlaroiya/Downloads/IMG_1276.HEIC" \
  --out assets/avatar.jpg
```

Expected output: `/Users/devishlaroiya/Downloads/IMG_1276.HEIC` then `assets/avatar.jpg`

- [ ] **Step 3: Verify both files exist**

```bash
ls -lh assets/
```

Expected:
```
-rw-r--r--  ...  avatar.jpg
-rw-r--r--  ...  voice.mp3
```

- [ ] **Step 4: Add assets/ to .gitignore (large binary files)**

Open `.gitignore` and add:
```
assets/
tiktok-ai-avatar/public/avatar-video.mp4
```

- [ ] **Step 5: Commit the gitignore update**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add .gitignore
git commit -m "chore: ignore tiktok avatar binary assets"
```

---

## Task 2: Scaffold the Remotion Project

**Files:**
- Create: entire `tiktok-ai-avatar/` directory

- [ ] **Step 1: Scaffold with create-video**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
npx create-video@latest --yes --blank --no-tailwind tiktok-ai-avatar
```

Expected: directory `tiktok-ai-avatar/` created with `src/`, `public/`, `package.json`, etc.

- [ ] **Step 2: Install dependencies and verify studio starts**

```bash
cd tiktok-ai-avatar
npm install
npx remotion studio &
sleep 5
kill %1
```

Expected: no errors, studio starts (we kill it immediately — just checking it boots).

- [ ] **Step 3: Create the public placeholder**

```bash
mkdir -p public
touch public/.gitkeep
```

This keeps `public/` in git so teammates know where to drop `avatar-video.mp4`.

- [ ] **Step 4: Create the components and lib directories**

```bash
mkdir -p src/components src/lib
```

- [ ] **Step 5: Commit the scaffold**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add tiktok-ai-avatar/
git commit -m "feat: scaffold tiktok-ai-avatar Remotion project"
```

---

## Task 3: Configure Root and Entry Point

**Files:**
- Replace: `tiktok-ai-avatar/src/index.ts`
- Replace: `tiktok-ai-avatar/src/Root.tsx`

- [ ] **Step 1: Replace index.ts**

Write the following to `tiktok-ai-avatar/src/index.ts` (overwrite entirely):

```ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

- [ ] **Step 2: Replace Root.tsx**

Write the following to `tiktok-ai-avatar/src/Root.tsx` (overwrite entirely):

```tsx
import { Composition } from "remotion";
import { TikTokAIAvatar } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TikTokAIAvatar"
      component={TikTokAIAvatar}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar"
npx tsc --noEmit
```

Expected: no errors (Composition.tsx doesn't exist yet — that's fine, tsc may warn but not error on missing module if tsconfig is lenient. If it errors, proceed to Task 4 first then re-run).

- [ ] **Step 4: Commit**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add tiktok-ai-avatar/src/index.ts tiktok-ai-avatar/src/Root.tsx
git commit -m "feat: configure TikTokAIAvatar composition (1080x1920, 30fps, 450 frames)"
```

---

## Task 4: Build Background Component

**Files:**
- Create: `tiktok-ai-avatar/src/components/Background.tsx`

- [ ] **Step 1: Create Background.tsx**

```tsx
import { AbsoluteFill } from "remotion";

export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0d0d1a 0%, #0f3460 100%)",
      }}
    />
  );
};
```

- [ ] **Step 2: Create a minimal Composition.tsx so the studio can render**

Write the following to `tiktok-ai-avatar/src/Composition.tsx`:

```tsx
import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";

export const TikTokAIAvatar: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Render a still to verify background renders**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar"
npx remotion still TikTokAIAvatar --scale=0.25 --frame=0 out/check-background.png
```

Expected: `out/check-background.png` created. Open it:

```bash
open out/check-background.png
```

Expected: 270×480 image (1080×1920 at 0.25 scale) showing a dark navy-to-blue gradient. No errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add tiktok-ai-avatar/src/components/Background.tsx tiktok-ai-avatar/src/Composition.tsx
git commit -m "feat: add Background component — dark gradient fill"
```

---

## Task 5: Build HookBadge Component

**Files:**
- Create: `tiktok-ai-avatar/src/components/HookBadge.tsx`
- Modify: `tiktok-ai-avatar/src/Composition.tsx`

- [ ] **Step 1: Create HookBadge.tsx**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

export const HookBadge: React.FC = () => {
  const frame = useCurrentFrame();

  const translateY = interpolate(frame, [0, 15], [-80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 100,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          background: "rgba(78, 205, 196, 0.15)",
          border: "2px solid #4ecdc4",
          borderRadius: 50,
          padding: "18px 48px",
          color: "#4ecdc4",
          fontFamily: "sans-serif",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
          whiteSpace: "nowrap" as const,
        }}
      >
        MADE WITH AI 🤖
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Add HookBadge to Composition.tsx**

Replace `tiktok-ai-avatar/src/Composition.tsx` entirely:

```tsx
import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { HookBadge } from "./components/HookBadge";

export const TikTokAIAvatar: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <HookBadge />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Render stills at frame 0 and frame 15 to verify animation**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar"
npx remotion still TikTokAIAvatar --scale=0.25 --frame=0 out/check-badge-0.png
npx remotion still TikTokAIAvatar --scale=0.25 --frame=15 out/check-badge-15.png
open out/check-badge-0.png out/check-badge-15.png
```

Expected:
- `check-badge-0.png`: badge invisible or partially off-screen at the top
- `check-badge-15.png`: teal badge fully visible at the top, centred

- [ ] **Step 4: Commit**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add tiktok-ai-avatar/src/components/HookBadge.tsx tiktok-ai-avatar/src/Composition.tsx
git commit -m "feat: add HookBadge — slide-in from top with teal glow"
```

---

## Task 6: Build AvatarVideo Component

**Files:**
- Create: `tiktok-ai-avatar/src/components/AvatarVideo.tsx`
- Modify: `tiktok-ai-avatar/src/Composition.tsx`

> `public/avatar-video.mp4` won't exist yet at build time — Remotion will show a blank area in Studio. That's expected. The component will work once the D-ID video is dropped in.

- [ ] **Step 1: Create AvatarVideo.tsx**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, Video, staticFile } from "remotion";

export const AvatarVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          width: 800,
          height: 1000,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(78, 205, 196, 0.12)",
        }}
      >
        <Video
          src={staticFile("avatar-video.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Add AvatarVideo to Composition.tsx**

Replace `tiktok-ai-avatar/src/Composition.tsx` entirely:

```tsx
import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { HookBadge } from "./components/HookBadge";
import { AvatarVideo } from "./components/AvatarVideo";

export const TikTokAIAvatar: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <AvatarVideo />
      <HookBadge />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add tiktok-ai-avatar/src/components/AvatarVideo.tsx tiktok-ai-avatar/src/Composition.tsx
git commit -m "feat: add AvatarVideo — fades in D-ID clip at frame 15"
```

---

## Task 7: Build Caption Data and Captions Component

**Files:**
- Create: `tiktok-ai-avatar/src/lib/captions.ts`
- Create: `tiktok-ai-avatar/src/components/Captions.tsx`
- Modify: `tiktok-ai-avatar/src/Composition.tsx`

- [ ] **Step 1: Create lib/captions.ts**

```ts
export interface CaptionLine {
  text: string;
  startFrame: number;
  endFrame: number;
}

// Timings are based on 30fps. Adjust startFrame/endFrame after
// receiving the D-ID video to match the actual speech timing.
export const CAPTION_LINES: CaptionLine[] = [
  { text: "If you want to know how I made this", startFrame: 30, endFrame: 120 },
  { text: "video entirely with AI —", startFrame: 120, endFrame: 180 },
  { text: "my voice, my avatar, everything —", startFrame: 180, endFrame: 270 },
  { text: "give it a like and follow.", startFrame: 270, endFrame: 330 },
  { text: "I'll show you exactly how.", startFrame: 330, endFrame: 390 },
];
```

- [ ] **Step 2: Create Captions.tsx**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { CAPTION_LINES } from "../lib/captions";

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();

  const activeLine = CAPTION_LINES.find(
    (line) => frame >= line.startFrame && frame < line.endFrame
  ) ?? null;

  if (!activeLine) return null;

  const opacity = interpolate(
    frame,
    [activeLine.startFrame, activeLine.startFrame + 8],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 300,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          background: "rgba(0, 0, 0, 0.65)",
          borderRadius: 16,
          padding: "20px 48px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          fontSize: 48,
          fontWeight: 500,
          lineHeight: 1.4,
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        {activeLine.text}
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Add Captions to Composition.tsx**

Replace `tiktok-ai-avatar/src/Composition.tsx` entirely:

```tsx
import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { HookBadge } from "./components/HookBadge";
import { AvatarVideo } from "./components/AvatarVideo";
import { Captions } from "./components/Captions";

export const TikTokAIAvatar: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <AvatarVideo />
      <HookBadge />
      <Captions />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 4: Render a still at frame 75 to verify a caption line appears**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar"
npx remotion still TikTokAIAvatar --scale=0.25 --frame=75 out/check-caption.png
open out/check-caption.png
```

Expected: caption text `"If you want to know how I made this"` visible in white pill near the bottom of the frame.

- [ ] **Step 5: Commit**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add tiktok-ai-avatar/src/lib/captions.ts tiktok-ai-avatar/src/components/Captions.tsx tiktok-ai-avatar/src/Composition.tsx
git commit -m "feat: add Captions component — line-by-line fade-in from captions data"
```

---

## Task 8: Build CTAButton Component

**Files:**
- Create: `tiktok-ai-avatar/src/components/CTAButton.tsx`
- Modify: `tiktok-ai-avatar/src/Composition.tsx`

- [ ] **Step 1: Create CTAButton.tsx**

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

export const CTAButton: React.FC = () => {
  const frame = useCurrentFrame();

  // Springy entrance: frame 300 → 330
  const entranceScale = interpolate(frame, [300, 330], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });

  const entranceOpacity = interpolate(frame, [300, 318], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Continuous pulse after entrance: oscillates every 30 frames
  const pulseFrame = Math.max(0, frame - 330) % 30;
  const pulseScale = interpolate(pulseFrame, [0, 15, 30], [1, 1.06, 1], {
    extrapolateRight: "clamp",
  });

  const scale = frame < 330 ? entranceScale : pulseScale;
  const opacity = entranceOpacity;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 140,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          background: "#e94560",
          borderRadius: 60,
          padding: "32px 96px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        ❤️ Like & Follow
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Assemble final Composition.tsx (must be done before renders so CTAButton is included)**

Replace `tiktok-ai-avatar/src/Composition.tsx` entirely with the complete version:

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { HookBadge } from "./components/HookBadge";
import { AvatarVideo } from "./components/AvatarVideo";
import { Captions } from "./components/Captions";
import { CTAButton } from "./components/CTAButton";

export const TikTokAIAvatar: React.FC = () => {
  const frame = useCurrentFrame();

  // Global fade-out: frame 420 → 450
  const globalOpacity = interpolate(frame, [420, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      <Background />
      <AvatarVideo />
      <HookBadge />
      <Captions />
      <CTAButton />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Render a still at frame 315 to verify CTA entrance animation mid-spring**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar"
npx remotion still TikTokAIAvatar --scale=0.25 --frame=315 out/check-cta-entrance.png
open out/check-cta-entrance.png
```

Expected: red CTA button partially scaled in (mid-spring), visible but not yet full size.

- [ ] **Step 4: Render a still at frame 345 to verify pulse is active**

```bash
npx remotion still TikTokAIAvatar --scale=0.25 --frame=345 out/check-cta-pulse.png
open out/check-cta-pulse.png
```

Expected: red CTA button fully visible, slightly larger than normal (pulse peak = 15 frames into the cycle).

- [ ] **Step 5: Commit**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add tiktok-ai-avatar/src/components/CTAButton.tsx tiktok-ai-avatar/src/Composition.tsx
git commit -m "feat: add CTAButton + global fade-out — composition complete"
```

---

## Task 9: Full Verification

**Files:** No new files — verification only.

- [ ] **Step 1: TypeScript compile check**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar"
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Render key frames across the full timeline**

```bash
npx remotion still TikTokAIAvatar --scale=0.25 --frame=0   out/verify-0.png
npx remotion still TikTokAIAvatar --scale=0.25 --frame=15  out/verify-15.png
npx remotion still TikTokAIAvatar --scale=0.25 --frame=75  out/verify-75.png
npx remotion still TikTokAIAvatar --scale=0.25 --frame=200 out/verify-200.png
npx remotion still TikTokAIAvatar --scale=0.25 --frame=315 out/verify-315.png
npx remotion still TikTokAIAvatar --scale=0.25 --frame=360 out/verify-360.png
npx remotion still TikTokAIAvatar --scale=0.25 --frame=435 out/verify-435.png
open out/verify-*.png
```

| Frame | What to check |
|-------|--------------|
| 0 | Dark gradient only — badge not yet visible |
| 15 | Badge fully in, avatar area dark (no video yet) |
| 75 | First caption line visible |
| 200 | Third caption line, badge still showing |
| 315 | CTA button mid-spring entrance |
| 360 | CTA pulsing, last caption |
| 435 | Global fade-out — frame mostly dark |

- [ ] **Step 3: Open Remotion Studio for a full scrub-through**

```bash
npx remotion studio
```

Scrub through all 450 frames. Verify:
- Badge slides in smoothly
- Avatar area is dark/blank (video not yet present — expected)
- Captions switch correctly at each `startFrame`
- CTA button has springy entrance then gentle pulse
- Frame 420+ fades out

Close Studio when done.

- [ ] **Step 4: Final commit and push**

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects"
export PATH="/opt/homebrew/bin:$PATH"
git add tiktok-ai-avatar/
git commit -m "feat: complete tiktok-ai-avatar Remotion project

All components built: Background, HookBadge, AvatarVideo, Captions, CTAButton.
Awaiting D-ID avatar-video.mp4 in public/ to complete the video.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
```

---

## Task 10: D-ID Integration (Manual — Creator Does This)

> This task is done by the creator in the D-ID web UI. No code changes required.

- [ ] **Step 1:** Sign up at [studio.d-id.com](https://studio.d-id.com) (free 14-day trial)
- [ ] **Step 2:** Click **"Create Video"** → **"Talking Photo"**
- [ ] **Step 3:** Upload `assets/avatar.jpg` as the presenter photo
- [ ] **Step 4:** In the audio section, select **"Upload audio"** and upload `assets/voice.mp3`
  - If the clip is too short for the script: switch to **"Text to Speech"**, paste the script, and set voice to match your sample
- [ ] **Step 5:** Click **Generate** — wait 1–3 minutes
- [ ] **Step 6:** Download the result and save it as:
  ```
  tiktok-ai-avatar/public/avatar-video.mp4
  ```
- [ ] **Step 7:** Open Remotion Studio and scrub through to verify the avatar video plays in the frame:
  ```bash
  cd "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar"
  npx remotion studio
  ```
- [ ] **Step 8:** Adjust caption timings in `src/lib/captions.ts` if the speech timing differs from the defaults
- [ ] **Step 9:** Render the final video:
  ```bash
  npx remotion render TikTokAIAvatar out/tiktok-ai-avatar.mp4
  ```
  Expected: `out/tiktok-ai-avatar.mp4` — 1080×1920, ~15 seconds, ready to post.
