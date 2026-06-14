/**
 * Partners — tiered logo strip (Organised by / In partnership with /
 * Supported by) + a collaboration flag line. Sits between the CTA and the
 * Footer to lend institutional credibility without crowding the warmth.
 *
 * Official emblems render in full colour (no grayscale) out of respect for
 * government/partner brand marks.
 */
import {
  partners,
  flags,
  PARTNER_TIER_LABELS,
  type Partner,
  type PartnerTier,
} from "../data/organizations";

const TIER_ORDER: PartnerTier[] = ["organiser", "collaborator", "supporter"];

export function Partners() {
  return (
    <section className="relative bg-cream-100 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
          Friends of the Camp
        </span>

        <div className="reveal mt-10 flex flex-col gap-10">
          {TIER_ORDER.map((tier) => {
            const group = partners.filter((p) => p.tier === tier);
            if (group.length === 0) return null;
            return (
              <div key={tier} className="flex flex-col items-center gap-4">
                <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-clove-700/55">
                  {PARTNER_TIER_LABELS[tier]}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
                  {group.map((p) => (
                    <PartnerLogo key={p.name} partner={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collaboration flags */}
        <div className="reveal mt-14 flex flex-col items-center gap-4">
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
                {i < flags.length - 1 && <span className="text-terracotta-500/50">·</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const img = (
    <img
      src={partner.logo}
      alt={partner.name}
      loading="lazy"
      className="h-14 w-auto max-w-[200px] object-contain opacity-85 transition-all duration-300 hover:opacity-100 md:h-16"
    />
  );

  return (
    <div className="flex flex-col items-center gap-1.5" title={partner.name}>
      {partner.href ? (
        <a href={partner.href} target="_blank" rel="noopener noreferrer">
          {img}
        </a>
      ) : (
        <div>{img}</div>
      )}
      {partner.altHref && (
        <a
          href={partner.altHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-medium uppercase tracking-wider text-clove-700/50 transition-colors hover:text-terracotta-500"
        >
          VK ↗
        </a>
      )}
    </div>
  );
}
