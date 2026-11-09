import argparse

import ollama

from common import COLLECTION_NAME, EMBEDDING_MODEL, LLM_MODEL, get_client


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
context = "\n\n".join(
    f"[{hit.payload['title']}]\n{hit.payload['document']}" for hit in hits
)

response = ollama.chat(
    model=LLM_MODEL,
    messages=[
        {
            "role": "system",
            "content": (
                "제공된 참고 자료만 근거로 한국어로 답하라. 자료에 없는 규정이나 "
                "날짜는 추측하지 말고 공식 공지를 확인하라고 안내하라."
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

print("사용한 문서:", [hit.payload["title"] for hit in hits])
print("\nLLM 답변:\n", response.message.content, sep="")
