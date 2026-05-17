import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_PORT = process.env.SERVER_PORT ?? "8787";

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
