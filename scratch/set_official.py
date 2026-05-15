import sqlite3

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Official covenants with Domus Magna info
COVENANTS = [
    "Durenmar", "Fudarus", "Harco", "Magvillus", "Verdeir",
    "Cave of Shadows", "Val-Negra", "Coeris", "Cad Gadu", "Castra Solis",
    "Fengheld", "Irencilia", "Blackthorn", "Doissetep", "Semita Errabunda", "Thousand Caves"
]

for name in COVENANTS:
    cursor.execute("UPDATE covenants SET is_official = 1 WHERE name = ?", (name,))

conn.commit()
print("Updated official covenants to is_official = 1")
conn.close()
