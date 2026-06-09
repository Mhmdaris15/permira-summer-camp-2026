/**
 * Central layout config for the campsite proposal scene.
 *
 * Axis convention:
 *   • +X  = East   (screen right)
 *   • +Z  = South  (screen bottom)
 *   • +Y  = Up
 *
 * EVERY position/colour the visual layer reads lives here. JSX never
 * holds hard-coded coordinates or hex values — so the entire site plan
 * is one file to retune.
 *
 * Palette design notes (creative-director pass):
 *   • Warm analogous core (terracotta → saffron → cream)
 *   • Two cool accents (sky-blue assembly, slate-blue games) for hierarchy
 *   • Greens desaturated, two-tone for depth without busyness
 *   • Values clustered so no single colour "shouts" — composition first
 */

export const TERRAIN = {
  width: 44, // X span
  depth: 34, // Z span
} as const;

/** Cohesive palette tuned for premium low-poly readability. */
export const COLORS = {
  // Earth + ground
  earth:           "#7a5a3a",
  grass:           "#9bbf6e",   // softer, less neon than before
  grassDeep:       "#8eb461",
  grassMist:       "#c8dfa8",   // for fade-out tufts near edges
  path:            "#e6cfa1",
  pathStripe:      "#c3a877",

  // Camp structures — warm analogous
  participantTent: "#df7a3a",
  participantAlt:  "#cf6730",   // two-tone variation per instance
  committeeTent:   "#b4451c",
  committeePost:   "#5a2a13",
  postRoof:        "#8a3315",
  postWall:        "#d4b285",

  // Activity colour codes
  cooking:         "#edb04a",   // warm yellow
  cookingTable:    "#7e5535",
  briefing:        "#ecd9b0",   // cream
  briefingFrame:   "#5a2a13",
  games:           "#6c9bc8",   // muted sky-blue
  assembly:        "#aac9ec",   // softer blue
  assemblyMark:    "#ffffff",

  // Campfire — emotional warmth
  fireBase:        "#2c130b",
  fireGlow:        "#f0b945",
  fireCore:        "#ffe4a8",

  // Foliage — desaturated and varied
  tree:            "#4f7a3a",
  treeDark:        "#3d6028",
  treeAccent:      "#7aa55a",
  trunk:           "#5a3a1f",

  // Atmospheric / overlays
  fence:           "#9b7b5e",
  arrowIn:         "#3fa074",   // muted green, less video-game
  arrowOut:        "#c4502a",
  northNeedle:     "#b4451c",
  lanternGlow:     "#f5b942",

  // Sky gradient — used by SkyDome
  skyTop:          "#aed4ef",
  skyMid:          "#dceaf6",
  skyHorizon:      "#f7e8d6",   // warm haze at the horizon
} as const;

export type ColorKey = keyof typeof COLORS;

// -----------------------------------------------------------------------------
// Zones — coloured ground patches with floating labels
// -----------------------------------------------------------------------------

export type Zone = {
  id: string;
  label: string;
  /** [x, z] centre of the patch */
  position: [number, number];
  /** [width, depth] in world units */
  size: [number, number];
  color: ColorKey;
  /** Hover priority — higher = lifts more on hover (use for hero zones). */
  hero?: boolean;
  category?: "tents" | "activity" | "facility" | "path";
};

export const ZONES: Zone[] = [
  { id: "committee-post",   label: "Committee Post",       position: [-17,  -13], size: [4,  4],   color: "committeePost", category: "facility", hero: true },
  { id: "committee-tents",  label: "Committee Tents",      position: [ -3,  -12], size: [14, 4],   color: "committeeTent", category: "tents" },
  { id: "briefing",         label: "Briefing & Gathering", position: [-12,    1], size: [9,  7],   color: "briefing",      category: "activity" },
  { id: "campfire",         label: "Campfire",             position: [  3,    1], size: [6,  6],   color: "fireBase",      category: "activity", hero: true },
  { id: "cooking",          label: "Cooking & Dining",     position: [ 14,    0], size: [9,  9],   color: "cooking",       category: "activity" },
  { id: "games",            label: "Games / Fun Sessions", position: [  3,   10], size: [10, 5],   color: "games",         category: "activity" },
  { id: "assembly",         label: "Assembly Point",       position: [-14,   10], size: [6,  5],   color: "assembly",      category: "facility" },
  { id: "participant-tents",label: "Participant Tents",    position: [ 14,   11], size: [12, 7],   color: "participantTent", category: "tents" },
];

