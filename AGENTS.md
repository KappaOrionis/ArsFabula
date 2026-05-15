# AGENTS.md — ArsFabula Agent Configuration

This file configures AI agents working on the ArsFabula project.
Read this file at the start of every coding session.

## Project Overview

**ArsFabula** is a local-first desktop application for *Ars Magica 5th Edition* tabletop RPG
campaign management. Players manage their Alliance (Covenant), characters (Magi and Companions),
and narrative history through an AI-assisted interface.

**Stack**: Tauri (desktop shell) + React (frontend) + Rust/Python (backend) + SQLite (data) + ChromaDB/FAISS (RAG lore)

**Knowledge Base**: The system ingests official *Ars Magica 5e* sources (Markdown rules, Excel creature indices, PDF grimoires) as listed in `resources/SOURCES.md`. 
> [!IMPORTANT]
> **Priority Rule**: All agents and system components MUST prioritize sources located in the `resources/` directory for lore, rules calculation, and data ingestion. Do not use external web searches or assumptions if the data exists in `resources/`.

## Critical Language Rules

| Context | Language |
|---|---|
| Source code, variables, functions | **English** |
| Database schema, column names | **English** |
| UI labels, messages shown to user | **French** |
| Comments explaining *why* (architecture) | English |
| Lore content (spells, locations, NPCs) | French |
| Git commit messages | English |
| ADR documents | English |

## Architecture Standards

### Database (SQLite)
- Schema lives in `src-tauri/migrations/` (SQLx migrations)
- No raw SQL strings in Rust code — use `sqlx::query!()` macros (compile-time checked)
- All IDs are UUIDs stored as TEXT
- Always add `created_at` and `updated_at` timestamps

### Backend (Rust — Tauri commands)
- All Tauri commands use `#[tauri::command]` and return `Result<T, String>`
- Internal functions use typed errors via `thiserror`
- Application-level errors use `anyhow` for context chaining
- Zero warnings policy: `#![deny(warnings, clippy::all)]` in `src-tauri/src/lib.rs`
- All async code uses Tokio; never `std::thread::sleep`
- Structured logging via `tracing` — no `println!` in production

### Backend (Python — AI/RAG layer)
- All code uses Python 3.11+ with strict type hints
- Pydantic models for all data transfer objects
- FastAPI for the local HTTP API (if used as sidecar)
- `ruff` for linting, `mypy --strict` for type checking
- No warnings policy: `ruff check --select ALL`

### Frontend (React + TypeScript)
- Strict TypeScript (`"strict": true` in tsconfig)
- Tauri IPC via `@tauri-apps/api/core`'s `invoke()`
- i18next for French translations (all user-visible strings)
- No raw strings in JSX — always use `t('key')` translation function

### RAG / AI
- **Local only**: LM Studio — no external API calls
- LM Studio exposes an OpenAI-compatible REST API on `http://localhost:1234/v1`
- Embeddings: any model loaded in LM Studio (default: `nomic-embed-text`)
- LLM: configurable via `config/ai.toml`, default `mistral-7b` loaded in LM Studio
- ChromaDB persisted to `./data/chroma_db` (relative to project root)
- All lore indexed with `entity_type`, `openars_page`, `language` metadata
- Use `langchain_openai.ChatOpenAI` with `base_url="http://localhost:1234/v1"` and `api_key="lm-studio"`

## Quality Requirements (from PRD)

- **100% test coverage** on all rule calculation functions
- **Zero warnings** from `cargo clippy`, `ruff`, `tsc`
- All rule implementations **must cite the OpenArs page** in a docstring/comment
- E2E tests must mock LM Studio (never call real AI in CI) — use fixture JSON responses

## Agent Skills Available

The following skills are pre-installed for this project (`.agent/skills/`):

| Skill | When to Use |
|---|---|
| `rag-implementation` | Building or modifying the Lore RAG engine |
| `chunking-strategy` | Indexing lore documents into ChromaDB |
| `rust-async-patterns` | Writing Tauri backend commands, SQLite integration |
| `systematic-debugging` | Investigating any bug — read this FIRST before fixing |

## ADR Location

Architecture Decision Records are in `docs/adr/`. Always create an ADR for:
- New library/framework adoption
- Database schema changes affecting existing data
- AI model or embedding model changes
- API design decisions

## Directory Structure

```
ArsFabula/
├── .agent/
│   └── skills/               # Project-specific agent skills
├── docs/
│   └── adr/                  # Architecture Decision Records
├── src/                      # React frontend
│   ├── components/
│   ├── i18n/                 # French translations
│   └── hooks/
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── commands/         # Tauri IPC commands
│   │   ├── db/               # SQLite/sqlx layer
│   │   └── errors.rs         # Typed error definitions
│   └── migrations/           # SQLx migrations
├── python/                   # Python AI/RAG sidecar (if used)
│   ├── rag/
│   └── tests/
├── data/
│   └── chroma_db/            # ChromaDB persistence (gitignored)
├── resources/                # Primary source of truth (Official Lore & Rules)
│   ├── SOURCES.md            # Registry of all local documents
│   └── Ars-Magica-Open-License/ # Core rules repository
├── PRD_Ars_Fabula.md         # Product Requirements Document
├── AGENTS.md                 # This file
```

## Common Commands

```bash
# Frontend
npm run dev          # Start Tauri dev mode (frontend + backend)
npm run test         # Run Vitest unit tests

# Backend (Rust)
cargo clippy -- -D warnings    # Must pass with zero warnings
cargo test                     # Run all Rust tests
cargo sqlx migrate run         # Apply pending SQLx migrations

# Python RAG
ruff check .                   # Lint
mypy --strict .                # Type check
pytest --cov=. tests/          # Tests with coverage

# All together (CI simulation)
npm run build && cargo build --release
```
