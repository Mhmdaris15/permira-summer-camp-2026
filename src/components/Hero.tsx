import { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { dishes } from "../data/dishes";
import { eventLogo, flags } from "../data/organizations";

/**
 * Hero — full-viewport cinematic opener.
 *
 * Composition:
 *   • Left  — editorial headline, flag eyebrow, CTAs, stats
 *   • Right — a parallax cluster of real archive + dish photos, fanned like
 *             scattered prints, with the event logo as a wax-stamp badge
 *   • Base  — an auto-scrolling marquee of past-camp moments
 *
 * Motion: Framer Motion handles staggered entrance + perpetual gentle float;
 * pointer parallax is driven by CSS custom properties (--px/--py) set on the
 * section, so it costs zero React re-renders.
 */

// Pull every archive photo (build-optimised) for the collage + marquee.
const archiveModules = import.meta.glob<string>(
  "../assets/archives/*.{jpg,jpeg,png,webp}",
  { eager: true, query: "?url", import: "default" },
);
const archives: string[] = Object.entries(archiveModules)
  .sort(([a], [b]) => idx(a) - idx(b))
  .map(([, url]) => url);

function idx(p: string) {
  const m = p.match(/\((\d+)\)/);
  return m ? Number(m[1]) : 0;
}

// Curated collage cards — mix of camp moments + a hero dish. Captions are
// decorative-free (language-neutral matted prints) to stay fully translatable.
const collage = [
  { src: archives[7] ?? archives[0], depth: 26, className: "left-0 top-2 w-[58%] rotate-[-6deg]", float: 6.5, delay: 0.15 },
  { src: dishes[0].image,            depth: 16, className: "right-2 top-0 w-[46%] rotate-[5deg]",  float: 5.0, delay: 0.3 },
  { src: archives[2] ?? archives[1], depth: 38, className: "right-0 bottom-6 w-[52%] rotate-[4deg]", float: 7.5, delay: 0.45 },
  { src: archives[12] ?? archives[3], depth: 22, className: "left-6 bottom-0 w-[42%] rotate-[-4deg]", float: 6.0, delay: 0.6 },
];

export function Hero() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);

  function handleMove(e: React.MouseEvent) {
    const el = sectionRef.current;
    if (!el) return;
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1..1
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    el.style.setProperty("--px", String(nx));
    el.style.setProperty("--py", String(ny));
  }

  return (
    <section
      ref={sectionRef}
      id="top"
      onMouseMove={handleMove}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-batik bg-grain pt-28 pb-28 md:pt-32"
      style={{ "--px": 0, "--py": 0 } as React.CSSProperties}
    >
      {/* Warm directional wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 75% 15%, rgba(224,123,60,0.22), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(196,80,42,0.16), transparent 50%)",
        }}
      />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8">
        {/* ─────────── LEFT: editorial ─────────── */}
        <div className="relative z-10">
          {/* Flag eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-3 rounded-full border border-terracotta-500/25 bg-cream-50/70 py-1.5 pl-2 pr-4 text-xs font-medium uppercase tracking-[0.16em] text-terracotta-600 backdrop-blur-sm"
          >
            <span className="flex items-center -space-x-1.5">
              <img src={flags[0].flag} alt="Indonesia" className="h-5 w-5 rounded-full object-cover ring-2 ring-cream-50" />
              <img src={flags[1].flag} alt="Russia" className="h-5 w-5 rounded-full object-cover ring-2 ring-cream-50" />
            </span>
            {t("hero.eyebrow")}
          </motion.div>

          <h1 className="mt-6 font-display text-balance text-5xl font-light leading-[1.0] tracking-[-0.02em] text-clove-900 md:text-7xl lg:text-[5rem]">
            {[t("hero.titleLead"), t("hero.titleLine2"), t("hero.titleLine3")].map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {i === 0 ? (
                  <>
                    {line}{" "}
                    <span className="relative inline-block">
                      <span className="italic font-medium text-terracotta-500">{t("hero.titleNusantara")}</span>
                      <svg
                        viewBox="0 0 220 14"
                        aria-hidden
                        className="absolute -bottom-2 left-0 h-2.5 w-full text-turmeric"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M2 9 C 50 2, 110 14, 218 5" />
                      </svg>
                    </span>
                  </>
                ) : i === 1 ? (
                  <span className="text-clove-900/80">{line}</span>
                ) : (
                  <span className="font-script text-saffron text-6xl md:text-8xl lg:text-[7rem] leading-none">
                    {line}
                  </span>
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-clove-700/85"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#register"
              className="group inline-flex items-center gap-2 rounded-full bg-clove-900 px-7 py-3.5 text-sm font-medium text-cream-50 shadow-[0_12px_30px_-10px_rgba(74,32,20,0.6)] transition-all hover:bg-terracotta-500 hover:shadow-[0_16px_40px_-10px_rgba(196,80,42,0.6)]"
            >
              {t("hero.ctaPrimary")}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#journey"
              className="inline-flex items-center gap-2 rounded-full border border-clove-900/15 bg-cream-50/60 px-7 py-3.5 text-sm font-medium text-clove-900 backdrop-blur transition-all hover:border-terracotta-500/40 hover:bg-cream-50"
            >
              {t("hero.ctaSecondary")}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.74 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 text-clove-700"
          >
            <Stat value={t("hero.stat1")} label={t("hero.stat1label")} />
            <Stat value={t("hero.stat2")} label={t("hero.stat2label")} />
            <Stat value={t("hero.stat3")} label={t("hero.stat3label")} />
          </motion.div>
        </div>

        {/* ─────────── RIGHT: parallax collage ─────────── */}
        <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-lg lg:block">
          {/* Soft halo behind the cluster */}
          <div className="absolute inset-8 rounded-[40%] bg-gradient-to-br from-terracotta-500/15 via-saffron/10 to-turmeric/15 blur-3xl" />

          {collage.map((card, i) => (
            <ParallaxCard key={i} depth={card.depth} className={card.className}>
              <motion.figure
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: card.delay, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                <motion.div
                  animate={{ y: [0, -card.float, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                  className="overflow-hidden rounded-2xl bg-cream-50 p-1.5 shadow-[0_24px_60px_-20px_rgba(74,32,20,0.5)] ring-1 ring-black/5"
                >
                  <img
                    src={card.src}
                    alt=""
                    loading="eager"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                </motion.div>
              </motion.figure>
            </ParallaxCard>
          ))}

          {/* Event-logo wax stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="grid h-28 w-28 place-items-center rounded-full bg-cream-50 p-2 shadow-[0_18px_44px_-12px_rgba(74,32,20,0.55)] ring-1 ring-terracotta-500/20">
              <img src={eventLogo} alt="PERMIRA Summer Camp 2026" className="h-full w-full rounded-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─────────── BASE: moments marquee ─────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
      >
        <div className="mb-3 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-clove-700/50">
          <span className="h-px w-8 bg-clove-700/20" />
          Moments from past camps
          <span className="h-px w-8 bg-clove-700/20" />
        </div>
        <div className="relative overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <motion.div
            className="flex w-max gap-3"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...archives, ...archives].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                aria-hidden
                loading="lazy"
                className="h-16 w-24 shrink-0 rounded-lg object-cover opacity-70 shadow-sm ring-1 ring-black/5 md:h-20 md:w-32"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-32 left-1/2 hidden -translate-x-1/2 lg:block">
        <div className="flex flex-col items-center gap-2 text-clove-700/40">
          <span className="text-[10px] uppercase tracking-[0.3em]">{t("hero.scroll")}</span>
          <span className="block h-8 w-px animate-pulse bg-clove-700/30" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-medium text-terracotta-500">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-clove-700/70">{label}</div>
    </div>
  );
}

/**
 * ParallaxCard — positions a card absolutely and shifts it with the pointer
 * via the section's --px/--py custom properties. `depth` is the pixel travel
 * at the screen edge; larger = the card appears closer to the viewer.
 */
function ParallaxCard({
  depth,
  className,
  children,
}: {
  depth: number;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        transform: `translate(calc(var(--px) * ${depth}px), calc(var(--py) * ${depth}px))`,
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}
