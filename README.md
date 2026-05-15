# ArsFabula

**ArsFabula** is a local-first, AI-augmented desktop application for managing and narrating campaigns for **Ars Magica 5th Edition**.

## Key Features
- **Covenant Management**: Tracking seasonal cycles, resources, and laboratory quality.
- **AI Storyguide**: Local AI narrator using LM Studio to interpret lore and rules.
- **Lore Codex**: RAG-powered chatbot for querying the OpenArs rules and Mythic Europe lore.
- **Data Sovereignty**: 100% offline and private.

## Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Rust** (Stable)
- **Python** (3.11+)
- **LM Studio** (Launched and serving on `localhost:1234`)

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   cd src-tauri && cargo fetch
   cd ../python && pip install -r requirements.txt
   ```
3. Initialize the database:
   ```bash
   cd src-tauri && cargo sqlx migrate run
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

## Development Standards
See [AGENTS.md](AGENTS.md) for coding standards, language rules, and architecture details.

## Legal
ArsFabula is developed under the OpenArs license (CC BY-SA 4.0). See [SOURCES.md](SOURCES.md) for official source materials.
