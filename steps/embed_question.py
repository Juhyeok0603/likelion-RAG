import argparse

import ollama

from common import EMBEDDING_MODEL, preview


parser = argparse.ArgumentParser()
parser.add_argument("question")
question = parser.parse_args().question

embedding = ollama.embed(model=EMBEDDING_MODEL, input=question).embeddings[0]
print(f"질문: {question}")
print(f"임베딩 차원: {len(embedding)}")
print(f"벡터 앞 10개: {preview(embedding)}")

