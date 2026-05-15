import os
import httpx
from pathlib import Path
from tqdm import tqdm

SOURCES = {
    "creature_index": "https://www.atlas-games.com/atlas-cms/resources/downloads/ars-magica-5th-edition-creature-index-v3.xls",
    "grand_grimoire": "https://www.atlas-games.com/atlas-cms/resources/downloads/arm5-grand-grimoire-of-hermetic-spells.pdf",
    "virtues_flaws": "http://www.atlas-games.com/pdf_storage/ArM5VFIndex.pdf",
    "books_by_ability": "http://www.atlas-games.com/pdf_storage/ArM5BooksByAbilityIndex.pdf",
    "promises_fr": "https://www.atlas-games.com/pdf_storage/promises_french.pdf",
    "rules_md": "https://github.com/OriginalMadman/Ars-Magica-Open-License/archive/refs/heads/master.zip"
}

def download_file(url: str, dest_path: Path):
    if dest_path.exists():
        print(f"Skipping {dest_path.name}, already exists.")
        return

    print(f"Downloading {url}...")
    with httpx.stream("GET", url, follow_redirects=True) as response:
        total = int(response.headers.get("Content-Length", 0))
        with open(dest_path, "wb") as f, tqdm(total=total, unit="B", unit_scale=True, desc=dest_path.name) as bar:
            for data in response.iter_bytes():
                f.write(data)
                bar.update(len(data))

def setup_sources():
    base_dir = Path("data/sources")
    base_dir.mkdir(parents=True, exist_ok=True)

    for name, url in SOURCES.items():
        ext = url.split(".")[-1]
        if "archive" in url:
            ext = "zip"
        dest = base_dir / f"{name}.{ext}"
        try:
            download_file(url, dest)
        except Exception as e:
            print(f"Failed to download {name}: {e}")

if __name__ == "__main__":
    setup_sources()
    print("\nSources downloaded to data/sources/")
    print("Note: For the Markdown rules, you will need to unzip rules_md.zip into data/sources/ars-magica-open-license/")
