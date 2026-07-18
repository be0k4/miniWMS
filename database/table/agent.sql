CREATE TABLE public.agent (
    agent_cd character varying(3) NOT NULL,    -- 荷主コード（主キー）
    agent_nm character varying(100) NOT NULL,  -- 荷主名
    default_whs_cd character varying(10),      -- デフォルト倉庫コード
    contact_person character varying(50),      -- 連絡先担当者名
    contact_email character varying(100),      -- 連絡先メール
    contact_phone character varying(20),       -- 連絡先電話
    is_enabled character(1) DEFAULT 'Y' NOT NULL,-- 有効フラグ (Y/N)
    notes text,                                -- 備考・メモ

    -- 監査用共通カラム
    reg_tm timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 登録時刻
    reg_psn character varying(50),             -- 登録者
    upd_tm timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 更新時刻
    upd_psn character varying(50),             -- 更新者

    CONSTRAINT agent_pkey PRIMARY KEY (agent_cd),
    CONSTRAINT check_is_enabled CHECK (is_enabled IN ('Y','N'))
);