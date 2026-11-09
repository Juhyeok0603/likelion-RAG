import ollama
from qdrant_client import models

from common import COLLECTION_NAME, DATA_FILE, EMBEDDING_MODEL, get_client, load_sections, preview


sections = load_sections()
documents = [document for _, document in sections]
embeddings = ollama.embed(model=EMBEDDING_MODEL, input=documents).embeddings
client = get_client()

if client.collection_exists(COLLECTION_NAME):
    client.delete_collection(COLLECTION_NAME)

client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=models.VectorParams(
        size=len(embeddings[0]),
        distance=models.Distance.COSINE,
    ),
)
client.upsert(
    collection_name=COLLECTION_NAME,
    wait=True,
    points=[
        models.PointStruct(
            id=number,
            vector=embedding,
            payload={"title": title, "document": document, "source": DATA_FILE.name},
        )
        for number, ((title, document), embedding) in enumerate(
            zip(sections, embeddings), start=1
        )
    ],
)

print(f"저장 완료: {len(sections)}개 문서")
print(f"임베딩 차원: {len(embeddings[0])}")
print(f"첫 벡터 앞 10개: {preview(embeddings[0])}")

