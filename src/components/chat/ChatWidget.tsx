import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat, type ChatMessage } from "./useChat";
import { cn } from "../../lib/cn";

const SUGGESTIONS = [
  "When is the camp?",
  "What's on Day 2?",
  "How do I register?",
  "What should I bring?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, pending, send, reset } = useChat();
  const [draft, setDraft] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages or while typing indicator is visible.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  // Focus input when panel opens.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || pending) return;
    void send(draft);
    setDraft("");
  }

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat with the host"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full text-cream-50 shadow-[0_15px_40px_-10px_rgba(196,80,42,0.55)] transition-colors md:bottom-8 md:right-8",
          open ? "bg-clove-900 hover:bg-clove-800" : "bg-terracotta-500 hover:bg-terracotta-600",
        )}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </motion.svg>
          ) : (
            <motion.svg
              key="open"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with the PERMIRA host"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-[89] flex h-[72dvh] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-clove-900/10 bg-cream-50 shadow-[0_30px_80px_-20px_rgba(74,32,20,0.45)] md:bottom-28 md:right-8"
          >
            <Header onReset={reset} onClose={() => setOpen(false)} />

            <div
              ref={listRef}
              data-lenis-prevent
              className="flex-1 overflow-y-auto bg-cream-100/40 px-4 py-5"
            >
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <Bubble key={m.id} msg={m} />
                ))}
                {pending && <TypingDots />}
                {messages.length <= 1 && !pending && (
                  <Suggestions
                    onPick={(text) => {
                      setDraft("");
                      void send(text);
                    }}
                  />
                )}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-clove-900/8 bg-cream-50 px-3 py-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask anything about the camp…"
                disabled={pending}
                maxLength={1000}
                className="flex-1 rounded-full bg-cream-100 px-4 py-2.5 text-sm text-clove-900 placeholder:text-clove-700/45 outline-none transition focus:bg-cream-50 focus:ring-2 focus:ring-terracotta-500/25 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!draft.trim() || pending}
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-terracotta-500 text-cream-50 transition hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:bg-clove-900/20"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Header({ onReset, onClose }: { onReset: () => void; onClose: () => void }) {
  return (
    <div className="relative flex items-center gap-3 border-b border-clove-900/8 bg-clove-900 px-4 py-3 text-cream-50">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-saffron text-clove-900">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-4 3-5 5-9z" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="flex-1">
        <div className="font-display text-sm font-medium">The PERMIRA Host</div>
        <div className="flex items-center gap-1.5 text-[11px] text-cream-100/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" />
          Online · Typically replies instantly
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        title="Start a fresh conversation"
        className="rounded-full p-1.5 text-cream-100/80 transition hover:bg-cream-100/10 hover:text-cream-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="rounded-full p-1.5 text-cream-100/80 transition hover:bg-cream-100/10 hover:text-cream-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-md bg-terracotta-500 text-cream-50"
            : "rounded-bl-md bg-cream-50 text-clove-900 shadow-sm ring-1 ring-clove-900/5",
        )}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start"
    >
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-cream-50 px-4 py-3 shadow-sm ring-1 ring-clove-900/5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-terracotta-500"
            animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Suggestions({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="rounded-full border border-clove-900/12 bg-cream-50 px-3 py-1.5 text-xs text-clove-700 transition hover:border-terracotta-500/40 hover:text-terracotta-500"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
