import re
import json

with open('resources/recensement_magi_ars_magica.md', 'r', encoding='utf-8') as f:
    content = f.read()

magi_blocks = content.split('### ')[1:]

COVENANT_MAP = {
    'durenmar': 'cov-durenmar-0000',
    'fengheld': 'cov-fengheld-0000',
    'crintera': 'cov-crintera-0000',
    'irencilia': 'cov-irencilia-0000',
    'fudarus': 'cov-fudarus-0000',
    'la maison du lévrier': 'cov-levrier-0000',
    'exspectatio': 'cov-exspectatio-0000',
    'doissetep': 'cov-doissetep-0000',
    'val-negra': 'cov-valnegra-0000',
    'harco': 'cov-harco-0000',
    'verdi': 'cov-verdi-0000',
    'valnastium': 'cov-valnastium-0000',
    'cave of twisting shadows': 'cov-twisting-0000',
    'coeris': 'cov-coeris-0000',
    'kastellon': 'cov-kastellon-0000',
    'blackthorn': 'cov-blackthorn-0000',
    'schola pythagoranis': 'cov-pythagoranis-0000',
    'horsinglas': 'cov-horsinglas-0000',
    'jaferia': 'cov-jaferia-0000',
    'ashenrise': 'cov-ashenrise-0000',
    'favras': 'cov-favras-0000',
    'krasnorechye': 'cov-krasnorechye-0000',
    'acre': 'cov-acre-0000',
    'castra solis': 'cov-castrasolis-0000',
    'magvillus': 'cov-magvillus-0000',
    'semitae': 'cov-semitae-0000',
}

def escape_sql(val):
    if val is None:
        return 'NULL'
    if isinstance(val, int):
        return str(val)
    # Escape single quotes
    clean = str(val).replace("'", "''")
    return f"'{clean}'"

sql_lines = [
    "-- 20260515000011_seed_magi_census.sql",
    "-- Seed 3 missing official covenants and 120 canonical census magi",
    "",
    "INSERT OR IGNORE INTO covenants (id, name, aura_type, aura_level, founding_year, tribunal, size, description, is_official, domus_magna, season_status, location_desc, gps_coords, notable_magi, custodes, grogs_desc, vis_sources, laboratories, library)",
    "VALUES ",
    "('cov-castrasolis-0000', 'Castra Solis', 'magic', 5, 800, 'Provençal', 'medium', 'Célèbre alliance de la Maison Flambeau en Provence, réputée pour ses tournois magiques et ses maîtres de feu.', 1, NULL, 'Été', 'Située dans les collines ensoleillées de Provence.', '43.5000° N, 5.5000° E', 'Gaston (Flambeau), Ranulf (Flambeau), Garsias (Flambeau)', 'Écuyers, hérauts d''armes et artisans forgerons.', 'Gardes d''élite spécialisés dans l''encadrement des tournois magiques.', 'Les Rayons du Solstice (6 pions Ignem)', 'Ateliers ouverts et arènes d''entraînement magique fortifiées.', 'Recueils de joutes magiques et traités de Creo et d''Ignem.'),",
    "('cov-magvillus-0000', 'Magvillus', 'magic', 5, 767, 'Rome', 'large', 'Domus Magna de la Maison Guernicus et siège des Quaesitores, veillant au respect du Code d''Hermès à travers toute l''Europe Mythique.', 1, 'Maison Guernicus', 'Automne', 'Vaste complexe palatial fortifié situé en Italie centrale.', '42.5000° N, 12.5000° E', 'Julia (Guernicus) et le Conseil des Quaesitores', 'Scribes juristes, greffiers et enquêteurs laïques.', 'Garde prétorienne hermétique assermentée pour protéger les tribunaux et les juges.', 'La Balance de Justice (10 pions Rego, 5 pions Vim)', 'Salles d''archives sécurisées et laboratoires d''investigation magique.', 'La plus grande bibliothèque de jurisprudence hermétique et de droit romain de l''Ordre.'),",
    "('cov-semitae-0000', 'Semitae', 'magic', 4, 900, 'Stonehenge', 'medium', 'Alliance du Tribunal de Stonehenge abritant d''anciennes traditions de sorciers du climat et d''hermétistes d''Ex Miscellanea.', 1, NULL, 'Été', 'Située sur les côtes brumeuses et venteuses de l''Angleterre.', '53.0000° N, 1.0000° E', 'Aururentius (Ex Miscellanea)', 'Pêcheurs, marins et météorologues traditionnels.', 'Guetteurs côtiers et milice locale.', 'Les Vents de la Tempête (6 pions Auram)', 'Tours d''observation météorologique ouvertes sur le ciel.', 'Traités sur les phénomènes climatiques et la magie de l''Auram.');",
    "",
    "-- Remove old placeholder magi from virtual covenant Doxa Hermetica to avoid duplicates",
    "DELETE FROM characters WHERE covenant_id = 'official-cov-id-0000';",
    "",
    "INSERT OR REPLACE INTO characters (id, covenant_id, name, character_type, house, birth_year, death_year, description, favored_arts, familiar_link, apprentice_registry, biographical_notice, source_book, page_reference, is_official, is_active)",
    "VALUES"
]

values_list = []

for idx, block in enumerate(magi_blocks):
    lines = block.strip().split('\n')
    data = {}
    for line in lines[1:]:
        line = line.strip()
        if line.startswith('* **'):
            match = re.match(r'\*\s*\*\*([^*:]+)[*:\s]*\*\*\s*[:\s]*\s*(.*)', line)
            if match:
                key = match.group(1).strip()
                val = match.group(2).strip()
                data[key] = val
    
    name = data.get("Nom de l'Hermétiste", f"Magus {idx+1}")
    house = data.get("Maison de l'Ordre", "")
    
    by_str = data.get("Année de naissance", "")
    by_match = re.search(r'\d+', by_str)
    birth_year = int(by_match.group(0)) if by_match else 1200
    
    dy_str = data.get("Année de Crépuscule ou de Décès estimée", "")
    dy_match = re.search(r'\d+', dy_str)
    death_year = int(dy_match.group(0)) if dy_match else None

    cov_str = data.get("Alliance d'attache hermétique", "")
    cov_clean = cov_str.split('(')[0].strip().lower()
    cov_id = COVENANT_MAP.get(cov_clean, 'official-cov-id-0000')

    desc = data.get("Description physique & Attributs", "")
    arts = data.get("Arts et Formes de prédilection", "").replace('**', '').strip()
    familiar = data.get("Lien de Familier", "")
    apprentice = data.get("Registre des Apprentis", "")
    bio = data.get("Notice biographique", "")
    book = data.get("Livre Source Officiel (Canon)", "").replace('*', '').strip()
    page = data.get("Page de Référence", "")

    val_str = f"({escape_sql(f'magus-census-{idx+1:04d}')}, {escape_sql(cov_id)}, {escape_sql(name)}, 'magus', {escape_sql(house)}, {escape_sql(birth_year)}, {escape_sql(death_year)}, {escape_sql(desc)}, {escape_sql(arts)}, {escape_sql(familiar)}, {escape_sql(apprentice)}, {escape_sql(bio)}, {escape_sql(book)}, {escape_sql(page)}, 1, 1)"
    values_list.append(val_str)

sql_lines.append(",\n".join(values_list) + ";\n")

with open('src-tauri/migrations/20260515000011_seed_magi_census.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_lines))

print("Successfully generated src-tauri/migrations/20260515000011_seed_magi_census.sql")
