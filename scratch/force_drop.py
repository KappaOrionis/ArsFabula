import sqlite3

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("ALTER TABLE characters DROP COLUMN is_official")
conn.commit()
print("Dropped!")
conn.close()
