import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./AppRouter.tsx";
import AppProviders from "./components/common/AppProviders.tsx";

// アプリケーションの初期化と、グローバルな状態管理
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
