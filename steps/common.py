import re
from pathlib import Path

from qdrant_client import QdrantClient


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_FILE = BASE_DIR / "knowledge" / "joonbu_lion_survival.md"
COLLECTION_NAME = "joongbu_survival"
QDRANT_URL = "http://localhost:6333"
EMBEDDING_MODEL = "bge-m3"
LLM_MODEL = "qwen3:8b"


def get_client() -> QdrantClient:
    return QdrantClient(url=QDRANT_URL)


def load_sections() -> list[tuple[str, str]]:
    text = DATA_FILE.read_text(encoding="utf-8")
    sections = []
    for section in re.split(r"(?m)^## ", text)[1:]:
        title, body = section.split("\n", 1)
        sections.append((title.strip(), f"{title.strip()}\n{body.strip()}"))
    if not sections:
        raise ValueError(f"'## 제목' 형식의 문단이 없습니다: {DATA_FILE}")
    return sections


def preview(embedding: list[float]) -> str:
    values = ", ".join(f"{value:.6f}" for value in embedding[:10])
    return f"[{values}, ...]"

