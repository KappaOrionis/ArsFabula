-- 20260515000010_expand_characters_metadata.sql
-- Add new metadata fields to characters table for Magi Census lore

ALTER TABLE characters ADD COLUMN death_year INTEGER;
ALTER TABLE characters ADD COLUMN favored_arts TEXT;
ALTER TABLE characters ADD COLUMN familiar_link TEXT;
ALTER TABLE characters ADD COLUMN apprentice_registry TEXT;
ALTER TABLE characters ADD COLUMN biographical_notice TEXT;
ALTER TABLE characters ADD COLUMN source_book TEXT;
ALTER TABLE characters ADD COLUMN page_reference TEXT;
