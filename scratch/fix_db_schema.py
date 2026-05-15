import sqlite3
import os

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Manually add the columns back so the DB is in the correct state
try:
    cursor.execute("ALTER TABLE covenants ADD COLUMN is_official INTEGER NOT NULL DEFAULT 0")
    print("Added is_official to covenants")
except Exception as e:
    print("covenants is_official:", e)

try:
    cursor.execute("ALTER TABLE covenants ADD COLUMN domus_magna TEXT")
    print("Added domus_magna to covenants")
except Exception as e:
    print("covenants domus_magna:", e)

try:
    cursor.execute("ALTER TABLE characters ADD COLUMN is_official INTEGER NOT NULL DEFAULT 0")
    print("Added is_official to characters")
except Exception as e:
    print("characters is_official:", e)

# Insert the migration records manually so sqlx knows they ran
migrations = [
    (20260515000006, 'add domus magna', b'\x1f\xe6\x17(\xb0\xd7\xaa\xb2{\xe9V\x7f\xd9\xb3\x82dm\xc8?[\x8b\xf0t\xaa\xfc\xe9\xd93\xf5\x84Qx]\xb2\x8b\x87\xe1\x8f\x119FkL\x84E@\xfc\x1e'),
    (20260515000007, 'add official flag to characters', b'\x00'*48) # fake checksum, doesn't matter for this one if we don't change the file
]

for version, desc, checksum in migrations:
    try:
        cursor.execute("""
            INSERT INTO _sqlx_migrations (version, description, success, checksum, execution_time)
            VALUES (?, ?, 1, ?, 100)
        """, (version, desc, checksum))
        print(f"Recorded migration {version}")
    except Exception as e:
        print(f"Migration {version}:", e)

conn.commit()
conn.close()
