/**
 * MapVideo — a lazy "facade" video showcase for the aerial camp / map flythrough.
 *
 * Why a facade: the source is a multi-GB stream. We must NOT mount the player
 * iframe on page load (it would tank the landing page). Instead we show a
 * lightweight poster + play button and only inject the iframe on click.
 *
 * Provider-switchable so you can ship today on Google Drive and move to a
 * proper streaming host later by changing two constants:
 *
 *   • "drive"   — Google Drive preview. Works now, but Drive throttles large
 *                 files under traffic and shows its own UI. Stopgap only.
 *   • "youtube" — Upload the video as Unlisted on YouTube (free, adaptive
 *                 streaming, clean embed, handles multi-GB). Recommended for
 *                 production. Then set PROVIDER="youtube" and VIDEO_ID to the
 *                 11-char YouTube id.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// --- Configure the source here -------------------------------------------
const PROVIDER: "drive" | "youtube" = "drive";
// Google Drive file id (from the shared link) OR a YouTube video id.
const VIDEO_ID = "1nRSp017RW_nZ7Gp2iX66IeTTBH1s5psj";
// -------------------------------------------------------------------------

function embedSrc(): string {
  if (PROVIDER === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;
  }
  // Drive preview player (autoplay isn't controllable; user taps play inside).
  return `https://drive.google.com/file/d/${VIDEO_ID}/preview`;
}

export function MapVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="map-video" className="relative overflow-hidden bg-clove-900 py-20 md:py-28">
      {/* Forest → river wash to seat the section in the new nature palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at 25% 0%, rgba(111,158,87,0.20), transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(63,124,147,0.22), transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-5xl px-6 text-center">
        <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-fern">
          From above
        </span>
        <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-tight tracking-tight text-cream-50 md:text-5xl">
          See the camp <span className="italic text-saffron">from the sky.</span>
        </h2>
        <p className="reveal mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-cream-100/75">
          A flythrough of the grounds — the forest paths, the riverside, and
          every corner of the camp where flavor meets nature.
        </p>

        {/* Player frame */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 overflow-hidden rounded-3xl border border-cream-100/10 bg-clove-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
        >
          <div className="relative aspect-video w-full">
            {playing ? (
              <iframe
                src={embedSrc()}
                title="PERMIRA Summer Camp — aerial map flythrough"
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Play the camp flythrough video"
                className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{
                  background:
                    "linear-gradient(135deg, #2f5d3a 0%, #234a4f 55%, #3f7c93 100%)",
                }}
              >
                {/* Soft texture so the poster isn't a flat gradient */}
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-25 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
                  }}
                />
                <span className="relative grid h-20 w-20 place-items-center rounded-full bg-cream-50/95 text-clove-900 shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="relative text-sm font-medium uppercase tracking-[0.2em] text-cream-50/90">
                  Play the flythrough
                </span>
                <span className="relative text-[11px] text-cream-50/55">
                  Loads only when you press play
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Cross-link to the interactive 3D map */}
        <p className="reveal mt-6 text-sm text-cream-100/70">
          Prefer to explore it yourself?{" "}
          <Link to="/maps" className="font-medium text-saffron underline-offset-4 hover:underline">
            Open the interactive camp map →
          </Link>
        </p>
      </div>
    </section>
  );
}
