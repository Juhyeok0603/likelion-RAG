import ollama

from steps.common import COLLECTION_NAME, EMBEDDING_MODEL, LLM_MODEL, get_client, preview


def answer_question(question: str) -> dict:
    question = question.strip()
    if not question:
        raise ValueError("질문을 입력하세요.")

    client = get_client()
    if not client.collection_exists(COLLECTION_NAME):
        raise RuntimeError("지식 데이터가 없습니다. 먼저 store_knowledge.py를 실행하세요.")

    question_embedding = ollama.embed(
        model=EMBEDDING_MODEL,
        input=question,
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
    response = ollama.chat(
        model=LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "제공된 참고 자료만 근거로 한국어로 간결하게 답하라. 자료에 없는 "
                    "규정, 날짜, 숫자는 추측하지 말고 공식 공지를 확인하라고 안내하라."
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
    return {
        "answer": response.message.content,
        "embedding_preview": preview(question_embedding),
        "embedding_dimension": len(question_embedding),
        "sources": [
            {"title": hit.payload["title"], "score": round(hit.score, 4)}
            for hit in hits
        ],
    }

