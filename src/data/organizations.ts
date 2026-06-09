/**
 * Organization assets — logos and flags for the partners strip and footer.
 * Imported so Vite hashes + build-optimises them (the source PNGs are
 * ~1MB each; ViteImageOptimizer compresses them at build).
 *
 * Source files live in src/assets/organization. Duplicate-named files
 * in that folder (e.g. "permiraspb logo big.PNG") are intentionally not
 * imported here — we reference one canonical copy each.
 */
import eventLogo from "../assets/organization/summercamp2026-logo.png";
import permiraLogo from "../assets/organization/permira-logo-small.png";
import kbriLogo from "../assets/organization/kbri-moskow.png";
import flagIndonesia from "../assets/organization/Flag_of_Indonesia.png";
import flagRussia from "../assets/organization/Flag_of_Russia.png";
import flagStPetersburg from "../assets/organization/Flag_of_St_Petersburg_(Russia).png";

export { eventLogo };

export type Partner = {
  name: string;
  logo: string;
  href?: string;
};

/** Supporting / presenting organisations shown in the Partners strip. */
export const partners: Partner[] = [
  { name: "PERMIRA", logo: permiraLogo, href: "https://permiraspb.org" },
  { name: "KBRI Moskow (Embassy of Indonesia, Moscow)", logo: kbriLogo },
];

export type FlagItem = {
  label: string;
  flag: string;
};

/** The cultures/host meeting at the camp — used as a collaboration line. */
export const flags: FlagItem[] = [
  { label: "Indonesia", flag: flagIndonesia },
  { label: "Russia", flag: flagRussia },
  { label: "Saint Petersburg", flag: flagStPetersburg },
];
