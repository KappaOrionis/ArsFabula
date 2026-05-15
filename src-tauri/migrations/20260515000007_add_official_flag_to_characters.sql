-- 20260515000007_add_official_flag_to_characters.sql
-- Add is_official column to characters table
ALTER TABLE characters ADD COLUMN is_official INTEGER NOT NULL DEFAULT 0;
