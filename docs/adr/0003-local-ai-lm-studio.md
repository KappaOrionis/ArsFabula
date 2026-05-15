# ADR-0003: Local-Only AI Inference via LM Studio

## Status

Accepted (Supersedes ADR-0002)

## Date

2026-05-15

## Context

ADR-0002 selected Ollama as the AI inference backend. Following user preference, LM Studio is preferred over Ollama for this project.

Both tools serve local LLMs offline with no cloud dependency. The key difference is the user experience and API surface:

- **Ollama**: CLI-first, headless, managed via terminal commands (`ollama run mistral`)
- **LM Studio**: GUI-first, models browsed/downloaded via a polished interface, serves an OpenAI-compatible REST API on `localhost:1234`

ArsFabula's target users are tabletop RPG players — not necessarily developers. LM Studio's graphical interface for loading models is more approachable for this audience.

## Decision Drivers (unchanged from ADR-0002)

- Must be fully offline — no cloud API calls
- Must not exfiltrate campaign data or prompts
- Should support model swapping without code changes
- Should be approachable for non-technical users

## Why LM Studio over Ollama

| Criterion | Ollama | LM Studio |
|---|---|---|
| User interface | CLI only | GUI (model browser, chat) |
| API format | Proprietary REST (`/api/generate`) | **OpenAI-compatible** (`/v1/chat/completions`) |
| Model discovery | `ollama pull <name>` | Browse GGUF library in-app |
| Auto-startup | System service option | Manual launch required |
| Headless mode | ✅ | ❌ |
| GPU management | Automatic | Automatic |
| Embedding support | ✅ (`/api/embed`) | ✅ (`/v1/embeddings`) |

**Critical advantage**: LM Studio's OpenAI-compatible API means we can use `langchain_openai.ChatOpenAI` and `langchain_openai.OpenAIEmbeddings` with a simple `base_url` override — no custom LangChain integration required.

## Decision

Use **LM Studio** as the primary AI inference backend.

**API integration** (Python RAG sidecar):

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

# LM Studio: OpenAI-compatible, no real API key needed
LM_STUDIO_BASE_URL = "http://localhost:1234/v1"
LM_STUDIO_API_KEY = "lm-studio"  # Any non-empty string works

llm = ChatOpenAI(
    base_url=LM_STUDIO_BASE_URL,
    api_key=LM_STUDIO_API_KEY,
    model="mistral-7b-instruct",   # Must match model loaded in LM Studio
    temperature=0.7,
)

embeddings = OpenAIEmbeddings(
    base_url=LM_STUDIO_BASE_URL,
    api_key=LM_STUDIO_API_KEY,
    model="nomic-embed-text",      # Must match embedding model loaded in LM Studio
)
```

**Configuration** (`config/ai.toml`):

```toml
[lm_studio]
base_url = "http://localhost:1234/v1"
api_key = "lm-studio"             # Placeholder — LM Studio ignores this value
timeout_secs = 30

[models]
embedding = "nomic-embed-text"    # Load this in LM Studio before launching ArsFabula
narration = "mistral-7b-instruct" # Primary narrative LLM
codex = "mistral-7b-instruct"     # Codex Q&A (lower temperature)

[inference]
narrative_temperature = 0.7
codex_temperature = 0.2           # Factual mode for rules queries
max_lore_chunks = 5
```

**Startup health check** (Rust, via Tauri command):

```rust
// GET http://localhost:1234/v1/models
// If 404 or connection refused → show French warning in UI
async fn check_lm_studio_health(base_url: &str) -> Result<bool, ArsFabulaError> {
    let client = reqwest::Client::new();
    let resp = client
        .get(format!("{}/models", base_url))
        .timeout(Duration::from_secs(3))
        .send()
        .await;
    Ok(resp.map(|r| r.status().is_success()).unwrap_or(false))
}
// If false → UI shows: "Le service IA n'est pas disponible. Veuillez démarrer LM Studio."
```

**E2E test mocking** — never call real LM Studio in CI:

```python
# tests/fixtures/ai_responses/narration_response.json
{
  "choices": [{ "message": { "content": "Le Covenant de... [mocked narrative]" } }]
}

# In tests: mock httpx/requests to return fixture JSON
```

## Consequences

### Positive
- OpenAI-compatible API → zero custom integration code; `langchain_openai` works out-of-the-box
- GUI model browser is more accessible for non-developer users
- Single `base_url` change is the only config needed to switch models
- Standard `/v1/` API format is future-proof (easy to swap to any OpenAI-compatible backend)

### Negative
- LM Studio has no headless/autostart mode — users must launch it manually before using ArsFabula
- No CLI for model management (can't script model downloads)
- Startup health check is required to give clear feedback when LM Studio is not running

### Risks

| Risk | Mitigation |
|---|---|
| User forgets to start LM Studio | Startup health check → French error message with instructions |
| Wrong model loaded in LM Studio | Validate model name from `/v1/models` response on startup |
| Embedding model mismatch invalidates ChromaDB index | Store `embedding_model` in ChromaDB metadata; detect mismatch on startup, offer re-index |
| LM Studio port 1234 conflict | Make `base_url` configurable in `config/ai.toml` |

## Lessons Learned from ADR-0002

The selection of Ollama in ADR-0002 prioritized headless/CLI operation, which is more suited for developer workflows. For ArsFabula's target audience (tabletop RPG players), LM Studio's GUI approach reduces friction at the cost of autostart capability — an acceptable trade-off.

## Related Decisions

- ADR-0001: SQLite + ChromaDB — ChromaDB uses the embedding model defined here (`nomic-embed-text`)
- ADR-0002 (Superseded): Original Ollama selection

## References

- [LM Studio](https://lmstudio.ai/)
- [LM Studio OpenAI-compatible API docs](https://lmstudio.ai/docs/api/openai-api)
- [langchain-openai](https://python.langchain.com/docs/integrations/chat/openai/)
- [nomic-embed-text](https://huggingface.co/nomic-ai/nomic-embed-text-v1)
- ArsFabula PRD §1 (Data Sovereignty) and §2 (AI Inference stack)
