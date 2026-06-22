// JWTペイロードと、生成ロジックのインターフェース定義
// カスタムプロバイダで差し替えるロジックはすべてこのインターフェースに従う
export type JwtType = 'access' | 'refresh';

// JWTのペイロードの型定義は世界標準に従うべきだが、プロジェクトの要件に応じてカスタマイズも可能となっている
export type JwtPayload = {
  jti: string; // JWTの一意な識別子
  sub: string; // ユーザーIDなどの識別子
  iss: string; // 発行者
  type: JwtType; // トークンの種類
  userId: string; // ユーザーID
  agentCd: string; // エージェントコード
  whsCd: string; // RLS用の倉庫コード
};
export interface IJwtRepository {
  generatePayload(
    userId: string,
    agentCd: string,
    whsCd: string,
    type: JwtType,
    jti?: string,
  ): JwtPayload;
}
