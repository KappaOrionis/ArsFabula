import sqlite3
db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE covenants DROP COLUMN is_official")
    print("Dropped is_official from covenants")
except Exception as e:
    print("Error dropping is_official:", e)

try:
    cursor.execute("ALTER TABLE covenants DROP COLUMN domus_magna")
    print("Dropped domus_magna from covenants")
except Exception as e:
    print("Error dropping domus_magna:", e)

conn.commit()
conn.close()
