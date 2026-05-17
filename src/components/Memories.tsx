/**
 * "Memories" gallery — placeholder gradient tiles until real photos exist.
 * The grid uses an irregular masonry-like layout with handwritten captions
 * that fade in on hover, evoking a polaroid-pinned moodboard.
 */

const moments = [
  { caption: "the first laugh at the wok",   palette: ["#d99a3b", "#a23d1f"], span: "md:row-span-2 md:col-span-1", aspect: "aspect-[3/4]" },
  { caption: "lemongrass, lightly bruised",  palette: ["#c4502a", "#4a2014"], span: "",                            aspect: "aspect-[4/3]" },
  { caption: "morning at the market",        palette: ["#e07b3c", "#6b2e1a"], span: "md:col-span-2",               aspect: "aspect-[16/9]" },
  { caption: "soto, learning a new accent",  palette: ["#d99a3b", "#6b2e1a"], span: "",                            aspect: "aspect-square" },
  { caption: "candles, then quiet",          palette: ["#a23d1f", "#2c130b"], span: "md:row-span-2",               aspect: "aspect-[3/4]" },
  { caption: "two flags, one table",         palette: ["#e0a73c", "#a23d1f"], span: "md:col-span-2",               aspect: "aspect-[16/9]" },
  { caption: "recipe cards, exchanged",      palette: ["#d96a3a", "#4a2014"], span: "",                            aspect: "aspect-[4/3]" },
];

export function Memories() {
  return (
    <section id="memories" className="relative bg-cream-50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
              Memories
            </span>
            <h2 className="reveal mt-4 max-w-2xl font-display text-balance text-4xl font-light leading-tight tracking-tight text-clove-900 md:text-6xl">
              Moments that <span className="italic text-terracotta-500">linger</span> longer than the meal.
            </h2>
          </div>
          <p className="reveal max-w-md text-pretty text-base leading-relaxed text-clove-700/80">
            A glimpse of past PERMIRA gatherings — laughter over shared work,
            the small rituals that turn strangers into friends.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[180px] grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {moments.map((m, i) => (
            <figure
              key={i}
              className={`reveal group relative overflow-hidden rounded-2xl ${m.span} ${m.aspect}`}
              style={{
                background: `linear-gradient(135deg, ${m.palette[0]}, ${m.palette[1]})`,
              }}
            >
              <div
                className="absolute inset-0 opacity-25 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-40"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clove-900/60 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-5 bottom-5 translate-y-2 font-script text-2xl text-cream-50 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:text-3xl">
                {m.caption}
              </figcaption>
              <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-cream-50/40 transition-all duration-500 group-hover:scale-150 group-hover:bg-cream-50" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
