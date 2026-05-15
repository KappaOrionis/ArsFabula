import re
import sqlite3
import uuid
from pathlib import Path
from typing import List, Dict, Any
from base import AppConfig, get_chroma_client, get_lore_collection

# Regex patterns for Ars Magica 5e spell blocks
# Example: "Ball of Abysmal Flame CrIg 35"
SPELL_HEADER_RE = re.compile(r"^(.*?)\s+([A-Z][a-z][A-Z][a-z])\s+(\d+)$")
# Example: "R: Voice, D: Mom, T: Ind"
RDT_RE = re.compile(r"R:\s*(.*?),\s*D:\s*(.*?),\s*T:\s*(.*)")

class SpellIngestor:
    def __init__(self, db_path: str, collection: Any):
        self.db_path = db_path
        self.collection = collection
        self.tefo_map = {
            "Cr": "Creo", "In": "Intellego", "Mu": "Muto", "Pe": "Perdo", "Re": "Rego",
            "An": "Animal", "Aq": "Aquam", "Au": "Auram", "Co": "Corpus", "He": "Herbam",
            "Ig": "Ignem", "Im": "Imaginem", "Me": "Mentem", "Te": "Terram", "Vi": "Vim"
        }

    def parse_tefo(self, short_code: str) -> (str, str):
        """Maps 'CrIg' to ('Creo', 'Ignem')"""
        te = self.tefo_map.get(short_code[:2], "Unknown")
        fo = self.tefo_map.get(short_code[2:], "Unknown")
        return te, fo

    def insert_to_sqlite(self, spells: List[Dict[str, Any]]):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for s in spells:
            cursor.execute("""
                INSERT INTO spells (
                    id, name, technique, form, level, range_param, duration_param, target_param, description, openars_page
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()), s['name'], s['technique'], s['form'], s['level'],
                s['range'], s['duration'], s['target'], s['description'], s['page']
            ))
        
        conn.commit()
        conn.close()

    def insert_to_chromadb(self, spells: List[Dict[str, Any]]):
        ids = []
        documents = []
        metadatas = []
        
        for s in spells:
            doc_id = f"spell_{s['name'].lower().replace(' ', '_')}"
            ids.append(doc_id)
            documents.append(f"{s['name']} ({s['technique']} {s['form']} {s['level']})\n{s['description']}")
            metadatas.append({
                "entity_type": "spell",
                "technique": s['technique'],
                "form": s['form'],
                "level": s['level'],
                "openars_page": s['page']
            })
            
        self.collection.add(ids=ids, documents=documents, metadatas=metadatas)

    def process_markdown_content(self, content: str, source_name: str):
        """
        Parses a Markdown version of the Grimoire.
        This assumes the PDF was already converted to MD by 'marker'.
        """
        spells = []
        lines = content.split('\n')
        
        current_spell = None
        
        for line in lines:
            line = line.strip()
            if not line: continue
            
            # Check for spell header
            match = SPELL_HEADER_RE.match(line)
            if match:
                if current_spell: spells.append(current_spell)
                name, tefo_code, level = match.groups()
                te, fo = self.parse_tefo(tefo_code)
                current_spell = {
                    "name": name, "technique": te, "form": fo, "level": int(level),
                    "description": "", "range": "", "duration": "", "target": "",
                    "page": source_name
                }
                continue
            
            if current_spell:
                # Check for RDT line
                rdt_match = RDT_RE.search(line)
                if rdt_match:
                    current_spell["range"], current_spell["duration"], current_spell["target"] = rdt_match.groups()
                else:
                    # Append to description
                    current_spell["description"] += line + " "

        if current_spell: spells.append(current_spell)
        
        print(f"Extracted {len(spells)} spells.")
        self.insert_to_sqlite(spells)
        self.insert_to_chromadb(spells)

if __name__ == "__main__":
    config = AppConfig.load()
    client = get_chroma_client(config)
    collection = get_lore_collection(client)
    
    ingestor = SpellIngestor("src-tauri/db.sqlite", collection)
    
    # Example: Run on the converted MD file
    # User should run: marker data/sources/grand_grimoire.pdf --output_dir data/processed
    md_path = Path("data/processed/grand_grimoire/grand_grimoire.md")
    if md_path.exists():
        with open(md_path, "r", encoding="utf-8") as f:
            ingestor.process_markdown_content(f.read(), "Grand Grimoire")
    else:
        print(f"File {md_path} not found. Please run 'marker' on the PDF first.")
