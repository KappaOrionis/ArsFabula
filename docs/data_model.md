# Data Model — ArsFabula

**Last Updated**: 2026-05-15
**Status**: Draft — pending first SQLx migration

---

## 1. Relational Schema (SQLite via SQLx)

All migrations live in `src-tauri/migrations/`. All IDs are UUIDs stored as `TEXT`.
Timestamps use ISO 8601 format (UTC).

---

### 1.1 `covenants`

The primary entity. Every campaign has exactly one active Covenant.

```sql
CREATE TABLE covenants (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name            TEXT NOT NULL UNIQUE,
    aura_type       TEXT NOT NULL CHECK(aura_type IN ('magic', 'faerie', 'divine', 'infernal', 'none')),
    aura_level      INTEGER NOT NULL DEFAULT 0 CHECK(aura_level BETWEEN 0 AND 10),
    founding_year   INTEGER NOT NULL,           -- e.g. 1200 (AD)
    location_id     TEXT REFERENCES locations(id),
    tribunal        TEXT NOT NULL,              -- e.g. 'Normandy', 'Rhine', 'Iberia'
    size            TEXT NOT NULL DEFAULT 'small' CHECK(size IN ('tiny', 'small', 'medium', 'large')),
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- Ref: ArM5, p. 68 (Covenant Boons & Hooks)
```

---

### 1.2 `characters`

Magi, Companions, and Grogs. Polymorphic via `character_type`.

