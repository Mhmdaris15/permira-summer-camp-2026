/** Indonesia + Russia + ASEAN member states (Singapore excluded). */
export const NATIONALITIES = [
  "Indonesia",
  "Russia",
  "Brunei",
  "Cambodia",
  "Laos",
  "Malaysia",
  "Myanmar",
  "Philippines",
  "Thailand",
  "Vietnam",
] as const;

export type Nationality = (typeof NATIONALITIES)[number];

/** Flag emoji for any nationality string (falls back to a neutral flag). */
export function nationalityFlag(n: string): string {
  return NATIONALITY_FLAGS[n as Nationality] ?? "🏳️";
}

export const NATIONALITY_FLAGS: Record<Nationality, string> = {
  Indonesia: "🇮🇩",
  Russia: "🇷🇺",
  Brunei: "🇧🇳",
  Cambodia: "🇰🇭",
  Laos: "🇱🇦",
  Malaysia: "🇲🇾",
  Myanmar: "🇲🇲",
  Philippines: "🇵🇭",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
};
export type Gender = "Female" | "Male";

export type RegistrationData = {
  fullName: string;
  nationality: Nationality | "";
  university: string;
  gender: Gender | "";
  email: string;
  phone: string;
  messenger: string;        // Telegram or WhatsApp handle
  dietary: string;
  priorExperience: string;  // optional
  motivation: string;
  passport: File | null;
  studentCard: File | null;
  /** Honeypot — must remain empty. If filled, the request is silently dropped. */
  website: string;
};

export type FieldErrors = Partial<Record<keyof RegistrationData, string>>;

export const emptyRegistration: RegistrationData = {
  fullName: "",
  nationality: "",
  university: "",
  gender: "",
  email: "",
  phone: "",
  messenger: "",
  dietary: "",
  priorExperience: "",
  motivation: "",
  passport: null,
  studentCard: null,
  website: "",
};

export const LIMITS = {
  fullName: 80,
  university: 120,
  dietary: 240,
  priorExperience: 600,
  motivation: 800,
} as const;

export const FILE_LIMITS = {
  maxBytes: 10 * 1024 * 1024, // 10 MB
  acceptedMime: ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const,
};
