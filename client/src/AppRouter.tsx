import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import LoginPage from "./components/pages/LoginPage";
import { authTokenStorage } from "./utils/accessTokenStorage";

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

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
