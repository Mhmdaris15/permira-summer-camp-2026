import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

/**
 * Single shared logger. JSON in production (parsed by Loki/Grafana/etc.),
 * pretty-printed in dev. Level controlled by LOG_LEVEL.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss.l", ignore: "pid,hostname" },
      },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.adminToken",
    ],
    censor: "[redacted]",
  },
});
