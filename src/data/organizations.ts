/**
 * Organization assets — logos, flags, collaboration marks, partner tiers,
 * and social links. Imported so Vite hashes them at build.
 *
 * Partner attributions are drawn from the official proposal and assets the
 * committee supplied. Anything not yet formally confirmed is listed in
 * CONTENT_AUDIT.md for committee sign-off before publication.
 */
import eventLogo from "../assets/organization/summercamp2026-logo.png";
import permiraLogo from "../assets/organization/permira-logo-small.png";
import kbriLogo from "../assets/organization/kbri-moskow.png";
import ecologyLogo from "../assets/organization/ecology-committe-spb.svg";
import natureSocietyLogo from "../assets/organization/logo-organisasi-masyarakat-lingkungan-hidup.jpg";
import externalRelationsLogo from "../assets/organization/Committee for External Relations of Saint-Petersburg Logo.png";
import aseanLogo from "../assets/organization/asean-logo.svg";
import flagIndonesia from "../assets/organization/Flag_of_Indonesia.png";
import flagRussia from "../assets/organization/Flag_of_Russia.png";
import flagStPetersburg from "../assets/organization/Flag_of_St_Petersburg_(Russia).png";
import tgLogo from "../assets/organization/telegram-logo.png";
import vkLogo from "../assets/organization/vk-logo.png";

export { eventLogo, aseanLogo };

// -----------------------------------------------------------------------------
// Collaboration marks — Indonesia · Russia · ASEAN · Saint Petersburg
// -----------------------------------------------------------------------------

export type Collaborator = {
  label: string;
  logo: string;
  kind: "flag" | "emblem";
};

export const collaborators: Collaborator[] = [
  { label: "Indonesia", logo: flagIndonesia, kind: "flag" },
  { label: "Russia", logo: flagRussia, kind: "flag" },
  { label: "ASEAN", logo: aseanLogo, kind: "emblem" },
  { label: "Saint Petersburg", logo: flagStPetersburg, kind: "flag" },
];

// -----------------------------------------------------------------------------
// Partner tiers
// -----------------------------------------------------------------------------

export type PartnerTier = "organiser" | "collaborator" | "supporter";

export type Partner = {
  name: string;
  logo: string;
  href?: string;
  altHref?: string;
  tier: PartnerTier;
};

export const PARTNER_TIER_LABELS: Record<PartnerTier, string> = {
  organiser: "Organized by",
  collaborator: "In Collaboration With",
  supporter: "Supported by",
};

export const partners: Partner[] = [
  {
    name: "PERMIRA St. Petersburg — Indonesian Students' Association in Russia",
    logo: permiraLogo,
    href: "https://vk.com/permiraspb",
    tier: "organiser",
  },
  {
    name: "Committee for Nature Use, Environmental Protection and Ecological Safety — Saint Petersburg & Leningrad Oblast",
    logo: ecologyLogo,
    href: "https://kpr.lenobl.ru/",
    altHref: "https://vk.com/club192811754",
    tier: "collaborator",
  },
  {
    name: "Committee for External Relations of Saint Petersburg",
    logo: externalRelationsLogo,
    tier: "collaborator",
  },
  {
    name: "All-Russian Society for Nature Conservation — Leningrad Branch",
    logo: natureSocietyLogo,
    tier: "collaborator",
  },
  {
    name: "Embassy of the Republic of Indonesia in Moscow (KBRI Moskow)",
    logo: kbriLogo,
    tier: "supporter",
  },
];

// -----------------------------------------------------------------------------
// Social links (proposal-backed: VK + Telegram). Email lives in the footer.
// -----------------------------------------------------------------------------

export type SocialLink = {
  label: string;
  href: string;
  logo: string;
};

export const socials: SocialLink[] = [
  { label: "VK", href: "https://vk.com/permiraspb", logo: vkLogo },
  { label: "Telegram", href: "https://t.me/permiraspb", logo: tgLogo },
];

// -----------------------------------------------------------------------------
// Flags (kept for the Cultural Exchange / collaboration line)
// -----------------------------------------------------------------------------

export type FlagItem = { label: string; flag: string };

export const flags: FlagItem[] = [
  { label: "Indonesia", flag: flagIndonesia },
  { label: "Russia", flag: flagRussia },
  { label: "Saint Petersburg", flag: flagStPetersburg },
];
