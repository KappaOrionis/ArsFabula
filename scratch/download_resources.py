import os
import requests
import subprocess

resources_dir = "c:/Users/janvi/LocalRepository/ArsFabula/resources"
sources_file = os.path.join(resources_dir, "SOURCES.md")

urls = [
    ("ars-magica-5th-edition-creature-index-v3.xls", "https://www.atlas-games.com/atlas-cms/resources/downloads/ars-magica-5th-edition-creature-index-v3.xls"),
    ("arm5-grand-grimoire-of-hermetic-spells.pdf", "https://www.atlas-games.com/atlas-cms/resources/downloads/arm5-grand-grimoire-of-hermetic-spells.pdf"),
    ("ArM5VFIndex.pdf", "http://www.atlas-games.com/pdf_storage/ArM5VFIndex.pdf"),
    ("ArM5BooksByAbilityIndex.pdf", "http://www.atlas-games.com/pdf_storage/ArM5BooksByAbilityIndex.pdf"),
    ("ArMForgottenMagicofHermes.pdf", "https://atlas-games.com/pdf_storage/ArMForgottenMagicofHermes.pdf"),
    ("ArM5Beasts.pdf", "http://www.atlas-games.com/pdf_storage/ArM5Beasts.pdf"),
    ("arm5formulae.pdf", "https://atlas-games.com/atlas-cms/resources/downloads/arm5formulae.pdf"),
    ("arm5-complex-debate-rules.zip", "https://atlas-games.com/atlas-cms/resources/downloads/arm5-complex-debate-rules.zip"),
    ("arm5frenchchar.pdf", "http://www.atlas-games.com/pdf_storage/arm5frenchchar.pdf"),
    ("promises_french.pdf", "https://www.atlas-games.com/pdf_storage/promises_french.pdf"),
    ("promises.pdf", "https://www.atlas-games.com/pdf_storage/promises.pdf"),
    ("nigrasaxa.pdf", "https://www.atlas-games.com/pdf_storage/nigrasaxa.pdf")
]

def download_files():
    for filename, url in urls:
        path = os.path.join(resources_dir, filename)
        if os.path.exists(path):
            print(f"Skipping {filename}, already exists.")
            continue
        print(f"Downloading {filename}...")
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                with open(path, 'wb') as f:
                    f.write(response.content)
                print(f"Success: {filename}")
            else:
                print(f"Failed to download {filename}: HTTP {response.status_code}")
        except Exception as e:
            print(f"Error downloading {filename}: {e}")

    # Clone the license repo
    license_path = os.path.join(resources_dir, "Ars-Magica-Open-License")
    if not os.path.exists(license_path):
        print("Cloning Ars-Magica-Open-License...")
        subprocess.run(["git", "clone", "https://github.com/OriginalMadman/Ars-Magica-Open-License", license_path], check=False)

if __name__ == "__main__":
    download_files()
