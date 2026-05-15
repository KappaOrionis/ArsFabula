import os
import uuid
from datetime import datetime
from pathlib import Path
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from base import AppConfig, get_chroma_client, get_lore_collection

def ingest_markdown_directory(directory_path: str, collection: chromadb.Collection):
    """
    Parses all .md files in a directory and adds them to the vector store.
    """
    path = Path(directory_path)
    if not path.exists():
        print(f"Error: Source directory {directory_path} not found.")
        return

    # Configuration for text splitting
    # Ref: SKILL-chunking-strategy
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        separators=["\n## ", "\n### ", "\n", " ", ""]
    )

    print(f"Starting ingestion from {directory_path}...")
    
    for md_file in path.glob("**/*.md"):
        print(f"Processing {md_file.name}...")
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Split text into chunks
        chunks = text_splitter.split_text(content)
        
        # Prepare data for ChromaDB
        documents = []
        metadatas = []
        ids = []

        for i, chunk in enumerate(chunks):
            chunk_id = f"{md_file.stem}_{i}_{uuid.uuid4().hex[:8]}"
            documents.append(chunk)
            metadatas.append({
                "source_file": str(md_file.relative_to(path)),
                "entity_type": "rule" if "Rules" in str(md_file) else "lore",
                "language": "en", # Sources are currently English
                "indexed_at": datetime.utcnow().isoformat()
            })
            ids.append(chunk_id)

        # Batch insert into ChromaDB
        if documents:
            collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print(f"  Added {len(documents)} chunks from {md_file.name}")

if __name__ == "__main__":
    config = AppConfig.load()
    client = get_chroma_client(config)
    collection = get_lore_collection(client)
    
    # Target directory for OpenArs Markdown sources
    source_dir = "data/sources/ars-magica-open-license"
    ingest_markdown_directory(source_dir, collection)
    print("Ingestion complete.")
