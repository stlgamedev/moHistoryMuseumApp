import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// Set base for GitHub Pages project-site hosting.
// Override via VITE_BASE env var if deploying to user.github.io root.
const base = process.env.VITE_BASE ?? "/moHistoryMuseumApp/";

export default defineConfig({
  base,
  plugins: [preact()],
  server: {
    host: true,
    port: 5173,
  },
});
