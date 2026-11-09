# RAG Orange Lab

Ollama의 `bge-m3`로 문서와 질문을 임베딩하고, Qdrant에서 관련 문서를 검색한 뒤 `qwen3:8b`가 답변하는 교육용 웹사이트입니다.

## 구성

```text
knowledge/joonbu_lion_survival.md  실습용 지식 문서
steps/                        단계별 실습 코드
docs/                         주황색 교육용 웹사이트
server.py                     웹사이트와 로컬 챗봇 API 실행
rag.py                        전체 흐름을 합친 완성본
compose.yaml                  Qdrant 서버 구성
```

지식 문서는 비공식 실습 자료입니다. 실제 학사 규정과 일정은 학교의 최신 공식 안내를 확인하세요.

## 실행

PowerShell에서 현재 폴더를 연 뒤 실행합니다.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
ollama pull bge-m3
ollama pull qwen3:8b
ollama list
docker pull qdrant/qdrant:v1.20.0
docker compose up -d
.\.venv\Scripts\python.exe steps\store_knowledge.py
.\.venv\Scripts\python.exe server.py
```

- `ollama pull bge-m3`: 문서와 질문을 벡터로 바꾸는 임베딩 모델 설치
- `ollama pull qwen3:8b`: 검색 문서를 근거로 답변하는 생성 모델 설치
- `ollama list`: 두 모델이 설치됐는지 확인
- `docker pull`: Qdrant 서버 이미지 설치
- `pip install -r requirements.txt`: Python용 `qdrant-client` 설치

브라우저에서 아래 주소를 엽니다.

- 교육용 웹사이트와 챗봇: <http://127.0.0.1:8000>
- Qdrant 대시보드: <http://localhost:6333/dashboard>

`docs/index.html`을 파일로 직접 열면 설명은 볼 수 있지만 챗봇은 동작하지 않습니다. 챗봇까지 사용하려면 `server.py`를 실행해야 합니다.

### 챗봇이 JSON 오류를 표시할 때

`Unexpected end of JSON input`이 보이면 챗봇 서버가 꺼졌거나 정적 미리보기 서버로 요청이 전달된 상태입니다. 아래 명령으로 `server.py`를 실행한 뒤 페이지를 새로고침합니다.

```powershell
.\.venv\Scripts\python.exe server.py
```

VS Code Live Server처럼 다른 로컬 포트에서 페이지를 열어도 챗봇 요청은 자동으로 `http://127.0.0.1:8000/api/chat`을 사용합니다.

## 단계별 실행

```powershell
.\.venv\Scripts\python.exe steps\check_db.py
.\.venv\Scripts\python.exe steps\store_knowledge.py
.\.venv\Scripts\python.exe steps\embed_question.py "과제를 놓치지 않으려면?"
.\.venv\Scripts\python.exe steps\search_similar.py "과제를 놓치지 않으려면?"
.\.venv\Scripts\python.exe steps\generate_answer.py "과제를 놓치지 않으려면?"
```

문서를 수정했다면 `store_knowledge.py`를 다시 실행합니다. 이 명령은 이 실습의 `jungbu_survival` 컬렉션만 새로 만듭니다.

## 수업에서 확인할 지점

1. `check_db.py`: Qdrant 서버와 컬렉션 확인
2. `store_knowledge.py`: 문서 분할 → 임베딩 → Qdrant 저장
3. `embed_question.py`: 질문을 1,024차원 벡터로 변환
4. `search_similar.py`: 코사인 유사도 기준 Top 3 검색
5. `generate_answer.py`: 검색 문서와 질문을 LLM에 전달
6. 웹사이트의 챗봇: 전체 과정을 한 화면에서 실행

검색 결과의 코사인 유사도가 클수록 질문과 더 가깝습니다. 질문을 바꿔 검색 문서와 최종 답변이 함께 변하는지 확인해 보세요.

## 코드 확인

```powershell
.\.venv\Scripts\python.exe -m unittest -v
```
