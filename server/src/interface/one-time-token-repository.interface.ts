// ワンタイムトークンと、生成ロジックのインターフェース定義
// カスタムプロバイダで差し替えるロジックはすべてこのインターフェースに従う
export type OneTimeTokenPayload = {
  sub: string; // ユーザーIDなどの識別子
  iss: string; // 発行者
  type: 'ott'; // トークンの種類
};
export interface IOneTimeTokenRepository {
  generatePayload(): OneTimeTokenPayload;
}
