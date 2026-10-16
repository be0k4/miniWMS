export type AuthInfo = {
  user_id: string;
  agent_cd: string;
  whs_cd: string;
};

export type AuthSession = {
  accessToken: string;
  authInfo: AuthInfo;
};

// 単寿命のアクセストークンとRLS用の認証情報
//  APIのリクエスト時にヘッダに付与する
// メモリ上の変数はブラウザのリロードで破棄されるため、リフレッシュトークンを使ってセッション情報の更新を行う想定
// → AppRouter.tsxのuseEffect
let authSessionInMemory: AuthSession | null = null;

export const authTokenStorage = {
  set(session: AuthSession) {
    authSessionInMemory = session;
  },
  clear() {
    authSessionInMemory = null;
  },
  getAccessToken() {
    return authSessionInMemory?.accessToken ?? null;
  },
  getAuthInfo() {
    return authSessionInMemory?.authInfo ?? null;
  },
  hasAccessToken() {
    return authSessionInMemory !== null;
  },
};
