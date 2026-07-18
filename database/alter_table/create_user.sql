-- ログイン用のuserとagentを追加
INSERT INTO users (user_id, whs_cd, user_nm, whs_nm, password, email, agent_cd, is_enabled, reg_psn, upd_psn)
VALUES ('be0k4', '001', '岡部 圭吾', '浜松第一拠点', '$argon2id$v=19$m=65536,t=3,p=4$wWe6RcSiOlUXyL9rpToQ8g$TrcBcoTEwao/4rt3tfhMMHqsT0hYKkD8/Dc/OrYN8os', 'okabe@example.com', 'AG1', 'Y', 'mws_user', 'mws_user');
INSERT INTO agent (agent_cd, agent_nm, default_whs_cd, contact_person, contact_email, contact_phone, is_enabled, notes, reg_psn, upd_psn)
VALUES ('AG1', '株式会社サンプル荷主', '001', '岡部 圭吾', 'okabe@example.com', '090-1234-5678', 'Y', '', 'mws_user', 'mws_user');