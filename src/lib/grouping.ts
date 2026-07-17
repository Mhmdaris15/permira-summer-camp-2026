/**
 * Balanced random group maker. Splits participants into groups (teams, tents,
 * etc.) that are balanced across the chosen dimensions (nationality and/or
 * gender) while staying random within each stratum.
 *
 * Method: bucket people by the composite of the enabled balance dimensions,
 * shuffle each bucket, then deal each bucket round-robin across the groups with
 * a rotating start offset. Even spread of every stratum → balanced groups; the
 * shuffle keeps it random and re-rollable. Pure and deterministic given the RNG.
 */

export type GroupMember = {
  id: string;
  fullName: string;
  nationality: string;
  gender: string;
};

export type GroupConfig = {
  /** "count" = make exactly N groups; "size" = ~N members per group. */
  mode: "count" | "size";
  value: number;
  balanceNationality: boolean;
  balanceGender: boolean;
  /** Group name prefix, e.g. "Team" or "Tent". */
  labelPrefix: string;
  naming: "number" | "letter";
};

export type Group = { name: string; members: GroupMember[] };

/** Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 0 → "A", 25 → "Z", 26 → "AA" … for letter-named groups. */
function toLetter(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function groupCountFor(total: number, cfg: GroupConfig): number {
  if (total <= 0) return 0;
  const v = Math.max(1, Math.floor(cfg.value) || 1);
  return cfg.mode === "count" ? Math.min(v, total) : Math.max(1, Math.ceil(total / v));
}

export function makeGroups(people: readonly GroupMember[], cfg: GroupConfig): Group[] {
  const total = people.length;
  const groupCount = groupCountFor(total, cfg);
  if (groupCount === 0) return [];

  const stratumKey = (p: GroupMember) =>
    [
      cfg.balanceNationality ? p.nationality.trim().toLowerCase() : "",
      cfg.balanceGender ? p.gender.trim().toLowerCase() : "",
    ].join("|");

  // Bucket by stratum. Larger strata dealt first so remainders spread evenly.
  const strata = new Map<string, GroupMember[]>();
  for (const p of people) {
    const k = stratumKey(p);
    const bucket = strata.get(k);
    if (bucket) bucket.push(p);
    else strata.set(k, [p]);
  }
  const ordered = [...strata.values()].sort((a, b) => b.length - a.length);

  const buckets: GroupMember[][] = Array.from({ length: groupCount }, () => []);
  let offset = 0;
  for (const members of ordered) {
    const shuffled = shuffle(members);
    for (let i = 0; i < shuffled.length; i++) {
      buckets[(offset + i) % groupCount].push(shuffled[i]);
    }
    // Continue dealing from where this stratum left off, so the next stratum
    // fills the groups that received fewer members first.
    offset = (offset + shuffled.length) % groupCount;
  }

  return buckets.map((members, i) => ({
    name: `${cfg.labelPrefix} ${cfg.naming === "letter" ? toLetter(i) : i + 1}`.trim(),
    members: shuffle(members),
  }));
}

/** Per-group tallies for the balance summary chips. */
export function tallyBy(members: GroupMember[], field: "nationality" | "gender"): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const m of members) {
    const name = (m[field] || "—").trim() || "—";
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
