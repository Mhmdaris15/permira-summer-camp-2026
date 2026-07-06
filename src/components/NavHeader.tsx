import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/cn";
import { LanguageSwitcher } from "./LanguageSwitcher";
import PermiraLogo from "../assets/organization/permira-logo-big.png";

const linkKeys = [
  { href: "#journey", key: "nav.journey" },
  { href: "#opening", key: "nav.opening" },
  { href: "#cuisine", key: "nav.cuisine" },
  { href: "#exchange", key: "nav.exchange" },
  { href: "#memories", key: "nav.memories" },
  { href: "#faq", key: "nav.faq" },
] as const;

export function NavHeader() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-cream-50/85 backdrop-blur-md border-b border-cream-200/70"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
        <a href="#top" className="group flex items-center gap-2.5">
          <img src={PermiraLogo} alt="Permira logo" className="h-12 w-12" />
          <span className="font-display text-lg font-semibold text-clove-900">
PERMIRA Summer Camp<span className="text-terracotta-500"> · </span>2026
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {linkKeys.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-clove-700 transition-colors hover:text-terracotta-500"
            >
              {t(link.key)}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-terracotta-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <LanguageSwitcher />
          <a
            href="#register"
            className="rounded-full bg-clove-900 px-5 py-2.5 text-sm font-medium text-cream-50 shadow-sm transition-all hover:bg-terracotta-500 hover:shadow-md"
          >
            {t("nav.join")}
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-full p-2 text-clove-900 hover:bg-cream-200/60"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-cream-200/70 bg-cream-50/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {linkKeys.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-clove-700 hover:bg-cream-100 hover:text-terracotta-500"
              >
                {t(link.key)}
              </a>
            ))}
            <a
              href="#register"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-clove-900 px-5 py-2.5 text-center text-sm font-medium text-cream-50"
            >
              {t("nav.join")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
