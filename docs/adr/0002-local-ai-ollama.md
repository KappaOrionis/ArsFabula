# ADR-0002: Local-Only AI Inference via Ollama

## Status

**Superseded by [ADR-0003](0003-local-ai-lm-studio.md)**

## Date

2026-05-15

## Context

ArsFabula requires two AI capabilities:

1. **Embeddings** — converting lore text chunks into vectors for ChromaDB semantic search
2. **LLM inference** — generating French narrative text for the AI Storyguide and Codex responses

The PRD mandates **100% offline operation** and **data sovereignty** (no campaign data or prompts leaving the user's machine). This eliminates all cloud AI providers (OpenAI, Anthropic, Google, etc.).

The target users run Windows/macOS desktop machines with varying hardware (some with GPU, some CPU-only).

## Decision Drivers

- **Must be offline** — PRD requirement, no exceptions
- **Must not exfiltrate user data** — campaign narratives and character data are private
- **Should support model swapping** — different users may have different GPU VRAM budgets
- **Should be simple to set up** — players, not developers, are the end users
- **Embeddings and LLM can use different models** — optimize each separately

## Considered Options

### Option A: Ollama ✅ Selected

- Single binary install, cross-platform (Windows/macOS/Linux)
- Manages model downloads, GPU offloading, and serving automatically
- REST API on `localhost:11434` — simple HTTP calls from Rust or Python
- Supports `nomic-embed-text` (768-dim, lightweight) and `mistral:7b`, `llama3.2:3b`, etc.
- Active community, widely used in local AI projects

**Con**: Requires user to install Ollama separately (not bundled in Tauri binary).

### Option B: LM Studio

- GUI-first tool, excellent for non-technical users
- Compatible OpenAI API format (`localhost:1234`)
- No CLI/automation support — harder to check "is model loaded?" programmatically

**Con**: No headless mode; cannot be auto-started by ArsFabula. Rejected as primary, kept as fallback.

### Option C: llama.cpp (direct integration)

- Could be bundled directly in Tauri binary via FFI
- Maximum control over inference

**Con**: Enormous engineering effort; no embedding model support out-of-box; maintenance burden for each new model format. Rejected for v1.

### Option D: candle (Rust ML framework by HuggingFace)

- Pure Rust, could run in-process in Tauri
- No external process dependency

**Con**: Limited model ecosystem; no Mistral/LLaMA support at production quality yet. Revisit for v2.

## Decision

Use **Ollama** as the primary AI inference backend.

**Default models** (configurable in `config/ai.toml`):

| Purpose | Default Model | VRAM Estimate |
|---|---|---|
| Embeddings | `nomic-embed-text` | ~500 MB |
| Narration LLM | `mistral:7b` | ~4 GB |
| Fallback LLM (low VRAM) | `llama3.2:3b` | ~2 GB |

**Configuration** (`config/ai.toml`):
```toml
[ollama]
base_url = "http://localhost:11434"
timeout_secs = 30

[models]
embedding = "nomic-embed-text"
narration = "mistral"
codex = "mistral"

[context]
max_lore_chunks = 5
narrative_temperature = 0.7
codex_temperature = 0.2   # Lower = more factual for rules queries
```

**Health check on startup**: ArsFabula pings `GET /api/tags` before first AI call. If Ollama is not running, show a French warning: *"Le service IA n'est pas disponible. Veuillez démarrer Ollama."*

**In E2E tests**: Ollama is mocked — never call real AI in CI. Use fixture responses stored in `tests/fixtures/ai_responses/`.

## Consequences

### Positive
- Zero data leaves the machine — full privacy compliance
- Users can choose any Ollama-compatible model based on their hardware
- Embedding model is stable and well-tested (`nomic-embed-text`)
- LLM can be swapped without code changes (only `config/ai.toml`)

### Negative
- User must install Ollama separately — adds friction to onboarding
- Cold start (first inference) is slow while model loads into VRAM
- Quality ceiling is lower than GPT-4/Claude for narrative generation

### Risks

| Risk | Mitigation |
|---|---|
| User doesn't have Ollama installed | Startup health check with clear French error message + link to ollama.com |
| Model not downloaded | Check `/api/tags` response; show install instructions per model |
| ChromaDB re-index needed after embedding model change | Version `embedding_model` in ChromaDB metadata; detect mismatch on startup |
| CPU-only machines too slow for 7B model | Document `llama3.2:3b` as lightweight fallback in README |

## Related Decisions

- ADR-0001: SQLite + ChromaDB — ChromaDB uses `nomic-embed-text` defined here
- Future ADR: In-process inference (candle/llama.cpp) for v2 if Ollama dependency is problematic

## References

- [Ollama](https://ollama.com/)
- [nomic-embed-text](https://huggingface.co/nomic-ai/nomic-embed-text-v1)
- [Mistral 7B](https://mistral.ai/news/announcing-mistral-7b/)
- ArsFabula PRD §1 (Data Sovereignty) and §2 (AI Inference stack)
