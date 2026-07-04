/**
 * CampMap — the Location section as an illustrated "expedition chart".
 *
 * Rather than a watermarked satellite screenshot or default map pins, the camp
 * is drawn as a warm sand spit ringed by lake water and pine forest (faithful
 * to the client's hand sketch of Kubenskiy Island). Function-coded medallion
 * markers sit on the sand, linked by dashed trails that draw on when the map
 * scrolls into view. Selecting a marker slides its detail into the side panel.
 *
 * All copy is translated (i18n `location.*`); all geometry is data
 * (`src/data/campMap.ts`). To add photos/logistics later, extend the data and
 * read it here — no structural rewrite needed.
 */
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IslandGallery } from "./IslandGallery";
import {
  CAMP_ZONES,
  CAMP_TRAILS,
  CHART_W,
  CHART_H,
  type CampZone,
  type CampZoneCategory,
} from "../data/campMap";

// --- Flythrough video (same source as the standalone player) --------------
const PROVIDER: "drive" | "youtube" = "drive";
const VIDEO_ID = "1nRSp017RW_nZ7Gp2iX66IeTTBH1s5psj";
function embedSrc(): string {
  return PROVIDER === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`
    : `https://drive.google.com/file/d/${VIDEO_ID}/preview`;
}

// --- Function → colour. Six distinguishable hues drawn from the palette. ---
const CATEGORY_COLOR: Record<CampZoneCategory, string> = {
  arrival: "#3f7c93", // river blue
  facility: "#c4502a", // terracotta
  food: "#e07b3c", // saffron
  gather: "#6f9e57", // fern
  rest: "#a9773f", // warm clay
  nature: "#7bb0a0", // soft shore teal
};

// --- Custom line icons, 24×24 stroke space --------------------------------
const ICON_PATHS: Record<CampZone["icon"], string> = {
  anchor: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 0v12M8 11h8M5 15a7 7 0 0 0 14 0",
  flag: "M6 21V4m0 1h11l-2.2 3.2L17 12H6",
  pot: "M4 10h16l-1.2 8.3a2 2 0 0 1-2 1.7H7.2a2 2 0 0 1-2-1.7zM9 10V7m3 3V6m3 4V7M3 10h18",
  bowl: "M4 11h16a8 8 0 0 1-16 0zM9.5 4c0 1.2-1 1.2-1 2.4S9.5 7.6 9.5 8.8M14.5 4c0 1.2-1 1.2-1 2.4s1 1.2 1 2.4",
  fire: "M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-4 3-5 5-9z",
  tent: "M12 4 3 20h18zM12 4v16M9 20l3-6 3 6",
  waves: "M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0",
};

