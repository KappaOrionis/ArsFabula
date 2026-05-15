import sqlite3
import os
import uuid

db_path = "C:/Users/janvi/AppData/Roaming/com.janvi.arsfabula/arsfabula.db"

# Official covenants from MapView.tsx
COVENANTS = [
    ("Durenmar", "Rhine", "Le cœur de l'Ordre d'Hermès. Fondée par Bonisagus, abrite la Grande Bibliothèque.", 1),
    ("Fengheld", "Rhine", "Alliance puissante et politique, rivale historique de Durenmar.", 1),
    ("Irencilia", "Rhine", "Centre de la culture Merinita et des mystères de la féérie.", 1),
    ("Cratera", "Rhine", "Bastion de la Maison Tytalus dans le tribunal du Rhin.", 1),
    ("Blackthorn", "Stonehenge", "Bastion de la maison Tremere en Angleterre.", 1),
    ("Cad Gadu", "Stonehenge", "Siège spirituel de la Maison Ex Miscellanea.", 1),
    ("Voluntas", "Stonehenge", "Alliance Jerbiton influente dans le sud de l'Angleterre.", 1),
    ("Ungulus", "Stonehenge", "Ancienne alliance isolée dans le nord.", 1),
    ("Cœur de Chêne", "Normandy", "Alliance influente gérant les relations avec la noblesse.", 1),
    ("Fudarus", "Normandy", "Centre de la Maison Tytalus.", 1),
    ("Mont-Saint-Michel", "Normandy", "Alliance Jerbiton située dans l'abbaye célèbre.", 1),
    ("Harco", "Rome", "Centre névralgique de la Maison Mercere.", 1),
    ("Magvillus", "Rome", "Siège de la Maison Guernicus.", 1),
    ("Verdeir", "Rome", "La forge de la Maison Verditius.", 1),
    ("Metron", "Rome", "Alliance érudite proche de Rome.", 1),
    ("Cave of Shadows", "Greater Alps", "Centre de la Maison Criamon.", 1),
    ("Val-Negra", "Greater Alps", "Ancienne citadelle Flambeau.", 1),
    ("Coeris", "Transylvania", "Forteresse de la Maison Tremere.", 1),
    ("Fénix", "Iberia", "Alliance ancienne luttant pour le savoir hermétique.", 1),
    ("Barcelona", "Iberia", "Alliance urbaine dynamique.", 1),
    ("Doissetep", "Provençal", "L'une des alliances les plus puissantes de l'Ordre.", 1),
    ("Castra Solis", "Provençal", "Haut lieu de la Maison Flambeau.", 1),
    ("Semita Errabunda", "The Levant", "Alliance isolée entre l'Occident et l'Orient.", 1),
    ("Thousand Caves", "Novgorod", "Vaste réseau souterrain évitant la surface.", 1),
    ("Leth Moga", "Hibernia", "Gardiens des traditions gaéliques.", 1),
    ("Ashengarden", "Hibernia", "Alliance Merinita dans les bois d'Irlande.", 1),
    ("Blackburn", "Loch Leglean", "Alliance de guerriers en Écosse.", 1)
]

def seed():
    if not os.path.exists(db_path):
        print(f"DB not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    for name, tribunal, desc, official in COVENANTS:
        cid = str(uuid.uuid4())
        # Use lowercase aura_type as per CHECK constraint
        cursor.execute("""
            INSERT OR IGNORE INTO covenants (id, name, tribunal, aura_type, aura_level, founding_year, description, is_official, size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (cid, name, tribunal, "magic", 3, 1220, desc, official, "medium"))
        
        # Create initial season for each
        cursor.execute("""
            INSERT OR IGNORE INTO seasons (id, covenant_id, year, quarter, is_current)
            VALUES (?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), cid, 1220, "winter", 1))

    conn.commit()
    conn.close()
    print("Seeding completed successfully.")

if __name__ == "__main__":
    seed()
