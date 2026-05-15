-- 20260515000002_add_official_flag.sql
ALTER TABLE covenants ADD COLUMN is_official INTEGER NOT NULL DEFAULT 0;
