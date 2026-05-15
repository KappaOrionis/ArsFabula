import sys
import json
import os
from pathlib import Path

# Add ingestion dir to path to reuse AppConfig
sys.path.append(str(Path(__file__).parent.parent / "ingestion"))

try:
    from base import AppConfig, get_chroma_client, get_lore_collection
except ImportError:
    # Fallback if pathing fails
    print(json.dumps({"error": "Failed to import base modules"}))
    sys.exit(1)

def search(query, filter_type=None, limit=10):
    config = AppConfig.load()
    client = get_chroma_client(config)
    collection = get_lore_collection(client)
    
    where_clause = {}
    if filter_type:
        where_clause = {"entity_type": filter_type}
        
    results = collection.query(
        query_texts=[query],
        n_results=limit,
        where=where_clause if where_clause else None
    )
    
    formatted_results = []
    # results['ids'], results['documents'], results['metadatas']
    if results['ids']:
        for i in range(len(results['ids'][0])):
            formatted_results.append({
                "id": results['ids'][0][i],
                "title": results['metadatas'][0][i].get("name", results['ids'][0][i]),
                "content": results['documents'][0][i],
                "entity_type": results['metadatas'][0][i].get("entity_type", "lore"),
                "metadata": results['metadatas'][0][i]
            })
            
    return formatted_results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)
        
    query = sys.argv[1]
    filter_type = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != "null" else None
    
    try:
        results = search(query, filter_type)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
