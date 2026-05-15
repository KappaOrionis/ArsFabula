import os
from typing import Optional
try:
    import tomllib
except ImportError:
    import tomli as tomllib
from pydantic import BaseModel
from pydantic_settings import BaseSettings
import chromadb
from chromadb.config import Settings as ChromaSettings

class InferenceConfig(BaseModel):
    base_url: str
    api_key: str
    timeout: int

class ModelsConfig(BaseModel):
    chat_model: str
    embedding_model: str

class RagConfig(BaseModel):
    db_path: str
    max_context_chunks: int
    min_similarity: float

class AppConfig(BaseSettings):
    inference: InferenceConfig
    models: ModelsConfig
    rag: RagConfig

    @classmethod
    def load(cls, path: str = "config/ai.toml") -> "AppConfig":
        with open(path, "rb") as f:
            data = tomllib.load(f)
        return cls(**data)

def get_chroma_client(config: AppConfig):
    """Initializes and returns a persistent ChromaDB client."""
    os.makedirs(config.rag.db_path, exist_ok=True)
    return chromadb.PersistentClient(
        path=config.rag.db_path,
        settings=ChromaSettings(allow_reset=True)
    )

def get_lore_collection(client: chromadb.ClientAPI):
    """Gets or creates the main lore collection."""
    return client.get_or_create_collection(
        name="arsfabula_lore",
        metadata={"hnsw:space": "cosine"}
    )
