/**
 * OpeningCeremony — the Day-1 official opening programme: a bilingual
 * ceremony with the national anthems, the VIP speaker lineup, the tumpeng
 * cutting, and a link to the live broadcast. Data lives in
 * src/data/ceremony.ts; all copy is translated under `ceremony.*`.
 */
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CEREMONY_ITEMS, LIVESTREAM_URL } from "../data/ceremony";

export function OpeningCeremony() {
  const { t } = useTranslation();

  return (
    <section id="opening" className="relative overflow-hidden bg-cream-100 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
            {t("ceremony.eyebrow")}
          </span>
          <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-[1.05] tracking-tight text-clove-900 md:text-5xl">
            {t("ceremony.heading")}{" "}
            <span className="italic text-saffron">{t("ceremony.headingEm")}</span>
          </h2>
          <p className="reveal mt-5 max-w-xl text-pretty text-base leading-relaxed text-clove-700/80">
            {t("ceremony.intro")}
          </p>
        </div>

        {/* Live broadcast banner */}
        <div className="reveal mt-8 flex flex-col gap-4 rounded-3xl border border-clove-900/8 bg-clove-900 p-6 text-cream-50 sm:flex-row sm:items-center sm:justify-between md:p-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-saffron">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
              </span>
              {t("ceremony.dateTime")}
            </div>
            <p className="mt-2 text-sm text-cream-100/75">{t("ceremony.livestreamNote")}</p>
          </div>
          <a
            href={LIVESTREAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-medium text-clove-900 transition hover:bg-cream-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {t("ceremony.watchLive")}
          </a>
        </div>

        {/* Programme timeline */}
        <ol className="reveal mt-10 space-y-0">
          {CEREMONY_ITEMS.map((item, i) => {
            const label = t(`ceremony.items.${item.key}`);
            const isMoment = item.kind === "moment";
            return (
              <motion.li
                key={item.key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-[64px_1fr] gap-4 border-b border-clove-900/8 py-4 last:border-0 md:grid-cols-[88px_1fr] md:gap-6"
              >
                <div className="pt-0.5 font-mono text-xs tabular-nums text-clove-700/60 md:text-sm">
                  {item.time}
                </div>
                <div className="flex items-start gap-3">
                  <span
                    className={
                      isMoment
                        ? "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-saffron"
                        : "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-terracotta-500/50"
                    }
                    aria-hidden
                  />
                  <div>
                    {isMoment ? (
                      <p className="font-display text-base italic text-clove-800">{label}</p>
                    ) : (
                      <>
                        <p className="font-display text-base font-medium text-clove-900">{item.name}</p>
                        <p className="mt-0.5 text-sm leading-snug text-clove-700/75">{label}</p>
                      </>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
