/**
 * IslandGallery — a preview grid of real photos of Kubenskiy Island in the
 * Kivi Park nature reserve. Images are pulled in with import.meta.glob so any
 * photo dropped into src/assets/kubinskiy-island/ is picked up automatically
 * (robust to the awkward filenames), hashed, and bundled by Vite.
 *
 * Clicking a photo opens a full-screen lightbox with prev/next + keyboard
 * navigation (←/→/Esc). Rendered inside the dark Location (CampMap) section.
 */
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Eager glob → each value is the final hashed asset URL.
const modules = import.meta.glob(
  "../assets/kubinskiy-island/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
);
const PHOTOS: string[] = Object.keys(modules)
  .sort()
  .map((k) => modules[k] as string);

export function IslandGallery() {
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
    <div className="reveal mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-display text-2xl font-light text-cream-50">
          {t("location.galleryTitle")}
        </h3>
        <span className="text-[11px] text-cream-100/50">{t("location.galleryNote")}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PHOTOS.map((src, i) => (
          <button
            type="button"
            key={src}
            onClick={() => setOpenIndex(i)}
            aria-label={t("location.galleryOpen")}
            className={`group relative overflow-hidden rounded-2xl ring-1 ring-cream-100/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron ${
              i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-[4/3]"
            }`}
          >
            <img
              src={src}
              alt={t("location.galleryAlt")}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-clove-900/40 to-transparent opacity-0 transition group-hover:opacity-100"
            />
            {/* zoom affordance */}
            <span
              aria-hidden
              className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-clove-900/60 text-cream-50 opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4M11 8v6M8 11h6" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {createPortal(
        <AnimatePresence>
          {openIndex !== null && (
            <motion.div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-clove-900/90 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              role="dialog"
              aria-modal="true"
              aria-label={t("location.galleryTitle")}
            >
              {/* Close */}
              <button
                type="button"
                onClick={close}
                aria-label={t("common.close")}
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-cream-50/20"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                </svg>
              </button>

              {/* Prev / Next */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Previous"
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-cream-50/20 md:left-6"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Next"
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream-50/10 text-cream-50 transition hover:bg-cream-50/20 md:right-6"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              <motion.img
                key={PHOTOS[openIndex]}
                src={PHOTOS[openIndex]}
                alt={t("location.galleryAlt")}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />

              <div className="pointer-events-none absolute bottom-5 left-0 right-0 text-center text-xs text-cream-100/70">
                {openIndex + 1} / {PHOTOS.length} · {t("location.galleryNote")}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
