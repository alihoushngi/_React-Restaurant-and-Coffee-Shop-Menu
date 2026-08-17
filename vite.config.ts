import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    outDir: "dist",
  },
  server: {
    proxy: {
      "/api/data": {
        target: "https://rayocafe.ir",
        changeOrigin: true,
      },
    },
  },
});
