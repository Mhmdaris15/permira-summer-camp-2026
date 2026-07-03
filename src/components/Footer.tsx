import { useTranslation } from "react-i18next";
import { eventLogo, socials } from "../data/organizations";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-cream-200 bg-cream-100 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={eventLogo}
              alt="PERMIRA Summer Camp 2026"
              className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-black/10"
            />
            <span className="font-display text-lg font-semibold text-clove-900">
              PERMIRA Summer Camp <span className="text-terracotta-500">·</span> 2026
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-clove-700/75">
            {t("footer.tagline")}
          </p>

          {/* Social links */}
          <div className="mt-6 flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full bg-cream-50 ring-1 ring-black/10 transition hover:ring-terracotta-500/40"
              >
                <img src={s.logo} alt="" className="h-4 w-4 object-contain" />
              </a>
            ))}
            <a
              href="mailto:info@permiraspb.org"
              className="ml-1 text-sm text-clove-700 underline-offset-4 hover:text-terracotta-500 hover:underline"
            >
              info@permiraspb.org
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <a href="#journey" className="text-clove-700 hover:text-terracotta-500">{t("nav.journey")}</a>
          <a href="#cuisine" className="text-clove-700 hover:text-terracotta-500">{t("nav.cuisine")}</a>
          <a href="#exchange" className="text-clove-700 hover:text-terracotta-500">{t("nav.exchange")}</a>
          <a href="#stewardship" className="text-clove-700 hover:text-terracotta-500">{t("nav.stewardship")}</a>
          <a href="#join" className="text-clove-700 hover:text-terracotta-500">{t("nav.join")}</a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-clove-900/10 px-6 pt-6">
        <div className="flex flex-col items-start justify-between gap-3 text-xs text-clove-700/60 md:flex-row md:items-center">
          <div className="flex flex-col gap-1.5">
            <span>{t("footer.copyright")}</span>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {t("footer.developedBy")}{" "}
              <a
                href="https://aris-septanugroho-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-clove-700 underline-offset-4 hover:text-terracotta-500 hover:underline"
              >
                Muhammad Aris Septanugroho
              </a>
              <span className="flex items-center gap-1.5">
                <a
                  href="https://www.linkedin.com/in/muhammad-aris-septanugroho/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Muhammad Aris Septanugroho on LinkedIn"
                  title="LinkedIn"
                  className="grid h-6 w-6 place-items-center rounded-full text-clove-700/70 transition hover:bg-cream-50 hover:text-terracotta-500"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-7.1c0-1.7-.03-3.9-2.37-3.9-2.38 0-2.74 1.85-2.74 3.77V24h-4V8z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/mhmdaris15"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Muhammad Aris Septanugroho on GitHub"
                  title="GitHub"
                  className="grid h-6 w-6 place-items-center rounded-full text-clove-700/70 transition hover:bg-cream-50 hover:text-terracotta-500"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 12 .5z" />
                  </svg>
                </a>
              </span>
            </span>
          </div>
          <span className="font-script text-base text-saffron">{t("footer.script")}</span>
        </div>
      </div>
    </footer>
  );
}
