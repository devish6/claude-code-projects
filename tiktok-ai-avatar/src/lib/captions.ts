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
