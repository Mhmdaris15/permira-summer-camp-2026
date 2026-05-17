import { journeyDays, type JourneyDay } from "../data/journey";
import { cn } from "../lib/cn";

const accentMap = {
  saffron:    { text: "text-saffron",        bg: "bg-saffron/10",        ring: "ring-saffron/40" },
  terracotta: { text: "text-terracotta-500", bg: "bg-terracotta-500/10", ring: "ring-terracotta-500/40" },
  turmeric:   { text: "text-turmeric",       bg: "bg-turmeric/10",       ring: "ring-turmeric/40" },
} as const;

export function ExperienceJourney() {
  return (
    <section id="journey" className="relative bg-cream-50 py-24 md:py-32">
      {/* Section heading */}
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
          The Experience
        </span>
        <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-tight tracking-tight text-clove-900 md:text-6xl">
          Three days. Three acts. <br />
          <span className="italic text-terracotta-500">One unfolding story.</span>
        </h2>
        <p className="reveal mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-clove-700/80 md:text-lg">
          The camp is not a programme — it is a journey from first hello to
          last embrace. Each day deepens the next.
        </p>
      </div>

      {/* Timeline rail */}
      <div className="relative mt-20 md:mt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-terracotta-500/30 to-transparent md:block"
        />

        <ol className="mx-auto flex max-w-6xl flex-col gap-24 px-6 md:gap-32">
          {journeyDays.map((day, i) => (
            <DayPanel key={day.index} day={day} flipped={i % 2 === 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function DayPanel({ day, flipped }: { day: JourneyDay; flipped: boolean }) {
  const accent = accentMap[day.accent];

  return (
    <li className="relative">
      {/* Pulsing node on the timeline */}
      <div className="absolute left-1/2 top-6 hidden -translate-x-1/2 md:block">
        <div className={cn("h-3 w-3 rounded-full", accent.bg, "ring-4", accent.ring)}>
          <div className={cn("h-full w-full rounded-full", accent.text, "animate-ping")} />
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16",
          flipped && "md:[&>*:first-child]:order-2",
        )}
      >
        {/* Numeral / verb side */}
        <div
          className={cn(
            "reveal flex flex-col justify-center",
            flipped ? "md:items-start md:text-left" : "md:items-end md:text-right",
          )}
        >
          <span className={cn("font-mono text-sm tracking-widest", accent.text)}>
            {day.label.toUpperCase()} · {day.date}
          </span>
          <div className="mt-3 flex items-baseline gap-4">
            <span
              className={cn(
                "font-display text-[7rem] font-light leading-none md:text-[10rem]",
                accent.text,
              )}
            >
              0{day.index}
            </span>
            <span className="font-display text-3xl italic text-clove-900 md:text-5xl">
              {day.verb}.
            </span>
          </div>
          <h3 className="mt-6 max-w-md font-display text-2xl font-light leading-snug text-clove-900 md:text-3xl">
            {day.headline}
          </h3>
          <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-clove-700/80">
            {day.body}
          </p>
        </div>

        {/* Activity card */}
        <div className="reveal">
          <div className="group relative overflow-hidden rounded-3xl border border-clove-900/8 bg-cream-100 p-7 shadow-[0_20px_60px_-30px_rgba(74,32,20,0.4)] transition-transform duration-500 hover:-translate-y-1 md:p-9">
            <div className={cn("absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl", accent.bg)} />
            <div className="relative">
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-clove-700/60">
                The day, in moments
              </span>
              <ul className="mt-6 space-y-5">
                {day.activities.map((act) => (
                  <li
                    key={act.title}
                    className="group/item flex items-start gap-4 border-b border-clove-900/5 pb-5 last:border-0 last:pb-0"
                  >
                    <span
                      className={cn(
                        "mt-1 shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] tracking-wider",
                        accent.bg,
                        accent.text,
                      )}
                    >
                      {act.time}
                    </span>
                    <div>
                      <div className="font-display text-lg text-clove-900">
                        {act.title}
                      </div>
                      <div className="mt-1 text-sm leading-relaxed text-clove-700/80">
                        {act.detail}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
