/**
 * FAQ — a public accordion of frequently asked questions. Content is fully
 * translated (i18n `faq.items` = array of { q, a }); one item open at a time.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type QA = { q: string; a: string };

export function FAQ() {
  const { t } = useTranslation();
  const items = t("faq.items", { returnObjects: true }) as QA[];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-cream-50 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="reveal text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
            {t("faq.eyebrow")}
          </span>
          <h2 className="reveal mt-4 font-display text-balance text-4xl font-light leading-[1.05] tracking-tight text-clove-900 md:text-5xl">
            {t("faq.heading")}{" "}
            <span className="italic text-saffron">{t("faq.headingEm")}</span>
          </h2>
          <p className="reveal mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-clove-700/75">
            {t("faq.intro")}
          </p>
        </div>

        <div className="reveal mt-10 divide-y divide-clove-900/10 border-y border-clove-900/10">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-lg font-medium text-clove-900">{item.q}</span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-clove-900/15 text-terracotta-500 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-10 text-sm leading-relaxed text-clove-700/85">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
