# Card art provenance

## What is here

Only the **nine faces dealt for September 2026** (`content/draws/september-2026.json`),
not the full deck. A later month deals nine different cards and copies those in;
`scripts/render-draw-cards.mjs` fails if a dealt card's file is missing, so the
set here and the set in the draw cannot silently drift apart.

## The faces

Scans of the **Rider–Waite–Smith tarot deck**, first published 1909 by William
Rider & Son, illustrated by **Pamela Colman Smith** (1878–1951).

- **Source:** Wikimedia Commons, via
  `https://commons.wikimedia.org/wiki/Special:FilePath/<file>?width=600`
- **Licence:** public domain. The 1909 publication places the work in the public
  domain in the United States (published before 1929), and Pamela Colman Smith
  died in 1951, which clears life-of-author-plus-70 terms including the UK, the
  EU and Canada.
- **Processing:** resized to 600px wide, re-encoded as WebP at quality 82. No
  cropping, recolouring or other alteration.
- **Fetched:** 2026-07-28, into `vedic-numerology/public/tarot`; copied here
  2026-09-10.

🔴 **This repo is PUBLIC and Pages-served.** These files are safe to publish
because they are public domain and unaltered — that is the whole reason the
licence note travels with them rather than living only in the private repo.
Nothing else from `vedic-numerology/public` may be copied here on this
precedent; `card-back.webp` in particular is original Numevix work and stays
in the private repo.

Filenames are `<card.id>.webp`, where `card.id` is the slug in
`content/tarot-deck.json`.
