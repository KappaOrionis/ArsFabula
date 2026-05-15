import sqlite3
import os
import uuid

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"

# Official covenants with Domus Magna info
COVENANTS = [
    ("Durenmar", "Rhine", "Le cœur de l'Ordre d'Hermès. Siège de la Maison Bonisagus.", 1, "Bonisagus"),
    ("Fudarus", "Normandy", "Centre de la Maison Tytalus.", 1, "Tytalus"),
    ("Harco", "Rome", "Centre névralgique de la Maison Mercere.", 1, "Mercere"),
    ("Magvillus", "Rome", "Siège de la Maison Guernicus.", 1, "Guernicus"),
    ("Verdeir", "Rome", "La forge de la Maison Verditius.", 1, "Verditius"),
    ("Cave of Shadows", "Greater Alps", "Centre de la Maison Criamon.", 1, "Criamon"),
    ("Val-Negra", "Greater Alps", "Ancienne citadelle Flambeau.", 1, "Flambeau"),
    ("Coeris", "Transylvania", "Forteresse de la Maison Tremere.", 1, "Tremere"),
    ("Cad Gadu", "Stonehenge", "Siège spirituel de la Maison Ex Miscellanea.", 1, "Ex Miscellanea"),
    ("Castra Solis", "Provençal", "Haut lieu de la Maison Flambeau.", 1, "Flambeau"),
    
    # Other official but not Domus Magna
    ("Fengheld", "Rhine", "Alliance puissante et politique, rivale historique de Durenmar.", 1, None),
    ("Irencilia", "Rhine", "Centre de la culture Merinita et des mystères de la féérie.", 1, None),
    ("Blackthorn", "Stonehenge", "Bastion de la maison Tremere en Angleterre.", 1, None),
    ("Doissetep", "Provençal", "L'une des alliances les plus puissantes de l'Ordre.", 1, None),
    ("Semita Errabunda", "The Levant", "Alliance isolée entre l'Occident et l'Orient.", 1, None),
    ("Thousand Caves", "Novgorod", "Vaste réseau souterrain évitant la surface.", 1, None)
]

def seed():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Clear existing to avoid duplicates during dev seeding
    cursor.execute("DELETE FROM covenants WHERE is_official = 1")

    for name, tribunal, desc, official, domus in COVENANTS:
        cid = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO covenants (id, name, tribunal, aura_type, aura_level, founding_year, description, is_official, size, domus_magna)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (cid, name, tribunal, "magic", 3, 1220, desc, official, "medium", domus))
        
        cursor.execute("""
            INSERT OR IGNORE INTO seasons (id, covenant_id, year, quarter, is_current)
            VALUES (?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), cid, 1220, "winter", 1))

    conn.commit()
    conn.close()
    print("Domus Seeding completed successfully.")

if __name__ == "__main__":
    seed()
