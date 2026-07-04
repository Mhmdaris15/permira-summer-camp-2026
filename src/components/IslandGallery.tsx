/**
 * IslandGallery — a preview grid of real photos of Kubenskiy Island in the
 * Kivipark nature reserve. Images are pulled in with import.meta.glob so any
 * photo dropped into src/assets/kubinskiy-island/ is picked up automatically
 * (robust to the awkward filenames), hashed, and bundled by Vite.
 *
 * Rendered inside the dark Location (CampMap) section.
 */
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
          <div
            key={src}
            className={`group relative overflow-hidden rounded-2xl ring-1 ring-cream-100/10 ${
              // Give the first photo a wider, taller feature cell on larger screens.
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
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-clove-900/30 to-transparent opacity-0 transition group-hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
