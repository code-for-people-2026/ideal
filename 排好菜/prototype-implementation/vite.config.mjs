import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        "page-map": resolve(import.meta.dirname, "page-map.html"),
        "engineering-model": resolve(import.meta.dirname, "engineering-model.html"),
      },
    },
  },
  optimizeDeps: { include: ["react", "react-dom/client"] },
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  plugins: [react()],
});