```sql
CREATE TABLE characters (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    covenant_id     TEXT NOT NULL REFERENCES covenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    character_type  TEXT NOT NULL CHECK(character_type IN ('magus', 'companion', 'grog')),
    house           TEXT,   -- Magus only: 'Bonisagus', 'Flambeau', 'Bjornaer', etc.
    birth_year      INTEGER NOT NULL,
    warp_score      INTEGER NOT NULL DEFAULT 0,  -- Ref: ArM5, p. 168
    warp_points     INTEGER NOT NULL DEFAULT 0,
    confidence_score INTEGER NOT NULL DEFAULT 1, -- Ref: ArM5, p. 19
    confidence_points INTEGER NOT NULL DEFAULT 3,
    description     TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

---

### 1.3 `character_arts`

Hermetic Arts (Techniques × Forms) for Magi only.

```sql
CREATE TABLE character_arts (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    art_name        TEXT NOT NULL CHECK(art_name IN (
        -- Techniques
        'Creo', 'Intellego', 'Muto', 'Perdo', 'Rego',
        -- Forms
        'Animal', 'Aquam', 'Auram', 'Corpus', 'Herbam',
        'Ignem', 'Imaginem', 'Mentem', 'Terram', 'Vim'
    )),
    score           INTEGER NOT NULL DEFAULT 0,
    xp              INTEGER NOT NULL DEFAULT 0,     -- Current XP toward next score
    UNIQUE(character_id, art_name)
);
-- Ref: ArM5, p. 31 (Arts)
```

---

### 1.4 `character_abilities`

Skills and Knowledges for all character types.

```sql
CREATE TABLE character_abilities (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    ability_name    TEXT NOT NULL,
    specialty       TEXT,
    score           INTEGER NOT NULL DEFAULT 0,
    xp              INTEGER NOT NULL DEFAULT 0,
    UNIQUE(character_id, ability_name, specialty)
);
-- Ref: ArM5, p. 62 (Abilities)
```

---

### 1.5 `seasons`

The heartbeat of the game — each season is a unit of narrative time.

```sql
CREATE TABLE seasons (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    covenant_id     TEXT NOT NULL REFERENCES covenants(id) ON DELETE CASCADE,
    year            INTEGER NOT NULL,
    quarter         TEXT NOT NULL CHECK(quarter IN ('spring', 'summer', 'autumn', 'winter')),
    event_summary   TEXT,           -- AI-generated narrative summary
    is_current      INTEGER NOT NULL DEFAULT 0,
    completed_at    TEXT,           -- NULL if season not yet resolved
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(covenant_id, year, quarter)
);
-- Ref: ArM5, p. 167 (Seasonal Activities)
```

---

### 1.6 `season_activities`

What each character did in a given season.

```sql
CREATE TABLE season_activities (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    season_id       TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    activity_type   TEXT NOT NULL CHECK(activity_type IN (
        'study_summa', 'study_tractatus', 'practice', 'training',
        'exposure', 'adventure', 'teaching', 'lab_work', 'vis_extraction',
        'initiation', 'writing', 'other'
    )),
    art_or_ability  TEXT,           -- What was studied/practiced
    xp_gained       INTEGER DEFAULT 0,
    description     TEXT,
    UNIQUE(season_id, character_id)
);
-- Ref: ArM5, p. 163 (Advancement Summary)
```

---

### 1.7 `resources`

Covenant resources: Vis stocks and mundane treasury.

```sql
CREATE TABLE resources (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    covenant_id     TEXT NOT NULL REFERENCES covenants(id) ON DELETE CASCADE,
    resource_type   TEXT NOT NULL CHECK(resource_type IN (
        -- Vis (one per Art)
        'vis_creo', 'vis_intellego', 'vis_muto', 'vis_perdo', 'vis_rego',
        'vis_animal', 'vis_aquam', 'vis_auram', 'vis_corpus', 'vis_herbam',
        'vis_ignem', 'vis_imaginem', 'vis_mentem', 'vis_terram', 'vis_vim',
        -- Mundane
        'silver', 'income'
    )),
    amount          INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- Ref: ArM5, p. 95 (Vis)
```

---

### 1.8 `vis_sources`

Recurring annual Vis income for the Covenant.

```sql
CREATE TABLE vis_sources (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    covenant_id     TEXT NOT NULL REFERENCES covenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    art_type        TEXT NOT NULL,      -- e.g. 'vis_ignem'
    amount_per_year INTEGER NOT NULL DEFAULT 1,
    season_harvested TEXT CHECK(season_harvested IN ('spring', 'summer', 'autumn', 'winter', 'any')),
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

---

### 1.9 `library_books`

Summae and Tractatus in the Covenant library.

```sql
CREATE TABLE library_books (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    covenant_id     TEXT NOT NULL REFERENCES covenants(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    book_type       TEXT NOT NULL CHECK(book_type IN ('summa', 'tractatus')),
    subject         TEXT NOT NULL,          -- Art or Ability
    level           INTEGER,                -- Summae only (Ref: ArM5, p. 166)
    quality         INTEGER NOT NULL,       -- Ref: ArM5, p. 165
    author          TEXT,
    language        TEXT DEFAULT 'Latin',
    condition       TEXT DEFAULT 'good' CHECK(condition IN ('good', 'damaged', 'poor')),
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- Ref: ArM5, p. 165 (Books)
```

---

### 1.10 `laboratories`

Each Magus has (or aspires to) a personal lab.

```sql
CREATE TABLE laboratories (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    character_id    TEXT NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
    size            INTEGER NOT NULL DEFAULT 0,         -- Ref: ArM5, p. 112
    general_quality INTEGER NOT NULL DEFAULT 0,         -- Overall Lab Total bonus
    safety          INTEGER NOT NULL DEFAULT 0,
    specialization  TEXT,                               -- e.g. 'Ignem', 'Longevity'
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- Ref: ArM5, p. 109 (Laboratory)
```

---

### 1.11 `spells`

Spells known by Magi (or invented/in the lab).

```sql
CREATE TABLE spells (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    character_id    TEXT REFERENCES characters(id) ON DELETE SET NULL,  -- NULL = generic/codex spell
    name            TEXT NOT NULL,
    technique       TEXT NOT NULL CHECK(technique IN ('Creo','Intellego','Muto','Perdo','Rego')),
    form            TEXT NOT NULL CHECK(form IN (
        'Animal','Aquam','Auram','Corpus','Herbam',
        'Ignem','Imaginem','Mentem','Terram','Vim'
    )),
    level           INTEGER NOT NULL,
    mastery_score   INTEGER NOT NULL DEFAULT 0,
    range_param     TEXT NOT NULL DEFAULT 'Personal',   -- Ref: ArM5, p. 111
    duration_param  TEXT NOT NULL DEFAULT 'Momentary',
    target_param    TEXT NOT NULL DEFAULT 'Individual',
    description     TEXT,
    openars_page    TEXT,   -- e.g. 'ArM5 p.131'
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- Ref: ArM5, p. 114 (Spells)
```

---

### 1.12 `locations`

Named places in Mythic Europe relevant to the Covenant.

```sql
CREATE TABLE locations (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name            TEXT NOT NULL,
    tribunal        TEXT,
    aura_type       TEXT CHECK(aura_type IN ('magic', 'faerie', 'divine', 'infernal', 'none')),
    aura_level      INTEGER DEFAULT 0,
    description     TEXT,
    is_covenant_site INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

---

### 1.13 `saga_events`

AI-generated narrative events, linked to a season.

```sql
CREATE TABLE saga_events (
    id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    season_id       TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    covenant_id     TEXT NOT NULL REFERENCES covenants(id),
    event_type      TEXT NOT NULL CHECK(event_type IN (
        'story', 'random_event', 'tribunal', 'crisis',
        'discovery', 'visitor', 'war', 'plague', 'other'
    )),
    title           TEXT NOT NULL,
    narrative       TEXT NOT NULL,              -- French narrative text (AI-generated)
    ai_model_used   TEXT,                       -- e.g. 'mistral:7b'
    involved_characters TEXT,                   -- JSON array of character IDs
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

---

## 2. SQLite Triggers

Auto-update `updated_at` timestamps:

```sql
CREATE TRIGGER covenants_updated_at
AFTER UPDATE ON covenants
BEGIN
    UPDATE covenants SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = NEW.id;
END;

-- (Similar triggers for: characters, laboratories, resources)
```

---

## 3. Key Indexes

```sql
-- Season lookups (most common query pattern)
CREATE INDEX idx_seasons_covenant_year ON seasons(covenant_id, year, quarter);

-- Character roster
CREATE INDEX idx_characters_covenant ON characters(covenant_id, character_type);

-- Library browsing
CREATE INDEX idx_library_covenant_subject ON library_books(covenant_id, subject);

-- Spell lookup by TeFo
CREATE INDEX idx_spells_tefo ON spells(technique, form, level);

-- Saga event timeline
CREATE INDEX idx_saga_events_season ON saga_events(season_id, created_at);
```

---

## 4. Vector Store Schema (ChromaDB)

Persisted at `./data/chroma_db`. Collections are isolated by domain.

### Collection: `arsfabula_lore`

Indexes OpenArs rulebook content and game lore.

| Metadata Field | Type | Values / Example |
|---|---|---|
| `entity_type` | string | `spell`, `creature`, `virtue`, `flaw`, `ability`, `rule`, `location`, `item` |
| `technique` | string | `Creo`, `Intellego`, ... (for spells) |
| `form` | string | `Animal`, `Corpus`, ... (for spells) |
| `openars_page` | string | `ArM5 p.131` |
| `language` | string | `fr`, `en` |
| `source_file` | string | `perdo.md`, `bestiary.md` |
| `indexed_at` | string | ISO 8601 |

### Collection: `arsfabula_saga`

Indexes campaign narrative history for contextual AI narration.

| Metadata Field | Type | Values / Example |
|---|---|---|
| `season_id` | string | UUID reference |
| `covenant_id` | string | UUID reference |
| `event_type` | string | `story`, `random_event`, ... |
| `year` | integer | 1220 |
| `quarter` | string | `spring`, `summer`, ... |

---

## 5. Entity Relationship Diagram

```
covenants
    │
    ├── characters (covenant_id)
    │       ├── character_arts (character_id)
    │       ├── character_abilities (character_id)
    │       ├── laboratories (character_id)
    │       └── spells (character_id)
    │
    ├── seasons (covenant_id)
    │       ├── season_activities (season_id ← character_id)
    │       └── saga_events (season_id)
    │
    ├── resources (covenant_id)
    ├── vis_sources (covenant_id)
    ├── library_books (covenant_id)
    └── locations (via covenants.location_id)
```

---

## 6. Migration File Naming Convention

```
src-tauri/migrations/
├── 20260515_000001_create_core_tables.sql
├── 20260515_000002_create_indexes.sql
├── 20260515_000003_create_triggers.sql
└── 20260515_000004_seed_default_arts.sql
```

Each migration is **append-only**: never modify an existing migration file.
Use `cargo sqlx migrate run` to apply.
