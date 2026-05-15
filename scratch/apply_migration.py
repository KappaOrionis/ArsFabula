import sqlite3
import os

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE covenants ADD COLUMN is_official INTEGER NOT NULL DEFAULT 0;")
        print("Migration applied.")
    except sqlite3.OperationalError as e:
        print(f"Migration skip: {e}")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
