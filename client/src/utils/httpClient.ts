import axios, { AxiosError, AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { authTokenStorage } from "./accessTokenStorage";

type RefreshTokenResponse = {
  accessToken: string;
};

// Axiosのリクエスト設定にリトライフラグを追加
type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// アプリ全体で使用するHTTPクライアント
const DEFAULT_TIMEOUT =
  typeof import.meta !== "undefined" && import.meta.env?.DEV ? 0 : 10000;

export const httpClient = axios.create({
  baseURL: "/api",
  timeout: DEFAULT_TIMEOUT,
  // Cookieの送信を有効化する
  withCredentials: true,
});

// httpClient側でインターセプタを設定しているため、再帰的に呼ばれないため専用クライアントに分ける
const refreshClient = axios.create({
  baseURL: "/api",
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
});

// 送信前処理でアクセストークンをヘッダーに付与する
httpClient.interceptors.request.use((config) => {
  const accessToken = authTokenStorage.getAccessToken();
  if (accessToken) {
    setAuthorizationHeader(config, accessToken);
  }
  return config;
});

const setAuthorizationHeader = (
  config: InternalAxiosRequestConfig,
  accessToken: string,
) => {
  if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(config.headers);
  }
  config.headers.set("Authorization", `Bearer ${accessToken}`);
};

// 送信後処理でトークン期限切れ時のアクセストークンの自動更新を行う
httpClient.interceptors.response.use(
  // 正常時の処理
  (response) => response,
  // エラー時の処理
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (
      // 401 Unauthorized
      status !== 401 ||
      // 無限ループ防止
      originalRequest._retry ||
      isExcludedFromAutoRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      setAuthorizationHeader(originalRequest, newAccessToken);
      // アクセストークンを更新した後、元のリクエストを再試行する
      return httpClient(originalRequest);
    } catch {
      authTokenStorage.clear();
      redirectToLogin();
      return Promise.reject(error);
    }
  },
);

/**
 * @returns 自動更新の対象外URLであればtrue
 */
const isExcludedFromAutoRefresh = (url?: string) => {
  if (!url) {
    return false;
  }
  return url.includes("/auth/refresh-token") || url.includes("/login");
};

/**
 * アクセストークンの更新を行う。
 * 更新に失敗した場合はログインページにリダイレクトされる。
 */
export const restoreSessionIfNeeded = async (): Promise<boolean> => {
  if (authTokenStorage.hasAccessToken()) {
    return true;
  }
  try {
    await refreshAccessToken();
    return true;
  } catch {
    authTokenStorage.clear();
    redirectToLogin();
    return false;
  }
};

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }
  if (window.location.pathname === "/login") {
    return;
  }
  window.location.replace(`/login${window.location.search}`);
};

let refreshInFlight: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (!refreshInFlight) {
    refreshInFlight = refreshClient
      .get<RefreshTokenResponse>("/auth/refresh-token")
      .then((response) => {
        const accessToken = response.data.accessToken;
        authTokenStorage.set({ accessToken });
        return accessToken;
      })
      // 更新完了時にキャッシュをクリア
      .finally(() => {
        refreshInFlight = null;
      });
  }
  // 既に更新中であれば、そのPromiseを返すため二重リクエストを防ぐ
  return refreshInFlight;
};
