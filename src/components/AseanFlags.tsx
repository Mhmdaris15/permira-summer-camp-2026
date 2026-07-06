/**
 * AseanFlags — a strip of all ten ASEAN member-state flags. Real flag images
 * are used where available; the four without image assets (Brunei, Cambodia,
 * Laos, Singapore) ship as bundled SVGs under assets/organization/asean/.
 */
import { useTranslation } from "react-i18next";

import brunei from "../assets/organization/asean/brunei.svg";
import cambodia from "../assets/organization/asean/cambodia.svg";
import laos from "../assets/organization/asean/laos.svg";
import singapore from "../assets/organization/asean/singapore.svg";
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
  { name: "Singapore", flag: singapore },
  { name: "Thailand", flag: thailand },
  { name: "Vietnam", flag: vietnam },
];

export function AseanFlags() {
  const { t } = useTranslation();
  return (
    <div className="reveal mt-14 rounded-3xl border border-clove-900/8 bg-cream-50/60 p-6 md:p-8">
      <div className="text-center">
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
          {t("exchange.aseanMembersTitle")}
        </span>
        <p className="mx-auto mt-2 max-w-xl text-sm text-clove-700/70">
          {t("exchange.aseanMembersNote")}
        </p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {MEMBERS.map((m) => (
          <li key={m.name} className="flex flex-col items-center gap-2">
            <img
              src={m.flag}
              alt={`Flag of ${m.name}`}
              loading="lazy"
              className="h-9 w-14 rounded-md object-cover shadow-sm ring-1 ring-clove-900/10"
            />
            <span className="text-xs font-medium text-clove-700">{m.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
