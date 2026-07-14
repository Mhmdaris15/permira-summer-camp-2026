import { FILE_LIMITS, LIMITS, type FieldErrors, type RegistrationData } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Permissive — allows + country code, spaces, dashes, parens
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

/**
 * Returns i18n keys (not literal messages) so the Field component can
 * translate them in the active language. Keys live under `validation.*`.
 */
export function validate(data: RegistrationData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.fullName.trim()) errors.fullName = "validation.nameReq";
  else if (data.fullName.trim().length < 2) errors.fullName = "validation.nameShort";
  else if (data.fullName.length > LIMITS.fullName) errors.fullName = "validation.nameLong";

  if (!data.nationality) errors.nationality = "validation.natReq";

  if (!data.university.trim()) errors.university = "validation.uniReq";
  else if (data.university.length > LIMITS.university) errors.university = "validation.uniLong";

  if (!data.gender) errors.gender = "validation.genderReq";

  if (!data.email.trim()) errors.email = "validation.emailReq";
  else if (!EMAIL_RE.test(data.email.trim())) errors.email = "validation.emailBad";

  if (!data.phone.trim()) errors.phone = "validation.phoneReq";
  else if (!PHONE_RE.test(data.phone.trim())) errors.phone = "validation.phoneBad";

  if (!data.messenger.trim()) errors.messenger = "validation.messengerReq";

  if (data.dietary.length > LIMITS.dietary) errors.dietary = "validation.dietaryLong";

  if (data.priorExperience.length > LIMITS.priorExperience)
    errors.priorExperience = "validation.priorLong";

  if (!data.motivation.trim()) errors.motivation = "validation.motivationReq";
  else if (data.motivation.trim().length < 40) errors.motivation = "validation.motivationShort";
  else if (data.motivation.length > LIMITS.motivation) errors.motivation = "validation.motivationLong";

  const passport = validateFile(data.passport, "passport", true);
  if (passport) errors.passport = passport;
  // Student card is optional — only validate size/type when one is provided.
  const studentCard = validateFile(data.studentCard, "studentCard", false);
  if (studentCard) errors.studentCard = studentCard;

  return errors;
}

function validateFile(
  file: File | null,
  which: "passport" | "studentCard",
  required: boolean,
): string | undefined {
  if (!file) return required ? `validation.${which}Req` : undefined;
  if (file.size > FILE_LIMITS.maxBytes) return `validation.${which}Big`;
  if (!FILE_LIMITS.acceptedMime.includes(file.type as typeof FILE_LIMITS.acceptedMime[number]))
    return `validation.${which}Type`;
  return undefined;
}
