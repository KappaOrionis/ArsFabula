import subprocess
import os
from pathlib import Path

def run_script(script_path: str):
    print(f"\n>>> Running {script_path}...")
    result = subprocess.run(["python", script_path], capture_output=True, text=True)
    if result.returncode == 0:
        print(result.stdout)
    else:
        print(f"Error in {script_path}:")
        print(result.stderr)

def main():
    print("=== ArsFabula Global Ingestion Pipeline ===")
    
    # 1. Download missing sources
    run_script("python/download_sources.py")
    
    # 2. Ingest Markdown Rules (OpenArs)
    # Assumes data/sources/ars-magica-open-license exists
    run_script("python/ingestion/ingest_markdown.py")
    
    # 3. Ingest Excel Creatures
    run_script("python/ingestion/ingest_excel.py")
    
    # 4. Ingest PDF Spells (Requires 'marker' output)
    # Note: 'marker' is a heavy tool, we suggest running it manually first
    # but we can try to automate a small check
    processed_dir = Path("data/processed/grand_grimoire")
    if not processed_dir.exists():
        print("\n[!] Grand Grimoire processed Markdown not found.")
        print("Please run: marker data/sources/grand_grimoire.pdf --output_dir data/processed")
    else:
        run_script("python/ingestion/ingest_pdf.py")

    print("\n=== Global Ingestion Complete ===")

if __name__ == "__main__":
    main()
