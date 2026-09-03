import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  // 尾注：本地预览复制 GitHub Pages 子路径，使路由和公开资产在两处保持一致。
  base: command === "serve" ? "/meal-mind/prototype-implementation/" : "./",
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
