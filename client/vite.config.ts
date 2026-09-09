import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // client/.envではなく、モノレポルートの.envを参照する
  envDir: "..",
  resolve: {
    // recoil の ESM ビルドを使用する(React 18系では問題ないが19系ではCJSビルドを使用しないと内部エラーが発生する)
    // Recoil から Zustand や Jotai へ乗り換えるのが通例らしい
    alias: {
      recoil: "recoil/es/index.js",
    },
  },
  plugins: [react()],
});
