import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_PORT = process.env.SERVER_PORT ?? "8787";

// Source images are pre-optimised at commit time via scripts/optimize-images.mjs,
// so there is no build-time image plugin here — that keeps the Docker build free
// of the native `sharp` dependency (which failed to compile on Alpine and caused
// 15+ minute Coolify builds).
//
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
