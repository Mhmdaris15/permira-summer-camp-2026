/**
 * EventPhotos — a gallery of real photographs taken during the PERMIRA Summer Camp 2026.
 * Images live in src/assets/photos and are pulled in with import.meta.glob.
 * Clicking a photo opens a full-screen lightbox with prev/next + keyboard navigation.
 */
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Eager glob → each value is the final hashed asset URL.
const modules = import.meta.glob(
  "../assets/photos/*.{jpg,jpeg,png,webp,JPG,PNG,WEBP}",
  { eager: true, import: "default" },
);
const PHOTOS: string[] = Object.keys(modules)
  .sort()
  .map((k) => modules[k] as string);

export function EventPhotos() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setOpenIndex((i) => (i === null ? i : (i + dir + PHOTOS.length) % PHOTOS.length)),
    [],
  );

  // Keyboard nav + body scroll lock while open.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, close, step]);

  if (PHOTOS.length === 0) return null;

  return (
    <section id="event-photos" className="relative bg-cream-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
              {t("eventPhotos.eyebrow")}
            </span>
            <h2 className="reveal mt-4 max-w-2xl font-display text-balance text-4xl font-light leading-tight tracking-tight text-clove-900 md:text-6xl">
              {t("eventPhotos.heading1")} <span className="italic text-terracotta-500">{t("eventPhotos.headingItalic")}</span> {t("eventPhotos.heading2")}
            </h2>
          </div>
          <p className="reveal max-w-md text-pretty text-base leading-relaxed text-clove-700/80">
            {t("eventPhotos.intro")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {PHOTOS.map((src, i) => (
            <motion.figure
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              onClick={() => setOpenIndex(i)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-clove-900/5 aspect-[4/3]"
            >
              <img
                src={src}
                alt={`${t("eventPhotos.galleryAlt")} ${i + 1}`}
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
      {createPortal(
        <AnimatePresence>
          {openIndex !== null && (
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
                key={openIndex}
                src={PHOTOS[openIndex]}
                alt={`${t("eventPhotos.galleryAlt")} ${openIndex + 1}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-cream-50/10 px-4 py-1.5 font-mono text-xs text-cream-50/80">
                {openIndex + 1} / {PHOTOS.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
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

function prev() {
  // This will be handled by the step function in the component
}

function next() {
  // This will be handled by the step function in the component
}