CREATE TABLE public.users (
    user_id character varying(10) NOT NULL,
    whs_cd character varying(8) NOT NULL,               -- 倉庫コード
    user_nm character varying(40) NOT NULL,             -- ユーザー名
    password character varying NOT NULL,                -- パスワード（NestJSでハッシュ化）
    email character varying(50),                        -- メールアドレス
    agent_cd character varying(3),                      -- 担当荷主コード
    is_enabled character varying(1) DEFAULT 'Y' NOT NULL, --退職者用の管理サイン
    
    -- 監査用共通カラム
    reg_tm timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reg_psn character varying(10),
    upd_tm timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    upd_psn character varying(10),

    -- 複合主キー設定
    CONSTRAINT users_pkey PRIMARY KEY (user_id, whs_cd),
    -- フラグのチェック制約
    CONSTRAINT check_is_enabled CHECK (is_enabled IN ('Y', 'N'))
);

-- インデックス（ログイン時に高速に検索できるようにする）
CREATE INDEX idx_users_login ON public.users USING btree (user_id, is_enabled);
