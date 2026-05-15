-- 20260515_000001_create_core_tables.sql
-- Initial schema for ArsFabula

-- Enable UUID extension if supported, but SQLite uses TEXT by default
-- All IDs are UUIDs stored as TEXT

-- 1. Covenants
CREATE TABLE IF NOT EXISTS covenants (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name            TEXT NOT NULL UNIQUE,
    aura_type       TEXT NOT NULL CHECK(aura_type IN ('magic', 'faerie', 'divine', 'infernal', 'none')),
    aura_level      INTEGER NOT NULL DEFAULT 0 CHECK(aura_level BETWEEN 0 AND 10),
    founding_year   INTEGER NOT NULL,
    location_id     TEXT,
    tribunal        TEXT NOT NULL,
    size            TEXT NOT NULL DEFAULT 'small' CHECK(size IN ('tiny', 'small', 'medium', 'large')),
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 2. Characters
CREATE TABLE IF NOT EXISTS characters (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    covenant_id     TEXT NOT NULL REFERENCES covenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    character_type  TEXT NOT NULL CHECK(character_type IN ('magus', 'companion', 'grog')),
    house           TEXT,
    birth_year      INTEGER NOT NULL,
    warp_score      INTEGER NOT NULL DEFAULT 0,
    warp_points     INTEGER NOT NULL DEFAULT 0,
    confidence_score INTEGER NOT NULL DEFAULT 1,
    confidence_points INTEGER NOT NULL DEFAULT 3,
    description     TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 3. Character Arts
CREATE TABLE IF NOT EXISTS character_arts (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    art_name        TEXT NOT NULL CHECK(art_name IN (
        'Creo', 'Intellego', 'Muto', 'Perdo', 'Rego',
        'Animal', 'Aquam', 'Auram', 'Corpus', 'Herbam',
        'Ignem', 'Imaginem', 'Mentem', 'Terram', 'Vim'
    )),
    score           INTEGER NOT NULL DEFAULT 0,
    xp              INTEGER NOT NULL DEFAULT 0,
    UNIQUE(character_id, art_name)
);

-- 4. Seasons
CREATE TABLE IF NOT EXISTS seasons (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    covenant_id     TEXT NOT NULL REFERENCES covenants(id) ON DELETE CASCADE,
    year            INTEGER NOT NULL,
    quarter         TEXT NOT NULL CHECK(quarter IN ('spring', 'summer', 'autumn', 'winter')),
    event_summary   TEXT,
    is_current      INTEGER NOT NULL DEFAULT 0,
    completed_at    TEXT,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(covenant_id, year, quarter)
);

-- 5. Resources
CREATE TABLE IF NOT EXISTS resources (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    covenant_id     TEXT NOT NULL REFERENCES covenants(id) ON DELETE CASCADE,
    resource_type   TEXT NOT NULL CHECK(resource_type IN (
        'vis_creo', 'vis_intellego', 'vis_muto', 'vis_perdo', 'vis_rego',
        'vis_animal', 'vis_aquam', 'vis_auram', 'vis_corpus', 'vis_herbam',
        'vis_ignem', 'vis_imaginem', 'vis_mentem', 'vis_terram', 'vis_vim',
        'silver', 'income'
    )),
    amount          INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 6. Spells
CREATE TABLE IF NOT EXISTS spells (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    character_id    TEXT REFERENCES characters(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    technique       TEXT NOT NULL CHECK(technique IN ('Creo','Intellego','Muto','Perdo','Rego')),
    form            TEXT NOT NULL CHECK(form IN (
        'Animal','Aquam','Auram','Corpus','Herbam',
        'Ignem','Imaginem','Mentem','Terram','Vim'
    )),
    level           INTEGER NOT NULL,
    mastery_score   INTEGER NOT NULL DEFAULT 0,
    range_param     TEXT NOT NULL DEFAULT 'Personal',
    duration_param  TEXT NOT NULL DEFAULT 'Momentary',
    target_param    TEXT NOT NULL DEFAULT 'Individual',
    description     TEXT,
    openars_page    TEXT,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS covenants_updated_at AFTER UPDATE ON covenants
BEGIN
    UPDATE covenants SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS characters_updated_at AFTER UPDATE ON characters
BEGIN
    UPDATE characters SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS resources_updated_at AFTER UPDATE ON resources
BEGIN
    UPDATE resources SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
