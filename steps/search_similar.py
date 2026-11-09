import argparse

import ollama

from common import COLLECTION_NAME, EMBEDDING_MODEL, get_client


parser = argparse.ArgumentParser()
parser.add_argument("question")
question = parser.parse_args().question

question_embedding = ollama.embed(
    model=EMBEDDING_MODEL,
    input=question,
).embeddings[0]
hits = get_client().query_points(
    collection_name=COLLECTION_NAME,
    query=question_embedding,
    limit=3,
    with_payload=True,
).points

print(f"질문: {question}")
for rank, hit in enumerate(hits, start=1):
    print(f"{rank}. {hit.payload['title']} / 코사인 유사도: {hit.score:.4f}")

