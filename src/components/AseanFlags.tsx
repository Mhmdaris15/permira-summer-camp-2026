/**
 * AseanFlags — the ASEAN member states represented at the camp. Real flag
 * images are used where available; those without image assets (Brunei,
 * Cambodia, Laos) ship as bundled SVGs under assets/organization/asean/.
 * Singapore is intentionally omitted.
 */
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import brunei from "../assets/organization/asean/brunei.svg";
import cambodia from "../assets/organization/asean/cambodia.svg";
import laos from "../assets/organization/asean/laos.svg";
import indonesia from "../assets/organization/Flag_of_Indonesia.png";
import malaysia from "../assets/organization/malaysia-flag.jpg";
import myanmar from "../assets/organization/myanmar-flag.jpg";
import philippines from "../assets/organization/philippine-flag.jpg";
import thailand from "../assets/organization/thailand-flag.jpg";
import vietnam from "../assets/organization/vietnam-flag.jpg";

// Alphabetical, per ASEAN convention.
const MEMBERS: { name: string; flag: string }[] = [
  { name: "Brunei", flag: brunei },
  { name: "Cambodia", flag: cambodia },
  { name: "Indonesia", flag: indonesia },
  { name: "Laos", flag: laos },
  { name: "Malaysia", flag: malaysia },
  { name: "Myanmar", flag: myanmar },
  { name: "Philippines", flag: philippines },
  { name: "Thailand", flag: thailand },
  { name: "Vietnam", flag: vietnam },
];

export function AseanFlags() {
  const { t } = useTranslation();

  return (
    <div className="reveal mt-16 overflow-hidden rounded-[2rem] border border-clove-900/8 bg-gradient-to-b from-cream-50 to-cream-100/70 shadow-[0_24px_70px_-40px_rgba(44,19,11,0.45)]">
      {/* Header */}
      <div className="relative px-6 pt-9 text-center md:px-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-terracotta-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-terracotta-500">
          {t("exchange.aseanMembersTitle")}
        </span>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-clove-700/75">
          {t("exchange.aseanMembersNote")}
        </p>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 px-6 py-9 md:gap-x-10 md:px-12 md:py-11">
        {MEMBERS.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
            className="group flex w-20 flex-col items-center gap-2.5 md:w-24"
          >
            <div className="relative">
              {/* soft glow on hover */}
              <span
                aria-hidden
                className="absolute -inset-1 rounded-2xl bg-saffron/30 opacity-0 blur-md transition duration-300 group-hover:opacity-100"
              />
              <img
                src={m.flag}
                alt={`Flag of ${m.name}`}
                loading="lazy"
                className="relative h-14 w-20 rounded-xl object-cover shadow-md ring-1 ring-clove-900/10 transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl md:h-16 md:w-24"
              />
            </div>
            <span className="text-center text-xs font-medium tracking-wide text-clove-700 transition-colors group-hover:text-terracotta-500">
              {m.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
