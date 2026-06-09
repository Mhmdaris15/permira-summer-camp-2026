/**
 * Partners — "Presented by" logo strip + a collaboration flag line.
 * Sits between the CTA and the Footer to lend institutional credibility.
 */
import { partners, flags } from "../data/organizations";

export function Partners() {
  return (
    <section className="relative bg-cream-100 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
          Presented &amp; Supported by
        </span>

        {/* Partner logos */}
        <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-10 md:gap-16">
          {partners.map((p) => {
            const img = (
              <img
                src={p.logo}
                alt={p.name}
                loading="lazy"
                className="h-16 w-auto object-contain opacity-80 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 md:h-20"
              />
            );
            return p.href ? (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" title={p.name}>
                {img}
              </a>
            ) : (
              <div key={p.name} title={p.name}>
                {img}
              </div>
            );
          })}
        </div>

        {/* Collaboration flags */}
        <div className="reveal mt-12 flex flex-col items-center gap-4">
          <span className="text-[11px] uppercase tracking-[0.25em] text-clove-700/55">
            A collaboration across
          </span>
          <div className="flex items-center gap-6 md:gap-10">
            {flags.map((f, i) => (
              <div key={f.label} className="flex items-center gap-6 md:gap-10">
                <div className="flex items-center gap-2.5">
                  <img
                    src={f.flag}
                    alt={`Flag of ${f.label}`}
                    loading="lazy"
                    className="h-6 w-auto rounded-sm shadow-sm ring-1 ring-black/10"
                  />
                  <span className="text-sm font-medium text-clove-800">{f.label}</span>
                </div>
                {i < flags.length - 1 && (
                  <span className="text-terracotta-500/50">·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
