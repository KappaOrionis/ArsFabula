import sqlite3

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("DELETE FROM _sqlx_migrations WHERE version = 20260515000007")
    print("Deleted migration 7 from _sqlx_migrations")
except Exception as e:
    print("Error deleting migration 7:", e)

try:
    cursor.execute("ALTER TABLE characters DROP COLUMN is_official")
    print("Dropped is_official from characters")
except Exception as e:
    print("Error dropping is_official from characters:", e)

conn.commit()
conn.close()
