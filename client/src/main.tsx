import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./AppRouter.tsx";
import GlobalProgressBar from "./components/common/GlobalProgressBar";
import GlobalNotice from "./components/common/GlobalNotice";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { RecoilRoot } from "recoil";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1565c0" },
    secondary: { main: "#2e7d32" },
    background: { default: "#f5f7fb" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
  },
  components: {
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 16px",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "0.75rem",
          backgroundColor: "#1E293B",
        },
      },
    },
  },
});

// アプリケーションの初期化と、グローバルな状態管理
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RecoilRoot>
        <GlobalProgressBar />
        <GlobalNotice />
        <AppRouter />
      </RecoilRoot>
    </ThemeProvider>
  </StrictMode>,
);
