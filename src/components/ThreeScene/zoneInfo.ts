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
  "committee-post": {
    icon: "🏛️",
    summary: "Command HQ for the organisers",
    description:
      "The committee post is the operational heart of the camp. Registration check-in, lost & found, and on-call medical support all run from here. Look for the flag.",
    activities: ["Check-in / registration desk", "Daily briefings stand-by", "Lost & found", "On-call medics"],
    capacity: "Staff of 8",
    schedule: [
      { day: "All days", time: "07:00 – 23:00", what: "Staffed continuously" },
    ],
  },

  "committee-tents": {
    icon: "⛺",
    summary: "Where the organising team rests and prepares",
    description:
      "Four staff tents arranged in a quiet row to the north of the camp. Off-limits to participants except by invitation; coordination meetings happen here.",
    activities: ["Staff sleeping quarters", "Late-night planning", "Equipment storage"],
    capacity: "12 staff",
  },

  "briefing": {
    icon: "📣",
    summary: "Morning gatherings and daily storytelling",
    description:
      "An open-air pavilion of woven mats and low benches. Each day opens here with a fifteen-minute briefing in two languages, and closes here with reflection.",
    activities: ["Daily briefings", "Cultural storytelling", "Open-mic reflections", "Language exchange"],
    capacity: "Up to 60",
    schedule: [
      { day: "Day 1–3", time: "08:00 – 08:30", what: "Morning briefing" },
      { day: "Day 1–3", time: "21:30 – 22:00", what: "Closing reflection" },
    ],
  },

  "campfire": {
    icon: "🔥",
    summary: "The heart of every evening",
    description:
      "A stone-ringed fire under string lights. This is where Indonesian and Russian students share their first conversations — songs, recipes, and the small ceremonies of arrival.",
    activities: ["Cultural Night performances", "Group reflection", "Songs together"],
    capacity: "All participants",
    schedule: [
      { day: "Day 2", time: "21:00", what: "Cultural Night & campfire" },
    ],
  },

  "cooking": {
    icon: "🍲",
    summary: "Culinary Masterclass & Cooking Session",
    description:
      "Open-air kitchen where mixed teams of Indonesian, Russian, and ASEAN students cook Indonesian dishes together — learning the ingredients, techniques, and stories behind them. Example dishes include Sate Madura, Ayam Lengkuas, and Soto Ayam (actual dishes may vary).",
    activities: ["Culinary Masterclass I", "Culinary Masterclass II", "Cooking challenge & presentation"],
    capacity: "Teams of 5–6",
    schedule: [
      { day: "Day 2", time: "10:00", what: "Culinary Masterclass I" },
      { day: "Day 2", time: "17:00", what: "Culinary Masterclass II" },
    ],
  },

  "games": {
    icon: "🎯",
    summary: "Play, laugh, lower the language barrier",
    description:
      "An open lawn for the Fun Session — mixed-team traditional games such as Lompat Karet (rubber-band jump) and Game Sendal (sandal toss). Wordless fun does what introductions can't.",
    activities: ["Fun Session", "Traditional team games", "Mixed-group challenges"],
    capacity: "All participants",
    schedule: [
      { day: "Day 2", time: "15:00", what: "Fun Session" },
    ],
  },

  "assembly": {
    icon: "🚨",
    summary: "Muster point for safety and headcounts",
    description:
      "Marked with a large white H. In an emergency, everyone gathers here for the headcount. Also the daily start point for off-site excursions.",
    activities: ["Emergency assembly", "Excursion mustering", "Safety briefing"],
    capacity: "All participants",
  },

  "participant-tents": {
    icon: "🏕️",
    summary: "Your home for three nights",
    description:
      "Group tents where participants sleep, arranged by team. Shared washrooms and storage are a short walk away.",
    activities: ["Sleeping quarters", "Personal storage", "Directed free time"],
    capacity: "35 participants",
  },
};
