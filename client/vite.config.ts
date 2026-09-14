import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // client/.envではなく、モノレポルートの.envを参照する
  envDir: "..",
  // 環境差分をインフラ側で吸収するため、常に同一オリジンとしてリクエストを想定
  // {client}/api/login -> {server}/login へ転送 (例: http://localhost:3000/login)
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:30001", // 開発環境のサーバーURL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    // recoil の ESM ビルドを使用する(React 18系では問題ないが19系ではCJSビルドを使用しないと内部エラーが発生する)
    // Recoil から Zustand や Jotai へ乗り換えるのが通例らしい
    alias: {
      recoil: "recoil/es/index.js",
    },
  },
  plugins: [react()],
});
