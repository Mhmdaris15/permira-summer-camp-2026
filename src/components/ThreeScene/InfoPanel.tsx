/**
 * InfoPanel — sliding glass panel on the right showing the inspected
 * zone's detail. Driven entirely by sceneState; closes on the X, on the
 * backdrop, or on ESC.
 */
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ZONES } from "./layout";
import { ZONE_INFO } from "./zoneInfo";
import { useSceneState } from "./sceneState";

export function InfoPanel() {
  const { inspectedId, clearInspect } = useSceneState();

  // ESC closes
  useEffect(() => {
    if (!inspectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearInspect();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspectedId, clearInspect]);

  const zone = inspectedId ? ZONES.find((z) => z.id === inspectedId) : null;
  const info = inspectedId ? ZONE_INFO[inspectedId] : null;

  return (
    <AnimatePresence>
      {zone && info && (
        <motion.aside
          key={zone.id}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 30, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto absolute right-6 top-24 z-30 w-[22rem] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-white/55 bg-white/65 shadow-[0_30px_80px_-20px_rgba(74,32,20,0.45)] ring-1 ring-black/[0.02] backdrop-blur-xl backdrop-saturate-150"
        >
          {/* Header */}
          <header className="flex items-start justify-between gap-3 border-b border-black/5 bg-gradient-to-br from-white/40 to-white/10 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/75 text-xl shadow-sm ring-1 ring-black/5">
                {info.icon}
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-terracotta-500">
                  Area
                </div>
                <h3 className="font-display text-lg font-semibold leading-tight text-clove-900">
                  {zone.label}
                </h3>
                <p className="mt-0.5 text-[11.5px] italic text-clove-700/80">
                  {info.summary}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearInspect}
              aria-label="Close"
              className="rounded-full p-1.5 text-clove-700/70 transition hover:bg-white/60 hover:text-terracotta-500"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          {/* Body */}
          <div className="space-y-4 px-5 py-4">
            <p className="text-[12.5px] leading-relaxed text-clove-800/90">
              {info.description}
            </p>

            <Section label="Activities">
              <ul className="grid grid-cols-1 gap-1.5 text-[12px] text-clove-800">
                {info.activities.map((a) => (
                  <li key={a} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-terracotta-500" />
                    {a}
                  </li>
                ))}
              </ul>
            </Section>

            <Section label="Capacity">
              <p className="text-[12px] text-clove-800">{info.capacity}</p>
            </Section>

            {info.schedule && info.schedule.length > 0 && (
              <Section label="Schedule">
                <ul className="space-y-1.5 text-[12px] text-clove-800">
                  {info.schedule.map((row, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-2 border-b border-black/5 pb-1.5 last:border-0 last:pb-0">
                      <span>
                        <span className="font-medium">{row.day}</span>
                        <span className="ml-2 text-clove-700/65">{row.time}</span>
                      </span>
                      <span className="ml-3 text-right text-[11.5px] italic text-clove-700/85">
                        {row.what}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          {/* Footer hint */}
          <footer className="border-t border-black/5 bg-white/35 px-5 py-2.5 text-[10.5px] text-clove-700/70">
            ESC or click outside to close · click another zone to switch
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-clove-700/55">
        {label}
      </div>
      {children}
    </section>
  );
}
