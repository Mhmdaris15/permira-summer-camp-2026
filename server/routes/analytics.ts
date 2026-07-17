import { Router } from "express";
import { computeStats, generateInsights } from "../services/analytics.js";

// Mounted behind requireAdmin in index.ts.
export const analyticsRouter: Router = Router();

// Fast descriptive aggregates for the dashboard.
analyticsRouter.get("/", async (_req, res) => {
  try {
    res.json(await computeStats());
  } catch (err) {
    console.error("[analytics] stats error:", err);
    res.status(500).json({ error: "Could not compute analytics." });
  }
});

// On-demand AI cohort analysis (Gemini). Separate endpoint so it only runs when
// the admin asks — it costs tokens and takes a few seconds.
analyticsRouter.post("/insights", async (_req, res) => {
  try {
    res.json(await generateInsights());
  } catch (err) {
    console.error("[analytics] insights error:", err);
    res.status(500).json({
      error: "Could not generate AI insights.",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
