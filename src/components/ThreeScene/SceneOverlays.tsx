/**
 * SceneOverlays — HTML-layer UI siblings to the Canvas:
 *
 *   • Hint toast on first arrival ("Click any zone to explore")
 *   • Reset-view floating button (visible only when a zone is inspected)
 *
 * Both read from sceneState; both auto-dismiss intelligently.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSceneState } from "./sceneState";

export function SceneOverlays() {
  const { inspectedId, hasInteracted, clearInspect } = useSceneState();

  // First-time hint: show after ~1.6s (intro completes), hide on first click.
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowHint(true), 1600);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (hasInteracted) setShowHint(false);
  }, [hasInteracted]);

  return (
    <>
      {/* Hint toast */}
      <AnimatePresence>
        {showHint && !hasInteracted && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full border border-white/55 bg-white/65 px-5 py-2 text-[12px] font-medium text-clove-900 shadow-[0_12px_30px_-10px_rgba(74,32,20,0.4)] backdrop-blur-xl backdrop-saturate-150"
          >
            ✨ Click any area to explore it
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset-view button — only when an area is inspected */}
      <AnimatePresence>
        {inspectedId && (
          <motion.button
            key="reset"
            type="button"
            onClick={clearInspect}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute bottom-6 left-1/2 z-30 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-white/55 bg-clove-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream-50 shadow-[0_14px_36px_-10px_rgba(74,32,20,0.6)] transition hover:bg-terracotta-500"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Reset view
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
