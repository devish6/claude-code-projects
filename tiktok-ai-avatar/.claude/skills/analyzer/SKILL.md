---
name: analyzer
description: Use when reading how Numevix content actually performed - per-post reach, watch time, retention, or comparing a post against the account's own baseline. Also use before proposing any content change, to establish the baseline the change will be measured against.
---

# Analyzer

**The only role that touches reality. It never authors and never scores — it reports measurements.**

## Inward: our own numbers

Two routes to the same analysis. Both hand rows to `scripts/lib/windsor.mjs`.

1. **In session (preferred):** the Windsor MCP. No API key at all.
   `ToolSearch("select:mcp__claude_ai_Windsor_ai__get_fields,mcp__claude_ai_Windsor_ai__get_data")`
   🪤 `get_data` rejects guessed field names — **call `get_fields` first, it is not optional.**
2. **Unattended:** `npm run analyze:reach`, which reads the key from
   `~/.numevix-publish/credentials.json`.

Account `17841425392432041` ("numevix").

### Rules

- ⭐ **Always report against the account's own baseline**, never as an absolute.
  Use `describeAgainstBaseline`. "V29 reached 228" is not a reading; "228 against
  a 171 baseline" is.
- 🪤 **Watch time is in MILLISECONDS.** Use `msToSeconds`, never the raw field.
- 🔴 **There is no duration field.** Duration comes from `durations.json`
  (`scripts/lib/duration.mjs`). Any completion-percentage claim must state its `n`.
- 🪤 **The ledger records what we REQUESTED, not what happened.** `"privacy":
  "public"` is our own input echoed back. Ask the platform.
- 🪤 **Never read `launchctl`'s `runs` counter** — it resets on reload. Read the ledgers.
- ⭐⭐ **The owner's dashboards are the instrument.** `collect-metrics` under-reads,
  and the owner has twice found bugs that hundreds of green tests missed. When a
  number matters, verify against the real thing.

### Settled — do not re-run these

- **The ≥6s watch-time rule is confounded with era.** Before 07-28 it meant median
  reach 1,487; after, 248, with 0 of 16 posts over 1,000 — including 11.4s→498.
- **The Instagram upload route is ruled out.** 07-28/29/30 were hand-posted and
  already dead; the first publisher post is 07-31.
- **The break is after 07-24**, not 07-28. The last post over 1,000 reach is 07-24.
- **Six of the eight all-time winners fall on 07-16 and 07-17.** Read the clusters
  (`findWinnerClusters`), not just the era medians.
- **On YouTube, API upload gets zero feed distribution** (n=7, max 3 views). That
  is a YouTube/Facebook finding — Instagram is unaffected.

## Outward: the niche

Drives Chrome to study numerology and spirituality accounts. Reports what is
winning: opening structures, lengths, formats, caption mechanics.

- ⭐⭐ **Same-account control, always** (`sameAccountLift` in `scripts/lib/niche.mjs`).
  Across accounts, follower count swamps the signal.
- 🪤 **Never compare posts of different ages.** A 30-day-old post against a
  3-hour-old one once produced a false "the old format won".
- 🔴 **Never lift a numerology claim from competitor copy.** Their rulesets
  disagree with ours — of the pairs popular posts cite, only 4&9 overlaps with
  our own `friendship.ts`. **Formats are copyable. Facts are not.**
- **Keyword search, not hashtags.** Hashtag browsing surfaced noise.

## The bridge

**An outward finding is a hypothesis, never a change.** It enters the loop and is
tested against our own numbers. That discipline is what talked us out of the
conflict-framed compatibility reel — and the evidence then went the other way.
