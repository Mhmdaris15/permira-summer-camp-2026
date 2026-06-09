import { eventLogo } from "../data/organizations";

export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-100 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={eventLogo}
              alt="PERMIRA Summer Camp 2026"
              className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-black/10"
            />
            <span className="font-display text-lg font-semibold text-clove-900">
              Permira <span className="text-terracotta-500">·</span> Nusantara
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-clove-700/75">
            PERMIRA Summer Camp 2026 — Taste of Nusantara. A culinary diplomacy
            programme connecting Indonesian and Russian students in Saint
            Petersburg.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <a href="#journey" className="text-clove-700 hover:text-terracotta-500">Journey</a>
          <a href="#cuisine" className="text-clove-700 hover:text-terracotta-500">Cuisine</a>
          <a href="#exchange" className="text-clove-700 hover:text-terracotta-500">Exchange</a>
          <a href="#memories" className="text-clove-700 hover:text-terracotta-500">Memories</a>
          <a href="#join" className="text-clove-700 hover:text-terracotta-500">Join</a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-clove-900/10 px-6 pt-6">
        <div className="flex flex-col items-start justify-between gap-3 text-xs text-clove-700/60 md:flex-row">
          <span>© 2026 PERMIRA. All flavors reserved.</span>
          <span className="font-script text-base text-saffron">selamat makan · приятного аппетита</span>
        </div>
      </div>
    </footer>
  );
}
