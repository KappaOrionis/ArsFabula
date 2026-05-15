# Product Requirements Document (PRD) - Project "Ars Fabula"

## 1. Vision and Product Goals
**Ars Fabula** is a local-first, AI-augmented application designed to manage and narrate campaigns for **Ars Magica 5th Edition** (utilizing the OpenArs license). The application shifts the focus from individual characters to the **Covenant (Alliance)** as the primary entity, anchoring it within the geopolitics and magic of **Mythic Europe**.

### Key Objectives:
* **Covenant-Centric Management:** Treat the Covenant as the living core of the game (Boons, Hooks, resources, library, and labs).
* **AI Storyguide:** A local LLM acting as a narrator and rule arbiter, generating seasonal events and interpreting lore.
* **Data Sovereignty:** 100% offline operation, ensuring privacy for campaign data and AI prompts.
* **Legal Compliance:** Strictly adhere to the Creative Commons CC BY-SA 4.0 license from Atlas Games and Paradox Interactive's trademark requirements.

---

## 2. Technical Stack (The "Architect's Ledger")
All technical implementation details are strictly in **English**.

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **Tauri / React** | Low memory footprint, native performance, modern UI. |
| **Core Logic** | **Rust or Python (Strict Typing)** | Memory safety (Rust) or rapid development with strict type hints (Python). |
| **Relational DB** | **SQLite** | Local-first persistence, ACID compliance, portable. |
| **Vector DB** | **FAISS or ChromaDB** | RAG (Retrieval-Augmented Generation) for lore queries. |
| **AI Inference** | **Ollama / LM Studio** | Local inference of Llama 3 or Mistral models. |
| **Localisation** | **Fluent or i18next** | Decoupling technical keys from French UI strings. |

---

## 3. Functional Requirements

### 3.1. Covenant OS (Alliance Management)
* **Seasonal Cycle:** Automated time advancement by quarter (Spring, Summer, Autumn, Winter).
* **Resource Tracking:** Ledger for Vis sources (per Art), mundane income, and expenditures.
* **Library & Lab:** Inventory of *Summae* and *Tractatus*. Automated calculation of Lab quality and bonuses.
* **Personnel:** Database of Magi, Companions, and Grogs with automatic aging and XP calculation.

### 3.2. Mythic Europe Ecosystem
* **Factions & Tribunals:** Tracking diplomatic relations with neighboring Covenants and local authorities.
* **The Four Realms:** Influence levels of Divine, Faerie, Infernal, and Magic auras in the region.
* **Historical Timeline:** Integration of 13th-century events into the AI's narrative context.

### 3.3. The Codex (Lore Chatbot & Audit)
* **Semantic Search:** Natural language interface to query 5th Edition rules and lore.
* **Data Auditor:** The AI validates SQL data (e.g., a custom spell) against the Lore stored in the Vector DB.
* **Knowledge Bridge:** The Codex queries the English DB/Vector store and responds to the user in French.

---

## 4. Data Model & Ontology

### 4.1. Relational Schema (English)
* `Covenants`: (id, name, aura_level, founding_year, location_id)
* `Characters`: (id, name, type, house_id, warp_level, confidence)
* `Resources`: (id, covenant_id, art_type, amount_per_year)
* `Seasons`: (id, year, quarter, event_log)

### 4.2. Ontology Definition
The system operates on a semantic graph (Subject-Predicate-Object):
* `[Spell]` *requires* `[Technique]` + `[Form]`.
* `[Mage]` *belongs_to* `[House]`.
* `[Infernal_Creature]` *suffers_penalty_in* `[Divine_Aura]`.
* `[Covenant]` *is_located_in* `[Tribunal]`.

---

## 5. Coding Standards & Quality Assurance

### 5.1. Coding Rules
* **Strict Typing:** Mandatory static typing (Rust or Python with `mypy`).
* **English Naming:** Variables, functions, and DB schemas must be in English.
* **Documentation:** Every rule-related function must include a docstring citing the OpenArs book and page (e.g., `// Ref: ArM5, p. 173`).
* **Linters:** Zero-warning policy for `clippy` (Rust) or `ruff` (Python).

### 5.2. Testing Harness
* **Unit Tests:** 100% coverage on rule calculations (Penetration, Stress Dies, Aging).
* **End-to-End (E2E):** Automated scenarios for Covenant creation and seasonal progression.
* **IA Mocking:** LLM responses must be mocked for deterministic E2E testing pipelines.

---

## 6. Internationalization (i18n)
* **Internal:** Code, DB, and technical docs are in **English**.
* **External:** User Interface (UI) and Codex conversations are in **French**.
* **Mapping:** Use dictionary files for all UI strings. No hardcoded French in source files.

---

## 7. Legal & Compliance
* **Attribution:** Mandatory CC BY-SA 4.0 notice in the "About" screen.
* **Trademarks:** Specific legal notices for Atlas Games and Paradox Interactive.
* **Excluded Terms:** No use of *Order of Hermes*, *Tremere*, etc., in the application title or binaries.

---

## 8. Documentation Output Requirements
The system must generate and maintain:
1.  `architecture.md`: System design and data flow.
2.  `data_model.md`: Detailed SQL and Vector schemas.
3.  `feature_specs.md`: Detailed logic for every game mechanic.
4.  `ontology.md`: The semantic mapping of Mythic Europe.
5.  `test_report.md`: Results of unit and E2E runs.
