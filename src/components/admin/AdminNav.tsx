import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import LogoPermira from "../../assets/organization/permira-logo-small.png";

type Tab = "knowledge" | "participants" | "email" | "history";

const TABS: { id: Tab; label: string; to: string }[] = [
  { id: "knowledge", label: "Knowledge", to: "/admin" },
  { id: "participants", label: "Participants", to: "/admin/participants" },
  { id: "email", label: "Send email", to: "/admin/email" },
  { id: "history", label: "Email history", to: "/admin/email/history" },
];

/** Shared admin header with logo, section tabs, and sign-out. */
export function AdminNav({
  current,
  onSignOut,
}: {
  current: Tab;
  onSignOut: () => void;
}) {
  return (
    <header className="border-b border-clove-900/8 bg-cream-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2.5">
            <img src={LogoPermira} alt="Permira logo" className="h-11" />
            <span className="font-display text-lg font-semibold text-clove-900">
              Permira SPB<span className="text-terracotta-500"> · </span>Admin
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <Link
                key={t.id}
                to={t.to}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                  current === t.id
                    ? "bg-clove-900 text-cream-50"
                    : "text-clove-700 hover:bg-terracotta-500/10 hover:text-terracotta-500",
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-full border border-clove-900/15 bg-cream-50 px-4 py-1.5 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500"
        >
          Sign out
        </button>
      </div>
      {/* Mobile tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-clove-900/8 px-4 py-2 md:hidden">
        {TABS.map((t) => (
          <Link
            key={t.id}
            to={t.to}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition",
              current === t.id
                ? "bg-clove-900 text-cream-50"
                : "text-clove-700 hover:bg-terracotta-500/10 hover:text-terracotta-500",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
