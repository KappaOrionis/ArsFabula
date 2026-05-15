import sqlite3

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("DELETE FROM _sqlx_migrations WHERE version = 20260515000007")
cursor.execute("DELETE FROM _sqlx_migrations WHERE description LIKE '%official flag to characters%'")
print("Rows deleted:", cursor.rowcount)

conn.commit()
conn.close()
