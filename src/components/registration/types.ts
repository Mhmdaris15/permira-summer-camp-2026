export type Nationality = "Indonesia" | "Russia";
export type Gender = "Female" | "Male";

export type RegistrationData = {
  fullName: string;
  nationality: Nationality | "";
  university: string;
  age: string; // kept as string so the input value stays controlled; parsed at submit
  gender: Gender | "";
  email: string;
  phone: string;
  messenger: string;        // Telegram or WhatsApp handle
  dietary: string;
  priorExperience: string;  // optional
  motivation: string;
  passport: File | null;
  /** Honeypot — must remain empty. If filled, the request is silently dropped. */
  website: string;
};

export type FieldErrors = Partial<Record<keyof RegistrationData, string>>;

export const emptyRegistration: RegistrationData = {
  fullName: "",
  nationality: "",
  university: "",
  age: "",
  gender: "",
  email: "",
  phone: "",
  messenger: "",
  dietary: "",
  priorExperience: "",
  motivation: "",
  passport: null,
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
