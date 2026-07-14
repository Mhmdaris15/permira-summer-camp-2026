import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "./types.js";

const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash-lite";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set on the server.");
  client = new GoogleGenAI({ apiKey });
  return client;
}

export function buildSystemPrompt(context: string): string {
  return [
    "You are the friendly host of PERMIRA Summer Camp 2026 — Cuisine of Nusantara: Lessons of Nature and Friendship of Peoples.",
    "Answer questions from prospective participants about the event using ONLY the knowledge base below.",
    "",
    "Tone: warm, concise, and welcoming — like a good host explaining a dinner party.",
    "Length: 1–4 short sentences. Use bullet lists only when comparing several items.",
    "Style: write in plain prose. Avoid corporate phrasing. Never invent dates, prices, names, or facts not present in the knowledge base.",
    "",
    "When you genuinely don't know something:",
    "- Say so plainly in one sentence.",
    "- Suggest the user contact the organisers at the email in the Contact section.",
    "- Do not guess.",
    "",
    "Out of scope topics (not about this camp): briefly redirect back to the camp.",
    "",
    "--- KNOWLEDGE BASE START ---",
    context,
    "--- KNOWLEDGE BASE END ---",
  ].join("\n");
}

/**
 * Gemini uses `model` (not `assistant`) for the bot role; this maps cleanly
 * from our internal ChatMessage shape without leaking provider details to
 * callers. History is capped to the last 12 turns to bound cost & latency.
 */
export async function chat(opts: {
  messages: ChatMessage[];
  context: string;
}): Promise<string> {
  const ai = getClient();
  const trimmed = opts.messages.slice(-12);

  const contents = trimmed.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: buildSystemPrompt(opts.context),
      maxOutputTokens: 600,
      temperature: 0.6,
    },
  });

  return (response.text ?? "").trim();
}
