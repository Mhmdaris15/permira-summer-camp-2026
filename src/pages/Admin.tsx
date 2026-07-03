import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  clearAdminToken,
  loginWithAdminToken,
  setAdminToken,
  verifyAdminSession,
} from "../lib/adminAuth";
import { KnowledgeEditor } from "../components/admin/KnowledgeEditor";
import LogoPermira from "../assets/organization/permira-logo-small.png";

type AuthState =
  | { status: "checking" }
  | { status: "anonymous"; error?: string }
  | { status: "authed" };

export function Admin() {
  const [auth, setAuth] = useState<AuthState>({ status: "checking" });
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // On mount, ask the server whether the stored JWT is still valid.
  useEffect(() => {
    void (async () => {
      const ok = await verifyAdminSession();
      if (ok) setAuth({ status: "authed" });
      else {
        clearAdminToken();
        setAuth({ status: "anonymous" });
      }
    })();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!token.trim() || submitting) return;
    setSubmitting(true);
    const result = await loginWithAdminToken(token.trim());
    setSubmitting(false);
    if (result.ok) {
      setAdminToken(result.token);
      setAuth({ status: "authed" });
      setToken("");
    } else {
      setAuth({ status: "anonymous", error: result.error });
    }
  }

  function handleSignOut() {
    clearAdminToken();
    setAuth({ status: "anonymous" });
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="border-b border-clove-900/8 bg-cream-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            {/* Logo Permira */}
            <img src={LogoPermira} alt="Permira logo" className="h-12" />
            <span className="font-display text-lg font-semibold text-clove-900">
              Permira <span className="text-terracotta-500">·</span> Admin
            </span>
          </Link>
          {auth.status === "authed" && (
            <div className="flex items-center gap-3">
              <Link
                to="/admin/participants"
                className="rounded-full bg-cream-100 px-4 py-1.5 text-sm font-medium text-clove-700 transition hover:bg-terracotta-500/10 hover:text-terracotta-500"
              >
                Participants →
              </Link>
              <Link
                to="/admin/email"
                className="rounded-full bg-cream-100 px-4 py-1.5 text-sm font-medium text-clove-700 transition hover:bg-terracotta-500/10 hover:text-terracotta-500"
              >
                Send email →
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-clove-900/15 bg-cream-50 px-4 py-1.5 text-sm font-medium text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {auth.status === "checking" && (
          <div className="text-clove-700/70">Checking session…</div>
        )}

        {auth.status === "anonymous" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-3xl border border-clove-900/8 bg-cream-50 p-8 shadow-[0_30px_80px_-30px_rgba(74,32,20,0.4)]"
          >
            <h1 className="font-display text-2xl font-light text-clove-900">
              Admin sign-in
            </h1>
            <p className="mt-2 text-sm text-clove-700/75">
              Enter the shared admin token to manage the chatbot's knowledge base.
            </p>
            <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-clove-900">
                Admin token
                <input
                  type="password"
                  autoComplete="current-password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-terracotta-500/20"
                />
              </label>
              {auth.error && (
                <p role="alert" className="text-xs text-terracotta-500">
                  {auth.error}
                </p>
              )}
              <button
                type="submit"
                disabled={!token.trim() || submitting}
                className="rounded-full bg-clove-900 px-5 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500 disabled:opacity-60"
              >
                {submitting ? "Verifying…" : "Sign in"}
              </button>
              <p className="text-[11px] text-clove-700/55">
                The token is set on the server as <code className="rounded bg-cream-100 px-1 py-0.5 font-mono">ADMIN_TOKEN</code>.
                It's stored only in your browser's localStorage on this device.
              </p>
            </form>
          </motion.div>
        )}

        {auth.status === "authed" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h1 className="font-display text-3xl font-light text-clove-900 md:text-4xl">
                Chatbot knowledge base
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-clove-700/75">
                Anything you save here is injected verbatim into the assistant's
                system prompt. Keep entries short, factual, and skim-friendly.
              </p>
            </div>
            <KnowledgeEditor onSignOut={handleSignOut} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
