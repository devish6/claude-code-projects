# TikTok AI Avatar Video — Design Spec
**Date:** 2026-05-26  
**Project:** `tiktok-ai-avatar` (new Remotion project in the monorepo)  
**Status:** Approved

---

## 1. Overview

A TikTok-format short video (9:16) where the creator's AI-generated talking head delivers a single hook line, asking viewers to like and follow to learn how the video was made entirely with AI. The video itself is the proof of concept — the medium is the message.

---

## 2. Script

> *"If you want to know how I made this video entirely with AI — my voice, my avatar, everything — give it a like and follow. I'll show you exactly how."*

Approximate duration: **12–13 seconds** of speech.

---

## 3. Pipeline

The video is produced in three stages. Two of these (audio extraction and Remotion assembly) are handled in this codebase. The D-ID step is manual and done once by the creator.

### Stage 1 — Audio Extraction (FFmpeg, automated)
- Input: `IMG_1795.MOV` (creator's voice recording)
- Output: `voice.mp3` (extracted AAC audio, ~4.6s)
- Command: `ffmpeg -i IMG_1795.MOV -vn -acodec mp3 voice.mp3`
- **Note:** The raw voice clip is ~4.6s — shorter than the full script. The creator may need to re-record a longer clip covering the full script, or D-ID can use this as a voice reference with text-to-speech synthesis.

### Stage 2 — Talking Head Generation (D-ID, manual)
- Creator signs up at [studio.d-id.com](https://studio.d-id.com) (free 14-day trial)
- Uploads: `avatar.jpg` (converted from `IMG_1276.HEIC`) + `voice.mp3`
- D-ID animates the photo with the audio, generating a lip-synced talking head video
- Output: `avatar-video.mp4` — creator downloads and places in `tiktok-ai-avatar/public/`

### Stage 3 — Remotion Composition (automated)
- Remotion wraps `avatar-video.mp4` with animated overlays
- Output: final `tiktok-ai-avatar.mp4` (1080×1920, 30fps, ~15s)

---

## 4. Composition Spec

| Property | Value |
|----------|-------|
| Width | 1080px |
| Height | 1920px |
| FPS | 30 |
| Total duration | 450 frames (~15s) |
| Composition ID | `TikTokAIAvatar` |

### Scene Breakdown

| Frame range | Time | Element | Animation |
|-------------|------|---------|-----------|
| 0–15 | 0–0.5s | Hook badge enters | Slide down from top + fade in |
| 15–30 | 0.5–1s | Avatar video starts | Fade in |
| 30–360 | 1–12s | Captions | Line-by-line fade in, synced to speech |
| 300–420 | 10–14s | CTA button | Springy scale-in + continuous pulse |
| 420–450 | 14–15s | Full frame | Soft fade out |

---

## 5. Visual Design

### Colour Palette
| Token | Value | Use |
|-------|-------|-----|
| `bg-top` | `#0d0d1a` | Background gradient top |
| `bg-bottom` | `#0f3460` | Background gradient bottom |
| `accent-teal` | `#4ecdc4` | Hook badge text + border |
| `accent-red` | `#e94560` | CTA button |
| `caption-bg` | `rgba(0,0,0,0.65)` | Caption pill background |
| `caption-text` | `#ffffff` | Caption text |

### Typography
- Hook badge: uppercase, bold, letter-spacing 1.5px, 28px
- Captions: medium weight, 48px, line-height 1.4
- CTA: bold, 52px

### Animations
- All animations use `interpolate()` + `useCurrentFrame()` — no CSS transitions
- Spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` for CTA pulse
- Easing for fade-ins: `Easing.bezier(0.16, 1, 0.3, 1)`

---

## 6. Component Architecture

```
tiktok-ai-avatar/
├── public/
│   └── avatar-video.mp4        ← dropped in by creator after D-ID
├── src/
│   ├── index.ts                ← Remotion entry
│   ├── Root.tsx                ← registers TikTokAIAvatar composition
│   ├── Composition.tsx         ← orchestrates all sequences
│   ├── components/
│   │   ├── Background.tsx      ← dark gradient fill (AbsoluteFill)
│   │   ├── HookBadge.tsx       ← "MADE WITH AI 🤖" animated badge
│   │   ├── AvatarVideo.tsx     ← <Video> component wrapping avatar-video.mp4
│   │   ├── Captions.tsx        ← line-by-line caption reveal
│   │   └── CTAButton.tsx       ← pulsing ❤️ Like & Follow button
│   └── lib/
│       └── captions.ts         ← caption lines + frame timings
```

### Component responsibilities

**`Background.tsx`**  
Full-screen dark gradient. No interactivity. Static.

**`HookBadge.tsx`**  
Teal pill badge reading `MADE WITH AI 🤖`. Slides in from top at frame 0, settles at frame 15. Stays visible for the full duration.

**`AvatarVideo.tsx`**  
Wraps Remotion's `<Video>` component pointing at `staticFile("avatar-video.mp4")`. Centered horizontally, positioned in the middle third of the vertical frame. Fade-in from frame 15–30.

**`Captions.tsx`**  
Receives an array of `{ text, startFrame, endFrame }` caption lines from `lib/captions.ts`. Each line fades in at its `startFrame` and fades out at `endFrame`. Positioned in the lower-middle of the frame above the CTA.

**`CTAButton.tsx`**  
Red `❤️ Like & Follow` button. Springy entrance at frame 300, then a continuous gentle scale pulse (1.0 → 1.05 → 1.0 every 30 frames).

---

## 7. Caption Timings

Based on the script, approximate line splits (to be adjusted after D-ID video is generated):

| Line | Text | Start frame | End frame |
|------|------|-------------|-----------|
| 1 | "If you want to know how I made this" | 30 | 120 |
| 2 | "video entirely with AI —" | 120 | 180 |
| 3 | "my voice, my avatar, everything —" | 180 | 270 |
| 4 | "give it a like and follow." | 270 | 330 |
| 5 | "I'll show you exactly how." | 330 | 390 |

---

## 8. Assets

| File | Source | Destination |
|------|--------|-------------|
| `IMG_1795.MOV` | Creator's Downloads | Used for audio extraction |
| `IMG_1276.HEIC` | Creator's Downloads | Converted to `avatar.jpg` for D-ID |
| `voice.mp3` | FFmpeg output | Uploaded to D-ID |
| `avatar-video.mp4` | D-ID output | `tiktok-ai-avatar/public/` |

---

## 9. Out of Scope

- ElevenLabs voice cloning (using raw voice directly)
- HeyGen (using D-ID instead)
- Captions auto-sync from audio (manual timing in `lib/captions.ts`)
- Rendering/publishing pipeline (creator runs `npx remotion render` manually)
- Music/background audio (voice only)
