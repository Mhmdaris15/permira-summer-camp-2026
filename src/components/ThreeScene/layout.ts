/**
 * Central layout config for the campsite proposal scene.
 *
 * All positions are [x, y, z] with:
 *   • +X  = East   (screen right)
 *   • +Z  = South  (screen bottom)
 *   • +Y  = Up
 *
 * Tweaking the site plan is purely a matter of editing this file —
 * components read from these arrays, nothing else.
 */

export const TERRAIN = {
  width: 44, // X span
  depth: 34, // Z span
} as const;

/** Bright, readable palette for proposal PDFs (not theme-driven). */
export const COLORS = {
  grass:           "#a8d676",
  grassDeep:       "#8bc25a",
  path:            "#e8d4a8",
  pathStripe:      "#c9b385",
  participantTent: "#e07b3c",
  committeeTent:   "#c4502a",
  committeePost:   "#6b2e1a",
  postRoof:        "#a23d1f",
  fireBase:        "#3a1c10",
  fireGlow:        "#f0b945",
  cooking:         "#f5b942",
  cookingTable:    "#8c5a3c",
  games:           "#5fa8d3",
  briefing:        "#f3e2c7",
  briefingFrame:   "#6b2e1a",
  assembly:        "#7eb5ff",
  assemblyMark:    "#ffffff",
  tree:            "#4a7c3a",
  treeDark:        "#3a6128",
  trunk:           "#5a3a1a",
  fence:           "#a78566",
  arrowIn:         "#3fa860",
  arrowOut:        "#d4380a",
  northNeedle:     "#c4502a",
} as const;

export type ColorKey = keyof typeof COLORS;

// -----------------------------------------------------------------------------
// Zones — colored ground patches with labels
// -----------------------------------------------------------------------------

export type Zone = {
  id: string;
  label: string;
  /** [x, z] center of the patch */
  position: [number, number];
  /** [width, depth] in world units */
  size: [number, number];
  color: ColorKey;
  /** Optional sub-label (legend category). */
  category?: "tents" | "activity" | "facility" | "path";
};

export const ZONES: Zone[] = [
  { id: "committee-post",   label: "Committee Post",        position: [-17,  -13], size: [4, 4],   color: "committeePost", category: "facility" },
  { id: "committee-tents",  label: "Committee Tents",       position: [ -3,  -12], size: [14, 4],  color: "committeeTent", category: "tents"    },
  { id: "briefing",         label: "Briefing & Gathering",  position: [-12,    1], size: [9, 7],   color: "briefing",      category: "activity" },
  { id: "campfire",         label: "Campfire",              position: [  3,    1], size: [6, 6],   color: "fireBase",      category: "activity" },
  { id: "cooking",          label: "Cooking & Dining",      position: [ 14,    0], size: [9, 9],   color: "cooking",       category: "activity" },
  { id: "games",            label: "Games / Fun Sessions",  position: [  3,   10], size: [10, 5],  color: "games",         category: "activity" },
  { id: "assembly",         label: "Assembly Point",        position: [-14,   10], size: [6, 5],   color: "assembly",      category: "facility" },
  { id: "participant-tents",label: "Participant Tents",     position: [ 14,   11], size: [12, 7],  color: "participantTent", category: "tents"  },
];

// -----------------------------------------------------------------------------
// Tent clusters — generated from row/col patterns to keep JSX clean
// -----------------------------------------------------------------------------

export type TentCluster = {
  id: string;
  /** Centre of the cluster bounding box, [x, z]. */
  origin: [number, number];
  rows: number;
  cols: number;
  spacing: [number, number]; // [x-gap, z-gap]
  color: ColorKey;
  rotationY?: number; // optional rotation in radians applied to each tent
};

export const TENT_CLUSTERS: TentCluster[] = [
  {
    id: "participants",
    origin: [14, 11],
    rows: 2,
    cols: 4,
    spacing: [2.6, 2.8],
    color: "participantTent",
  },
  {
    id: "committee",
    origin: [-3, -12],
    rows: 1,
    cols: 4,
    spacing: [3.2, 0],
    color: "committeeTent",
  },
];

// -----------------------------------------------------------------------------
// Paths — flat strips connecting zones (rendered as rectangles)
// -----------------------------------------------------------------------------

export type Path = {
  id: string;
  /** End-points in [x, z] world coords. */
  from: [number, number];
  to:   [number, number];
  width: number;
  /** Optional label for entrance/exit. */
  label?: string;
};

export const PATHS: Path[] = [
  // West entrance corridor → centre
  { id: "entrance", from: [-22,   2], to: [ -8,   2], width: 2.6, label: "Entrance" },
  // Centre spine
  { id: "spine",    from: [ -8,   2], to: [ 10,   2], width: 2.2 },
  // East exit corridor
  { id: "exit",     from: [ 10,   4], to: [ 22,   4], width: 2.6, label: "Exit" },
  // North link — campfire to committee row
  { id: "n-spur",   from: [  3,  -9], to: [  3,  -1], width: 1.6 },
  // South link — campfire to games
  { id: "s-spur",   from: [  3,   4], to: [  3,   8], width: 1.6 },
  // Assembly link
  { id: "w-spur",   from: [-12,   4], to: [-12,   8], width: 1.6 },
];

// -----------------------------------------------------------------------------
// Trees — perimeter scatter, hand-placed for visual balance
// -----------------------------------------------------------------------------

/** Each tree: [x, z, scale, variant] — variant 0|1 toggles colour shade. */
export const TREES: Array<[number, number, number, 0 | 1]> = [
  [-20, -15, 1.1, 0], [-15, -16, 0.9, 1], [-10, -16, 1.0, 0],
  [ -5, -16, 0.9, 1], [  6, -16, 1.0, 0], [ 12, -16, 1.1, 1], [ 18, -16, 1.0, 0],
  [-21,  -8, 1.0, 1], [-21,  -2, 0.9, 0], [-21,   4, 1.0, 1], [-21,  10, 1.1, 0], [-21,  14, 0.9, 1],
  [ 21,  -8, 1.0, 0], [ 21,  -2, 1.1, 1], [ 21,  10, 1.0, 0], [ 21,  14, 0.9, 1],
  [-18,  15, 1.0, 1], [-10,  15, 0.9, 0], [ -3,  15, 1.0, 1], [  9,  15, 1.1, 0], [ 18,  15, 0.9, 1],
];

// -----------------------------------------------------------------------------
// Misc fixed positions
// -----------------------------------------------------------------------------

/** Where the central campfire sits — used by Campfire component. */
export const CAMPFIRE_POSITION: [number, number] = [3, 1];

/** North arrow placement (corner of the terrain). */
export const NORTH_INDICATOR_POSITION: [number, number] = [-19, -13];
