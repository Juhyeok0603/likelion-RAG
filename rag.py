from __future__ import annotations

import argparse
import re
from pathlib import Path

import ollama
from qdrant_client import QdrantClient, models


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "knowledge" / "joonbu_lion_survival.md"
COLLECTION_NAME = "jungbu_survival"
QDRANT_URL = "http://localhost:6333"
EMBEDDING_MODEL = "bge-m3"
LLM_MODEL = "qwen3:8b"


def load_sections(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8")
    sections = []
    for section in re.split(r"(?m)^## ", text)[1:]:
        title, body = section.split("\n", 1)
        document = f"{title.strip()}\n{body.strip()}"
        sections.append((title.strip(), document))
    if not sections:
        raise ValueError(f"'## 제목' 형식의 문단이 없습니다: {path}")
    return sections


def get_client() -> QdrantClient:
    return QdrantClient(url=QDRANT_URL)


def embedding_preview(embedding: list[float]) -> str:
    return "[" + ", ".join(f"{value:.6f}" for value in embedding[:10]) + ", ...]"


def show_db() -> None:
    client = get_client()
    if not client.collection_exists(COLLECTION_NAME):
        raise SystemExit("먼저 'python rag.py index'를 실행하세요.")

    info = client.get_collection(COLLECTION_NAME)
    points, _ = client.scroll(
        collection_name=COLLECTION_NAME,
        limit=100,
        with_payload=True,
        with_vectors=True,
    )
    print("\n[Qdrant DB 구성]")
    print(f"서버: {QDRANT_URL}")
    print(f"대시보드: {QDRANT_URL}/dashboard")
    print(f"컬렉션: {COLLECTION_NAME}")
    print(f"포인트 수: {info.points_count}")
    print("레코드 구조: id + vector + payload(document, source, title)")
    for point in points:
        print(f"- id={point.id}, title={point.payload['title']}")
    if points:
        print(f"첫 벡터 차원: {len(points[0].vector)}")
        print(f"첫 벡터 실제 값(앞 10개): {embedding_preview(points[0].vector)}")


def index_documents() -> None:
    sections = load_sections(DATA_FILE)
    documents = [document for _, document in sections]
    embeddings = ollama.embed(model=EMBEDDING_MODEL, input=documents).embeddings
    client = get_client()

    if client.collection_exists(COLLECTION_NAME):
        client.delete_collection(COLLECTION_NAME)
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=len(embeddings[0]), distance=models.Distance.COSINE
        ),
    )
    client.upsert(
        collection_name=COLLECTION_NAME,
        wait=True,
        points=[
            models.PointStruct(
                id=number,
                vector=embedding,
                payload={
                    "document": document,
                    "source": DATA_FILE.name,
                    "title": title,
                },
            )
            for number, ((title, document), embedding) in enumerate(
                zip(sections, embeddings), start=1
            )
        ],
    )
    print("\n[문서 임베딩]")
    print(f"모델: {EMBEDDING_MODEL}")
    print(f"문서 수: {len(embeddings)}, 벡터 차원: {len(embeddings[0])}")
    print(f"첫 벡터 실제 값(앞 10개): {embedding_preview(embeddings[0])}")
    show_db()


def ask(question: str) -> None:
    client = get_client()
    if not client.collection_exists(COLLECTION_NAME):
        raise SystemExit("먼저 'python rag.py index'를 실행하세요.")

    question_embedding = ollama.embed(
        model=EMBEDDING_MODEL, input=question
    ).embeddings[0]
    hits = client.query_points(
        collection_name=COLLECTION_NAME,
        query=question_embedding,
        limit=3,
        with_payload=True,
    ).points
    context = "\n\n".join(
        f"[{hit.payload['title']}]\n{hit.payload['document']}" for hit in hits
    )

    print("\n[질문 임베딩]")
    print(f"벡터 차원: {len(question_embedding)}")
    print(f"실제 값(앞 10개): {embedding_preview(question_embedding)}")
    print("\n[Qdrant 유사도 검색]")
    for rank, hit in enumerate(hits, start=1):
        print(f"{rank}. {hit.payload['title']} (코사인 유사도: {hit.score:.4f})")

    response = ollama.chat(
        model=LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "너는 중부대 멋사 활동 안내 도우미다. 제공된 참고 자료만 근거로 "
                    "한국어로 간결하게 답하라. 자료에 없는 규정, 날짜, 숫자는 추측하지 "
                    "말고 공식 공지를 확인하라고 안내하라."
                ),
            },
            {
                "role": "user",
                "content": f"[참고 자료]\n{context}\n\n[질문]\n{question}",
            },
        ],
        think=False,
        options={"temperature": 0, "num_predict": 256},
    )
    print(f"\n[LLM 답변]\n{response.message.content}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ollama와 Qdrant로 만든 최소 RAG 실습")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("index", help="지식 문서를 임베딩해 Qdrant에 적재")
    subparsers.add_parser("show", help="Qdrant에 저장된 데이터 확인")
    ask_parser = subparsers.add_parser("ask", help="적재한 문서에 질문")
    ask_parser.add_argument("question", help="질문 내용")
    args = parser.parse_args()

    if args.command == "index":
        index_documents()
    elif args.command == "show":
        show_db()
    else:
        ask(args.question)


if __name__ == "__main__":
    main()

