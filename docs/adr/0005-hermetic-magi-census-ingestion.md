# ADR-0005: Hermetic Magi Census Ingestion and Character Metadata Expansion

## Status

Accepted

## Context

The ArsFabula application requires a rich, canonical foundation of tabletop RPG lore for *Ars Magica 5th Edition*. Specifically, the official census of 120 Hermetic Magi (`recensement_magi_ars_magica.md`) provides extensive biographical, mechanical, and historical details for magi across Mythic Europe.

To fully integrate this data into the local-first campaign management tool, the existing database schema and application models needed to be expanded to support lore-specific metadata without breaking existing user-created characters.

## Decision Drivers

- **Must preserve canonical lore accuracy** by capturing all provided census attributes (House, birth/death years, favored arts, familiar links, apprentice registry, biographical notices, and source book citations).
- **Must support nullable/optional fields** to accommodate incomplete historical records or user-created characters that do not possess full canonical backgrounds.
- **Must ensure idempotent ingestion** so migrations can run repeatedly without duplicating records or overwriting user modifications.
- **Must maintain seamless frontend integration** by exposing rich metadata through Tauri IPC commands for display in the covenant and character dashboards.

## Considered Options

### Option 1: Relational Entity-Attribute-Value (EAV) Tables

- **Pros**: Highly flexible; allows adding arbitrary new metadata attributes without altering the core `characters` table schema.
- **Cons**: Significantly increases SQL query complexity and join overhead; harder to enforce compile-time type safety with `sqlx`.

### Option 2: Dedicated `character_metadata` Table

- **Pros**: Keeps the primary `characters` table lean; cleanly separates core mechanical stats from narrative lore.
- **Cons**: Requires 1:1 joins on every character query, adding unnecessary boilerplate to backend Tauri commands.

### Option 3: Direct Schema Expansion of `characters` Table (Chosen)

- **Pros**: Keeps SQL queries simple and performant; leverages SQLite's efficient storage of `NULL` values; maps cleanly to a single Rust struct with `Option<T>` fields; fully supported by compile-time `sqlx` checking.
- **Cons**: Slightly widens the `characters` table, but SQLite handles wide tables with sparse columns exceptionally well.

## Decision

We will expand the core `characters` table in SQLite with optional metadata columns and perform an automated, idempotent ingestion of the 120 canonical Hermetic Magi.

## Rationale

1. **Simplicity & Performance**: Storing character metadata directly in the `characters` table avoids complex joins and keeps Tauri IPC payloads straightforward.
2. **Type Safety**: Using `Option<T>` in the Rust `Character` model ensures seamless serialization/deserialization while perfectly mirroring the SQLite schema.
3. **Idempotency**: Using `INSERT OR REPLACE` for characters and `INSERT OR IGNORE` for covenants guarantees that the canonical census can be re-seeded reliably without creating duplicate entries or corrupting state.

## Consequences

### Positive

- Rich canonical lore is immediately accessible within the application UI.
- Users can view detailed biographical notices, source citations, favored arts, and familiar links directly in the Covenant Dashboard.
- Compile-time SQL verification via `sqlx` remains fully intact.
- Zero impact on existing user-created characters due to default `NULL` handling.

### Negative

- Minor increase in SQLite database file size due to seeded biographical text.
- Frontend components require updated TypeScript interfaces to handle optional lore fields.

## Implementation Notes

- Migration `20260515000010_expand_characters_metadata.sql` adds `death_year`, `favored_arts`, `familiar_link`, `apprentice_registry`, `biographical_notice`, `source_book`, and `page_reference`.
- Migration `20260515000011_seed_magi_census.sql` seeds missing canonical covenants (`Castra Solis`, `Magvillus`, `Semitae`) and ingests all 120 magi.
- Rust backend models and commands updated in `src-tauri/src/db/models.rs` and `src-tauri/src/commands/characters.rs`.
- Frontend dashboards (`CovenantDashboard.tsx` and `CharacterList.tsx`) enhanced to elegantly render the new metadata attributes.

## References

- Official Census Source: `resources/recensement_magi_ars_magica.md`
- Product Requirements Document: `PRD_Ars_Fabula.md`
- SQLite Database Architecture: `docs/adr/0001-sqlite-chromadb-storage.md`
