import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const API_PORT = process.env.SERVER_PORT ?? "8787";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Compress imported images at build time. The archive photos ship at
    // 2–4.5MB each raw; this brings them down dramatically without touching
    // source files. Only runs on `vite build`, not in dev.
    ViteImageOptimizer({
      jpg: { quality: 72 },
      jpeg: { quality: 72 },
      webp: { quality: 78 },
      png: { quality: 80 },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
