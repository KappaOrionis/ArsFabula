# RAG Implementation

Master Retrieval-Augmented Generation (RAG) to build LLM applications that provide accurate, grounded responses using external knowledge.

## When to Use This Skill

- Building Q&A systems over proprietary documents (Ars Magica lore, OpenArs rulebook)
- Creating chatbots with current, factual information (ArsFabula narrative AI)
- Implementing semantic search with natural language queries (Codex lore search)
- Reducing hallucinations with grounded responses (game rule enforcement)

## ArsFabula-Specific Context

This skill is **critical** for the Lore RAG Engine described in the PRD:
- Index OpenArs lore pages into ChromaDB/FAISS (local, no cloud dependency)
- Use Ollama/LM Studio for local embeddings (no API key required)
- Chunk lore documents by section headers (Markdown-aware splitting)
- Filter retrieval by `entity_type` metadata (Spell, Bestiary, Location, etc.)

## Core RAG Pipeline (LangGraph)

```python
from langgraph.graph import StateGraph, START, END
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import TypedDict

class RAGState(TypedDict):
    question: str
    context: list[Document]
    answer: str

# ArsFabula: Use LM Studio (OpenAI-compatible API on localhost:1234)
# from langchain_openai import ChatOpenAI, OpenAIEmbeddings
# llm = ChatOpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio", model="mistral-7b-instruct")
# embeddings = OpenAIEmbeddings(base_url="http://localhost:1234/v1", api_key="lm-studio", model="nomic-embed-text")
# vectorstore = Chroma(collection_name="arsfabula_lore", embedding_function=embeddings, persist_directory="./data/chroma")

rag_prompt = ChatPromptTemplate.from_template("""
Answer based on the Ars Magica lore context below.
If you cannot answer from context, say so clearly.
Always reference the OpenArs page number if available.

Context: {context}
Question: {question}
Answer:""")

async def retrieve(state: RAGState) -> RAGState:
    docs = await retriever.ainvoke(state["question"])
    return {"context": docs}

async def generate(state: RAGState) -> RAGState:
    context_text = "\n\n".join(doc.page_content for doc in state["context"])
    messages = rag_prompt.format_messages(context=context_text, question=state["question"])
    response = await llm.ainvoke(messages)
    return {"answer": response.content}

builder = StateGraph(RAGState)
builder.add_node("retrieve", retrieve)
builder.add_node("generate", generate)
builder.add_edge(START, "retrieve")
builder.add_edge("retrieve", "generate")
builder.add_edge("generate", END)
rag_chain = builder.compile()
```

## Hybrid Retrieval (Recommended for Lore)

```python
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever

# BM25 for exact rule/spell name matching
bm25_retriever = BM25Retriever.from_documents(documents)
bm25_retriever.k = 10

# Dense retrieval for semantic/thematic queries
dense_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

# Combine: 40% keyword (for exact rule lookups), 60% semantic
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, dense_retriever],
    weights=[0.4, 0.6]
)
```

## Local Vector Store (ChromaDB — no cloud)

```python
from langchain_chroma import Chroma

vectorstore = Chroma(
    collection_name="arsfabula_lore",
    embedding_function=embeddings,
    persist_directory="./data/chroma_db"  # Relative to ArsFabula project root
)
```

## Metadata Filtering for Lore Types

```python
# Filter by entity type during retrieval
results = await vectorstore.asimilarity_search(
    "Perdo Corpus spell",
    filter={"entity_type": "spell", "technique": "Perdo"},
    k=5
)

# Add metadata when indexing
docs_with_metadata = []
for doc in documents:
    doc.metadata.update({
        "entity_type": determine_entity_type(doc),  # spell/creature/location/virtue/flaw
        "openars_page": extract_page_ref(doc),
        "language": "fr",  # UI language
    })
    docs_with_metadata.append(doc)
```

## Reranking for Precision

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

async def retrieve_and_rerank(query: str, k: int = 5) -> list[Document]:
    candidates = await vectorstore.asimilarity_search(query, k=20)
    pairs = [[query, doc.page_content] for doc in candidates]
    scores = reranker.predict(pairs)
    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return [doc for doc, score in ranked[:k]]
```

## Structured RAG Response

```python
from pydantic import BaseModel, Field

class LoreRAGResponse(BaseModel):
    answer: str = Field(description="The answer based on Ars Magica lore")
    confidence: float = Field(description="Confidence score 0-1")
    openars_refs: list[str] = Field(description="OpenArs page references cited")
    entity_type: str = Field(description="Type: spell/creature/location/virtue/flaw")

structured_llm = llm.with_structured_output(LoreRAGResponse)
```

## Key Rules

- **ALWAYS use local models** (Ollama/LM Studio) — no external API calls in ArsFabula
- **ALWAYS persist ChromaDB** to `./data/chroma_db` for offline use
- **ALWAYS include OpenArs page refs** in metadata for rule citations
- **NEVER hallucinate rules** — if not in context, say "Non trouvé dans les sources"
- Lore data is in **French** (UI), but code/DB schema stays in **English**

## Source

https://antigravity.codes/agent-skills/ai-tools/rag-implementation
