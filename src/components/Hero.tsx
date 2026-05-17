import { useEffect, useRef } from "react";
import heroImg from "../assets/hero.png";

export function Hero() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const orb = orbRef.current;
      if (!orb) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 24;
      orb.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-batik bg-grain pt-32 pb-24 md:pt-40 md:pb-32"
    >
      {/* Soft warm wash */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(224,123,60,0.20), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(196,80,42,0.18), transparent 50%)",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-terracotta-500/30 bg-cream-50/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-terracotta-600 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-terracotta-500" />
            Summer · 2026
          </span>

          <h1 className="reveal mt-6 font-display text-balance text-5xl font-light leading-[1.02] tracking-[-0.02em] text-clove-900 md:text-7xl lg:text-[5.25rem]">
            Taste of{" "}
            <span className="relative inline-block">
              <span className="italic font-medium text-terracotta-500">Nusantara</span>
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
            <br />
            <span className="text-clove-900/80">where flavor</span>
            <br />
            <span className="font-script text-saffron text-6xl md:text-8xl lg:text-9xl leading-none">
              becomes friendship
            </span>
          </h1>

          <p className="reveal mt-8 max-w-xl text-pretty text-lg leading-relaxed text-clove-700/85">
            PERMIRA Summer Camp 2026 invites Indonesian and Russian students to
            cook, share, and celebrate across three unforgettable days — a story
            of cultures meeting at the same table.
          </p>

          <div className="reveal mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#register"
              className="group inline-flex items-center gap-2 rounded-full bg-clove-900 px-7 py-3.5 text-sm font-medium text-cream-50 shadow-[0_10px_30px_-10px_rgba(74,32,20,0.6)] transition-all hover:bg-terracotta-500 hover:shadow-[0_14px_36px_-10px_rgba(196,80,42,0.6)]"
            >
              Reserve your seat
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#journey"
              className="inline-flex items-center gap-2 rounded-full border border-clove-900/15 bg-cream-50/60 px-7 py-3.5 text-sm font-medium text-clove-900 backdrop-blur transition-all hover:border-terracotta-500/40 hover:bg-cream-50"
            >
              See the journey
            </a>
          </div>

          <div className="reveal mt-12 grid max-w-md grid-cols-3 gap-6 text-clove-700">
            <div>
              <div className="font-display text-3xl font-medium text-terracotta-500">3</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-clove-700/70">Days · Three acts</div>
            </div>
            <div>
              <div className="font-display text-3xl font-medium text-terracotta-500">12+</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-clove-700/70">Dishes shared</div>
            </div>
            <div>
              <div className="font-display text-3xl font-medium text-terracotta-500">2</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-clove-700/70">Cultures, one table</div>
            </div>
          </div>
        </div>

        {/* Visual focal point */}
        <div className="relative mx-auto w-full max-w-xl">
          <div
            ref={orbRef}
            className="relative aspect-square w-full transition-transform duration-300 ease-out"
          >
            {/* Concentric batik rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-terracotta-500/15 via-saffron/10 to-turmeric/15 blur-2xl" />
            <div className="absolute inset-6 rounded-full border border-terracotta-500/20" />
            <div className="absolute inset-14 rounded-full border border-terracotta-500/15" />
            <div className="absolute inset-24 rounded-full border border-terracotta-500/10" />

            {/* Orbiting spice tags */}
            <SpiceTag label="cinnamon" className="left-[-2%] top-[18%]" rotation={-8} />
            <SpiceTag label="lemongrass" className="right-[-4%] top-[32%]" rotation={6} />
            <SpiceTag label="galangal" className="left-[6%] bottom-[12%]" rotation={4} />
            <SpiceTag label="kemiri" className="right-[8%] bottom-[6%]" rotation={-5} />

            <img
              src={heroImg}
              alt="A bowl from the Nusantara"
              className="relative z-10 mx-auto h-full w-full object-contain drop-shadow-[0_30px_50px_rgba(74,32,20,0.25)]"
            />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-clove-700/50">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll the story</span>
          <span className="block h-8 w-px animate-pulse bg-clove-700/30" />
        </div>
      </div>
    </section>
  );
}

function SpiceTag({
  label,
  className,
  rotation,
}: {
  label: string;
  className: string;
  rotation: number;
}) {
  return (
    <div
      className={`absolute z-20 rounded-full border border-clove-900/10 bg-cream-50/90 px-3 py-1 font-script text-xl text-clove-800 shadow-sm backdrop-blur ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {label}
    </div>
  );
}
