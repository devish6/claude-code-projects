---
name: funnel
description: Use when working on the comment-to-DM mechanic - the caption CTA that asks for a parseable comment, classifying the comments that arrive, or building the DM queue the owner fulfils by hand. Also use when comment rate is the problem.
---

# Funnel

**The engine, not the content.** seb.ai's carousel took 3.2K likes and **6.4K
comments**, each one the word "Team" with an auto-reply. The 7 agents were what
the post was *about*. The funnel was what made it move.

## Status

🔴 **Meta App Review submitted 2026-08-08. Up to 20 days. It cannot be edited or
cancelled.** Until it lands, the whole comment → reply → DM flow is fulfilled
**by hand**, and that is the plan of record.

**On approval day:** swap Vercel's `META_PAGE_ACCESS_TOKEN` — it is still the old
scope-less publisher token — and redeploy, or the first real webhook fails on scope.

## Build the queue

```
npm run funnel:queue < comments.json
```

Pull comments with the Windsor MCP (`get_fields` first, then `get_data` on
`comment_id`, `comment_text`, `comment_timestamp`, `media_id`). The script sends
nothing.

## Rules

- ⭐ **`irrelevant` → send NOTHING is a first-class outcome, not a fallback.**
  Under the competitor post we studied, the single most-liked comment was a
  sceptic mocking the account. DMing that person is the worst available move.
- ⭐⭐ **The public "Sent you a DM" reply is load-bearing.** A non-follower's DM
  lands in Message Requests, not the Inbox — without the comment reply they may
  never see it.
- 🪤🪤 **Day/month order is a coin flip.** Moolank is the day reduced, so reading
  `05/06/1990` as the 5th rather than the 6th changes the answer. We assume DD/MM
  and **the DM asks** — *"tell me if I've got the day and month the wrong way
  round"*. **Never remove that flag to tidy the copy.**
- ⚠️ **Every DM carries the "ease, not permission" line.** Roughly two thirds of
  askers will not be on their own both-ways list and must not read it as a refusal.
- 🔴 **Every number is DERIVED** from `friendship.ts` via
  `scripts/derive-compatibility-pairs.mjs`, which exits non-zero on drift.
- **A deterministic parser, not an LLM call** — classification here is a small
  closed problem, so it can be exhaustively tested, and it is instant and free.
- ⭐ **If hand-fulfilment becomes unmanageable, that IS the success signal.**
