-- 画面分類のENUM型を作成（入荷・出荷・在庫/移動・その他を強制）
CREATE TYPE screen_category_type AS ENUM (
  'INBOUND',   -- 入荷
  'OUTBOUND',  -- 出荷
  'INVENTORY', -- 在庫/移動
  'OTHER'      -- その他
);
