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
 * Programme summary — drawn from the official proposal (Rangkaian Acara,
 * §8). Session titles match the proposal. Times are MSK. The full minute-by-
 * minute schedule is finalised by the organising committee closer to the event.
 */
export const journeyDays: JourneyDay[] = [
  {
    index: 1,
    label: "Day One",
    verb: "Arrive & Open",
    date: "July 19, 2026",
    headline: "Welcome, set up, and an official opening.",
    body:
      "Participants arrive, build camp together, and gather for the official opening ceremony — national anthems, welcome remarks, and a traditional tumpeng — followed by a first shared meal and bonding circle.",
    activities: [
      { time: "09:00", title: "Meet & Transfer", detail: "Gather at Ozerki metro, then travel by bus and boat to the island." },
      { time: "14:00", title: "Tent Setup & Team Bonding", detail: "Pitch tents by group, then ice-breaking games." },
      { time: "16:30", title: "Fun Games & Storytelling", detail: "Traditional team games, dinner, and an evening sharing session." },
    ],
    accent: "turmeric",
  },
  {
    index: 2,
    label: "Day Two",
    verb: "Cook & Connect",
    date: "July 20, 2026",
    headline: "Cook together, play together.",
    body:
      "The heart of the camp: two Culinary Masterclass & Cooking Sessions where mixed Indonesian, Russian, and ASEAN teams prepare Indonesian dishes, a fun session of traditional games, and an evening Cultural Night around the campfire.",
    activities: [
      { time: "11:00", title: "Culinary Masterclass", detail: "Hands-on cooking session in small mixed teams." },
      { time: "14:30", title: "Cooking Challenge & Presentation", detail: "Plate, present, and share your team's dish." },
      { time: "19:00", title: "Fun Night & Closing Circle", detail: "Games, a photo & video screening, and an optional late campfire." },
    ],
    accent: "saffron",
  },
  {
    index: 3,
    label: "Day Three",
    verb: "Reflect & Farewell",
    date: "July 21, 2026",
    headline: "Reflect, celebrate, and head home.",
    body:
      "A morning reflection, a collective camp break-down, and an awarding session recognising teamwork and spirit — closing a weekend of friendship between Indonesian, Russian, and ASEAN students.",
    activities: [
      { time: "10:00", title: "Camp Break-Down", detail: "Pack up and tidy the site together, leaving no trace." },
      { time: "11:30", title: "Awarding & Appreciation", detail: "Recognising best cooking, collaboration, team spirit, and participation." },
      { time: "12:30", title: "Closing Session", detail: "Official close, farewell photos, and journey home." },
    ],
    accent: "terracotta",
  },
];
