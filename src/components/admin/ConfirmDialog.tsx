import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export function ConfirmDialog({
  open,
  title,
  body,
  destructive,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  destructive?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] grid place-items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => !loading && onCancel()}
            className="absolute inset-0 bg-clove-900/65 backdrop-blur-sm"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl bg-cream-50 p-6 shadow-2xl"
          >
            <h3 className="font-display text-xl font-medium text-clove-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-clove-700/80">{body}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-full border border-clove-900/15 bg-cream-50 px-5 py-2 text-sm font-medium text-clove-700 transition hover:border-clove-900/30 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={
                  destructive
                    ? "rounded-full bg-terracotta-500 px-5 py-2 text-sm font-medium text-cream-50 transition hover:bg-terracotta-600 disabled:opacity-60"
                    : "rounded-full bg-clove-900 px-5 py-2 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500 disabled:opacity-60"
                }
              >
                {loading ? "Working…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
