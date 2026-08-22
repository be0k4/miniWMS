import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // client/.envではなく、モノレポルートの.envを参照する
  envDir: "..",
  plugins: [react()],
});
