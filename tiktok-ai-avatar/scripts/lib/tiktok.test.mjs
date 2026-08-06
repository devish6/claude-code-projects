import { describe, expect, test } from "vitest";

import {
  NOTE_TITLE,
  PASTE_RULE,
  captionNoteHtml,
  SINGLE_CHUNK_MAX,
  authorizeUrl,
  buildCaptionSheet,
  buildTikTokCaption,
  chunkPlan,
  publishState,
  uploadHeaders,
  validateTikTokVideo,
} from "./tiktok.mjs";

const entry = {
  v: "V17",
  title: "Birth Vs Destiny In 15 Seconds",
  tiktokCaption: "Birth vs destiny — not the same number.",
  instagramCaption: "Birth vs destiny.",
  hashtags: ["#numerology", "#birthnumber"],
  utmLinks: {
    tiktok: "https://numevix.com/tarot?utm_source=tiktok&utm_content=V17",
    instagram: "https://numevix.com/tarot?utm_source=instagram&utm_content=V17",
  },
};

describe("authorizeUrl", () => {
  const args = {
    clientKey: "awxyz",
    redirectUri: "https://devish6.github.io/claude-code-projects/tiktok-auth.html",
    state: "abc123",
  };

  test("asks for exactly the two scopes the app declares", () => {
    const url = new URL(authorizeUrl(args));

    expect(url.searchParams.get("scope")).toBe("user.info.basic,video.upload");
  });

  /**
   * video.publish is direct-to-feed and needs TikTok's audit. Requesting it
   * here would fail authorization against an app that never asked for it.
   */
  test("never requests video.publish", () => {
    expect(authorizeUrl(args)).not.toContain("video.publish");
  });

  test("carries the redirect and the state through", () => {
    const url = new URL(authorizeUrl(args));

    expect(url.searchParams.get("redirect_uri")).toBe(args.redirectUri);
    expect(url.searchParams.get("state")).toBe("abc123");
  });

  /**
   * The callback page is public and static, so state is the ONLY thing tying
   * a returned code to the request we started. Building a URL without it
   * would silently remove the check.
   */
  test("refuses to build a URL with no state", () => {
    expect(() => authorizeUrl({ ...args, state: "" })).toThrow(/state/i);
  });
});

describe("chunkPlan", () => {
  /**
   * A video under the ceiling must declare ONE chunk that is the whole file.
   * Declaring a smaller chunk_size with a count passes init and then fails
   * during upload with a size mismatch.
   */
  test("sends a small video as a single whole-file chunk", () => {
    expect(chunkPlan(8_000_000)).toEqual({
      video_size: 8_000_000,
      chunk_size: 8_000_000,
      total_chunk_count: 1,
    });
  });

  test("refuses a file past the single-chunk ceiling rather than mis-declaring it", () => {
    expect(() => chunkPlan(SINGLE_CHUNK_MAX + 1)).toThrow(/single-chunk/i);
  });

  test("rejects a nonsense size instead of sending it", () => {
    expect(() => chunkPlan(0)).toThrow();
    expect(() => chunkPlan(-1)).toThrow();
    expect(() => chunkPlan(1.5)).toThrow();
  });
});

describe("uploadHeaders", () => {
  /** Content-Range is inclusive, so a 100-byte file ends at index 99. */
  test("describes the byte range inclusively", () => {
    expect(uploadHeaders(100)["Content-Range"]).toBe("bytes 0-99/100");
  });

  test("declares the length and the mp4 type", () => {
    const h = uploadHeaders(100);

    expect(h["Content-Length"]).toBe("100");
    expect(h["Content-Type"]).toBe("video/mp4");
  });
});

describe("validateTikTokVideo", () => {
  test("accepts the durations this pipeline produces", () => {
    for (const seconds of [14.2, 19.6, 23.4, 27.8]) {
      expect(() => validateTikTokVideo({ seconds, width: 1080, height: 1920 })).not.toThrow();
    }
  });

  test("rejects landscape", () => {
    expect(() => validateTikTokVideo({ seconds: 20, width: 1920, height: 1080 })).toThrow(
      /vertical/i,
    );
  });

  test("rejects a clip shorter than TikTok allows", () => {
    expect(() => validateTikTokVideo({ seconds: 2, width: 1080, height: 1920 })).toThrow(/3/);
  });
});

