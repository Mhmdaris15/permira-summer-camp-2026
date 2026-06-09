/**
 * LoadingOverlay — fullscreen glass curtain shown while GLB assets and
 * the first frame load. Reads progress from drei's <Loader> internal
 * state via the useProgress hook.
 */
import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

export function LoadingOverlay() {
  const { progress, active } = useProgress();
  const [hidden, setHidden] = useState(false);

  // Hide a touch after progress reaches 100 so the canvas has a frame to draw.
  useEffect(() => {
    if (progress >= 100 && !active) {
      const t = window.setTimeout(() => setHidden(true), 350);
      return () => window.clearTimeout(t);
    }
  }, [progress, active]);

  if (hidden) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(ellipse at top, #e4eff8 0%, #cfe1ee 50%, #b8d5e8 100%)",
        opacity: progress >= 100 && !active ? 0 : 1,
        pointerEvents: progress >= 100 && !active ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-white/55 bg-white/55 px-10 py-7 shadow-[0_18px_50px_-20px_rgba(74,32,20,0.35)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-terracotta-500 text-cream-50">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-4 3-5 5-9z" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold text-clove-900">
            Building the campsite
          </span>
        </div>

        <div className="relative h-1 w-56 overflow-hidden rounded-full bg-clove-900/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-terracotta-500 to-saffron transition-[width] duration-300"
            style={{ width: `${Math.max(8, progress)}%` }}
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-clove-700/70">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
