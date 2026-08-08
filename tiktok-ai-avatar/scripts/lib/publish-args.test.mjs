import { describe, expect, test } from "vitest";
import { extraArgsFor, YOUTUBE_PRIVACY } from "./publish-args.mjs";
import { buildYouTubeMetadata } from "./youtube.mjs";

describe("publish-next per-platform arguments", () => {
  // The point of these is the EXPERIMENT, not the string. Publisher uploads get
  // no Shorts-feed distribution; private-then-hand-flip is the test that says
  // whether the publish event or the metadata is responsible. Flipping this
  // back to public silently ends the experiment and restores a 2-view outcome.
  test("youtube uploads go out PRIVATE while the feed experiment runs", () => {
    expect(YOUTUBE_PRIVACY).toBe("private");
    expect(extraArgsFor("youtube")).toEqual(["--privacy=private"]);
  });

  test("the value is one YouTube actually accepts", () => {
    expect(
      buildYouTubeMetadata(
        {
          v: "M1R",
          title: "Moolank 1",
          tiktokCaption: "body",
          utmLinks: { youtube: "https://numevix.com/?utm_source=youtube" },
        },
        { privacy: YOUTUBE_PRIVACY },
      ).status.privacyStatus,
    ).toBe("private");
  });

  test("no other platform is handed a privacy flag", () => {
    for (const p of ["facebook", "tiktok", "instagram"]) {
      expect(extraArgsFor(p)).toEqual([]);
    }
  });
});
