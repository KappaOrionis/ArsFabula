# ADR-0001: SQLite and ChromaDB Storage Strategy

## Status

Accepted

## Context

ArsFabula requires a local-first storage solution to manage:
1.  **Structured Data**: Covenant stats, character sheets, seasonal logs, and inventory (relational).
2.  **Unstructured Lore**: Rulebook text, spell descriptions, and historical context for the AI narrator (vector).
3.  **Local-First Requirement**: The application must work entirely offline without external cloud databases.

## Decision Drivers

- **Performance**: Fast retrieval of character stats and lore chunks.
- **Portability**: Easy to back up and move campaign data.
- **Developer Experience**: Robust tooling for schema migrations and vector search.
- **Language**: English for schema/internal data, French for narrative content.

## Considered Options

### Option 1: Pure JSON Files
- **Pros**: Zero overhead, human-readable.
- **Cons**: Poor query performance for large datasets, lack of relational integrity, no vector search support.

### Option 2: SQLite Only
- **Pros**: ACID compliant, relational integrity, single file, extremely mature.
- **Cons**: No native vector search for RAG (requires extensions like `sqlite-vss` which can be tricky to distribute).

### Option 3: SQLite + ChromaDB (Dual Storage)
- **Pros**: Best of both worlds. SQLite for relational logic; ChromaDB for semantic lore retrieval.
- **Cons**: Two storage engines to manage and keep in sync.

## Decision

We will use **SQLite** as the primary relational database and **ChromaDB** as the vector store.

## Rationale

- **SQLite** is the industry standard for local desktop storage. Its integration with Rust via `sqlx` provides compile-time query checking.
- **ChromaDB** provides a high-level API for vector search that is easy to integrate with Python/Rust sidecars and supports persistence to a local directory (`./data/chroma_db`).
- This separation allows the AI narrator to perform semantic searches in the "Lore" while the application logic handles "Facts" in the relational DB.

## Consequences

### Positive
- Robust campaign management with transactional safety.
- Powerful RAG capabilities for the AI Storyguide.
- 100% offline and private data.

### Negative
- Increased complexity in the ingestion pipeline (must populate two databases).
- Higher disk space usage compared to pure text.

### Risks
- Syncing character data changes into the vector store (if characters become part of the lore).
- Mitigation: Character data stays in SQLite; only static lore and finished seasonal logs are indexed in ChromaDB.

## Implementation Notes

- SQLite migrations managed via `sqlx-cli`.
- ChromaDB persistence pointed to `./data/chroma_db`.
- Internal logic always uses UUIDs for cross-database references.

## Related Decisions

- ADR-0004: Heterogeneous Data Ingestion
- ADR-0003: Local AI Inference using LM Studio
