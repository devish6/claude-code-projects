# Installing the 6pm daily job (do this yourself -- I can't run it for you)

I built and tested the pipeline in a sandbox with no access to your Mac, so
none of this is installed yet. Three one-time steps, all on your machine.

## 1. Pull the changes

Apply the patch (or copy the raw files -- see the delivery notes) into
`/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar`, then:

```bash
cd "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar"
npm install
npm run lint        # 1 pre-existing error, unrelated to this change -- see delivery notes
npx vitest run       # should show 7/7 passing, unchanged
npm run daily:viral -- --dry-run    # preview today's picks, writes nothing
```

If the dry-run preview looks right, do a real run once by hand before trusting
the scheduler with it:

```bash
npm run daily:viral
```

This renders 3 videos into `~/Desktop/Numevix Videos/Viral/`, writes their
captions, updates `Captions.md` / `POST-ORDER.md` / `RUN-LOG.md` /
`Hook Library.md`, and commits + pushes the code/content changes (not the
MP4s). Watch all three against the Step 6 quality bar before posting.

## 2. Install the launchd job

```bash
mkdir -p ~/Library/LaunchAgents
cp "/Users/devishlaroiya/Desktop/Claude Code Projects/tiktok-ai-avatar/deploy/com.numevix.dailyviral.plist" ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.numevix.dailyviral.plist
```

That's it -- it'll fire at **22:00 local every day**, building **the NEXT
day's** batch (the job passes `--tomorrow`), and also once immediately
whenever it's loaded (at login/reboot/whenever you re-run `launchctl load`).

22:00 sits after the day's last post (21:00), so rendering never competes
with publishing, and it leaves a full night before the 09:00 slot that needs
the files. It has been 18:00 (which was a bug -- the day's videos did not
exist when the 09:00 job woke, and a Story Friday video went out on a
Saturday), then 06:00 same-day, and is now 22:00 the night before.

The run-on-load behaviour is intentional: combined with the idempotency guard
in `daily-viral.mjs` (it no-ops if that date's real batch already exists),
it's what makes a missed run catch up on next wake instead of silently
skipping, without ever double-posting.

⚠️ `--tomorrow` is not simply "today + 1". If the Mac is asleep at 22:00 and
wakes the next morning, that reading would build the day *after* the current
one and skip a day entirely. The script builds tomorrow only once today is
genuinely covered (batch exists **and** every file is on disk); otherwise it
builds today first and picks up tomorrow next run.

Logs land in `tiktok-ai-avatar/logs/daily-viral.out.log` and `.err.log`.

## Useful commands

```bash
# Check it's loaded
launchctl list | grep numevix

# Force a run right now, without waiting for 6pm
launchctl start com.numevix.dailyviral

# Re-run a specific day (e.g. to backfill a day you missed)
npm run daily:viral -- --date=2026-07-30

# Preview any day without touching anything
npm run daily:viral -- --dry-run --date=2026-08-01

# Stop the schedule
launchctl unload ~/Library/LaunchAgents/com.numevix.dailyviral.plist

# Remove it entirely
launchctl unload ~/Library/LaunchAgents/com.numevix.dailyviral.plist
rm ~/Library/LaunchAgents/com.numevix.dailyviral.plist
```

## What I could NOT verify (no Chrome/renderer, no Desktop, no git push in my sandbox)

- The actual `npx remotion render` / `remotion still` calls -- I never ran
  them. `exportOne()` in `scripts/export-viral.mjs` is a small, low-risk
  extraction of code that was already shipping V01-V06, so the render path
  itself is unchanged; what's new is that `daily-viral.mjs` now calls it in a
  loop with per-video try/catch. Worth watching the first real run's stdout.
- Writing into the real `~/Desktop/Numevix Videos/Viral/` folder (doesn't
  exist in my sandbox) -- folder/file naming was checked by reading the
  convention in `scripts/export-viral.mjs`, not by writing to a real copy of
  it.
- `git add/commit/push` from inside the script -- untested for the same
  reason. If it fails, the script logs the error and continues (state is
  still saved locally either way).
- The one pre-existing `npm run lint` error in `src/viral/components/CTAEnding.tsx`
  (`durationInFrames` unused) -- confirmed this exists on `main` before any
  of my changes (I stashed my diff and reproduced it). Not something I
  introduced; up to you whether to fix it, it doesn't block `daily:viral`
  since that only depends on `tsc` + `vitest`, both of which are clean.

Everything else -- hook copy rules, no-repeat state logic, V-numbering,
music rotation, caption generation, the weekly-plan/algorithmic day switch --
I ran directly in my sandbox (`--dry-run`, plus a one-time seed script for
V07-V09) and confirmed it behaves as designed.
