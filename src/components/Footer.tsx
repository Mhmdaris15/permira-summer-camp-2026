export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-100 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-terracotta-500 text-cream-50">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-4 3-5 5-9z" strokeLinejoin="round" />
              </svg>
            </span>
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
