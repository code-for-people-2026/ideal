import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  // ponytail: local preview mirrors the GitHub Pages subpath so routes and public assets behave the same in both places.
  base: command === "serve" ? "/排好菜/prototype-implementation/" : "./",
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        "page-map": resolve(import.meta.dirname, "page-map.html"),
      },
    },
  },
  optimizeDeps: { include: ["react", "react-dom/client"] },
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  plugins: [react()],
}));
