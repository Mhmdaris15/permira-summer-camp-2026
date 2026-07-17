/**
 * Camp map — structured location data for the interactive Location section.
 *
 * This file holds ONLY structure (ids, geometry, category, marker shape).
 * All human-facing text lives in the i18n locales under `location.*` and is
 * looked up by zone id, so the map is fully translatable and easy to extend:
 * to attach photos, deeper logistics, or navigation later, add fields here
 * (e.g. `photos`, `coords`) and read them in CampMap — no JSX rewrite needed.
 *
 * Coordinate space
 * ----------------
 * `x` / `y` are PERCENTAGES (0–100) inside the illustrated chart box. The chart
 * SVG uses the matching viewBox `0 0 CHART_W CHART_H` (same 4:3 aspect as the
 * container), so a marker at (50, 50) sits at the true centre of the artwork
 * and trail paths drawn in viewBox units line up exactly with the HTML markers.
 *
 * Positions follow the client's hand sketch of the camp at Cape Kiperort, adjusted for
 * visual balance while preserving the real spatial relationships between areas.
 */

/** Functional grouping — drives marker colour + legend. */
export type CampZoneCategory =
  | "arrival"
  | "facility"
  | "food"
  | "gather"
  | "rest"
  | "nature";

/** Marker silhouette. The sketch drew dining as a diamond, common as a circle. */
export type CampMarkerShape = "pin" | "diamond" | "circle";

export type CampZone = {
  /** Stable id — also the i18n key: `location.zones.<id>.*`. */
  id: string;
  /** Original Russian label from the sketch, kept for authenticity/tooltip. */
  ruLabel: string;
  category: CampZoneCategory;
  shape: CampMarkerShape;
  /** Icon key resolved to an inline SVG in CampMap. */
  icon:
    | "anchor"
    | "flag"
    | "pot"
    | "bowl"
    | "fire"
    | "tent"
    | "waves";
  /** Chart position, 0–100 (x → right, y → down). */
  x: number;
  y: number;
  /** Hero markers render slightly larger and lead the reveal. */
  hero?: boolean;
};

/** 4:3 chart artwork space. Marker % → viewBox units via x*CHART_W/100. */
export const CHART_W = 1000;
export const CHART_H = 750;

export const CAMP_ZONES: CampZone[] = [
  { id: "pier",      ruLabel: "Причал",      category: "arrival",  shape: "pin",     icon: "anchor", x: 15, y: 43, hero: true },
  { id: "organizer", ruLabel: "Организатор", category: "facility", shape: "pin",     icon: "flag",   x: 73, y: 21 },
  { id: "kitchen",   ruLabel: "Кухня",       category: "food",     shape: "pin",     icon: "pot",    x: 46, y: 41, hero: true },
  { id: "dining",    ruLabel: "Питание",     category: "food",     shape: "diamond", icon: "bowl",   x: 61, y: 51 },
  { id: "common",    ruLabel: "Общая зона",  category: "gather",   shape: "circle",  icon: "fire",   x: 83, y: 61, hero: true },
  { id: "tents",     ruLabel: "Палатки",     category: "rest",     shape: "pin",     icon: "tent",   x: 41, y: 71 },
  { id: "beach",     ruLabel: "Пляж",        category: "nature",   shape: "pin",     icon: "waves",  x: 24, y: 83 },
];

/**
 * Trails between areas — chained [x, y] percentage way-points. Rendered as
 * gently curved dashed paths that "draw on" when the map scrolls into view.
 * They trace real walking routes from the sketch (pier is the hub).
 */
export const CAMP_TRAILS: Array<{ id: string; points: Array<[number, number]> }> = [
  { id: "pier-organizer", points: [[15, 43], [36, 31], [56, 25], [73, 21]] },
  { id: "pier-kitchen",   points: [[15, 43], [30, 42], [46, 41]] },
  { id: "kitchen-common", points: [[46, 41], [61, 51], [83, 61]] },
  { id: "kitchen-tents",  points: [[46, 41], [44, 56], [41, 71]] },
  { id: "pier-beach",     points: [[15, 43], [18, 62], [24, 83]] },
];
