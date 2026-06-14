/**
 * i18n setup — Russian default, English fallback, Indonesian third.
 *
 * Language is detected from localStorage → browser, persisted to localStorage.
 * All user-facing strings live in src/i18n/locales/{ru,en,id}.ts. The `en`
 * resource is the canonical key set; ru/id mirror its shape.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { en } from "./locales/en";
import { ru } from "./locales/ru";
import { id } from "./locales/id";

export const SUPPORTED_LANGS = ["ru", "en", "id"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  ru: "RU",
  en: "EN",
  id: "ID",
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      id: { translation: id },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    nonExplicitSupportedLngs: true, // treat "ru-RU" as "ru"
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "permira:lang",
      caches: ["localStorage"],
    },
  });

// If the detector found nothing supported, default to Russian explicitly.
if (!SUPPORTED_LANGS.includes(i18n.resolvedLanguage as Lang)) {
  void i18n.changeLanguage("ru");
}

export default i18n;
