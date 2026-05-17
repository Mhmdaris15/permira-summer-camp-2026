import { FILE_LIMITS, LIMITS, type FieldErrors, type RegistrationData } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Permissive — allows + country code, spaces, dashes, parens
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

export function validate(data: RegistrationData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.fullName.trim()) errors.fullName = "Please tell us your name.";
  else if (data.fullName.trim().length < 2) errors.fullName = "That name looks a little short.";
  else if (data.fullName.length > LIMITS.fullName) errors.fullName = `Keep it under ${LIMITS.fullName} characters.`;

  if (!data.nationality) errors.nationality = "Please select a nationality.";

  if (!data.university.trim()) errors.university = "Where do you study?";
  else if (data.university.length > LIMITS.university) errors.university = `Keep it under ${LIMITS.university} characters.`;

  const ageNum = Number(data.age);
  if (!data.age) errors.age = "Please share your age.";
  else if (!Number.isInteger(ageNum) || ageNum < 16 || ageNum > 35)
    errors.age = "Age must be between 16 and 35.";

  if (!data.gender) errors.gender = "Please choose an option.";

  if (!data.email.trim()) errors.email = "We'll need an email to write you back.";
  else if (!EMAIL_RE.test(data.email.trim())) errors.email = "That email doesn't look quite right.";

  if (!data.phone.trim()) errors.phone = "A phone number, please.";
  else if (!PHONE_RE.test(data.phone.trim())) errors.phone = "Use digits, spaces, +, - or ().";

  if (!data.messenger.trim()) errors.messenger = "Add your Telegram or WhatsApp handle.";

  if (data.dietary.length > LIMITS.dietary)
    errors.dietary = `Keep it under ${LIMITS.dietary} characters.`;

  if (data.priorExperience.length > LIMITS.priorExperience)
    errors.priorExperience = `Keep it under ${LIMITS.priorExperience} characters.`;

  if (!data.motivation.trim()) errors.motivation = "Tell us why you'd like to join — even a sentence.";
  else if (data.motivation.trim().length < 40) errors.motivation = "Give us at least 40 characters of why.";
  else if (data.motivation.length > LIMITS.motivation)
    errors.motivation = `Keep it under ${LIMITS.motivation} characters.`;

  errors.passport = validateFile(data.passport, "Passport scan");
  errors.consent = validateFile(data.consent, "Signed consent form");
  if (!errors.passport) delete errors.passport;
  if (!errors.consent) delete errors.consent;

  return errors;
}

function validateFile(file: File | null, label: string): string | undefined {
  if (!file) return `${label} is required.`;
  if (file.size > FILE_LIMITS.maxBytes) return `${label} is over 10 MB.`;
  if (!FILE_LIMITS.acceptedMime.includes(file.type as typeof FILE_LIMITS.acceptedMime[number]))
    return `${label} must be a PDF, JPG, PNG, or WebP.`;
  return undefined;
}
