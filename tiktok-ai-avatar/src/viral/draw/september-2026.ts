/**
 * September 2026 — the ten slides.
 *
 * 🔴 THE CARDS ARE NOT CHOSEN. They come from `content/draws/september-2026.json`,
 * dealt by `scripts/draw-month.mjs` and committed in `7eaae5c` BEFORE a word
 * below existed. The copy was written to the cards it found. ⛔ If a pairing
 * feels wrong, that is the format working — write to the friction, never
 * re-deal.
 *
 * ✍️ WHAT EVERY SLIDE DOES. It puts a number’s known nature (condensed from
 * `content/moolank-cards.json`, which mirrors the product's own birth-number
 * table) beside the card that happened to land next to it, and writes about
 * the SPACE BETWEEN THEM. Nine coincidences, examined. That is an honest thing
 * to publish; an assignment is not.
 *
 * ⚖️ Copy latitude, owner 2026-09-09: "does not have to be pain points, just
 * relatable and emotional." The wound rule stands — no accusation, no
 * flattery, no consolation — and `checkNoPromise` holds the ETHICS_BLOCK line:
 * nothing here promises an outcome or a date.
 */
import DRAW from "../../../content/draws/september-2026.json";
import MOOLANKS from "../../../content/moolank-cards.json";
import type { DrawSlide } from "./card";

/**
 * 🪤 `chalk-g` IS NOT THE FLAT PLATE HERE, whatever V59 measured. Its 13.1 span
 * is the 9:16 COPY STRIP; across the covered 4:5 card frame it spans 45.9
 * post-veil and `checkGroundFlatness` rejects it. `linen-b` spans 14.3 and
 * clears the ink at 8.71:1. Same rule as V59, opposite winner: reach for
 * flatness, not brightness — and measure the frame you are actually rendering.
 */
export const GROUND = "linen-b";

const drawn = new Map(DRAW.cards.map((c) => [c.moolank, c]));
const moolank = MOOLANKS as unknown as Record<string, { archetype: string; bornOn: string }>;

/** "4th, 13th, 22nd, 31st" → "Born on the 4th, 13th, 22nd or 31st". */
const bornLine = (n: number): string => {
  const parts = moolank[String(n)].bornOn.split(", ");
  const last = parts.pop();
  return `Born on the ${parts.join(", ")} or ${last}`;
};

/** The paragraph for each number. Written against the card that was dealt. */
const BODY: Record<number, string> = {
  1: `A number that has never found it hard to know its own mind drew the card about exactly that — clarity, judgement, the truth told straight. It looks like agreement, and agreement is the least useful thing a card can offer you. So take the harder half of it. The King of Swords is not the person who is right; he is the person who has learned what being right costs, and picks his moments. A 1 usually arrives at the verdict long before the room does. The question this leaves you with is not whether you can see it clearly. It is who still needs to arrive at it themselves.`,

  2: `The number that reads a room before anyone speaks drew the card of carrying too much. Ten of Wands is not a punishment and it is not a compliment about how strong you are. It is a picture of someone who cannot see over the top of what they picked up, and who took most of it voluntarily, one reasonable favour at a time. A 2 is built to feel the weight in a room and move to lift it. That is the gift and it is the whole problem. Nothing here says to put it down. It asks you to look at the load and name which parts were ever actually yours.`,

  3: `Six of the nine numbers name 3 a friend, and 3 drew the card about standing outside in the cold. That is the sort of coincidence worth sitting with rather than explaining away. Five of Pentacles is about lack — and the loneliest version of it is not having nobody. It is being surrounded and still not able to say the thing. A 3 is the one others come to for counsel, which quietly makes you the person nobody thinks to ask. There is a door in that card most readings skip past. It is lit, and the two figures walk by without looking up.`,

  4: `The number that reaches for more people than any other drew a card that is nothing but a beginning. Ace of Pentacles is an offer with no story attached yet — solid, real, and entirely dependent on what happens next. For a 4 that is the familiar shape and the familiar risk. Starting has never been the difficulty. A 4 collects openings the way other numbers collect regrets, and the ones that went nowhere mostly went nowhere quietly. So the card is not asking whether something is available to you. It is asking which of the things already in your hands you are prepared to finish.`,

  5: `The quickest mind in the set drew the card about feeling steadily. King of Cups holds the emotional weather without being moved by it, and gives without doing the arithmetic first — which is precisely the calculation a 5 runs by reflex. You read the deal, the person and the exit in the time most people take to sit down, and being that fast makes generosity feel like an unpriced risk. That is not coldness. It is speed doing what speed does. What sits between this number and this card is a small, specific question: what would you offer someone if you had not already worked out what it was worth?`,

  6: `The number drawn to beauty and to people drew a card that cannot sit still. Page of Swords is curiosity with no manners yet — the one who asks the question everybody else agreed to leave alone, and does not notice the room changing temperature. A 6 does notice. A 6 has always noticed, and has spent years smoothing the moment over before anyone had to feel it. So the friction here is not between you and the card. It is between the part of you that wants the room comfortable and the part that has a question it has been carrying for a while.`,

  7: `The most cautious number in the set drew the one card that does not wait. Knight of Wands rides at something before the risk has been fully priced, which is close to the opposite of how a 7 has learned to move. And a 7 has reasons. Caution is what happens to someone who has already seen how it goes. But the Knight’s other keyword is the unnamed fear, and that is the half worth your attention — because being able to see a thing coming has never once stopped it arriving. Between this number and this card sits a distinction worth holding: waiting for proof, and simply waiting.`,

  8: `The number built for the long game drew the apprentice. Page of Pentacles is a beginner with a coin in both hands, studying something they have not earned yet — an odd card to land beside the number that finishes what everyone else abandons. Read it as an insult and it is useless. Read it as a description and it is uncomfortably accurate: an 8 gets very good at one weight and then carries only that. Being a beginner is a thing you were once and stopped being on purpose. This card puts it back on the table without saying which room to carry it into.`,

  9: `The fighter drew the card about working with other people. Three of Pentacles is three figures agreeing on a plan, which is not the natural habitat of a number that takes a stand and holds it alone. A 9 does not lack allies. A 9 usually decides the cause is clear enough not to need a meeting about it, and by the time anyone offers, the position is already taken and defended. That is courage doing what courage does. The card sitting here is not asking you to stand down. It is asking who might have been standing with you, had you paused long enough to look.`,
};

const COVER: DrawSlide = {
  moolank: 0,
  bg: GROUND,
  title: "Nine cards. Drawn once.",
  body: `Nine cards, drawn at random on 10 September, one for every birth number. No card belongs to any number — Vedic numerology makes no such link, and this is not the place to invent one. What is here is a coincidence held up on purpose: the number you already are, next to the card that happened to land beside it. Sometimes the two agree. More often they argue, and the argument is the part worth reading. Find the day you were born, read what came up, and take it as something to think with rather than something to be told.`,
};

export const SEPTEMBER_2026: DrawSlide[] = [
  COVER,
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n): DrawSlide => {
    const card = drawn.get(n);
    if (!card) throw new Error(`no card dealt for moolank ${n}`);
    return {
      moolank: n,
      bg: GROUND,
      cardId: card.cardId,
      cardName: card.name,
      keywords: card.keywords,
      bornOn: bornLine(n),
      title: `Moolank ${n} · ${moolank[String(n)].archetype}`,
      body: BODY[n],
    };
  }),
];
