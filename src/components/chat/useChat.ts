import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "../../lib/apiBase";

export type ChatRole = "user" | "assistant";
export type ChatMessage = { id: string; role: ChatRole; content: string };

const STORAGE_KEY = "permira:chat:v1";

const greeting: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Welcome — I'm the host of PERMIRA Summer Camp 2026. Ask me about the schedule, what to bring, registration, or anything else about the camp.",
};

function loadInitial(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [greeting];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) && parsed.length ? parsed : [greeting];
  } catch {
    return [greeting];
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadInitial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Persist within the session so refreshing doesn't drop context.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      const userMsg: ChatMessage = { id: cryptoId(), role: "user", content: trimmed };
      const next = [...messages, userMsg];
      setMessages(next);
      setError(null);
      setPending(true);

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch(apiUrl("/api/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            messages: next.map(({ role, content }) => ({ role, content })),
          }),
        });

        const body = (await res.json().catch(() => ({}))) as {
          reply?: string;
          error?: string;
        };

        if (!res.ok || !body.reply) {
          throw new Error(body.error ?? `Server returned ${res.status}.`);
        }

        setMessages((prev) => [
          ...prev,
          { id: cryptoId(), role: "assistant", content: body.reply! },
        ]);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Network error.";
        setError(message);
        setMessages((prev) => [
          ...prev,
          {
            id: cryptoId(),
            role: "assistant",
            content:
              "I couldn't reach the server just now. Please try again, or write to hello@permira.id.",
          },
        ]);
      } finally {
        setPending(false);
        abortRef.current = null;
      }
    },
    [messages, pending],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([greeting]);
    setError(null);
  }, []);

  return { messages, pending, error, send, reset };
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `m_${Math.random().toString(36).slice(2, 10)}`;
}
