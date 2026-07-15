// Content for each Moolank (Driver Number) promo. Ruling planets follow the
// Vedic/Chaldean numerology mapping (1 Sun · 2 Moon · 3 Jupiter · 4 Rahu ·
// 5 Mercury · 6 Venus · 7 Ketu · 8 Saturn · 9 Mars).

export type MoolankData = {
  n: number;
  planet: string;
  born: string; // birth dates that reduce to this Moolank
  titlePlain: string; // strengths headline, plain part
  titleGold: string; // strengths headline, highlighted part
  strengths: string[]; // exactly 4
  quote: string; // planet-flavoured line under the strengths
  flips: [string, string][]; // exactly 4 [challenge, reframe] pairs
  music?: string; // public/ path e.g. "music/orbital-drift.mp3" — set when provided
};

export const MOOLANKS: Record<number, MoolankData> = {
  1: {
    n: 1,
    planet: "the Sun",
    born: "1st, 10th, 19th or 28th",
    titlePlain: "The Sun's",
    titleGold: "born leader.",
    strengths: [
      "A natural-born leader",
      "Fiercely independent",
      "Bold, original & driven",
      "Radiates confidence",
    ],
    quote: "The Sun bows to no one.",
    flips: [
      ["Called bossy?", "It's leadership — own the front."],
      ["Too proud?", "That's self-belief. Back it up."],
      ["Hate taking orders?", "Then build your own throne."],
      ["Impatient?", "It's drive — aim it at one goal."],
    ],
    music: "music/mool-1.mp3",
  },
  2: {
    n: 2,
    planet: "the Moon",
    born: "2nd, 11th, 20th or 29th",
    titlePlain: "The Moon's",
    titleGold: "quiet power.",
    strengths: [
      "Deeply intuitive",
      "Reads people instantly",
      "Gentle & diplomatic",
      "Creative & imaginative",
    ],
    quote: "Still water runs deepest.",
    flips: [
      ["Too sensitive?", "It's empathy — your superpower."],
      ["Moody?", "That's emotional depth. Feel it."],
      ["Indecisive?", "You weigh what others miss."],
      ["Overthink it?", "Trust the gut that's rarely wrong."],
    ],
    music: "music/mool-2.mp3",
  },
  3: {
    n: 3,
    planet: "Jupiter",
    born: "3rd, 12th, 21st or 30th",
    titlePlain: "Jupiter's",
    titleGold: "wise teacher.",
    strengths: [
      "Wise beyond your years",
      "Disciplined & ambitious",
      "A natural teacher",
      "Optimistic & expansive",
    ],
    quote: "Knowledge is your throne.",
    flips: [
      ["Too blunt?", "It's honesty — people need it."],
      ["Overly critical?", "That's high standards. Teach them."],
      ["Too bossy?", "You see the plan — lead it."],
      ["Workaholic?", "Channel it, then rest to grow."],
    ],
    music: "music/mool-3.mp3",
  },
  4: {
    n: 4,
    planet: "Rahu",
    born: "4th, 13th, 22nd or 31st",
    titlePlain: "Rahu's",
    titleGold: "rule-breaker.",
    strengths: [
      "You think differently",
      "Hard-working & systematic",
      "Loyal and dependable",
      "Built to disrupt",
    ],
    quote: "The outsider changes the game.",
    flips: [
      ["Feel like an outsider?", "That's a rare vision — use it."],
      ["Rebellious?", "You break what's already broken."],
      ["Unpredictable?", "It's adaptability. Flex it."],
      ["Misunderstood?", "Pioneers always are. Keep going."],
    ],
    music: "music/mool-4.mp3",
  },
  5: {
    n: 5,
    planet: "Mercury",
    born: "5th, 14th or 23rd",
    titlePlain: "Mercury's",
    titleGold: "quick mind.",
    strengths: [
      "Sharp & quick-witted",
      "A magnetic communicator",
      "Adaptable to anything",
      "Born for business",
    ],
    quote: "Speed is your advantage.",
    flips: [
      ["Restless?", "It's curiosity — feed it."],
      ["Take big risks?", "That's the entrepreneur in you."],
      ["Feel scattered?", "Pick one lane — you're unstoppable."],
      ["Impatient?", "You move while others wait."],
    ],
    music: "music/mool-5.mp3",
  },
  6: {
    n: 6,
    planet: "Venus",
    born: "6th, 15th or 24th",
    titlePlain: "Venus's",
    titleGold: "magnetic soul.",
    strengths: [
      "Effortlessly charming",
      "Artistic & creative",
      "Loving and magnetic",
      "Draws beauty & abundance",
    ],
    quote: "Beauty follows you.",
    flips: [
      ["Love comfort?", "Then build a beautiful life — with discipline."],
      ["Indulgent?", "Turn that taste into what you create."],
      ["Possessive?", "It's devotion. Give it freely."],
      ["People-pleaser?", "Charm is power — use it for you too."],
    ],
  },
  7: {
    n: 7,
    planet: "Ketu",
    born: "7th, 16th or 25th",
    titlePlain: "Ketu's",
    titleGold: "old soul.",
    strengths: [
      "Deeply intuitive",
      "Analytical & philosophical",
      "An independent thinker",
      "Quietly magnetic",
    ],
    quote: "You see what others can't.",
    flips: [
      ["Feel detached?", "That's freedom — most never taste it."],
      ["Overanalyze?", "It's depth. Trust your insight."],
      ["Restless within?", "You're seeking mastery — chase it."],
      ["Misunderstood?", "Depth is rare. Don't dilute it."],
    ],
  },
  8: {
    n: 8,
    planet: "Saturn",
    born: "8th, 17th or 26th",
    titlePlain: "Saturn's",
    titleGold: "chosen builder.",
    strengths: [
      "Ambitious & disciplined",
      "Born to lead and build",
      "Wired for material success",
      "Unshakable resilience",
    ],
    quote: "Saturn rewards the patient.",
    flips: [
      ["Seen as cold?", "It's deep focus — aim it at one goal."],
      ["Workaholic?", "Set limits, and stay unstoppable."],
      ["Too stubborn?", "That's conviction. Point it right."],
      ["Delays test you?", "They forge your empire."],
    ],
    music: "music/orbital-drift.mp3",
  },
  9: {
    n: 9,
    planet: "Mars",
    born: "9th, 18th or 27th",
    titlePlain: "Mars'",
    titleGold: "warrior spirit.",
    strengths: [
      "Courageous & bold",
      "Relentless energy",
      "A disciplined fighter",
      "A fierce protector",
    ],
    quote: "Fire forges the strong.",
    flips: [
      ["Quick to anger?", "That's passion — aim the fire."],
      ["Too aggressive?", "It's drive. Push, don't burn."],
      ["Impatient?", "Your urgency gets things done."],
      ["Always fighting?", "Then fight for what matters."],
    ],
  },
};
