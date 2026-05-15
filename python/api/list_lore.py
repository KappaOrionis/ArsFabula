import sys
import json
import os
from pathlib import Path

# Add root to path to import base
root = Path(__file__).parent.parent.parent
sys.path.append(str(root / "python" / "ingestion"))

try:
    from base import AppConfig, get_chroma_client, get_lore_collection
except ImportError:
    # Fallback if pathing fails in some environments
    sys.path.append(os.getcwd())
    from python.ingestion.base import AppConfig, get_chroma_client, get_lore_collection

def list_lore(limit=50):
    config = AppConfig.load()
    client = get_chroma_client(config)
    collection = get_lore_collection(client)
    
    # Get all items (up to limit)
    results = collection.get(limit=limit)
    
    formatted = []
    for i in range(len(results["ids"])):
        # Extract title from first line of document or use ID
        doc = results["documents"][i]
        title = doc.split('\n')[0][:50]
        if len(title) == 50: title += "..."
        
        formatted.append({
            "id": results["ids"][i],
            "title": title,
            "content": doc,
            "entity_type": results["metadatas"][i].get("entity_type", "lore"),
            "metadata": results["metadatas"][i]
        })
    
    return formatted

if __name__ == "__main__":
    try:
        data = list_lore()
        print(json.dumps(data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
