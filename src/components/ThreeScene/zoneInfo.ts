/**
 * Zone information — rendered in the InfoPanel when a zone is inspected.
 *
 * Keyed by the same `id` as the matching entry in layout.ts → ZONES.
 * Everything here is content; edit freely without touching JSX.
 *
 * Field guide:
 *   icon       — emoji rendered top-left of the panel
 *   summary    — one-line tagline shown below the title
 *   description — 2-3 sentences of editorial prose
 *   activities — short bullet list (verbs preferred)
 *   capacity   — rough headcount string ("Up to 60")
 *   schedule   — array of {day, time, what} or null if not time-bound
 *   color      — accent for the panel header (kept in sync with layout COLORS by id)
 */

export type ZoneInfoEntry = {
  icon: string;
  summary: string;
  description: string;
  activities: string[];
  capacity: string;
  schedule?: Array<{ day: string; time: string; what: string }>;
};

export const ZONE_INFO: Record<string, ZoneInfoEntry> = {
  pier: {
    icon: "⚓",
    summary: "Where the cape meets the bay",
    description:
      "The coach drops off nearby, so the pier on the Vyborg Bay shore is the camp's front door. First footsteps, first hellos, and the daily rhythm of camp all begin at the water's edge.",
    activities: ["Boat arrival & departure", "Luggage drop", "Daily check-in point"],
    capacity: "All arrivals",
    schedule: [
      { day: "Day 1", time: "on arrival", what: "Boats dock & welcome" },
    ],
  },

  organizer: {
    icon: "🏛️",
    summary: "Command HQ for the team",
    description:
      "The operational heart of the camp. Registration check-in, the daily briefing board, lost & found, and on-call medical support all run from here. Look for the flags.",
    activities: ["Check-in & registration", "Daily briefings", "Lost & found", "On-call medics"],
    capacity: "Staff of 8",
    schedule: [
      { day: "All days", time: "07:00 – 23:00", what: "Staffed continuously" },
    ],
  },

  kitchen: {
    icon: "🍲",
    summary: "Where the flavours are made",
    description:
      "Open-air kitchen where mixed teams of Indonesian, Russian, and ASEAN students cook Indonesian dishes together — learning the ingredients, techniques, and stories behind them. Example dishes include Sate Madura, Ayam Lengkuas, and Soto Ayam (actual dishes may vary).",
    activities: ["Culinary Masterclass I", "Culinary Masterclass II", "Cooking challenge & presentation"],
    capacity: "Teams of 5–6",
    schedule: [
      { day: "Day 2", time: "10:00", what: "Culinary Masterclass I" },
      { day: "Day 2", time: "17:00", what: "Culinary Masterclass II" },
    ],
  },

  dining: {
    icon: "🍽️",
    summary: "The table everyone shares",
    description:
      "Long shared tables in the open air. Meals are where the day's mixed teams come together and the real conversations start — the pavilion doubles as the daily briefing and storytelling space.",
    activities: ["Shared meals", "Tasting & presentation", "Daily briefings", "Evening tea"],
    capacity: "Up to 60",
    schedule: [
      { day: "Day 1–3", time: "08:00 – 08:30", what: "Morning briefing" },
    ],
  },

  common: {
    icon: "🔥",
    summary: "The heart of every evening",
    description:
      "An open gathering circle with a stone-ringed fire under string lights. This is where Indonesian and Russian students share their first conversations — songs, Cultural Night, and the small ceremonies of three days together.",
    activities: ["Cultural Night performances", "Campfire & songs", "Group reflection"],
    capacity: "All participants",
    schedule: [
      { day: "Day 2", time: "21:00", what: "Cultural Night & campfire" },
    ],
  },

  tents: {
    icon: "🏕️",
    summary: "Home for three nights",
    description:
      "Group tents where participants sleep, arranged by team, a short walk from the shore. Shared washrooms and storage are close by.",
    activities: ["Sleeping quarters", "Personal storage", "Directed free time"],
    capacity: "35 participants",
  },

  beach: {
    icon: "🏖️",
    summary: "Open sand, open play",
    description:
      "The shoreline is the camp's playground. Traditional mixed-team games — sandal toss (Game Sendal) and rubber-band jump (Lompat Karet) — do what introductions can't.",
    activities: ["Fun Session", "Traditional team games", "Sunset gatherings"],
    capacity: "All participants",
    schedule: [
      { day: "Day 2", time: "15:00", what: "Fun Session on the beach" },
    ],
  },
};
