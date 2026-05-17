import { Router } from "express";
import { composeContext, loadKnowledge } from "../knowledge.js";
import { chat } from "../llm.js";
import type { ChatMessage } from "../types.js";

export const chatRouter: Router = Router();

chatRouter.post("/", async (req, res) => {
  const messages = (req.body?.messages ?? []) as ChatMessage[];
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Body must include a non-empty `messages` array." });
    return;
  }
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      res.status(400).json({ error: "Each message needs role ('user'|'assistant') and string content." });
      return;
    }
    if (m.content.length > 4000) {
      res.status(400).json({ error: "Messages must be 4000 characters or fewer." });
      return;
    }
  }

  try {
    const kb = await loadKnowledge();
    const context = composeContext(kb);
    const reply = await chat({ messages, context });

    if (!reply) {
      res
        .status(502)
        .json({ error: "The assistant returned an empty response. Please try again." });
      return;
    }
    res.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chat] failure:", message);
    res.status(500).json({ error: message });
  }
});
