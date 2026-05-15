import sqlite3
db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
try:
    cursor.execute("SELECT version, description, success, checksum FROM _sqlx_migrations ORDER BY version DESC LIMIT 3")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
except sqlite3.OperationalError as e:
    print(f"Error: {e}")
conn.close()
