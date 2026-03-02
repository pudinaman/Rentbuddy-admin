import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 5174,
    allowedHosts: ["rentbuddy-admin-panel-2025.onrender.com"],
  },
});