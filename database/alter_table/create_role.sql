-- =================================================================
-- 1. RLS制限を強制発動させる「権限グループ（ロール）」を作成
-- =================================================================
-- 💡 superuser や特権を持たない、純粋なデータ読み書き専用のロールです
CREATE ROLE wms_rls_policy_role WITH NOSUPERUSER NOCREATEDB NOCREATEROLE;

-- =================================================================
-- 2. NestJS（アプリ）がDBに最初に接続するための「一般アカウント（ユーザー）」を作成
-- =================================================================
-- 💡 このユーザー自身も一般アカウントとして安全に作成します
CREATE ROLE app_user WITH LOGIN PASSWORD 'あなたのセキュアなパスワード' NOSUPERUSER NOCREATEDB NOCREATEROLE;

-- 💡 一般アカウント（app_user）に、RLS用の権限グループに切り替える許可を与える
GRANT wms_rls_policy_role TO app_user;

-- =================================================================
-- 3. 現在 public スキーマにある既存オブジェクトへの権限付与
-- =================================================================
-- 💡 スキーマの使用権限を付与
GRANT USAGE ON SCHEMA public TO wms_rls_policy_role;

-- 💡 RLSをバイパス（無視）しないよう、ALLではなく純粋な「データの読み書き権限」に絞って付与します
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO wms_rls_policy_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO wms_rls_policy_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO wms_rls_policy_role;

-- =================================================================
-- 4. 今後マイグレーション等で「新しいテーブル」が増えた時の自動対応設定
-- =================================================================
-- 💡 管理ユーザー(wms_user)が今後テーブルやシーケンスを作った時、
--    自動的に wms_rls_policy_role に読み書き権限が GRANT されるように設定します
ALTER DEFAULT PRIVILEGES FOR ROLE wms_user IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO wms_rls_policy_role;
ALTER DEFAULT PRIVILEGES FOR ROLE wms_user IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO wms_rls_policy_role;
ALTER DEFAULT PRIVILEGES FOR ROLE wms_user IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO wms_rls_policy_role;