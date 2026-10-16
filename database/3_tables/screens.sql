CREATE TABLE screens (
  agent_cd      VARCHAR(32)           NOT NULL, -- RLS用荷主コード
  whs_cd        VARCHAR(32)           NOT NULL, -- RLS用拠点コード
  screen_id     VARCHAR(64)           NOT NULL, -- 画面ID (例: 'inbound_receipt_entry')
  screen_name   VARCHAR(100)          NOT NULL, -- 画面表示名 (例: '入荷受付入力')
  category      screen_category_type  NOT NULL, -- 分類
  min_auth_level INT                  NOT NULL DEFAULT 1, -- 閲覧に必要な最小権限レベル
  icon_name     VARCHAR(64)           NULL,     -- MUIアイコン識別名 (例: 'Inventory')
  path          VARCHAR(255)          NULL,     -- 遷移先フロントエンドパス (例: '/inbound/receipt')
  display_order INT                  NOT NULL DEFAULT 0, -- 表示順序
  is_active     BOOLEAN               NOT NULL DEFAULT TRUE, -- 有効/無効フラグ
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 主キー: マルチテナント(拠点・荷主)毎に画面IDを一意にする
  CONSTRAINT pk_screens PRIMARY KEY (whs_cd, agent_cd, screen_id),

  -- 権限レベルのバリデーションチェック (例: 1〜99)
  CONSTRAINT chk_screens_auth_level CHECK (min_auth_level >= 1)
);

-- 検索・ソート用インデックス
CREATE INDEX idx_screens_lookup 
  ON screens (whs_cd, agent_cd, is_active, display_order);

