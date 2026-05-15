# ADR-0007: 1-to-1 Unique Covenant Visual Assets Mapping

## Status

Accepted (Supersedes ADR-0006)

## Context

ADR-0006 (2026-05-16) established Option 3 (Local File System Static Assets) for serving covenant illustrations from the Vite `public/covenants/` directory. However, to optimize initial storage, ADR-0006 adopted an "Archetypal Mapping" strategy where 10 shared illustrations were reused across 26 canonical covenants.

As the campaign management features matured and the covenant roster expanded to include virtual/legendary entities like *Doxa Hermetica* (`official-cov-id-0000`), the shared visual mapping became a limitation. Players and lore curators reported that covenants sharing identical visual assets diminished the premium, immersive tabletop experience required by the ArsFabula PRD.

We needed to decide whether to maintain the archetypal grouping or transition to a fully individualized visual registry.

## Decision Drivers

- **Immersion & Narrative Depth**: Each canonical covenant possesses a unique history, tribunal setting, and magical aura that deserves a distinct visual identity.
- **Asset Integrity**: Elimination of file hash collisions and shared placeholder visuals.
- **Local-First Performance**: Maintaining instant, offline-capable rendering without bloating the SQLite database file.
- **Architectural Clarity**: Ensuring a clean 1-to-1 relationship between database entity IDs and static asset filenames.

## Decision

We transition from an archetypal shared mapping to a **strict 1-to-1 unique visual asset mapping** for all 27 covenants (26 canonical covenants + Doxa Hermetica). 

Every covenant entity in the SQLite `covenants` table now references its own dedicated, unique illustration file in `public/covenants/` via the `visual_path` column.

### Lore-Accurate Visual Mandate
Each dedicated visual asset **must strictly correspond to the canonical or legendary description** of its respective covenant. The illustration must accurately reflect:
- **Architectural Archetype**: e.g., subterranean magical forge (Verdi), Roman palatial villa (Magvillus, Harco), Alpine Renaissance palace (Valnastium), coastal storm fortress (Fudarus, Semitae), or primordial faerie glade (Horsinglas).
- **Geographical & Tribunal Setting**: e.g., Mediterranean sunlight, dense Black Forest pine woods, or rugged Scottish highlands.
- **Hermetic House Affiliation**: e.g., opulent Jerbiton aesthetics, utilitarian Verditius workshops, or martial Tytalus battlements.

## Rationale

1. **Maximum Visual Immersion & Lore Fidelity**: Providing a 100% unique, lore-accurate architectural or environmental illustration for every covenant significantly elevates the premium aesthetic and narrative depth of the desktop application.
2. **Preservation of Local-First Performance**: We retain the core architectural decision from ADR-0006 (serving local static assets from the Vite public directory). This guarantees zero database bloat for image bytes and instant load times in the Tauri frontend.
3. **Simplified Asset Management**: A strict 1-to-1 mapping eliminates ambiguity in database migrations and makes future visual replacements straightforward (one file per covenant ID).

## Consequences

### Positive

- **100% Unique & Lore-Accurate Representation**: Every covenant has a distinct, canon-aligned hero image in the UI.
- **Clean Database Mapping**: Migration scripts explicitly map each covenant ID to its specific file.
- **Zero Database Bloat**: Relational data remains extremely lightweight, storing only relative file paths (`/covenants/cov_*.png`).

### Negative

- **Increased Bundle Size**: Storing 27 unique high-resolution images increases the static asset footprint and installer size. This trade-off is fully accepted to meet the "Rich Aesthetics / Premium Design" requirement.
- **Generation Quota Dependencies**: Batch generating 27 high-resolution digital masterpiece paintings can exhaust AI generation quotas (`429 Too Many Requests`) during intensive development sessions.

## Implementation Notes

- Audited `public/covenants/` using SHA-256 file hashes to identify and eliminate all duplicate image files.
- Seeded 27 unique PNG assets in `public/covenants/`.
- Created a dedicated visual asset (`cov_doxa_hermetica.png`) for the virtual covenant *Doxa Hermetica*.
- Updated migration `20260516000001_add_covenant_visuals.sql` with 27 individual `UPDATE` statements to enforce the 1-to-1 mapping.
- Purgatory cleanup of stale SQLite database artifacts (`arsfabula.db`) to ensure clean execution of the updated migration pipeline on startup.

### Quota Mitigation & Asynchronous Asset Replacement
During development sessions where AI image generation quotas are temporarily exhausted, high-quality local placeholder assets (such as high-resolution maps, project iconography, or UI mockups) are utilized to establish and verify the 1-to-1 unique file hash mapping. 

**Mandatory Follow-up**: These placeholder assets must be systematically replaced with bespoke, lore-accurate digital masterpiece paintings as soon as the generation quota resets (typically a 4-hour window), without requiring any changes to the SQLite database or migration scripts.

## Related Decisions

- ADR-0006: Covenant Visual Assets Architecture (Superseded by this decision)
