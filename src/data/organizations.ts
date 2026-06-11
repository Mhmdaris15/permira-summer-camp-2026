/**
 * Organization assets — logos and flags for the partners strip and footer.
 * Imported so Vite hashes them at build (PNGs are pre-optimised at source;
 * SVGs ship as-is and stay crisp at any size).
 */
import eventLogo from "../assets/organization/summercamp2026-logo.png";
import permiraLogo from "../assets/organization/permira-logo-small.png";
import kbriLogo from "../assets/organization/kbri-moskow.png";
import ecologyLogo from "../assets/organization/ecology-committe-spb.svg";
import flagIndonesia from "../assets/organization/Flag_of_Indonesia.png";
import flagRussia from "../assets/organization/Flag_of_Russia.png";
import flagStPetersburg from "../assets/organization/Flag_of_St_Petersburg_(Russia).png";

export { eventLogo };

/** Tier controls the heading a logo appears under in the Partners strip. */
export type PartnerTier = "organiser" | "partner" | "supporter";

export type Partner = {
  name: string;
  logo: string;
  href?: string;
  tier: PartnerTier;
  /** Optional second link (e.g. a VK community page). */
  altHref?: string;
};

export const PARTNER_TIER_LABELS: Record<PartnerTier, string> = {
  organiser: "Organised by",
  partner: "In partnership with",
  supporter: "Supported by",
};

export const partners: Partner[] = [
  {
    name: "PERMIRA — Indonesian Students' Association in Saint Petersburg",
    logo: permiraLogo,
    href: "https://permiraspb.org",
    tier: "organiser",
  },
  {
    name: "Committee for Nature Use, Environmental Protection and Ecological Safety — Saint Petersburg & Leningrad Oblast",
    logo: ecologyLogo,
    href: "https://kpr.lenobl.ru/",
    altHref: "https://vk.com/club192811754",
    tier: "partner",
  },
  {
    name: "KBRI Moskow — Embassy of the Republic of Indonesia, Moscow",
    logo: kbriLogo,
    tier: "supporter",
  },
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
