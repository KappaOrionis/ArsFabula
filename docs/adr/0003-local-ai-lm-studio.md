# ADR-0003: Local AI Inference using LM Studio

## Status

Accepted (Supersedes ADR-0002)

## Context

ArsFabula needs a local inference engine for LLMs (Llama 3, Mistral) to power the "Codex" and the "Storyguide".
While Ollama was initially considered (ADR-0002), the project aims for high accessibility and ease of setup for end-users, many of whom are not comfortable with CLI-only tools.

## Decision Drivers

- **Ease of Use**: GUI for model management and hardware configuration.
- **API Compatibility**: OpenAI-compatible REST API (standard in the ecosystem).
- **Performance**: High performance on Windows (GPU acceleration support).
- **Hardware Agnostic**: Good support for both NVIDIA and AMD/Metal (though primarily targeting Windows/NVIDIA for the developer).

## Considered Options

### Option 1: Ollama
- **Pros**: Lightweight, terminal-centric, easy to automate in scripts.
- **Cons**: Windows version is still in preview/newer, less intuitive GUI for casual users to change models.

### Option 2: LM Studio
- **Pros**: Polished GUI, simple "Start Server" button, local model discovery, extremely stable on Windows.
- **Cons**: Not easily "launchable" from within a binary (user must launch it manually).

### Option 3: Rust-native (llama.cpp bindings)
- **Pros**: Fully integrated into the app binary.
- **Cons**: Massive build times, high maintenance, difficult to handle multiple GPU backends (CUDA, Vulkan, ROCm) in a single binary without complex CI.

## Decision

We will use **LM Studio** as the primary local AI inference engine.

## Rationale

LM Studio provides a "zero-config" experience for the user. By exposing an OpenAI-compatible API on `localhost:1234`, it allows ArsFabula to remain decoupled from the specific inference engine while providing a robust, high-performance backend.

For the developer, it simplifies debugging: the LM Studio logs are separate and show exactly what tokens are being generated.

## Consequences

### Positive
- Standardized API usage via LangChain or OpenAI clients.
- Users can easily swap between Mistral, Llama 3, or other GGUF models.
- Reduced maintenance burden on the ArsFabula binary.

### Negative
- **Manual Step**: The user must launch LM Studio and click "Start Server" before running ArsFabula.
- Health Check required: The app must check if `http://localhost:1234/v1/models` is reachable on startup.

### Risks
- LM Studio changing its API or port.
- Mitigation: Port and Base URL are configurable in `config/ai.toml`.

## Implementation Notes

- Default Base URL: `http://localhost:1234/v1`
- Default API Key: `lm-studio` (ignored but required by some libraries)
- The app will display a "Connexion au Cerveau" (Connection to Brain) status in the UI, showing if the server is active.
- Model selection should be reflected in the `ai.toml`.

## Related Decisions

- ADR-0001: SQLite and ChromaDB Storage Strategy
- ADR-0004: Heterogeneous Data Ingestion