describe("publishState", () => {
  /**
   * ⭐ For an inbox upload SEND_TO_USER_INBOX is the SUCCESS terminal, not a
   * waypoint. Reading it as "still processing" would poll to timeout on a
   * video that had already landed in drafts.
   */
  test("treats reaching the inbox as success", () => {
    expect(publishState({ data: { status: "SEND_TO_USER_INBOX" } })).toEqual({
      done: true,
      ok: true,
    });
  });

  test("treats a completed direct post as success too", () => {
    expect(publishState({ data: { status: "PUBLISH_COMPLETE" } }).ok).toBe(true);
  });

  test("keeps polling while it is still uploading", () => {
    expect(publishState({ data: { status: "PROCESSING_UPLOAD" } })).toEqual({
      done: false,
      ok: false,
    });
  });

  test("treats a failure as terminal and surfaces why", () => {
    const state = publishState({
      data: { status: "FAILED", fail_reason: "video_format_unsupported" },
    });

    expect(state.done).toBe(true);
    expect(state.ok).toBe(false);
    expect(state.reason).toMatch(/format/);
  });
});

describe("buildTikTokCaption", () => {
  /** TikTok does not linkify caption URLs either — same reasoning as Meta. */
  test("says link in bio rather than printing a URL", () => {
    const caption = buildTikTokCaption(entry);

    expect(caption).toContain("Link in bio");
    expect(caption).not.toMatch(/https?:\/\//);
  });

  test("prefers the TikTok caption over the Instagram one", () => {
    expect(buildTikTokCaption(entry)).toContain("not the same number");
  });

  test("refuses a video with no TikTok link", () => {
    expect(() => buildTikTokCaption({ ...entry, utmLinks: {} })).toThrow(/utm/i);
  });

  test("includes the hashtags", () => {
    expect(buildTikTokCaption(entry)).toContain("#numerology");
  });
});

/**
 * ⭐ The sheet is read by a person on a phone, mid-publish, and overwritten
 * every run. The only failure that matters is pasting yesterday's caption onto
 * today's post, so these assert the two things that prevent it: the sheet names
 * WHICH video it is for, and the pasteable text is unambiguously delimited.
 */
describe("caption sheet", () => {
  const at = new Date("2026-08-06T16:00:00Z"); // 12:00 ET

  test("names the video it belongs to, so a stale file is obvious", () => {
    const sheet = buildCaptionSheet({ entry, caption: "x", at });
    expect(sheet).toContain("V17");
    expect(sheet).toContain("Birth Vs Destiny In 15 Seconds");
  });

  test("stamps the time in ET, not UTC and not the machine's guess", () => {
    // 16:00 UTC is 12:00 in Toronto — the slot this actually runs in. A UTC
    // stamp would read 16:00 and look like a different post four hours later.
    const sheet = buildCaptionSheet({ entry, caption: "x", at });
    expect(sheet).toMatch(/12:00/);
    expect(sheet).toContain("2026");
  });

  test("delimits exactly what to paste, and nothing else", () => {
    const caption = buildTikTokCaption(entry);
    const sheet = buildCaptionSheet({ entry, caption, at });
    const between = sheet.split(PASTE_RULE)[1];
    expect(between.trim()).toBe(caption.trim());
  });

  test("carries the real caption verbatim, footer and hashtags included", () => {
    const caption = buildTikTokCaption(entry);
    expect(buildCaptionSheet({ entry, caption, at })).toContain(caption);
  });
});

/**
 * ⭐ Notes takes HTML, not text. Newlines in a plain string are collapsed, so a
 * caption sent raw arrives as one unbroken paragraph — technically delivered
 * and useless to paste.
 */
describe("caption note html", () => {
  const at = new Date("2026-08-06T16:00:00Z");

  test("gives every line its own block so the caption survives", () => {
    const html = captionNoteHtml("one\ntwo\nthree");
    expect(html).toBe("<div>one</div><div>two</div><div>three</div>");
  });

  test("keeps blank lines, which separate the caption's paragraphs", () => {
    expect(captionNoteHtml("a\n\nb")).toContain("<div><br></div>");
  });

  test("escapes html so a caption cannot inject markup into the note", () => {
    const html = captionNoteHtml("5 < 8 & <b>bold</b>");
    expect(html).toContain("&lt;");
    expect(html).toContain("&amp;");
    expect(html).not.toContain("<b>");
  });

  /**
   * 🪤 The note is found BY NAME every run, and Notes takes that name from the
   * first line of the body. If the sheet's first line ever stops matching
   * NOTE_TITLE, the lookup misses and a second note is created every day.
   */
  test("opens on the exact line the note is looked up by", () => {
    const sheet = buildCaptionSheet({ entry, caption: "x", at });
    expect(sheet.split("\n")[0]).toBe(NOTE_TITLE);
  });
});
