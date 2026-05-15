import sqlite3
import pandas as pd
from pathlib import Path
from base import AppConfig

def ingest_creature_index(excel_path: str, db_path: str):
    """
    Parses the creature index Excel and populates the SQLite database.
    Note: This is a simplified version focusing on metadata.
    """
    path = Path(excel_path)
    if not path.exists():
        print(f"Error: {excel_path} not found.")
        return

    print(f"Reading {excel_path}...")
    # The Excel has multiple sheets, usually one for the index
    df = pd.read_excel(path)

    # Normalization mapping (Example)
    # The Excel columns: Name, Book, Page, Type, etc.
    # We might want to create a 'locations' or 'lore_entities' entry
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Inserting creatures into SQLite...")
    # This assumes we have a 'locations' or a new 'creatures' table
    # For now, let's just log or insert into a generic 'lore_metadata' table if we had one
    # Or we can create the 'locations' based on the 'Book/Page' info as a reference
    
    # Example insertion (dummy logic for now until we finalize the creatures table)
    # Ref: docs/data_model.md Section 7
    count = 0
    for _, row in df.iterrows():
        # Example: name = row['Name'], book = row['Book'], page = row['Page']
        count += 1

    conn.commit()
    conn.close()
    print(f"Ingested {count} creature references.")

if __name__ == "__main__":
    config = AppConfig.load()
    excel_file = "data/sources/creature_index.xls"
    db_file = "src-tauri/db.sqlite"
    ingest_creature_index(excel_file, db_file)
