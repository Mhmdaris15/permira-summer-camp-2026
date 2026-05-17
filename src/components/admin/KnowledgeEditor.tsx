import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../lib/apiBase";
import { adminHeaders, clearAdminToken } from "../../lib/adminAuth";
import { cn } from "../../lib/cn";

type Section = { id: string; title: string; body: string };
type Faq = { id: string; question: string; answer: string };
type KnowledgeBase = {
  sections: Section[];
  faqs: Faq[];
  contact: { email: string; telegram?: string };
  updatedAt: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";
type Tab = "sections" | "faqs" | "preview";

export function KnowledgeEditor({ onSignOut }: { onSignOut: () => void }) {
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("sections");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(apiUrl("/api/knowledge"));
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        setKb((await res.json()) as KnowledgeBase);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load.");
      }
    })();
  }, []);

  async function handleSave() {
    if (!kb) return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch(apiUrl("/api/knowledge"), {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...adminHeaders() },
        body: JSON.stringify(kb),
      });
      if (res.status === 401) {
        clearAdminToken();
        onSignOut();
        return;
      }
      const body = (await res.json().catch(() => ({}))) as KnowledgeBase & { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Save failed (${res.status}).`);
      setKb(body);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  async function loadPreview() {
    setPreview(null);
    try {
      const res = await fetch(apiUrl("/api/knowledge/preview"), { headers: adminHeaders() });
      if (res.status === 401) {
        clearAdminToken();
        onSignOut();
        return;
      }
      const body = (await res.json()) as { context?: string; error?: string };
      if (!res.ok || !body.context) throw new Error(body.error ?? "Preview failed.");
      setPreview(body.context);
    } catch (err) {
      setPreview(`(Failed to load preview — ${err instanceof Error ? err.message : "unknown"})`);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-terracotta-500/30 bg-terracotta-500/5 p-6 text-sm text-terracotta-600">
        Couldn't load the knowledge base — {loadError}
      </div>
    );
  }
  if (!kb) {
    return <div className="text-clove-700/70">Loading knowledge base…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-clove-900/8 pb-4">
        <div role="tablist" aria-label="Knowledge sections" className="flex gap-1.5">
          <TabButton active={tab === "sections"} onClick={() => setTab("sections")}>Sections</TabButton>
          <TabButton active={tab === "faqs"} onClick={() => setTab("faqs")}>FAQs</TabButton>
          <TabButton
            active={tab === "preview"}
            onClick={() => {
              setTab("preview");
              void loadPreview();
            }}
          >
            Prompt preview
          </TabButton>
        </div>

        <div className="flex items-center gap-3">
          {saveState === "saved" && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-leaf"
            >
              Saved · {new Date(kb.updatedAt).toLocaleString()}
            </motion.span>
          )}
          {saveState === "error" && saveError && (
            <span className="text-xs text-terracotta-500">{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="rounded-full bg-clove-900 px-5 py-2 text-sm font-medium text-cream-50 transition hover:bg-terracotta-500 disabled:opacity-60"
          >
            {saveState === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {tab === "sections" && (
        <SectionsEditor
          sections={kb.sections}
          onChange={(sections) => setKb({ ...kb, sections })}
          contact={kb.contact}
          onContactChange={(contact) => setKb({ ...kb, contact })}
        />
      )}
      {tab === "faqs" && (
        <FaqsEditor faqs={kb.faqs} onChange={(faqs) => setKb({ ...kb, faqs })} />
      )}
      {tab === "preview" && <PreviewPane content={preview} />}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition",
        active
          ? "bg-clove-900 text-cream-50"
          : "bg-cream-100 text-clove-700 hover:bg-cream-200",
      )}
    >
      {children}
    </button>
  );
}

function SectionsEditor({
  sections,
  onChange,
  contact,
  onContactChange,
}: {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  contact: { email: string; telegram?: string };
  onContactChange: (c: { email: string; telegram?: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((s, idx) => (
        <SectionRow
          key={s.id}
          section={s}
          onChange={(next) => {
            const copy = [...sections];
            copy[idx] = next;
            onChange(copy);
          }}
          onDelete={() => onChange(sections.filter((_, i) => i !== idx))}
        />
      ))}

      <button
        type="button"
        onClick={() =>
          onChange([
            ...sections,
            { id: `section-${Date.now().toString(36)}`, title: "New section", body: "" },
          ])
        }
        className="self-start rounded-full border border-dashed border-clove-900/20 px-4 py-2 text-sm text-clove-700 transition hover:border-terracotta-500/50 hover:text-terracotta-500"
      >
        + Add section
      </button>

      <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-clove-900/8 bg-cream-100/50 p-5 md:grid-cols-2">
        <FieldLabel label="Contact email">
          <input
            type="email"
            value={contact.email}
            onChange={(e) => onContactChange({ ...contact, email: e.target.value })}
            className="w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
          />
        </FieldLabel>
        <FieldLabel label="Telegram (optional)">
          <input
            type="text"
            value={contact.telegram ?? ""}
            onChange={(e) => onContactChange({ ...contact, telegram: e.target.value })}
            className="w-full rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-terracotta-500/20"
          />
        </FieldLabel>
      </div>
    </div>
  );
}

function SectionRow({
  section,
  onChange,
  onDelete,
}: {
  section: Section;
  onChange: (s: Section) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-clove-900/8 bg-cream-50 p-5 shadow-[0_8px_30px_-20px_rgba(74,32,20,0.4)]">
      <div className="mb-3 flex items-center gap-3">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Section title"
          className="flex-1 rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 font-display text-lg outline-none focus:ring-2 focus:ring-terracotta-500/20"
        />
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full p-2 text-clove-700/60 transition hover:bg-terracotta-500/10 hover:text-terracotta-500"
          aria-label="Delete section"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <textarea
        value={section.body}
        onChange={(e) => onChange({ ...section, body: e.target.value })}
        rows={5}
        placeholder="Plain-text body (the chatbot will see this verbatim as context)"
        className="w-full resize-y rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-terracotta-500/20"
      />
      <div className="mt-2 flex items-center justify-between text-[11px] text-clove-700/50">
        <span className="font-mono">{section.id}</span>
        <span>{section.body.length} characters</span>
      </div>
    </div>
  );
}

function FaqsEditor({ faqs, onChange }: { faqs: Faq[]; onChange: (next: Faq[]) => void }) {
  return (
    <div className="flex flex-col gap-4">
      {faqs.map((f, idx) => (
        <div key={f.id} className="rounded-2xl border border-clove-900/8 bg-cream-50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <input
              type="text"
              value={f.question}
              onChange={(e) => {
                const copy = [...faqs];
                copy[idx] = { ...f, question: e.target.value };
                onChange(copy);
              }}
              placeholder="Question"
              className="flex-1 rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-terracotta-500/20"
            />
            <button
              type="button"
              onClick={() => onChange(faqs.filter((_, i) => i !== idx))}
              className="rounded-full p-2 text-clove-700/60 transition hover:bg-terracotta-500/10 hover:text-terracotta-500"
              aria-label="Delete FAQ"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <textarea
            value={f.answer}
            onChange={(e) => {
              const copy = [...faqs];
              copy[idx] = { ...f, answer: e.target.value };
              onChange(copy);
            }}
            rows={3}
            placeholder="Answer"
            className="w-full resize-y rounded-xl border border-clove-900/12 bg-cream-50 px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-terracotta-500/20"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...faqs,
            { id: `faq-${Date.now().toString(36)}`, question: "", answer: "" },
          ])
        }
        className="self-start rounded-full border border-dashed border-clove-900/20 px-4 py-2 text-sm text-clove-700 transition hover:border-terracotta-500/50 hover:text-terracotta-500"
      >
        + Add FAQ
      </button>
    </div>
  );
}

function PreviewPane({ content }: { content: string | null }) {
  return (
    <div className="rounded-2xl border border-clove-900/8 bg-clove-900 p-5 text-cream-100">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-saffron">
        <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
        Composed system prompt context
      </div>
      <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-cream-100/90">
        {content ?? "Loading…"}
      </pre>
      <p className="mt-3 text-[11px] text-cream-100/50">
        This is exactly what the assistant sees as context on every request.
        Save your changes first, then re-open this tab to refresh.
      </p>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-clove-900">
      <span>{label}</span>
      {children}
    </label>
  );
}
