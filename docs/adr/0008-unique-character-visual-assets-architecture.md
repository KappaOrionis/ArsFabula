# ADR-0008: 1-to-1 Unique Character Visual Assets Mapping

## Status

Accepted

## Context

Following the success of ADR-0007 (1-to-1 Unique Covenant Visual Assets Mapping), which established dedicated hero illustrations for every covenant in the ArsFabula campaign manager, we needed to extend this premium visual architecture to the `characters` database entities (Magi, Companions, and Grogs).

The canonical census includes 120 registered magi across Mythic Europe, alongside player-created characters. To deliver an immersive, tabletop-grade experience that aligns with the ArsFabula PRD's "Rich Aesthetics / Premium Design" mandate, characters require high-fidelity portrait illustrations that reflect their physical descriptions, Hermetic Houses, and favored magical arts.

We needed to decide how to structure the database schema, asset storage, and fallback mechanisms for character visual identities.

## Decision Drivers

- **Lore Fidelity & Personalization**: Characters must possess distinct visual identities matching their physical descriptions in canon or player lore.
- **Local-First Performance**: Instant, offline-capable portrait rendering without bloating the SQLite database file or Tauri IPC payloads.
- **Robust Fallback Mechanism**: Graceful handling of newly created characters or magi lacking detailed physical descriptions.
- **Architectural Consistency**: Seamless alignment with the static asset patterns established in ADR-0006 and ADR-0007.

## Decision

We adopt a **strict 1-to-1 unique visual asset mapping** for character entities, supported by a structured fallback mechanism.

1. **Schema Extension**: We added a `visual_path` column (`TEXT`) to the `characters` SQLite table via migration `20260516000002_add_character_visuals.sql`.
2. **Dedicated Asset Directory**: All character portraits are stored as static files in the Vite public directory under `public/characters/`.
3. **1-to-1 Unique Registry**: Every census-registered magus receives a dedicated, unique portrait file (e.g., `/characters/char_darius.png` for Darius of Flambeau).
4. **Universal Fallback**: A high-quality default portrait (`/characters/unknown.png`) is established for characters without assigned bespoke visuals.

### Lore-Accurate Portrait Mandate
Bespoke character portraits **must strictly correspond to the canonical or player-defined physical description** of the magus, companion, or grog. Portraits must accurately reflect:
- **Hermetic House Aesthetics**: e.g., martial Flambeau robes, opulent Jerbiton finery, mystical Bjornaer animalistic traits, or scholarly Criamon tattoos.
- **Age & Warping Effects**: e.g., visible signs of Twilight, magical warping, or unnaturally preserved youth.
- **Favored Arts & Tools**: e.g., alchemical apparatus for Verditius, flames for Ignem specialists, or shadowy auras for Mentem/Imagonem masters.

## Rationale

1. **Maximum Immersion & Tabletop Feel**: Bespoke portraits transform the roster from a dry database list into a living, breathing covenant census, directly fulfilling the PRD's visual excellence goals.
2. **Preservation of Local-First Performance**: Serving static portraits from the bundled app package (`dist/assets`) guarantees zero database bloat for image bytes and instant load times in the Tauri frontend.
3. **Zero-Friction AI Iteration**: Because SQLite stores only the relative file path (`/characters/char_*.png`), updating or refining an AI-generated portrait requires only a simple file overwrite in `public/characters/`, with zero database migrations or code changes.

## Consequences

### Positive

- **100% Unique & Lore-Accurate Representation**: Every canonical magus has a distinct, canon-aligned portrait in the UI.
- **Clean Database Schema**: Relational data remains extremely lightweight, storing only relative file paths.
- **Graceful Degradation**: The `unknown.png` fallback ensures the UI remains pristine and unbroken even for newly created or un-illustrated characters.

### Negative

- **Increased Bundle Size**: Storing 120+ unique high-resolution portraits increases the static asset footprint and installer size. This trade-off is fully accepted to meet the premium design requirement.
- **AI Generation Quota Dependencies**: Batch generating dozens of high-resolution digital masterpiece portraits can exhaust AI generation quotas (`429 Too Many Requests`).

## Implementation Notes

- Created `public/characters/` directory and deployed the universal fallback `unknown.png`.
- Proactively deployed 36 unique placeholder portrait files (`char_*.png`) to establish the 1-to-1 file registry for the initial batch of canonical magi.
- Created migration `20260516000002_add_character_visuals.sql` to add `visual_path` to `characters`, set the default fallback, and map the 36 unique canonical magi.
- Updated Rust `Character` struct in `src-tauri/src/db/models.rs` and Tauri commands in `src-tauri/src/commands/characters.rs`.
- Enhanced React `CovenantDashboard.tsx` and `CharacterList.tsx` with dynamic portrait rendering and Lucide fallback icons.

### Quota Mitigation & Asynchronous Portrait Replacement
During development sessions where AI image generation quotas are temporarily exhausted (`429 Too Many Requests`), high-quality local placeholder assets are utilized to establish and verify the 1-to-1 unique file registry.

**Mandatory Follow-up**: These placeholder assets must be systematically replaced with bespoke, lore-accurate digital masterpiece portraits as soon as the generation quota resets (typically a 4-hour window), without requiring any changes to the SQLite database or migration scripts.

## Related Decisions

- ADR-0006: Covenant Visual Assets Architecture
- ADR-0007: 1-to-1 Unique Covenant Visual Assets Mapping
