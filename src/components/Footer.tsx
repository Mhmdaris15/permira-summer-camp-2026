import { eventLogo, socials } from "../data/organizations";

export function Footer() {
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
            III Indonesian–Russian Students Summer Camp 2026, hosted in Saint
            Petersburg — a youth diplomacy programme connecting students from
            Indonesia, Russia, and ASEAN through culture, cuisine, and
            environmental stewardship.
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
          <a href="#journey" className="text-clove-700 hover:text-terracotta-500">Programme</a>
          <a href="#cuisine" className="text-clove-700 hover:text-terracotta-500">Cuisine</a>
          <a href="#exchange" className="text-clove-700 hover:text-terracotta-500">Collaboration</a>
          <a href="#stewardship" className="text-clove-700 hover:text-terracotta-500">Stewardship</a>
          <a href="#join" className="text-clove-700 hover:text-terracotta-500">Register</a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-clove-900/10 px-6 pt-6">
        <div className="flex flex-col items-start justify-between gap-3 text-xs text-clove-700/60 md:flex-row">
          <span>© 2026 PERMIRA St. Petersburg. All rights reserved.</span>
          <span className="font-script text-base text-saffron">selamat makan · приятного аппетита</span>
        </div>
      </div>
    </footer>
  );
}
