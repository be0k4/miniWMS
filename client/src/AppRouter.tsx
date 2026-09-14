import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LoginPage from "./components/pages/LoginPage";
import { authTokenStorage } from "./utils/accessTokenStorage";
import { restoreSessionIfNeeded } from "./utils/httpClient";

const MainPage = () => <div>Main Test Page</div>;
const HelpPage = () => <div>Help Test Page</div>;
// 各ルートを認証ガードでラップする
const ProtectedLayout = () => {
  if (!authTokenStorage.hasAccessToken()) {
    return <Navigate to="/login" replace />;
  }
  // Outletは子ルートのコンポーネントを表示する
  return <Outlet />;
};

const LoginRoute = () => {
  if (authTokenStorage.hasAccessToken()) {
    return <Navigate to="/main" replace />;
  }
  return <LoginPage />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* ログイン画面（単体レイアウト） */}
      <Route path="/login" element={<LoginRoute />} />

      {/* ログイン後画面（ProtectedLayoutで共通ラップするグループ） */}
      <Route element={<ProtectedLayout />}>
        {/* replaceは戻るボタンの無限ループ抑制 */}
        <Route path="/" element={<Navigate to="/main" replace />} />

        <Route path="/help" element={<HelpPage />} />
        <Route path="/main" element={<MainPage />} />

        {/* 遷移先でIDの検証と動的生成を行う
        ^[a-z0-9_-]+$ で inbound_receive_01等のIDを期待*/}
        <Route path="/:id" element={<MainPage />} />

        {/* どこにもマッチしない場合の404エラー表示 */}
        <Route
          path="*"
          element={
            <p>
              404
              <br />
              page not found.
            </p>
          }
        />
      </Route>
    </>,
  ),
);

const AppRouter = () => {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let unmounted = false;
    const bootAuth = async () => {
      await restoreSessionIfNeeded();

      // JSの挙動上リダイレクト等でコンポーネントがアンマウントされても、続く処理が実行される可能性がある
      // リダイレクト→アンマウント→setState実行によるエラーを防ぐためのif文
      if (!unmounted) {
        setIsBooting(false);
      }
    };

    void bootAuth();
    // useEffectのクリーンアップ関数でアンマウントを検知することで、アンマウント後の状態更新を防ぐ
    return () => {
      unmounted = true;
    };
  }, []);

  // 認証情報を確定するまではルーティング画面を表示せず専用の表示を行う
  if (isBooting) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          color: "text.secondary",
        }}
      >
        <CircularProgress size={20} />
        <Typography variant="body2">認証情報を確認中...</Typography>
      </Box>
    );
  }

  return <RouterProvider router={router} />;
};

export default AppRouter;
