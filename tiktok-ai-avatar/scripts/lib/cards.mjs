/**
 * Info-card captions for Instagram.
 *
 * 🎯 THE STANDING RULE: "the ideology of promoting Numevix is right, but the way
 * we are doing it looks like an ad." So the caption carries VALUE first and the
 * promotion last. "Link in bio" is the footer; numevix.com appears on the card
 * itself only in its bottom corner. No product pitch inside the content.
 *
 * ⭐⭐ THE COMMENT CTA IS THE ONE LEVER THE REFERENCES ALL PULL.
 * Every high-performing account studied on 2026-08-04 closes on a ONE-WORD
 * comment ask: "comments mein 9 likho" (41.2K likes), "Comment 'power'" (55.8K),
 * "Comment your DOB and I'll share your soulmate number" (72.9K comments). Ours
 * used to say "comment below" and offer nothing. That was the whole gap.
 *
 * ⭐⭐⭐ THE DATE-LIST RULE, confirmed three times against real accounts: name
 * EVERY qualifying date. V28 named only "the 4th" and cut its addressable
 * audience to roughly a quarter. The caption opens on the full list for the
 * same reason the card does — a stranger has to self-identify in one line.
 */

/** Instagram truncates past this. */
export const CAPTION_MAX = 2200;

/** More than this and Instagram rejects the post outright. */
export const HASHTAG_MAX = 30;

const BASE_TAGS = [
  "#numerology",
  "#vedicnumerology",
  "#ankjyotish",
  "#moolank",
  "#birthnumber",
  "#numerologyindia",
  "#astrology",
  "#jyotish",
  "#spirituality",
  "#numbers",
];

/**
 * Tags for one card. The number- and planet-specific ones matter more than the
 * broad ones: #moolank8 is a feed a person actually follows, #astrology is a
 * firehose nobody reads.
 */
export const cardHashtags = (card) => {
  const planet = card.planet.toLowerCase();
  return [
    `#moolank${card.number}`,
    `#number${card.number}`,
    `#${planet}`,
    ...BASE_TAGS,
  ].slice(0, HASHTAG_MAX);
};

/**
 * The comment CTA.
 *
 * Deliberately the number itself rather than a word: it is the lowest-effort
 * reply that still tells us the commenter's number, and it mirrors reference #3
 * ("comments mein 9 likho") which drew 803 comments.
 */
export const commentCta = (n) => `Comment ${n} if this is your number 👇`;

/**
 * Builds the full caption for one Moolank card.
 *
 * @param {object} card an entry from content/moolank-cards.json
 */
/**
 * "8th, 17th, 26th" → "8th, 17th or 26th".
 *
 * The card sets the dates as a label where a bare list is right; a caption is a
 * sentence, and a trailing comma-list reads as truncated there. Every date still
 * appears — that part is the rule, the conjunction is only grammar.
 */
export const spokenDates = (bornOn) => bornOn.replace(/,\s*([^,]+)$/, " or $1");

export const buildCardCaption = (card) => {
  if (!card?.number) throw new Error("buildCardCaption needs a card with a number");

  const dates = spokenDates(card.bornOn);
  const lines = [
    `Moolank ${card.number} — Born on the ${dates}.`,
    "",
    `${card.planet} rules this number. ${card.personality}`,
    "",
    `Everything on the card: ruling planet, element, strengths, shadow side, career, relationships, lucky colours and the daily remedy for ${card.planet}.`,
    "",
    "Save it so you have it when you need it. Send it to the person whose number this is.",
    "",
    commentCta(card.number),
    "",
    "Link in bio 🔗",
    "",
    cardHashtags(card).join(" "),
  ];

  return lines.join("\n").slice(0, CAPTION_MAX);
};

/**
 * Caption for the narrated card REEL.
 *
 * Same value-first shape as the card, with two differences that matter:
 * the reel ends by holding the finished card, so the caption asks for the
 * screenshot rather than the save; and it names the language, because Hinglish
 * delivery is what the reference accounts at 41K-57K likes all share and it is
 * worth setting the expectation before someone taps the sound on.
 */
export const buildReelCaption = (card) => {
  if (!card?.number) throw new Error("buildReelCaption needs a card with a number");

  const lines = [
    `Moolank ${card.number} — Born on the ${spokenDates(card.bornOn)}.`,
    "",
    `${card.planet} rules this number. ${card.personality}`,
    "",
    // "remedy", not "upaay". Both captions are English throughout, per the
    // owner's standing decision of 2026-08-05 — see the note in
    // content/reel-scripts.json. It applies to cards as well as reels.
    `Ruling planet, element, strengths, lucky numbers and the daily remedy — the full card is at the end of the reel.`,
    "",
    "Screenshot the last frame and keep it.",
    "",
    commentCta(card.number),
    "",
    "Link in bio 🔗",
    "",
    cardHashtags(card).join(" "),
  ];

  return lines.join("\n").slice(0, CAPTION_MAX);
};

/**
 * Rejects a reel Instagram would refuse, before spending a post on it.
 *
 * Deliberately different limits from the image path: Reels wants VERTICAL video
 * between 3s and 15 minutes, where a feed image wants 4:5 to 1.91:1. Sending a
 * reel through validateCardImage would pass a jpeg check it can never satisfy.
 */
export const validateReelVideo = ({ seconds, width, height }) => {
  if (seconds < 3) throw new Error(`Reels requires at least 3s, this is ${seconds}s`);
  if (seconds > 900) throw new Error(`Reels allows at most 900s, this is ${seconds}s`);
  if (height <= width) throw new Error(`Reels needs a vertical video, this is ${width}x${height}`);
};

/**
 * Rejects an image Instagram would refuse, before spending a post on it.
 *
 * 🔴 JPEG ONLY. The Graph API rejects a PNG at `image_url` with an error that
 * names the URL rather than the format, which is a confusing place to learn it.
 * 🔴 Feed images must sit between 4:5 and 1.91:1. Our card is 1080x1350 = 0.8,
 * exactly the 4:5 floor, so any future height change breaks the post.
 */
export const validateCardImage = ({ width, height, path }) => {
  if (!/\.jpe?g$/i.test(path)) {
    throw new Error(`Instagram accepts JPEG only for image_url, got ${path}`);
  }
  const ratio = width / height;
  if (ratio < 0.8 || ratio > 1.91) {
    throw new Error(`aspect ratio must be between 4:5 (0.8) and 1.91:1, this is ${ratio.toFixed(3)}`);
  }
};
