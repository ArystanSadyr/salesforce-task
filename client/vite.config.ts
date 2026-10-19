import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "client",
  publicDir: "../data",
  plugins: [react()],
  server: { port: 5173, proxy: { "/reprice": "http://localhost:3001" } },
  build: { outDir: "../dist", emptyOutDir: true },
});
