/**
 * Legend — glassmorphic colour-key panel, grouped by category so the
 * eye can navigate it like a real architectural plan key.
 */
import { COLORS } from "./layout";

type Item = { color: string; label: string };
const TENTS: Item[] = [
  { color: COLORS.participantTent, label: "Participant tents" },
  { color: COLORS.committeeTent,   label: "Committee tents" },
];
const ACTIVITY: Item[] = [
  { color: COLORS.briefing,  label: "Briefing & gathering" },
  { color: COLORS.cooking,   label: "Cooking & dining" },
  { color: COLORS.games,     label: "Games / fun" },
  { color: COLORS.fireBase,  label: "Campfire" },
];
const FACILITIES: Item[] = [
  { color: COLORS.assembly,      label: "Assembly point" },
  { color: COLORS.committeePost, label: "Committee post" },
];
const WAYFINDING: Item[] = [
  { color: COLORS.path,     label: "Pathway" },
  { color: COLORS.arrowIn,  label: "Entrance" },
  { color: COLORS.arrowOut, label: "Exit" },
];

export function Legend() {
  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-10 max-w-xs select-none rounded-2xl border border-white/55 bg-white/55 px-5 py-4 shadow-[0_18px_50px_-20px_rgba(74,32,20,0.35)] ring-1 ring-black/[0.02] backdrop-blur-xl backdrop-saturate-150">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-terracotta-500" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-clove-700/80">
          Site Legend
        </span>
      </div>
      <Group title="Accommodation" items={TENTS} />
      <Group title="Activity zones" items={ACTIVITY} />
      <Group title="Facilities" items={FACILITIES} />
      <Group title="Wayfinding" items={WAYFINDING} last />
    </div>
  );
}

function Group({ title, items, last }: { title: string; items: Item[]; last?: boolean }) {
  return (
    <div className={last ? "" : "mb-3"}>
      <div className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-clove-700/55">
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2.5 text-[11.5px] text-clove-900">
            <span
              aria-hidden
              className="h-3 w-3 rounded-[3px] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] ring-1 ring-black/15"
              style={{ background: it.color }}
            />
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
