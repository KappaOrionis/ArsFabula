import sqlite3
import os

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE covenants ADD COLUMN domus_magna TEXT;")
        print("Migration applied: domus_magna column added.")
    except sqlite3.OperationalError as e:
        print(f"Migration skip: {e}")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
