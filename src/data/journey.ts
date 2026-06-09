export type DayActivity = {
  time: string;
  title: string;
  detail: string;
};

export type JourneyDay = {
  index: number;
  label: string;
  verb: string;
  date: string;
  headline: string;
  body: string;
  activities: DayActivity[];
  accent: "saffron" | "terracotta" | "turmeric";
};

/**
 * TODO(content): Refine activity copy with the actual camp programme.
 * These are first-draft narratives — tone and structure are locked in,
 * but the specific activities/timings are placeholders the user should
 * shape with their own programme. See note in App.tsx.
 */
export const journeyDays: JourneyDay[] = [
  {
    index: 1,
    label: "Day One",
    verb: "Connect",
    date: "July 17, 2026",
    headline: "Strangers meet at the same table.",
    body:
      "We open with names, stories, and the quiet ceremony of a shared meal. No script — just curiosity and the warmth of welcome.",
    activities: [
      { time: "10:00", title: "Pasar Pagi", detail: "Morning market walk-through with Indonesian hosts." },
      { time: "13:00", title: "First Bowl", detail: "A communal soto lunch — the icebreaker is the broth." },
      { time: "19:00", title: "Bonfire Stories", detail: "Each guest brings one memory of food from home." },
    ],
    accent: "turmeric",
  },
  {
    index: 2,
    label: "Day Two",
    verb: "Create",
    date: "July 18, 2026",
    headline: "Hands learn what words can't say.",
    body:
      "Cooking together. Russian and Indonesian students pair up to make Satay, Soto, and Ayam Lengkuas — every recipe an invitation to listen with your hands.",
    activities: [
      { time: "09:30", title: "Spice Atelier", detail: "Identify the eight spices that define Nusantara cuisine." },
      { time: "12:00", title: "Pair & Cook", detail: "Mixed teams prepare three dishes, one at a station." },
      { time: "17:00", title: "Plate · Trade · Taste", detail: "Each team plates for another — present what you made." },
    ],
    accent: "saffron",
  },
  {
    index: 3,
    label: "Day Three",
    verb: "Celebrate",
    date: "July 19, 2026",
    headline: "A night that tastes of both shores.",
    body:
      "A long table, candles, music from both cultures. We close with gratitude and a recipe card from each guest — to carry the camp home.",
    activities: [
      { time: "16:00", title: "The Long Table", detail: "Twelve dishes, two flags, one shared dusk." },
      { time: "19:00", title: "Voices & Strings", detail: "Sundanese angklung meets Russian balalaika." },
      { time: "21:30", title: "Recipe Exchange", detail: "Hand-written cards swapped before goodbyes." },
    ],
    accent: "terracotta",
  },
];
