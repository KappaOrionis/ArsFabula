# Chunking Strategy for RAG Systems

## Overview

Implement optimal chunking strategies for Retrieval-Augmented Generation (RAG) systems and document processing pipelines.

## When to Use This Skill

- Building the ArsFabula Lore RAG Engine (indexing OpenArs lore pages)
- Optimizing ChromaDB/FAISS vector search performance
- Processing Markdown lore documents (spells, bestiary, locations)
- Improving relevance of narrative AI responses

## ArsFabula-Specific Context

The lore corpus consists primarily of **Markdown documents** with hierarchical headers (## Technique, ### Form, #### Spell Name). The optimal strategy is **header-based chunking** combined with small semantic overlap.

### Lore Document Structure Example

```
# Perdo (Technique)
## Overview
Perdo destroys things...
## Perdo Corpus (Combination)
### Spells
#### Grip of the Choking Hand (PeCo 25)
...description...
**Requisites**: None
**Range**: Voice, **Duration**: Mom, **Target**: Part
```

## Strategy 1: Markdown Header Chunking (Primary — for Lore)

```python
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

# Split on headers to preserve semantic boundaries
headers_to_split_on = [
    ("#", "technique"),
    ("##", "form_combination"),
    ("###", "category"),
    ("####", "entry_name"),
]

md_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on,
    strip_headers=False  # Keep headers for context
)

# Then sub-split large sections
char_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=64,
    separators=["\n\n", "\n", ". ", " ", ""]
)

def chunk_lore_document(markdown_text: str, source_file: str) -> list[Document]:
    """Chunk an Ars Magica lore document preserving hierarchy."""
    # First pass: split by headers
    header_chunks = md_splitter.split_text(markdown_text)
    
    # Second pass: sub-split long sections
    final_chunks = []
    for chunk in header_chunks:
        if len(chunk.page_content) > 512:
            sub_chunks = char_splitter.split_documents([chunk])
            final_chunks.extend(sub_chunks)
        else:
            final_chunks.append(chunk)
    
    # Enrich metadata
    for chunk in final_chunks:
        chunk.metadata["source_file"] = source_file
        chunk.metadata["entity_type"] = infer_entity_type(chunk)
    
    return final_chunks
```

## Strategy 2: Fixed-Size Chunking (For Rule Tables)

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Small chunks for factoid queries (spell stats, creature abilities)
factoid_splitter = RecursiveCharacterTextSplitter(
    chunk_size=256,
    chunk_overlap=25,
    length_function=len
)

# Medium chunks for narrative/contextual queries
narrative_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1024,
    chunk_overlap=128,
    length_function=len
)
```

## Strategy 3: Semantic Chunking (For Long Narrative Texts)

```python
def semantic_chunk(text: str, similarity_threshold: float = 0.8) -> list[str]:
    """Chunk text based on semantic topic boundaries."""
    sentences = split_into_sentences(text)
    embeddings = generate_embeddings(sentences)  # local Ollama embeddings
    
    chunks = []
    current_chunk = [sentences[0]]
    
    for i in range(1, len(sentences)):
        similarity = cosine_similarity(embeddings[i-1], embeddings[i])
        if similarity < similarity_threshold:
            # Topic boundary detected
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentences[i]]
        else:
            current_chunk.append(sentences[i])
    
    chunks.append(" ".join(current_chunk))
    return chunks
```

## Strategy 4: Parent-Child Retrieval (For Context-Rich Answers)

```python
from langchain.retrievers import ParentDocumentRetriever
from langchain.storage import InMemoryStore
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Small child chunks for precise retrieval
child_splitter = RecursiveCharacterTextSplitter(chunk_size=256, chunk_overlap=30)
# Large parent chunks for full context in generation
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=150)

docstore = InMemoryStore()  # Or persist to SQLite

lore_retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=docstore,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)

await lore_retriever.aadd_documents(lore_documents)
# Returns parent (full section) but retrieves via child (precise chunk)
results = await lore_retriever.ainvoke("Grip of the Choking Hand spell")
```

## Metadata Enrichment During Chunking

```python
from datetime import datetime

def enrich_chunk_metadata(chunk: Document, source_file: str) -> Document:
    """Add ArsFabula-specific metadata to each chunk."""
    chunk.metadata.update({
        "source_file": source_file,
        "entity_type": infer_entity_type(chunk),  # spell/creature/location/virtue/flaw/rule
        "technique": extract_technique(chunk),     # Creo/Intellego/Muto/Perdo/Rego
        "form": extract_form(chunk),               # Animal/Aquam/Auram/Corpus/etc.
        "openars_page": extract_page_ref(chunk),   # "p.XX" reference
        "indexed_at": datetime.now().isoformat(),
        "language": detect_language(chunk),        # "fr" for UI lore, "en" for rules
    })
    return chunk
```

## Choosing Chunk Size for ArsFabula

| Content Type | Chunk Size | Overlap | Splitter |
|---|---|---|---|
| Spell stats (factoid) | 256 tokens | 25 | Fixed-size |
| Spell description | 512 tokens | 64 | Markdown header |
| Bestiary entry | 512 tokens | 64 | Markdown header |
| Saga narrative | 1024 tokens | 128 | Semantic |
| Rules reference | 768 tokens | 96 | Recursive char |

## Testing Chunk Quality

```python
async def evaluate_chunk_quality(
    retriever,
    test_queries: list[dict]  # [{query, expected_chunk_contains}]
) -> dict:
    """Validate that chunks retrieve correctly for known queries."""
    results = {}
    for test in test_queries:
        docs = await retriever.ainvoke(test["query"])
        found = any(test["expected"] in doc.page_content for doc in docs)
        results[test["query"]] = {
            "found": found,
            "top_result_preview": docs[0].page_content[:200] if docs else "No results"
        }
    return results
```

## Key Rules

- **ALWAYS** use `MarkdownHeaderTextSplitter` as the primary splitter for lore `.md` files
- **ALWAYS** preserve header context in child chunks (strip_headers=False)
- **NEVER** chunk across `####` spell/creature boundaries — each entry should be atomic
- **TEST** chunk quality with 10+ representative queries before full indexing
- Chunk size 512 tokens is the sweet spot for Ollama local models (context window)

## Source

https://antigravity.codes/agent-skills/ai-tools/chunking-strategy
