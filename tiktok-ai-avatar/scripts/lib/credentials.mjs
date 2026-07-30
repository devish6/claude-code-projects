import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Publishing credentials, stored OUTSIDE this repository.
 *
 * 🔴 This repo is PUBLIC and GitHub-Pages-served. An OAuth client secret or a
 * refresh token committed here is a published secret, so the store lives in
 * the home directory at 0600 and the repo never learns its contents.
 */
export const CREDENTIALS_PATH = join(homedir(), ".numevix-publish", "credentials.json");

export const loadCredentials = (path = CREDENTIALS_PATH) => {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
};

/** Merges into the existing store, so adding TikTok never drops YouTube. */
export const saveCredentials = (patch, path = CREDENTIALS_PATH) => {
  mkdirSync(dirname(path), { recursive: true });
  const current = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};

  const merged = { ...current };
  for (const [platform, values] of Object.entries(patch)) {
    merged[platform] = { ...(current[platform] ?? {}), ...values };
  }

  writeFileSync(path, JSON.stringify(merged, null, 2) + "\n");
  chmodSync(path, 0o600);
  return merged;
};

/** Fails with instructions rather than letting the API return a bare 401. */
export const requireCredentials = (platform, path = CREDENTIALS_PATH) => {
  const stored = loadCredentials(path)?.[platform];
  if (!stored?.client_id || !stored?.client_secret) {
    throw new Error(
      `No ${platform} credentials in ${path}.\n` +
        `Run: npm run publish:youtube -- --authorize\n` +
        `That needs a client_id and client_secret from a Google Cloud OAuth client (Desktop app).`,
    );
  }
  return stored;
};
