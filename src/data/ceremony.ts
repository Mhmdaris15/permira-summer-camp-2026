/**
 * Opening ceremony programme (Day 1, 19 July 2026 · 13:30–14:35 MSK).
 *
 * Structure only — names are proper nouns kept verbatim; roles and the
 * ceremony chrome are translated in the locales under `ceremony.*`.
 * `key` maps to `ceremony.items.<key>`:
 *   • kind "moment"  → a shared moment (anthems, tumpeng) — key is its label
 *   • kind "speaker" → `name` is shown, key is the person's role
 */
export type CeremonyItem = {
  time: string;
  key: string;
  kind: "moment" | "speaker";
  /** Proper-noun name, shown as-is for speakers. */
  name?: string;
};

/** Official broadcast URL from the event information. */
export const LIVESTREAM_URL = "https://summercamp2026.permiraspb.org";

export const CEREMONY_ITEMS: CeremonyItem[] = [
  { time: "13:30", key: "anthems", kind: "moment" },
  { time: "13:33", key: "pratikno", kind: "speaker", name: "Prof. Dr. Pratikno, M.Soc.Sc" },
  { time: "13:35", key: "ambassador", kind: "speaker", name: "H.E. José Antonio Morató Tavares" },
  { time: "13:40", key: "consul", kind: "speaker", name: "Valery A. Radchenko" },
  { time: "13:45", key: "stulov", kind: "speaker", name: "Fedor N. Stulov" },
  { time: "13:55", key: "mikhalchenko", kind: "speaker", name: "Anastasia V. Mikhalchenko" },
  { time: "14:05", key: "siluyanov", kind: "speaker", name: "Alexander N. Siluyanov" },
  { time: "14:10", key: "kalyagina", kind: "speaker", name: "Natalya A. Kalyagina" },
  { time: "14:15", key: "hidayatullah", kind: "speaker", name: "Muhammad Febri Hidayatullah" },
  { time: "14:25", key: "shaleha", kind: "speaker", name: "Fikriya Shaleha" },
  { time: "14:30", key: "tumpeng", kind: "moment" },
];
