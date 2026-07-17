import { GoogleGenAI } from "@google/genai";
import { listParticipants } from "./participants.js";
import type { Participant } from "../types.js";

/**
 * Registrant analytics: fast descriptive aggregates (computeStats) plus an
 * on-demand AI cohort analysis (generateInsights) via Gemini. Both are
 * admin-only — the routes gate access.
 */

export type CountItem = { name: string; count: number };

export type Stats = {
  total: number;
  byStatus: Record<string, number>;
  byNationality: CountItem[];
  byGender: CountItem[];
  topUniversities: CountItem[];
  byDate: { date: string; count: number }[];
  dietary: { withNeeds: number; none: number };
  documents: { passport: number; studentCard: number };
  generatedAt: string;
};

function tally(values: string[]): CountItem[] {
  const map = new Map<string, number>();
  for (const raw of values) {
    const name = raw.trim() || "—";
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

const NEGATIONS = new Set(["", "-", "—", "no", "none", "nil", "net", "нет", "tidak", "tidak ada"]);

export async function computeStats(): Promise<Stats> {
  const { rows } = await listParticipants({ limit: 500 });

  const byStatus: Record<string, number> = {};
  for (const p of rows) byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;

  const dateMap = new Map<string, number>();
  for (const p of rows) {
    const date = (p.submittedAt || "").slice(0, 10);
    if (date) dateMap.set(date, (dateMap.get(date) ?? 0) + 1);
  }
  const byDate = [...dateMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const dietaryNeeds = rows.filter(
    (p) => !NEGATIONS.has((p.dietary || "").trim().toLowerCase()),
  ).length;

  return {
    total: rows.length,
    byStatus,
    byNationality: tally(rows.map((p) => p.nationality)),
    byGender: tally(rows.map((p) => p.gender)),
    topUniversities: tally(rows.map((p) => p.university)).slice(0, 8),
    byDate,
    dietary: { withNeeds: dietaryNeeds, none: rows.length - dietaryNeeds },
    documents: {
      passport: rows.filter((p) => p.passportFileId).length,
      studentCard: rows.filter((p) => p.studentCardFileId).length,
    },
    generatedAt: new Date().toISOString(),
  };
}

// --- AI insights ---

export type Insights = {
  cohortOverview: string;
  themes: { title: string; detail: string }[];
  notable: { name: string; reason: string }[];
  generatedAt: string;
};

const MODEL = process.env.LLM_MODEL ?? "gemini-2.5-flash-lite";

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set on the server.");
  client = new GoogleGenAI({ apiKey });
  return client;
}

/** Compact record for the model — full records (names included) per admin choice. */
function toRecord(p: Participant) {
  return {
    name: p.fullName,
    nationality: p.nationality,
    university: p.university,
    gender: p.gender,
    status: p.status,
    motivation: (p.motivation || "").slice(0, 600),
    priorExperience: (p.priorExperience || "").slice(0, 300),
  };
}

export async function generateInsights(): Promise<Insights> {
  const { rows } = await listParticipants({ limit: 500 });
  if (rows.length === 0) {
    return {
      cohortOverview: "No registrations yet.",
      themes: [],
      notable: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const records = rows.slice(0, 150).map(toRecord);
  const prompt = [
    "You are an admissions analyst for the PERMIRA Summer Camp 2026 — an Indonesia–Russia–ASEAN youth cultural-exchange camp centred on cooking and nature.",
    "Analyse the participant registrations below and return JSON only, matching exactly this shape:",
    '{ "cohortOverview": string, "themes": [{ "title": string, "detail": string }], "notable": [{ "name": string, "reason": string }] }',
    "",
    "- cohortOverview: 3–4 sentences describing who has applied (nationalities, universities, backgrounds, overall energy).",
    "- themes: 3–5 recurring motivations or patterns; title is a short label, detail is one sentence.",
    "- notable: up to 5 applicants worth a closer look, each with their exact name and a one-line reason (strong motivation, relevant experience, etc.).",
    "Base everything ONLY on the data. Do not invent names or facts.",
    "",
    "PARTICIPANTS (JSON):",
    JSON.stringify(records),
  ].join("\n");

  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 1400,
      temperature: 0.4,
    },
  });

  const text = (response.text ?? "").trim();
  let parsed: Omit<Insights, "generatedAt">;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Model occasionally wraps JSON in prose/fences — salvage the object.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI returned an unparseable response.");
    parsed = JSON.parse(match[0]);
  }

  return {
    cohortOverview: parsed.cohortOverview ?? "",
    themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 6) : [],
    notable: Array.isArray(parsed.notable) ? parsed.notable.slice(0, 6) : [],
    generatedAt: new Date().toISOString(),
  };
}
