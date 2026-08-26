export const REFRESH_TOKEN_COOKIE_NAME = 'miniwms.refreshToken';

// 有効期限は24時間に設定
export const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const refreshTokenCookieOptions = {
  httpOnly: true, // JavaScriptからのアクセスを禁止することで、XSS攻撃によるトークンの漏洩を防ぐ
  secure: process.env.NODE_ENV === 'production', // HTTPS通信時のみクッキーを送信する (本番のみ有効)
  sameSite: 'strict' as const, // クロスサイトからのリクエストではクッキーを送信しない(開発・本番ともに同一オリジンを想定)
  path: '/auth/refresh-token',
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
};
