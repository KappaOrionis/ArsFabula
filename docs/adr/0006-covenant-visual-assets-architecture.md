# ADR-0006: Covenant Visual Assets Architecture and Storage Strategy

## Status

Superseded (Superseded by ADR-0007)

## Context

The ArsFabula application manages canonical covenants across Mythic Europe. To enhance user immersion and provide a premium, rich visual experience in the desktop UI, we need to associate high-quality visual representations (architectural illustrations, heraldic banners, or atmospheric environment art) with each covenant.

We needed to decide how to generate, store, and reference these visual assets within the Tauri + React + SQLite architecture.

## Decision Drivers

- **Performance & Asset Loading**: Visuals must load instantly in the Tauri frontend without network latency.
- **Maintainability & Bundle Size**: Avoid bloating the core binary while ensuring assets are reliably packaged and distributed.
- **Visual Consistency & Premium Aesthetic**: Visuals must reflect the distinct architectural archetypes of Ars Magica lore (e.g., Black Forest citadels, Alpine mountain fortresses, primordial faerie glades, Roman palatial villas, subterranean magical forges).
- **Database Alignment**: Seamless integration with the existing `covenants` SQLite table and Rust data models.

## Considered Options

### Option 1: Store Base64 Encoded Images in SQLite
- **Pros**: Single file portability (everything in the `.db` file).
- **Cons**: Substantial database bloat, slower query performance when listing covenants, increased memory usage during serialization/deserialization in Tauri IPC.

### Option 2: External CDN / Web URLs
- **Pros**: Zero local storage footprint.
- **Cons**: Violates the local-first requirement of ArsFabula. Fails when offline or when external links expire.

### Option 3: Local File System Static Assets (Vite Public Directory)
- **Pros**: Assets are served instantly by Vite during development and bundled efficiently into the Tauri app package (`dist/assets`). Zero database bloat (stores only lightweight relative file paths). High performance and clean separation of concerns.
- **Cons**: Requires managing static files in the repository.

## Decision

We adopt **Option 3: Local File System Static Assets**. We will store high-resolution, curated archetypal covenant illustrations in `public/covenants/` and reference them via a new `visual_path` column in the `covenants` SQLite table.

We have generated 10 distinct, ultra-premium masterpiece illustrations covering every architectural and geographical archetype present in the 26 canonical covenants:
1. `cov_black_forest_citadel.png` (Durenmar, Coeris, Blackthorn, Fengheld)
2. `cov_mountain_fortress.png` (Doissetep, Val-Negra, Kastellon)
3. `cov_ancient_forest_shrine.png` (Crintera, Ashenrise, Krasnorechye)
4. `cov_faerie_glade_palace.png` (Irencilia, Horsinglas)
5. `cov_coastal_storm_fortress.png` (Fudarus, Exspectatio, Semitae)
6. `cov_roman_villa_estate.png` (Harco, Magvillus, Favras)
7. `cov_magical_forge_cavern.png` (Verdi, Cave of Twisting Shadows)
8. `cov_renaissance_manor.png` (Valnastium, La Maison du Lévrier, Schola Pythagoranis)
9. `cov_moorish_palace.png` (Jaferia, Castra Solis)
10. `cov_crusader_crypt.png` (Acre)

## Rationale

1. **Local-First & High Performance**: Serving static images from the bundled app package guarantees instant, offline-capable rendering with zero IPC or database overhead for image bytes.
2. **Archetypal Mapping**: By creating 10 breathtaking, distinct architectural masterpieces, we achieve complete visual coverage for all 26 canonical covenants without exploding the repository size with redundant files.
3. **Clean Architecture**: Storing only the URI/path (`/covenants/cov_*.png`) in SQLite keeps the database lightweight and fast.

## Consequences

### Positive
- Rich, premium visual UI with zero load-time lag.
- Clean separation between binary data (images) and structured relational data (SQLite).
- Easy to add new custom covenants by reusing existing archetypes or dropping new images into `public/covenants/`.

### Negative
- Slight increase in repository and installer bundle size (~9 MB for 10 high-resolution images).

## Implementation Notes

- Added `visual_path` column to `covenants` via migration `20260516000001_add_covenant_visuals.sql`.
- Updated Rust `Covenant` struct in `src-tauri/src/db/models.rs` and Tauri commands in `src-tauri/src/commands/covenant.rs`.
- Enhanced React `CovenantDashboard.tsx` with dynamic banner overlays and image cards.
