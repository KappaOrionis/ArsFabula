import os
import uuid
import fitz # PyMuPDF
from datetime import datetime
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from base import AppConfig, get_chroma_client, get_lore_collection

def ingest_pdf_fr(pdf_path: str, collection):
    """Extracts text from a French PDF and adds it to ChromaDB."""
    path = Path(pdf_path)
    if not path.exists():
        print(f"Error: PDF {pdf_path} not found.")
        return

    print(f"Processing French PDF: {path.name}...")
    
    # Extract text using PyMuPDF
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    
    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = text_splitter.split_text(text)
    print(f"  Extracted {len(chunks)} chunks.")

    # Prepare data
    documents = []
    metadatas = []
    ids = []

    for i, chunk in enumerate(chunks):
        chunk_id = f"{path.stem}_fr_{i}_{uuid.uuid4().hex[:8]}"
        documents.append(chunk)
        metadatas.append({
            "source_file": path.name,
            "entity_type": "lore",
            "language": "fr",
            "indexed_at": datetime.utcnow().isoformat()
        })
        ids.append(chunk_id)

    # Batch insert
    if documents:
        # ChromaDB allows max 5461 items per batch usually, but let's do 100
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            collection.add(
                documents=documents[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size],
                ids=ids[i:i+batch_size]
            )
        print(f"  Successfully indexed {len(documents)} chunks in French.")

if __name__ == "__main__":
    config = AppConfig.load()
    client = get_chroma_client(config)
    collection = get_lore_collection(client)
    
    # Process known French files
    french_files = [
        "data/sources/promises_fr.pdf",
        "data/sources/grand_grimoire.pdf" # Assuming it might be useful too
    ]
    
    for f in french_files:
        if os.path.exists(f):
            ingest_pdf_fr(f, collection)
        else:
            print(f"Skipping {f} (not found)")
            
    print("French ingestion complete.")
