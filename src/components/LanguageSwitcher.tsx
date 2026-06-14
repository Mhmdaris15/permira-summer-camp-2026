/**
 * LanguageSwitcher — RU · EN · ID segmented control. Persists via the i18n
 * detector (localStorage key "permira:lang"). Reflects the active language.
 */
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, LANG_LABELS, type Lang } from "../i18n";
import { cn } from "../lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const active = (SUPPORTED_LANGS as readonly string[]).includes(i18n.resolvedLanguage ?? "")
    ? (i18n.resolvedLanguage as Lang)
    : "ru";

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-clove-900/12 bg-cream-50/70 p-0.5 backdrop-blur-sm",
        className,
      )}
    >
      {SUPPORTED_LANGS.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          aria-pressed={active === lng}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
            active === lng
              ? "bg-clove-900 text-cream-50"
              : "text-clove-700/70 hover:text-terracotta-500",
          )}
        >
          {LANG_LABELS[lng]}
        </button>
      ))}
    </div>
  );
}
