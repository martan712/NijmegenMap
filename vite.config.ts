import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The generated map assets (public/maps, public/tiles — ~5 GB, public/data,
// public/maps.json) live directly under public/ so the dev server serves them
// at the site root. They are build artifacts, so we skip copying them into the
// production bundle; deploy them alongside dist/ separately.
export default defineConfig({
  plugins: [react()],
  build: { copyPublicDir: false },
  server: {
    watch: {
      // Don't file-watch the huge generated asset trees (hundreds of thousands
      // of tiles) — it exhausts the OS file-watcher limit (ENOSPC).
      ignored: ["**/tiles/**", "**/maps/**", "**/data/**"],
    },
  },
});

