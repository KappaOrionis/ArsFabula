import sqlite3

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT * FROM _sqlx_migrations")
for row in cursor.fetchall():
    if 'characters' in row[1]:
        cursor.execute("DELETE FROM _sqlx_migrations WHERE version = ?", (row[0],))
        print("Deleted row with version", row[0])

conn.commit()
conn.close()
