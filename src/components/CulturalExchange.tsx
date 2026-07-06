import { useTranslation } from "react-i18next";
import { collaborators } from "../data/organizations";
import { AseanFlags } from "./AseanFlags";

const collabKey: Record<string, string> = {
  Indonesia: "exchange.indonesia",
  Russia: "exchange.russia",
  ASEAN: "exchange.asean",
  "Saint Petersburg": "exchange.stpetersburg",
};

const exchanges = [
  {
    id: "tea-coffee",
    indo: { title: "Kopi Tubruk", note: "Coarse coffee, hot water, no filter — patience required." },
    russ: { title: "Чай с самоваром", note: "Tea simmered in a samovar, sweetened with jam and time." },
    theme: "On waiting together",
  },
  {
    id: "soup-soto",
    indo: { title: "Soto Ayam", note: "Turmeric chicken broth — Indonesia's everyday comfort." },
    russ: { title: "Борщ", note: "Beet and cabbage soup — Russia's everyday comfort." },
    theme: "On warmth that travels",
  },
  {
    id: "festive",
    indo: { title: "Tumpeng", note: "A cone of yellow rice for every milestone." },
    russ: { title: "Каравай", note: "Round bread for the welcoming of guests." },
    theme: "On honoring arrival",
  },
];

export function CulturalExchange() {
  const { t } = useTranslation();
  return (
    <section
      id="exchange"
      className="relative bg-cream-100 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
            {t("exchange.eyebrow")}
          </span>
          <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-tight tracking-tight text-clove-900 md:text-6xl">
            {t("exchange.heading1")} <br />
            <span className="italic text-terracotta-500">{t("exchange.heading2")}</span>
          </h2>
          <p className="reveal mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-clove-700/80 md:text-lg">
            {t("exchange.intro")}
          </p>

          {/* Four-way collaboration marks */}
          <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {collaborators.map((c, i) => (
              <div key={c.label} className="flex items-center gap-6 md:gap-10">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={c.logo}
                    alt={c.label}
                    loading="lazy"
                    className={
                      c.kind === "flag"
                        ? "h-8 w-auto rounded-sm shadow-sm ring-1 ring-black/10"
                        : "h-9 w-auto"
                    }
                  />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-clove-700/70">
                    {t(collabKey[c.label] ?? c.label)}
                  </span>
                </div>
                {i < collaborators.length - 1 && (
                  <span className="text-terracotta-500/40">·</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 space-y-6 md:space-y-8">
          {exchanges.map((ex) => (
            <article
              key={ex.id}
              className="reveal group grid grid-cols-1 items-stretch overflow-hidden rounded-3xl border border-clove-900/8 bg-cream-50 shadow-[0_20px_60px_-40px_rgba(74,32,20,0.5)] transition-all hover:shadow-[0_30px_70px_-30px_rgba(196,80,42,0.3)] md:grid-cols-[1fr_auto_1fr]"
            >
              {/* Indonesia */}
              <div className="relative overflow-hidden p-8 md:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta-500/8 to-saffron/5" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-terracotta-600">
                    <span className="text-base">🇮🇩</span> {t("exchange.indonesia")}
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-light text-clove-900 md:text-4xl">
                    {ex.indo.title}
                  </h3>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-clove-700/85 md:text-base">
                    {t(`exchange.cards.${ex.id}.indoNote`)}
                  </p>
                </div>
              </div>

              {/* Center connector */}
              <div className="relative flex items-center justify-center bg-cream-100 px-6 py-4 md:flex-col md:py-10">
                <div className="hidden h-full w-px bg-gradient-to-b from-transparent via-clove-900/15 to-transparent md:block" />
                <div className="flex flex-col items-center gap-2 md:absolute">
                  <span className="font-script text-2xl text-saffron">
                    {t(`exchange.cards.${ex.id}.theme`)}
                  </span>
                  <svg
                    viewBox="0 0 60 24"
                    className="h-5 w-12 text-terracotta-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M2 12 L58 12" />
                    <path d="M52 6 L58 12 L52 18" />
                    <path d="M8 6 L2 12 L8 18" />
                  </svg>
                </div>
              </div>

              {/* Russia */}
              <div className="relative overflow-hidden p-8 md:p-10 md:text-right">
                <div className="absolute inset-0 bg-gradient-to-bl from-clove-700/8 to-cream-300/10" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-clove-700 md:justify-end">
                    {t("exchange.russia")} <span className="text-base">🇷🇺</span>
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-light text-clove-900 md:text-4xl">
                    {ex.russ.title}
                  </h3>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-clove-700/85 md:text-base">
                    {t(`exchange.cards.${ex.id}.russNote`)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <AseanFlags />
      </div>
    </section>
  );
}
