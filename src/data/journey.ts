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
 * Programme summary — drawn from the official rundown (Rangkaian Acara).
 * The visible times come from `activities[].time` here; the titles, verb,
 * headline, and body are translated under `journey.days.dN.*` in the locales.
 * Only three highlight moments per day are shown; the committee runs the full
 * minute-by-minute schedule on site.
 */
export const journeyDays: JourneyDay[] = [
  {
    index: 1,
    label: "Day One",
    verb: "Arrive & Open",
    date: "July 19, 2026",
    headline: "Opening Ceremony, Learning from Nature and Getting to Know Each Other.",
    body:
      "Gather at Ozerki metro, travel by coach to Cape Kiperort — a peninsula on Vyborg Bay — and pitch camp, then a bilingual opening ceremony with the national anthems, ministerial and diplomatic remarks, and a tumpeng, followed by a natural-materials masterclass, a cape walk, and campfire games.",
    activities: [
      { time: "09:00", title: "Gather & Transfer", detail: "Meet at Ozerki metro, then travel by coach north to Cape Kiperort (Vyborg District)." },
      { time: "13:30", title: "Opening Ceremony", detail: "A bilingual opening: anthems, remarks from the Minister, Ambassador, and regional officials, and the tumpeng cutting." },
      { time: "15:30", title: "Masterclass & Cape Walk", detail: "A natural-materials masterclass with conservation experts, a guided walk along the cape, then campfire games after dinner." },
    ],
    accent: "turmeric",
  },
  {
    index: 2,
    label: "Day Two",
    verb: "Cook & Connect",
    date: "July 20, 2026",
    headline: "The heart of the camp — PERMIRA Master Chef.",
    body:
      "Morning exercise and a Bubur Ayam breakfast, then PERMIRA Master Chef: an education & discussion session, a hands-on culinary masterclass, and a fusion cooking challenge blending Indonesia, Russia, and ASEAN. The evening brings open-air games, PERMIRA's Got Talent, and a heart-to-heart around the campfire.",
    activities: [
      { time: "09:30", title: "Culinary Masterclass", detail: "Hands-on cooking in teams of 5–6 with chef Aprilio Kristian Justin Teken — Nasi Goreng Kampung, Sate Taichan, and Sambal Matah." },
      { time: "15:00", title: "Fusion Cooking Challenge", detail: "Each team invents a fusion dish — Indonesia 50%, Russia 30%, ASEAN 20% — judged by a panel." },
      { time: "21:00", title: "PERMIRA's Got Talent", detail: "A bilingual cultural night of performances, then a heart-to-heart circle around the campfire." },
    ],
    accent: "saffron",
  },
  {
    index: 3,
    label: "Day Three",
    verb: "Reflect & Farewell",
    date: "July 21, 2026",
    headline: "Give back, reflect, and head home.",
    body:
      "Morning exercise and a Cekodok breakfast, a gotong-royong eco clean-up of Cape Kiperort, a friendship time capsule on the Wish Board, and a bilingual closing ceremony with awards and a farewell photo before the journey home.",
    activities: [
      { time: "09:30", title: "Eco Clean-Up (Gotong Royong)", detail: "Teams clear the shore and pack up together, leaving no trace." },
      { time: "11:30", title: "Time Capsule", detail: "Messages of friendship on the Wish Board, sealed until the next winter camp." },
      { time: "12:30", title: "Closing Ceremony & Awards", detail: "A bilingual closing, awards for best dish, teamwork, spirit, most active, and best moment, then a farewell photo." },
    ],
    accent: "terracotta",
  },
];
