# ADR-0004: Heterogeneous Data Ingestion Strategy

## Status

Accepted

## Context

ArsFabula needs to ingest a wide variety of official Ars Magica 5th Edition sources (listed in `SOURCES.md`) to populate the SQLite database (rules/stats) and ChromaDB (narrative lore).
Sources include:
- Markdown files (GitHub)
- Excel spreadsheets (Creature Index)
- PDFs (Grimoires, Virtues/Flaws indices)
- ZIP archives (Complex rules)

## Decision Drivers

- **Accuracy**: Data must be extracted correctly to ensure the rule engine works.
- **Maintainability**: The pipeline must be repeatable when new sources are added.
- **Complexity**: PDF table extraction is notoriously difficult.
- **Performance**: Ingestion should be a one-time setup step, but efficient enough for development.

## Considered Options

### Option 1: Manual Data Entry
- **Pros**: 100% accurate.
- **Cons**: Extremely slow, prone to human error over thousands of entries, not scalable.

### Option 2: Automated Scripts (Python)
- **Pros**: Excellent libraries for PDF (`pdfplumber`, `marker`), Excel (`pandas`), and Markdown (`markdown-it`). Rapid prototyping.
- **Cons**: Adds Python as a build-time dependency.

### Option 3: Rust-native Ingestion
- **Pros**: Faster execution, stays within the main language.
- **Cons**: Immature PDF parsing libraries compared to the Python ecosystem.

## Decision

We will use a **Python-based Ingestion Pipeline** to process the heterogeneous source files.

## Rationale

The Python ecosystem for data science and document parsing is vastly superior for this specific task. Using libraries like `pdfplumber` for tabular data in PDFs and `marker` for high-quality Markdown conversion allows us to handle the complex formatting of Ars Magica sourcebooks.

The data will be exported from Python directly into SQLite and ChromaDB.

## Consequences

### Positive
- High-quality data extraction from complex PDFs.
- Flexible processing of Markdown lore with LangChain chunking.
- Separation of concerns: the ingestion logic doesn't bloat the Rust binary.

### Negative
- Developers must have Python 3.11+ installed.
- Potential mismatch in dependencies between environments.

### Risks
- PDF layout changes (unlikely as these are legacy docs).
- Inconsistent naming across sources.
- Mitigation: Inclusion of a "Normalization" step in the Python scripts to map source terms to the canonical English database schema.

## Implementation Notes

- Scripts live in `python/ingestion/`.
- Use Pydantic models to validate data before insertion.
- Generate a `checksum` for each source file to avoid re-ingesting unchanged data.

## Related Decisions

- ADR-0001: SQLite and ChromaDB Storage Strategy
- ADR-0003: Local AI Inference using LM Studio
