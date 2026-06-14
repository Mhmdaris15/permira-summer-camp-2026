/**
 * "Memories" gallery — real photographs from past PERMIRA summer camps.
 *
 * Images live in src/assets/archives and are pulled in with import.meta.glob
 * (handles the spaced/parenthesised filenames cleanly). Vite hashes and
 * build-optimises each one. Clicking a tile opens a lightbox with keyboard
 * + arrow navigation.
 */
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Eager URL glob — returns { path: url }. Sorted numerically by the (n) suffix.
const archiveModules = import.meta.glob<string>(
  "../assets/archives/*.{jpg,jpeg,png,webp}",
  { eager: true, query: "?url", import: "default" },
);

const archives: string[] = Object.entries(archiveModules)
  .sort(([a], [b]) => extractIndex(a) - extractIndex(b))
  .map(([, url]) => url);

function extractIndex(path: string): number {
  const m = path.match(/\((\d+)\)/);
  return m ? Number(m[1]) : 0;
}

// Masonry span/aspect pattern cycled across the tiles for visual rhythm.
const LAYOUT = [
  "md:row-span-2 aspect-[3/4]",
  "aspect-[4/3]",
  "md:col-span-2 aspect-[16/9]",
  "aspect-square",
  "md:row-span-2 aspect-[3/4]",
  "aspect-[4/3]",
  "md:col-span-2 aspect-[16/9]",
  "aspect-square",
];

export function Memories() {
  const { t } = useTranslation();
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % archives.length)),
    [],
  );
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + archives.length) % archives.length)),
    [],
  );

  // Keyboard nav for the lightbox.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, next, prev]);

  return (
    <section id="memories" className="relative bg-cream-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
              {t("memories.eyebrow")}
            </span>
            <h2 className="reveal mt-4 max-w-2xl font-display text-balance text-4xl font-light leading-tight tracking-tight text-clove-900 md:text-6xl">
              {t("memories.heading1")} <span className="italic text-terracotta-500">{t("memories.headingItalic")}</span> {t("memories.heading2")}
            </h2>
          </div>
          <p className="reveal max-w-md text-pretty text-base leading-relaxed text-clove-700/80">
            {t("memories.intro")}
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {archives.map((src, i) => (
            <motion.figure
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              onClick={() => setActive(i)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-clove-900/5 ${LAYOUT[i % LAYOUT.length]}`}
            >
              <img
                src={src}
                alt={`PERMIRA summer camp memory ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clove-900/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 transition-all duration-500 group-hover:opacity-100">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cream-50/90 text-clove-900 shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </motion.figure>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-clove-900/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-cream-50/20"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>

            <NavButton side="left" onClick={(e) => { e.stopPropagation(); prev(); }} />
            <NavButton side="right" onClick={(e) => { e.stopPropagation(); next(); }} />

            <motion.img
              key={active}
              src={archives[active]}
              alt={`PERMIRA summer camp memory ${active + 1}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-cream-50/10 px-4 py-1.5 font-mono text-xs text-cream-50/80">
              {active + 1} / {archives.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={`absolute top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-cream-50/20 ${
        side === "left" ? "left-4 md:left-8" : "right-4 md:right-8"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        {side === "left" ? (
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
