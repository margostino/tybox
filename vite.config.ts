import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: "./frontend",
  build: {
    outDir: "../dist-frontend",
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/v1": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