// -----------------------------------------------------------------------------
// Tent clusters — generated from row/col grids; per-instance variation in JSX
// -----------------------------------------------------------------------------

export type TentCluster = {
  id: string;
  origin: [number, number];
  rows: number;
  cols: number;
  spacing: [number, number];
  color: ColorKey;
  /** Secondary tent colour mixed in for visual rhythm. */
  colorAlt?: ColorKey;
  rotationY?: number;
};

export const TENT_CLUSTERS: TentCluster[] = [
  { id: "participants", origin: [14, 11], rows: 2, cols: 4, spacing: [2.6, 2.8],
    color: "participantTent", colorAlt: "participantAlt" },
  { id: "committee",    origin: [-3, -12], rows: 1, cols: 4, spacing: [3.2, 0],
    color: "committeeTent" },
];

// -----------------------------------------------------------------------------
// Paths — chained 2D points so segments can bend gently
// -----------------------------------------------------------------------------

export type Path = {
  id: string;
  /** Series of [x, z] way-points. A straight path is just two points. */
  points: Array<[number, number]>;
  width: number;
};

export const PATHS: Path[] = [
  // West entrance corridor — gently curving in toward the central spine
  { id: "entrance",    points: [[-22, 2], [-16, 2.2], [-10, 1.8], [-8, 2]],    width: 2.4 },
  // Centre spine
  { id: "spine",       points: [[-8, 2], [0, 2.1], [10, 2]],                   width: 2.0 },
  // East exit corridor — angles slightly south for rhythm
  { id: "exit",        points: [[10, 4], [16, 4.4], [22, 4]],                  width: 2.4 },
  // North link — campfire to committee row
  { id: "n-spur",      points: [[3, -9], [3.2, -5], [3, -1]],                  width: 1.5 },
  // South link — campfire to games
  { id: "s-spur",      points: [[3, 4], [3.2, 6], [3, 8]],                     width: 1.5 },
  // Assembly link
  { id: "w-spur",      points: [[-12, 4], [-12, 6], [-12, 8]],                 width: 1.5 },
];

// -----------------------------------------------------------------------------
// Trees — perimeter scatter, hand-placed for visual balance
// -----------------------------------------------------------------------------

/** [x, z, scale, variant] — variant 0|1 toggles foliage shade. */
export const TREES: Array<[number, number, number, 0 | 1]> = [
  [-20, -15, 1.1, 0], [-15, -16, 0.9, 1], [-10, -16, 1.0, 0],
  [ -5, -16, 0.9, 1], [  6, -16, 1.0, 0], [ 12, -16, 1.1, 1], [ 18, -16, 1.0, 0],
  [-21,  -8, 1.0, 1], [-21,  -2, 0.9, 0], [-21,   4, 1.0, 1], [-21,  10, 1.1, 0], [-21,  14, 0.9, 1],
  [ 21,  -8, 1.0, 0], [ 21,  -2, 1.1, 1], [ 21,  10, 1.0, 0], [ 21,  14, 0.9, 1],
  [-18,  15, 1.0, 1], [-10,  15, 0.9, 0], [ -3,  15, 1.0, 1], [  9,  15, 1.1, 0], [ 18,  15, 0.9, 1],
];

// -----------------------------------------------------------------------------
// Subtle terrain hills — low-poly raised polygons under the perimeter, NOT
// inside the camp footprint. Used by Terrain.tsx to create gentle elevation.
// -----------------------------------------------------------------------------

/** [x, z, radius, height] */
export const HILLS: Array<[number, number, number, number]> = [
  [-18,  -2, 6.0, 0.6],
  [ 19,  -8, 5.0, 0.5],
  [ 20,  12, 5.5, 0.55],
  [-19,  14, 4.0, 0.45],
];

// -----------------------------------------------------------------------------
// Misc fixed positions
// -----------------------------------------------------------------------------

export const CAMPFIRE_POSITION: [number, number] = [3, 1];
export const NORTH_INDICATOR_POSITION: [number, number] = [-19, -13];

/** Entrance sign-post position (just outside the entrance arrow). */
export const ENTRANCE_SIGN_POSITION: [number, number] = [-21, 2];

/** Anchors for string lights — line strung between these XYZ points. */
export const STRING_LIGHT_ANCHORS: Array<[[number, number, number], [number, number, number]]> = [
  [[ -1, 3.0, -2], [ 7, 3.0, -2]],
  [[  7, 3.0, -2], [ 7, 3.0,  4]],
];
