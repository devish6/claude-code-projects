import { mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { loadCredentials, requireCredentials, saveCredentials } from "./credentials.mjs";

const tmpStore = () => join(mkdtempSync(join(tmpdir(), "numevix-cred-")), "credentials.json");

describe("credentials", () => {
  test("returns null when nothing has been stored yet", () => {
    expect(loadCredentials(tmpStore())).toBeNull();
  });

  test("round-trips what it stored", () => {
    const path = tmpStore();
    saveCredentials({ youtube: { client_id: "abc", client_secret: "shh" } }, path);

    expect(loadCredentials(path).youtube.client_id).toBe("abc");
  });

  /**
   * These are long-lived publishing credentials for the owner's own accounts.
   * World-readable permissions on a shared machine is how they leak.
   */
  test("writes the file readable only by its owner", () => {
    const path = tmpStore();
    saveCredentials({ youtube: { client_id: "abc" } }, path);

    expect(statSync(path).mode & 0o777).toBe(0o600);
  });

  test("merges rather than clobbering another platform's credentials", () => {
    const path = tmpStore();
    saveCredentials({ youtube: { client_id: "abc" } }, path);
    saveCredentials({ tiktok: { client_key: "xyz" } }, path);

    const stored = loadCredentials(path);
    expect(stored.youtube.client_id).toBe("abc");
    expect(stored.tiktok.client_key).toBe("xyz");
  });

  test("never writes a credential into the repository", () => {
    const path = tmpStore();
    saveCredentials({ youtube: { client_secret: "shh" } }, path);

    // The store must live outside the working tree — this repo is public and
    // GitHub-Pages-served, so a secret committed here is a published secret.
    expect(path.startsWith(process.cwd())).toBe(false);
    expect(readFileSync(path, "utf8")).toContain("shh");
  });

  test("explains exactly what is missing rather than failing at the API", () => {
    const path = tmpStore();

    expect(() => requireCredentials("youtube", path)).toThrow(/youtube/i);
    expect(() => requireCredentials("youtube", path)).toThrow(/authorize/i);
  });
});
