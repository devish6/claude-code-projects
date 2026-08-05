#!/usr/bin/env node
/**
 * npm run publish:next-card -- --kind=card|reel [--dry-run]
 *
 * Picks the next Moolank that has NOT been posted to Instagram in this kind,
 * and hands it to publish-card.mjs. This is the Instagram half of the schedule;
 * youtube/facebook/tiktok are served by publish-next.mjs off the queue entry
 * that queue-card-reel.mjs writes.
 *
 * ⭐ WHY A SEPARATE SCHEDULER FROM publish-next.mjs
 * publish-next walks `daily-state.json` videos and asks "which platforms is
 * this video still missing from". The card programme is the other way round:
 * one platform, and the question is "which NUMBER is still missing". Bending
 * one script around both questions meant a branch at every step — the ledger,
 * the ordering, the asset path and the duplicate guard are all different.
 *
 * 🔴 IT DELEGATES, IT DOES NOT REIMPLEMENT. publish-card.mjs already owns the
 * staging trick, the JPEG/aspect validation, the per-number-per-kind duplicate
 * guard and the ledger write. This file only decides WHICH number is next, so
 * the two can never disagree about what "already posted" means.
 *
 * 🪤 It must exit 0 when there is nothing to post. An empty queue is the normal
 * end state, not a failure, and a non-zero exit in a launchd job turns a quiet
 * no-op into a red herring in the logs.
 */
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const has = (name) => args.includes(`--${name}`);

const POST_LOG = join(homedir(), ".numevix-publish", "card-posts.json");
const log = (...a) => process.stdout.write(a.join(" ") + "\n");
const die = (m) => { process.stderr.write(m + "\n"); process.exit(1); };

/** Where a rendered asset of each kind lives. */
export const assetFor = (kind, n) =>
  kind === "reel" ? `out/reels/moolank-${n}-reel.mp4` : `out/cards/moolank-${n}.jpg`;

/**
 * The next number to post, or null when the queue is drained.
 *
 * ⭐⭐ DESCENDING, 9 DOWN TO 1 (changed 2026-08-05). It used to ascend.
 *
 * The card programme actually started at 9 and works downwards — 9 went out
 * first, then 8 — so ascending fought the running order rather than describing
 * it. It only ever looked right because 9 was the sole rendered reel: with 7
 * and 8 both rendered, ascending would have posted 7 next and skipped straight
 * past the 8 that was supposed to follow 9.
 *
 * 🪤 A NUMBER STILL COUNTS AS DONE PER `kind`, NOT OUTRIGHT. Moolank 8 has an
 * infocard on Instagram but has never had a REEL there, and the owner wants the
 * reel — so 8's card row must NOT mark 8 finished for reels. Collapsing the two
 * kinds into "this number has had its turn" is tempting now the infocard is
 * retired, and it would silently skip exactly the post being asked for.
 *
 * 🔴 The ledger's `kind` is read with a default of "card". The very first row
 * this pipeline ever wrote predates the field, and treating it as undefined
 * would re-post Moolank 8's card as though it had never gone out.
 */
export const nextNumber = ({ kind, posted, rendered }) => {
  const done = new Set(
    posted.filter((p) => (p.kind ?? "card") === kind).map((p) => p.moolank),
  );
  for (let n = 9; n >= 1; n--) {
    if (!done.has(n) && rendered.includes(n)) return n;
  }
  return null;
};

const main = () => {
  const kind = flag("kind") ?? "card";
  if (!["card", "reel"].includes(kind)) die(`--kind must be card or reel, got "${kind}"`);

  const posted = existsSync(POST_LOG) ? JSON.parse(readFileSync(POST_LOG, "utf8")) : [];
  const rendered = [];
  for (let n = 1; n <= 9; n++) {
    if (existsSync(join(ROOT, assetFor(kind, n)))) rendered.push(n);
  }

  const n = nextNumber({ kind, posted, rendered });
  if (n === null) {
    // Not a failure. Render more, or rewrite the remedies, then it resumes.
    log(`Nothing to post — every rendered ${kind} is already on Instagram.`);
    log(`  rendered: ${rendered.join(", ") || "none"}`);
    process.exit(0);
  }

  log(`Next ${kind}: Moolank ${n}  (${assetFor(kind, n)})`);

  if (has("dry-run")) {
    log("\n[DRY RUN] Handing off to publish-card would run:");
    log(`  node scripts/publish-card.mjs --n=${n}${kind === "reel" ? " --reel" : ""}`);
    process.exit(0);
  }

  execFileSync(
    "node",
    [join(ROOT, "scripts/publish-card.mjs"), `--n=${n}`, ...(kind === "reel" ? ["--reel"] : [])],
    { stdio: "inherit", cwd: ROOT },
  );
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
