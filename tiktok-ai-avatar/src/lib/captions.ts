export interface CaptionLine {
  text: string;
  startFrame: number;
  endFrame: number;
}

// Timings tuned to D-ID video duration (9.8s = ~294 frames at 30fps).
// Fine-tune in Remotion Studio if captions feel early or late.
export const CAPTION_LINES: CaptionLine[] = [
  { text: "If you want to know how I made this", startFrame: 15, endFrame: 120 },
  { text: "video entirely with AI —", startFrame: 120, endFrame: 165 },
  { text: "my voice, my avatar, everything —", startFrame: 165, endFrame: 225 },
  { text: "give it a like and follow.", startFrame: 225, endFrame: 279 },
  { text: "I'll show you exactly how.", startFrame: 279, endFrame: 309 },
];
