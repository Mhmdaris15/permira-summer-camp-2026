import { useState } from "react";
import { dishes, type Dish } from "../data/dishes";
import { cn } from "../lib/cn";

export function CulinaryHighlights() {
  const [activeId, setActiveId] = useState(dishes[0].id);
  const active = dishes.find((d) => d.id === activeId) ?? dishes[0];

  return (
    <section
      id="cuisine"
      className="relative overflow-hidden bg-clove-900 py-24 text-cream-100 md:py-32"
    >
      {/* Warm vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, rgba(217,154,59,0.12), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(196,80,42,0.18), transparent 50%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-saffron">
            Indonesian Culinary Inspirations
          </span>
          <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-tight tracking-tight md:text-6xl">
            Examples of Indonesian <br />
            <span className="italic text-saffron">culinary heritage.</span>
          </h2>
          <p className="reveal mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-cream-100/70 md:text-lg">
            In the Culinary Masterclass &amp; Cooking Sessions, mixed teams of
            Indonesian, Russian, and ASEAN students cook Indonesian dishes
            together — learning the ingredients, techniques, and stories behind
            each one. The examples below illustrate that heritage.
          </p>
          <p className="reveal mx-auto mt-4 max-w-xl text-pretty text-xs italic leading-relaxed text-cream-100/50">
            Actual dishes may vary depending on programme arrangements and
            availability.
          </p>
        </div>

        {/* Tab strip */}
        <div className="reveal mt-14 flex flex-wrap justify-center gap-2 md:gap-3">
          {dishes.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                activeId === d.id
                  ? "border-saffron bg-saffron text-clove-900 shadow-lg shadow-saffron/20"
                  : "border-cream-100/15 bg-cream-100/[0.03] text-cream-100/70 hover:border-cream-100/30 hover:text-cream-100",
              )}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Featured dish */}
        <DishFeature dish={active} />

        {/* Mini cards grid */}
        <div className="mt-20 grid grid-cols-1 gap-5 md:grid-cols-3">
          {dishes.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={cn(
                "reveal group relative overflow-hidden rounded-2xl border border-cream-100/10 text-left transition-all hover:border-saffron/40 hover:-translate-y-1",
                activeId === d.id && "border-saffron/60 ring-1 ring-saffron/40",
              )}
            >
              {/* Photo backdrop */}
              <img
                src={d.image}
                alt={d.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clove-900/90 via-clove-900/50 to-clove-900/25" />
              <div className="relative p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-cream-100/70">
                  {d.region}
                </div>
                <div className="mt-12 font-display text-xl text-cream-50 md:mt-16">{d.name}</div>
                <div className="mt-1 text-sm italic text-cream-100/70">
                  /{d.pronunciation}/
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function DishFeature({ dish }: { dish: Dish }) {
  return (
    <div
      key={dish.id}
      className="mt-12 grid grid-cols-1 items-stretch gap-8 rounded-3xl border border-cream-100/10 bg-cream-100/[0.04] p-2 backdrop-blur md:grid-cols-[1fr_1.2fr] md:p-3"
    >
      {/* Visual block — real dish photography with a warm scrim for text */}
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-2xl md:aspect-auto md:min-h-[460px]"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${dish.palette[0]}, ${dish.palette[1]} 80%)`,
        }}
      >
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
        />
        {/* Gradient scrim keeps the overlaid label legible over any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-clove-900/85 via-clove-900/20 to-clove-900/30" />
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
          <div className="flex items-center gap-2 text-cream-50/80">
            <span className="h-px flex-1 bg-cream-50/30" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
              Featured · No. 0{dishes.findIndex((d) => d.id === dish.id) + 1}
            </span>
            <span className="h-px w-8 bg-cream-50/30" />
          </div>

          <div>
            <div className="font-script text-3xl text-cream-50 md:text-4xl">
              {dish.tagline.split(",")[0]},
            </div>
            <div className="mt-1 font-display text-5xl font-light leading-none text-cream-50 md:text-7xl">
              {dish.name.split(" ").map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Narrative block */}
      <div className="flex flex-col justify-center px-4 py-8 md:px-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-saffron">
          {dish.region}
        </span>
        <h3 className="mt-3 font-display text-3xl font-light leading-tight text-cream-50 md:text-4xl">
          {dish.tagline}
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-cream-100/80">
          {dish.story}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-cream-100/10 pt-6">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-cream-100/50">
              Heart of the dish
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {dish.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="rounded-full border border-cream-100/15 bg-cream-100/5 px-2.5 py-1 text-xs text-cream-100/80"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-cream-100/50">
              Tradition pairs it with
            </div>
            <div className="mt-3 text-sm leading-relaxed text-cream-100/80">
              {dish.pairing}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
