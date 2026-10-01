export type AuthTokens = {
  accessToken: string;
};

// 単寿命のアクセストークン APIのリクエスト時にヘッダに付与する
// メモリ上の変数はブラウザのリロードで破棄されるため、リフレッシュトークンを使って更新を行う想定
let accessTokenInMemory: string | null = null;

export const authTokenStorage = {
  set(tokens: AuthTokens) {
    accessTokenInMemory = tokens.accessToken;
  },
  clear() {
    accessTokenInMemory = null;
  },
  getAccessToken() {
    return accessTokenInMemory;
  },
  hasAccessToken() {
    return accessTokenInMemory !== null;
  },
};
