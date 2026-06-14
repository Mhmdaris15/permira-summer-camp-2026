import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { RegistrationForm } from "./RegistrationForm";

export function RegistrationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC + body scroll lock + initial focus
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog without yanking it from a specific input —
    // let the user tab in naturally.
    const t = setTimeout(() => dialogRef.current?.focus(), 50);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      clearTimeout(t);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-stretch justify-center md:items-center"
          aria-hidden={!open}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.button
            aria-label={t("common.close")}
            onClick={onClose}
            className="absolute inset-0 bg-clove-900/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
            tabIndex={-1}
            className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-cream-50 shadow-2xl outline-none md:my-8 md:h-auto md:max-h-[92dvh] md:rounded-3xl"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="relative shrink-0 border-b border-clove-900/8 bg-cream-100/60 px-6 py-5 md:px-10 md:py-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.3em] text-terracotta-500">
                    {t("join.eyebrow")}
                  </span>
                  <h2
                    id="registration-title"
                    className="mt-2 font-display text-2xl font-light leading-tight text-clove-900 md:text-3xl"
                  >
                    {t("registration.title")}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label={t("common.close")}
                  onClick={onClose}
                  className="shrink-0 rounded-full p-2 text-clove-700 transition hover:bg-cream-200 hover:text-clove-900"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8"
            >
              <RegistrationForm onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
