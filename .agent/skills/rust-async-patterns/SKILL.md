# Rust Async Patterns

Production patterns for async Rust programming with Tokio runtime, including tasks, channels, streams, and error handling.

## When to Use This Skill

- Developing high-performance Tauri backend commands for ArsFabula
- Integrating SQLite via `sqlx` using async/await syntax
- Building concurrent narrative event processing
- Optimizing the local AI inference pipeline (Ollama HTTP calls)

## ArsFabula-Specific Context

The ArsFabula Tauri backend uses Rust for **security-critical** operations (data validation, rule enforcement). All async patterns must:
- Follow **zero-warning** policy (`#![deny(warnings)]`)
- Use **`thiserror`** for typed errors, **`anyhow`** for app-level errors
- Emit structured **`tracing`** logs (no `println!` in production code)
- Support graceful shutdown via `CancellationToken`

## Cargo.toml Dependencies

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
futures = "0.3"
async-trait = "0.1"
anyhow = "1.0"
thiserror = "1"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio-native-tls"] }
```

## Basic Async with Tracing

```rust
use tokio::time::{sleep, Duration};
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let result = fetch_lore_data("spells").await?;
    tracing::info!("Loaded {} lore entries", result.len());
    Ok(())
}

async fn fetch_lore_data(category: &str) -> Result<Vec<String>> {
    sleep(Duration::from_millis(10)).await; // simulate async DB read
    Ok(vec![format!("Data for {}", category)])
}
```

## Concurrent Tasks (JoinSet)

```rust
use tokio::task::JoinSet;
use anyhow::Result;

// Load multiple lore categories concurrently
async fn load_all_lore(categories: Vec<String>) -> Result<Vec<String>> {
    let mut set = JoinSet::new();
    for cat in categories {
        set.spawn(async move { fetch_lore_data(&cat).await });
    }
    let mut results = Vec::new();
    while let Some(res) = set.join_next().await {
        match res {
            Ok(Ok(data)) => results.extend(data),
            Ok(Err(e)) => tracing::error!("Lore load failed: {}", e),
            Err(e) => tracing::error!("Task panicked: {}", e),
        }
    }
    Ok(results)
}
```

## Typed Error Handling (ArsFabula pattern)

```rust
use thiserror::Error;
use anyhow::{Context, Result};

#[derive(Error, Debug)]
pub enum ArsFabulaError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Lore entity not found: {0}")]
    NotFound(String),
    #[error("Rule validation failed: {message}")]
    RuleViolation { message: String },
    #[error("AI inference timeout after {0:?}")]
    InferenceTimeout(std::time::Duration),
}

async fn get_covenant(db: &sqlx::SqlitePool, id: &str) -> Result<Covenant, ArsFabulaError> {
    let result = sqlx::query_as!(Covenant, "SELECT * FROM covenants WHERE id = ?", id)
        .fetch_optional(db)
        .await?;
    result.ok_or_else(|| ArsFabulaError::NotFound(id.to_string()))
}

// Application-level: use anyhow for context chaining
async fn process_season(db: &sqlx::SqlitePool, covenant_id: &str) -> Result<()> {
    let covenant = get_covenant(db, covenant_id)
        .await
        .context("Failed to load covenant for season processing")?;
    // ...
    Ok(())
}
```

## Async Trait for Repository Pattern

```rust
use async_trait::async_trait;

#[async_trait]
pub trait LoreRepository: Send + Sync {
    async fn get_spell(&self, id: &str) -> Result<Spell, ArsFabulaError>;
    async fn search_lore(&self, query: &str, entity_type: Option<&str>) -> Result<Vec<LoreEntry>>;
    async fn save_saga_event(&self, event: &SagaEvent) -> Result<()>;
}

pub struct SqliteLoreRepository {
    pool: sqlx::SqlitePool,
}

#[async_trait]
impl LoreRepository for SqliteLoreRepository {
    async fn get_spell(&self, id: &str) -> Result<Spell, ArsFabulaError> {
        sqlx::query_as!(Spell, "SELECT * FROM spells WHERE id = ?", id)
            .fetch_one(&self.pool)
            .await
            .map_err(Into::into)
    }

    async fn search_lore(&self, query: &str, entity_type: Option<&str>) -> Result<Vec<LoreEntry>> {
        // FTS5 search in SQLite
        sqlx::query_as!(LoreEntry,
            "SELECT * FROM lore_fts WHERE lore_fts MATCH ? AND (? IS NULL OR entity_type = ?)",
            query, entity_type, entity_type
        )
        .fetch_all(&self.pool)
        .await
        .map_err(Into::into)
    }

    async fn save_saga_event(&self, event: &SagaEvent) -> Result<()> {
        sqlx::query!(
            "INSERT INTO saga_events (id, covenant_id, season, year, description) VALUES (?, ?, ?, ?, ?)",
            event.id, event.covenant_id, event.season, event.year, event.description
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
```

## Graceful Shutdown (Tauri pattern)

```rust
use tokio_util::sync::CancellationToken;
use tokio::signal;

pub async fn run_background_services(token: CancellationToken) -> Result<()> {
    let token_clone = token.clone();

    // Saga event processor
    tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = token_clone.cancelled() => {
                    tracing::info!("Saga event processor shutting down");
                    break;
                }
                _ = process_pending_events() => {}
            }
        }
    });

    signal::ctrl_c().await?;
    tracing::info!("Shutdown signal received");
    token.cancel();
    tokio::time::sleep(Duration::from_secs(2)).await; // grace period
    Ok(())
}
```

## Timeout for AI Inference

```rust
use tokio::time::timeout;

async fn call_ollama_with_timeout(prompt: &str) -> Result<String, ArsFabulaError> {
    let duration = Duration::from_secs(30);
    timeout(duration, call_ollama(prompt))
        .await
        .map_err(|_| ArsFabulaError::InferenceTimeout(duration))?
}
```

## Key Rules

- **NEVER** use `std::thread::sleep` — always `tokio::time::sleep`
- **NEVER** use `unwrap()` in production paths — use `?` or explicit error handling
- **ALWAYS** instrument async functions with `#[tracing::instrument]`
- **ALWAYS** use `JoinSet` for collecting multiple concurrent results
- **ALWAYS** use `CancellationToken` for graceful shutdown (Tauri app lifecycle)
- Prefer `RwLock` over `Mutex` for read-heavy shared state (lore cache)

## Source

https://antigravity.codes/agent-skills/backend/rust-async-patterns
