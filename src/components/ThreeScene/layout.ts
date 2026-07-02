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

  // Lake + shore — the camp sits on a sand spit ringed by water
  water:           "#356072",
  waterDeep:       "#254a58",
  sand:            "#dcc39a",   // beach + dry spit
  pier:            "#4f86a0",   // arrival / dock (river blue)
  gather:          "#7d9b5a",   // common-ground lawn (fern)

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
  category?: "arrival" | "facility" | "food" | "gather" | "rest" | "nature";
};

// Camp laid out to match the hand sketch of Kubenskiy Island: the pier is the
// hub on the west shore, organisers to the NE, kitchen + dining through the
// centre, the common ground (campfire) to the east, tents south, beach SW.
export const ZONES: Zone[] = [
  { id: "pier",      label: "The Pier",         position: [-16,  -3], size: [4,  4], color: "pier",          category: "arrival",  hero: true },
  { id: "organizer", label: "Organisers' Post", position: [ 11, -10], size: [5,  5], color: "committeePost", category: "facility" },
  { id: "kitchen",   label: "Open Kitchen",     position: [ -2,  -3], size: [8,  7], color: "cooking",       category: "food", hero: true },
  { id: "dining",    label: "Dining Pavilion",  position: [  6,   1], size: [7,  6], color: "briefing",      category: "food" },
  { id: "common",    label: "Common Ground",    position: [ 14,   5], size: [9,  9], color: "gather",        category: "gather", hero: true },
  { id: "tents",     label: "Tent Village",     position: [ -5,   8], size: [12, 7], color: "participantTent", category: "rest" },
  { id: "beach",     label: "The Beach",        position: [-13,  10], size: [10, 5], color: "sand",          category: "nature" },
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
  // Participant tents fill the "Tent Village" zone, south-of-centre
  { id: "participants", origin: [-5, 8], rows: 2, cols: 4, spacing: [2.6, 2.8],
    color: "participantTent", colorAlt: "participantAlt" },
  // Organisers' tents — a short row just south of the Organisers' Post
  { id: "committee",    origin: [11, -6], rows: 1, cols: 3, spacing: [2.6, 0],
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

// The pier is the hub — every trail radiates from the west shore, as drawn.
export const PATHS: Path[] = [
  // Pier → Organisers' Post (curving north along the shore)
  { id: "pier-organizer", points: [[-16, -3], [-8, -7], [2, -9], [11, -10]], width: 2.0 },
  // Pier → Open Kitchen (central spine)
  { id: "pier-kitchen",   points: [[-16, -3], [-9, -3], [-2, -3]],           width: 2.2 },
  // Kitchen → Dining → Common Ground
  { id: "kitchen-common", points: [[-2, -3], [6, 1], [14, 5]],               width: 2.0 },
  // Kitchen → Tent Village
  { id: "kitchen-tents",  points: [[-2, -3], [-4, 3], [-5, 8]],              width: 1.6 },
  // Pier → Beach (down the west shore)
  { id: "pier-beach",     points: [[-16, -3], [-15, 3], [-13, 10]],          width: 1.6 },
];

// -----------------------------------------------------------------------------
// Trees — perimeter scatter, hand-placed for visual balance
// -----------------------------------------------------------------------------

/** [x, z, scale, variant] — variant 0|1 toggles foliage shade.
 *  Pine forest hugs the east + north of the island (as in the satellite);
 *  the west shore (pier) and the south-west (beach) are left open to water. */
export const TREES: Array<[number, number, number, 0 | 1]> = [
  // East forest band
  [18, -12, 1.0, 0], [21, -8, 1.1, 1], [21, -3, 0.9, 0], [20, 2, 1.0, 1],
  [21, 7, 1.1, 0], [19, 12, 0.9, 1], [16, 15, 1.0, 0],
  // North treeline
  [-6, -15, 0.9, 1], [2, -16, 1.0, 0], [9, -15, 1.1, 1], [15, -13, 1.0, 0],
  // A few inland fillers on the forest side
  [13, 15, 0.9, 1], [19, -13, 1.0, 1],
];

// -----------------------------------------------------------------------------
// Subtle terrain hills — low-poly raised polygons under the perimeter, NOT
// inside the camp footprint. Used by Terrain.tsx to create gentle elevation.
// -----------------------------------------------------------------------------

/** [x, z, radius, height] — raised ground only on the forested east/north. */
export const HILLS: Array<[number, number, number, number]> = [
  [ 20,  -6, 5.5, 0.55],
  [ 20,   9, 5.0, 0.5],
  [  9, -15, 5.0, 0.5],
  [ 16,  14, 4.0, 0.45],
];

// -----------------------------------------------------------------------------
// Misc fixed positions
// -----------------------------------------------------------------------------

// The campfire is the centrepiece of the Common Ground (east gathering circle).
export const CAMPFIRE_POSITION: [number, number] = [14, 5];
export const NORTH_INDICATOR_POSITION: [number, number] = [18, -14];

/** Welcome sign-post, standing at the pier where boats arrive. */
export const ENTRANCE_SIGN_POSITION: [number, number] = [-16, -0.4];

/** Anchors for string lights — strung over the Common Ground campfire. */
export const STRING_LIGHT_ANCHORS: Array<[[number, number, number], [number, number, number]]> = [
  [[ 10, 3.0, 3], [ 18, 3.0, 4]],
  [[ 18, 3.0, 4], [ 14, 3.0, 8]],
];
