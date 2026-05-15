# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before proposing any fix.

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

## When to Use This Skill

- Analyzing API failures (e.g., `POST /api/campaigns/[id]/messages` returning 404)
- Investigating intermittent narrative generation failures with Ollama
- Debugging SQLite persistence issues (saga events not saving)
- Troubleshooting Tauri IPC communication between React frontend and Rust backend
- Diagnosing RAG retrieval quality regressions

## Phase 1: OBSERVE — Gather Evidence

Before touching any code, instrument and observe:

```
For EACH component boundary:
- Log what data ENTERS the component
- Log what data EXITS the component
- Verify environment/config propagation
- Check state at each layer

Run ONCE to gather evidence showing WHERE it breaks
THEN analyze evidence to identify the failing component
THEN investigate that specific component
```

### ArsFabula Tracing Pattern (Rust)

```rust
use tracing::instrument;

// Add instrument to every async function under investigation
#[instrument(fields(campaign_id = %id, season = ?season))]
async fn process_campaign_message(id: &str, season: Season) -> Result<()> {
    tracing::debug!("Entering campaign message processing");
    // ... at each critical step:
    tracing::debug!(state = ?current_state, "State after step X");
    Ok(())
}
```

### ArsFabula Debug Logging Pattern (Python)

```python
import logging
import structlog

log = structlog.get_logger()

async def retrieve_lore(query: str, entity_type: str | None) -> list[dict]:
    log.debug("retrieve_lore.enter", query=query, entity_type=entity_type)
    results = await vectorstore.asimilarity_search(query, filter={"entity_type": entity_type})
    log.debug("retrieve_lore.results", count=len(results), query=query)
    return results
```

### ArsFabula Layer-by-Layer Check

```
# For API 404 issues (like the campaignId bug):
Layer 1: React frontend — log campaignId in state before fetch
Layer 2: Next.js API route — log req.params, check route matching
Layer 3: Backend proxy — log received campaignId, DB lookup query
Layer 4: SQLite — run raw query manually to verify record exists
```

## Phase 2: ISOLATE — Narrow the Scope

1. **Binary search the call stack**: Comment out half the pipeline, test, narrow down
2. **Minimal reproduction**: Create smallest failing test case
3. **Eliminate variables**: Test one change at a time
4. **Check boundaries**: Data transformations at each layer boundary

### ArsFabula Common Boundary Failures

| Boundary | What to Check |
|---|---|
| React → Tauri IPC | `invoke()` payload serialization, Rust command signature |
| Tauri → SQLite | Connection pool exhausted? Migration run? Table exists? |
| SQLite → RAG | ChromaDB sync? Embedding model available? |
| RAG → Ollama | Ollama running? Model loaded? Port 11434 accessible? |
| API → DB | `campaignId` UUID format mismatch? Session cookie missing? |

## Phase 3: HYPOTHESIZE — One Root Cause

After gathering evidence:
1. State exactly ONE hypothesis: "The bug is caused by X because Y"
2. Design a test that would DISPROVE this hypothesis
3. Run the test
4. If disproved, form a new hypothesis

**Never implement a fix until the hypothesis survives all tests.**

## Phase 4: FIX — Targeted and Minimal

- Fix ONLY the root cause, nothing else
- Write a regression test that would have caught this bug
- Document what you found in a comment or ADR if architectural

### Fix Verification Checklist

```
□ Does the fix address the ROOT CAUSE (not the symptom)?
□ Does a new test prove the fix works?
□ Does the existing test suite still pass?
□ Is the fix minimal (no collateral changes)?
□ Is there a TODO/ADR if a deeper architectural fix is needed?
```

## ArsFabula-Specific Known Failure Patterns

### 1. SQLite "not found" despite record existing
- **Root cause**: UUID stored as TEXT in SQLite, compared as BLOB or wrong format
- **Check**: `SELECT typeof(id) FROM campaigns LIMIT 1;`

### 2. Ollama timeout during narration
- **Root cause**: Model not loaded, context too long, or GPU VRAM exceeded
- **Check**: `curl http://localhost:11434/api/tags` — verify model is available

### 3. ChromaDB retrieval returns 0 results
- **Root cause**: Collection not persisted, wrong embedding model, wrong collection name
- **Check**: `chroma_client.list_collections()` — verify collection exists with data

### 4. Tauri IPC command not found
- **Root cause**: Command not registered in `tauri::Builder::invoke_handler`
- **Check**: Verify `#[tauri::command]` annotation and builder registration

### 5. React state stale in API calls
- **Root cause**: Closure captures old state before re-render
- **Check**: Use `useRef` for values needed in async callbacks, or use functional setState

## Documentation During Investigation

Keep a brief investigation log:

```markdown
## Debug Session: [Issue Title] — [Date]
**Symptom**: ...
**Layer 1 evidence**: ...
**Layer 2 evidence**: ...
**Hypothesis**: ...
**Test**: ...
**Root cause**: ...
**Fix applied**: ...
**Regression test**: ...
```

## Key Rules

- **STOP** if you are about to make a "might fix it" change — investigate more first
- **DOCUMENT** what you learn even if the fix is simple
- **VERIFY** by making the bug happen on purpose, then confirming the fix prevents it
- **PREFER** explicit assertions over silent failures

## Source

https://antigravity.codes/agent-skills/debugging/systematic-debugging
