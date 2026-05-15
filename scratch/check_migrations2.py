import sqlite3

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT version, description FROM _sqlx_migrations")
for row in cursor.fetchall():
    print(row)
    
conn.close()
