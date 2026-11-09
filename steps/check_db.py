from common import COLLECTION_NAME, QDRANT_URL, get_client


client = get_client()
try:
    collections = client.get_collections().collections
except Exception as error:
    raise SystemExit("Qdrant가 꺼져 있습니다. 먼저 'docker compose up -d'를 실행하세요.") from error

print(f"Qdrant 연결 성공: {QDRANT_URL}")
print("컬렉션:", [collection.name for collection in collections])

if client.collection_exists(COLLECTION_NAME):
    info = client.get_collection(COLLECTION_NAME)
    print(f"'{COLLECTION_NAME}' 포인트 수: {info.points_count}")
else:
    print(f"'{COLLECTION_NAME}' 컬렉션은 아직 없습니다.")

