# ADR-0001: SQLite + ChromaDB as Dual Storage Strategy

## Status

Accepted

## Date

2026-05-15

## Context

ArsFabula has two distinct data access patterns:

1. **Structured relational data** — Covenants, Characters, Seasons, Spells. Require ACID transactions and precise SQL filtering.
2. **Unstructured lore data** — OpenArs rulebook content queried via natural language. Requires semantic similarity search.

The system must operate **100% offline**, embedded in the Tauri binary bundle.

## Decision Drivers

- Must be fully offline — no cloud DBs, no external vector service
- Must support ACID transactions for seasonal progression
- Must support semantic NL queries for the Codex lore chatbot
- Must be embedded — no user-managed DB server
- Strong Rust bindings required for the Tauri backend

## Considered Options

### Option A: SQLite + ChromaDB ✅ Selected

**SQLite**: Embedded, zero-config, ACID-compliant, excellent Rust support via `sqlx` (compile-time query checking).

**ChromaDB**: Embedded vector store with disk persistence, metadata filtering, native LangChain integration.

**Con**: Two storage systems; ChromaDB needs Python runtime if used as sidecar.

### Option B: SQLite + FTS5 only

**Rejected**: FTS5 keyword search cannot replace embedding-based semantic retrieval for natural-language lore queries.

### Option C: FAISS + SQLite

**Rejected**: FAISS has no built-in metadata filtering or persistence management. ChromaDB is strictly better DX.

### Option D: DuckDB + Qdrant

**Rejected**: Overkill. DuckDB is OLAP-optimized (poor for transactional writes). Qdrant requires a running service.

## Decision

- **SQLite** (via `sqlx`) for all relational/transactional data
- **ChromaDB** (persisted to `./data/chroma_db`) for lore embeddings

```
data/
├── arsfabula.db        # SQLite — Covenants, Characters, Seasons
└── chroma_db/          # ChromaDB (gitignored)
    ├── arsfabula_lore/  # OpenArs rulebook embeddings
    └── arsfabula_saga/  # Campaign narrative history
```

**SQLite config**: WAL mode, UUID TEXT IDs, `sqlx::query!()` macros for compile-time verification.

**ChromaDB config**: Embedded, `nomic-embed-text` via Ollama (768-dim), two collections.

## Consequences

### Positive
- SQLite `.db` file is trivially portable and backup-friendly
- `sqlx` compile-time checking eliminates runtime SQL errors
- ChromaDB persistence survives restarts without re-indexing
- Both stores work fully offline

### Negative
- Two storage systems increase cognitive overhead
- ChromaDB initial indexing requires Python sidecar or Rust ChromaDB client

### Risks

| Risk | Mitigation |
|---|---|
| Embedding model change causes semantic drift | Store `embedding_model` in collection metadata; validate on startup |
| SQLite write contention during season processing | WAL mode + `sqlx::SqlitePool` |

## Related Decisions

- ADR-0002: Local-Only AI Inference via Ollama — defines the embedding model used by ChromaDB

## References

- [SQLx](https://github.com/launchbadge/sqlx), [ChromaDB Docs](https://docs.trychroma.com/), [SQLite WAL](https://www.sqlite.org/wal.html)
- ArsFabula PRD §2 (Stack) and §4 (Data Model)