/** Catmull-Rom → cubic bezier: a smooth curve through the given viewBox points. */
function smoothPath(points: Array<[number, number]>): string {
  const p = points.map(([x, y]) => [(x / 100) * CHART_W, (y / 100) * CHART_H]);
  if (p.length < 2) return "";
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function CampMap() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [flythrough, setFlythrough] = useState(false);

  const active = CAMP_ZONES.find((z) => z.id === activeId) ?? null;
  const categories: CampZoneCategory[] = ["arrival", "facility", "food", "gather", "rest", "nature"];

  return (
    <section id="location" className="relative overflow-hidden bg-clove-900 py-20 md:py-28">
      {/* Forest → river wash to seat the section in the nature palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(47,93,58,0.30), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(63,124,147,0.28), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section head */}
        <div className="max-w-2xl">
          <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-fern">
            {t("location.eyebrow")}
          </span>
          <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-[1.05] tracking-tight text-cream-50 md:text-5xl">
            {t("location.headingLead")}{" "}
            <span className="italic text-saffron">{t("location.headingEm")}</span>
          </h2>
          <p className="reveal mt-5 max-w-xl text-pretty text-base leading-relaxed text-cream-100/75">
            {t("location.intro")}
          </p>
        </div>

        {/* Chart + panel */}
        <div className="reveal mt-12 grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:gap-8">
          {/* --- The illustrated chart --- */}
          <div className="relative aspect-[4/3] w-full select-none">
            {/* Artwork layer (clipped, rounded) */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl ring-1 ring-cream-100/10 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.65)]">
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="h-full w-full"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={t("location.place")}
              >
                <defs>
                  <linearGradient id="cm-water" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#3f7c93" />
                    <stop offset="0.5" stopColor="#2a5563" />
                    <stop offset="1" stopColor="#1a333c" />
                  </linearGradient>
                  <radialGradient id="cm-sand" cx="0.42" cy="0.44" r="0.75">
                    <stop offset="0" stopColor="#e9d3ab" />
                    <stop offset="0.7" stopColor="#d9be92" />
                    <stop offset="1" stopColor="#c9ab7c" />
                  </radialGradient>
                  <filter id="cm-soft" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="7" />
                  </filter>
                  <filter id="cm-grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                  </filter>
                </defs>

                {/* Water */}
                <rect width={CHART_W} height={CHART_H} fill="url(#cm-water)" />
                {/* Depth contour lines (cartographic hint) */}
                <g fill="none" stroke="#bfe0e8" strokeOpacity="0.10" strokeWidth="2">
                  <path d="M40 250 C 180 180, 320 200, 430 300" />
                  <path d="M20 360 C 160 300, 300 320, 380 420" />
                  <path d="M760 700 C 840 620, 900 600, 980 640" />
                </g>

                {/* Forest — behind the sand, framing the clearing on the right + top */}
                <g>
                  <path
                    d="M470 120 C 640 70, 860 90, 1010 150 C 1030 300, 1020 470, 1000 620 C 980 660, 940 640, 900 610 C 900 470, 880 330, 820 240 C 720 180, 560 200, 470 210 Z"
                    fill="#2f5d3a"
                  />
                  <path
                    d="M520 150 C 700 120, 860 140, 980 200 C 995 340, 985 470, 965 560 C 900 470, 880 340, 800 270 C 700 220, 590 230, 520 235 Z"
                    fill="#3d6028"
                    opacity="0.85"
                  />
                  {/* canopy puffs for texture */}
                  {[
                    [640, 200, 34], [720, 175, 40], [820, 210, 46], [900, 260, 42],
                    [950, 360, 40], [940, 470, 44], [890, 560, 40], [800, 300, 38],
                    [700, 250, 30], [880, 190, 30],
                  ].map(([cx, cy, r], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#4f7a3a" : "#3d6028"} opacity="0.9" />
                  ))}
                </g>

                {/* Sand spit — soft shadow then body then beach rim */}
                <path
                  d="M110 380 C 130 220, 320 150, 470 150 C 660 150, 840 250, 900 420 C 930 540, 760 690, 560 705 C 380 715, 170 660, 100 520 Z"
                  fill="#0d1f24"
                  opacity="0.5"
                  filter="url(#cm-soft)"
                  transform="translate(0 14)"
                />
                <path
                  d="M110 380 C 130 220, 320 150, 470 150 C 660 150, 840 250, 900 420 C 930 540, 760 690, 560 705 C 380 715, 170 660, 100 520 Z"
                  fill="url(#cm-sand)"
                />
                {/* Beach — paler sand rim on the water-facing edges (top + lower-left) */}
                <path
                  d="M110 380 C 130 220, 320 150, 470 150 C 560 150, 650 175, 720 215 C 640 205, 520 200, 430 220 C 300 250, 190 320, 150 430 C 120 470, 110 430, 110 380 Z"
                  fill="#f0e4c6"
                  opacity="0.7"
                />
                <path
                  d="M100 520 C 170 660, 380 715, 560 705 C 470 690, 340 690, 250 640 C 180 600, 140 560, 120 500 C 110 505, 100 512, 100 520 Z"
                  fill="#f0e4c6"
                  opacity="0.6"
                />
                {/* scattered shore trees near the tent side */}
                {[[300, 560], [340, 600], [250, 520]].map(([cx, cy], i) => (
                  <g key={i} opacity="0.85">
                    <circle cx={cx} cy={cy} r="16" fill="#4f7a3a" />
                    <circle cx={cx + 8} cy={cy - 8} r="12" fill="#6f9e57" />
                  </g>
                ))}

                {/* grain overlay */}
                <rect width={CHART_W} height={CHART_H} filter="url(#cm-grain)" opacity="0.05" />

                {/* --- Trails --- */}
                <g fill="none" stroke="#7a5230" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 12">
                  {CAMP_TRAILS.map((tr, i) => {
                    const d = smoothPath(tr.points);
                    return reduce ? (
                      <path key={tr.id} d={d} />
                    ) : (
                      <motion.path
                        key={tr.id}
                        d={d}
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 1.1, delay: 0.3 + i * 0.15, ease: "easeInOut" }}
                      />
                    );
                  })}
                </g>

                {/* Compass rose (top-right) */}
                <g transform="translate(915 95)" opacity="0.85">
                  <circle r="30" fill="none" stroke="#fdf8f1" strokeOpacity="0.5" strokeWidth="1.5" />
                  <path d="M0 -26 L6 0 L0 26 L-6 0 Z" fill="#fdf8f1" fillOpacity="0.85" />
                  <path d="M0 -26 L6 0 L0 0 Z" fill="#e07b3c" />
                  <text x="0" y="-36" textAnchor="middle" fontSize="18" fill="#fdf8f1" fontFamily="var(--font-script)">N</text>
                </g>

              </svg>
            </div>

            {/* Script annotation in the open water off the beach (echoes the
                client's hand-written red note). Slight tilt for a charted feel. */}
            <span
              className="pointer-events-none absolute left-[2%] top-[60%] max-w-[30%] -rotate-6 font-script text-lg leading-tight text-cream-50/85 md:text-xl"
              aria-hidden
            >
              {t("location.beachNote")}
            </span>

            {/* --- Markers (interactive layer, not clipped) --- */}
            <div className="absolute inset-0">
              {CAMP_ZONES.map((z, i) => {
                const color = CATEGORY_COLOR[z.category];
                const isActive = activeId === z.id;
                const dimmed = activeId !== null && !isActive;
                return (
                  <motion.button
                    key={z.id}
                    type="button"
                    onClick={() => setActiveId(isActive ? null : z.id)}
                    aria-pressed={isActive}
                    aria-label={`${t(`location.zones.${z.id}.title`)} — ${t(`location.categories.${z.category}`)}`}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                    style={{ left: `${z.x}%`, top: `${z.y}%` }}
                    initial={reduce ? false : { opacity: 0, scale: 0.4, y: 8 }}
                    whileInView={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: 0.6 + i * 0.09, type: "spring", stiffness: 320, damping: 20 }}
                  >
                    {/* pulse ring on hover/active */}
                    <span
                      aria-hidden
                      className={`absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                        isActive ? "h-16 w-16 opacity-40" : "h-11 w-11 opacity-0 group-hover:h-14 group-hover:w-14 group-hover:opacity-30"
                      }`}
                      style={{ background: color }}
                    />
                    {/* medallion */}
                    <span
                      className={`grid place-items-center rounded-full text-cream-50 shadow-lg ring-2 ring-cream-50/80 transition-all duration-300 ${
                        z.hero ? "h-12 w-12" : "h-10 w-10"
                      } ${dimmed ? "opacity-45" : "opacity-100"} ${
                        isActive ? "scale-110" : "group-hover:scale-110 group-focus-visible:scale-110"
                      }`}
                      style={{
                        background: color,
                        borderRadius: z.shape === "diamond" ? "22%" : "9999px",
                        transform: z.shape === "diamond" ? "rotate(45deg)" : undefined,
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={z.hero ? "h-6 w-6" : "h-5 w-5"}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: z.shape === "diamond" ? "rotate(-45deg)" : undefined }}
                      >
                        <path d={ICON_PATHS[z.icon]} />
                      </svg>
                    </span>
                    {/* label */}
                    <span
                      className={`absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide backdrop-blur-sm transition-colors ${
                        isActive
                          ? "bg-cream-50 text-clove-900"
                          : "bg-clove-900/55 text-cream-50/90 group-hover:bg-clove-900/80"
                      } ${dimmed ? "opacity-45" : ""}`}
                    >
                      {t(`location.zones.${z.id}.title`)}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Focus caption — the real place name, lower-right on the water */}
            <div className="pointer-events-none absolute bottom-3 right-4 text-right">
              <div className="font-script text-lg text-cream-50/70">{t("location.place")}</div>
            </div>
          </div>

          {/* --- Detail panel --- */}
          <div className="relative min-h-[22rem] rounded-3xl border border-cream-100/12 bg-clove-800/40 p-6 backdrop-blur-sm md:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {active ? (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(null)}
                    className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-cream-100/60 transition hover:text-cream-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t("location.back")}
                  </button>

                  <div className="flex items-start gap-4">
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-cream-50 shadow-md"
                      style={{ background: CATEGORY_COLOR[active.category] }}
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={ICON_PATHS[active.icon]} />
                      </svg>
                    </span>
                    <div>
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                        style={{ color: CATEGORY_COLOR[active.category] }}
                      >
                        {t(`location.categories.${active.category}`)}
                      </span>
                      <h3 className="font-display text-2xl font-light leading-tight text-cream-50">
                        {t(`location.zones.${active.id}.title`)}
                      </h3>
                      <p className="font-script text-lg text-saffron/90">
                        {t(`location.zones.${active.id}.tagline`)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-pretty text-sm leading-relaxed text-cream-100/80">
                    {t(`location.zones.${active.id}.body`)}
                  </p>

                  <div className="mt-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cream-100/50">
                      {t("location.activitiesLabel")}
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {(t(`location.zones.${active.id}.activities`, { returnObjects: true }) as string[]).map((a) => (
                        <li
                          key={a}
                          className="rounded-full border border-cream-100/15 bg-cream-50/5 px-3 py-1 text-xs text-cream-100/85"
                        >
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 text-[11px] uppercase tracking-[0.2em] text-cream-100/35">
                    {active.ruLabel}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fern">
                    {t("location.overviewTitle")}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-light leading-tight text-cream-50">
                    {t("location.place")}
                  </h3>
                  <p className="mt-1 text-sm text-cream-100/60">{t("location.placeMeta")}</p>

                  <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-cream-100/12 bg-cream-50/5 p-3.5">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-river" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICON_PATHS.anchor} />
                    </svg>
                    <p className="text-xs leading-relaxed text-cream-100/75">{t("location.arriveNote")}</p>
                  </div>

                  <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-saffron/20 bg-saffron/5 p-3.5">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-saffron" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <p className="text-xs leading-relaxed text-cream-100/80">{t("location.gettingThere")}</p>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-cream-100/70">
                    {t("location.overviewBody")}
                  </p>

                  <div className="mt-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cream-100/50">
                      {t("location.legendTitle")}
                    </div>
                    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      {categories.map((c) => (
                        <li key={c} className="flex items-center gap-2 text-xs text-cream-100/80">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                          {t(`location.categories.${c}`)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-saffron/15 px-3 py-1.5 text-xs font-medium text-saffron">
                    {t("location.nights")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Real photos of the island */}
        <IslandGallery />

        {/* --- Secondary actions --- */}
        <div className="reveal mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setFlythrough((v) => !v)}
            className="inline-flex items-center gap-2.5 text-sm font-medium text-cream-50 transition hover:text-saffron"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/10 ring-1 ring-cream-50/20 transition group-hover:bg-cream-50/20">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            {t("location.flythroughCta")}
          </button>

          <Link
            to="/maps"
            className="inline-flex items-center gap-2 text-sm font-medium text-saffron underline-offset-4 hover:underline"
          >
            {t("location.mapCta")}
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Flythrough video reveal */}
        <AnimatePresence initial={false}>
          {flythrough && (
            <motion.div
              key="flythrough"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-6 overflow-hidden rounded-3xl border border-cream-100/10 bg-clove-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
                <div className="relative aspect-video w-full">
                  <iframe
                    src={embedSrc()}
                    title="PERMIRA Summer Camp — aerial map flythrough"
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-cream-50/45">{t("mapVideo.loadNote")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
