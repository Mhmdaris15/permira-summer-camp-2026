/**
 * Layout Proposal — full-screen interactive campsite plan styled to feel
 * like a premium product page. Glass overlays, sticky header chip,
 * one-click PNG export.
 */
import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Scene } from "../components/ThreeScene/Scene";
import { Legend } from "../components/ThreeScene/Legend";

export function LayoutProposal() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    const canvas = wrapRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `permira-campsite-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, #e4eff8 0%, #cfe1ee 50%, #b8d5e8 100%)",
      }}
    >
      {/* --- Top bar --- */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-5">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            to="/"
            className="rounded-full border border-white/60 bg-white/55 px-3.5 py-1.5 text-sm font-medium text-clove-700 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-xl transition hover:bg-white/85 hover:text-terracotta-500"
          >
            ←&nbsp; Home
          </Link>
          <div className="rounded-full border border-white/55 bg-white/55 px-4 py-1.5 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-terracotta-500">
              Proposal
            </span>
            <span className="ml-2 text-sm font-medium text-clove-900">
              Campsite Layout
            </span>
            <span className="ml-2 text-[11px] text-clove-700/70">
              Taste of Nusantara · 2026
            </span>
          </div>
        </div>
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="group inline-flex items-center gap-2 rounded-full bg-clove-900 px-5 py-2.5 text-xs font-semibold text-cream-50 shadow-[0_12px_30px_-10px_rgba(74,32,20,0.65)] transition hover:bg-terracotta-500 hover:shadow-[0_14px_36px_-10px_rgba(196,80,42,0.65)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4v12m0 0l-4-4m4 4l4-4" />
              <path d="M4 20h16" />
            </svg>
            Download PNG
          </button>
        </div>
      </header>

      {/* --- Canvas --- */}
      <div ref={wrapRef} className="absolute inset-0">
        <Scene />
      </div>

      {/* --- Bottom overlays --- */}
      <Legend />

      <div className="pointer-events-none absolute bottom-6 right-6 z-10 max-w-[15rem] select-none rounded-2xl border border-white/55 bg-white/55 px-4 py-3 text-[11px] leading-relaxed text-clove-700/85 shadow-[0_18px_50px_-20px_rgba(74,32,20,0.35)] ring-1 ring-black/[0.02] backdrop-blur-xl backdrop-saturate-150">
        <div className="mb-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-terracotta-500" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-terracotta-500">
            Controls
          </span>
        </div>
        <span className="text-clove-900/85">Drag</span> to rotate ·{" "}
        <span className="text-clove-900/85">scroll</span> to zoom ·{" "}
        <span className="text-clove-900/85">right-click</span> to pan
      </div>
    </div>
  );
}
