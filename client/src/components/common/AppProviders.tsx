import type { PropsWithChildren } from "react";
import { Alert, CssBaseline, LinearProgress, Snackbar } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { isLoadingState } from "../../states/loadingState";
import { noticeState } from "../../states/messageInfoState";

const GlobalProgressBar = () => {
  const isLoading = useRecoilValue(isLoadingState);

  if (!isLoading) return null;

  return (
    // プログレスバー
    <LinearProgress
      color="primary"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: (theme) => theme.zIndex.snackbar + 1,
      }}
    />
  );
};

const GlobalNotice = () => {
  const [notice, setNotice] = useRecoilState(noticeState);

  const handleClose = () => {
    setNotice((prev) => ({ ...prev, open: false }));
  };

  return (
    // メッセージ通知
    <Snackbar
      open={notice.open}
      autoHideDuration={notice.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={notice.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {notice.message}
      </Alert>
    </Snackbar>
  );
};

const theme = createTheme({
  // MUIのテーマ設定
  palette: {
    mode: "light",
    primary: { main: "#1565c0" }, //
    secondary: { main: "#2e7d32" },
    background: { default: "#f5f7fb" },
  },
  // 角丸の設定
  shape: { borderRadius: 10 },
  // フォントの設定
  typography: {
    fontFamily:
      '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
  },

  // コンポーネントのデフォルト設定やスタイルの上書き
  components: {
    // TextField（入力フォーム）
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
      },
    },

    // Paper / Card （カードや背景の紙っぽい部分）
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },

    // TableCell（表のセル）
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 16px", // 💡 デフォルトだと余白が広すぎて一覧性が低いため、少しキュッと縮める
        },
      },
    },

    // Tooltip（ホバー時の補足説明）
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

const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalProgressBar />
        <GlobalNotice />
        {children}
      </ThemeProvider>
    </RecoilRoot>
  );
};

export default AppProviders;
