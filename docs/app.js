const pages = [...document.querySelectorAll("main > .hero, main > .content-section")];
const pageLinks = [...document.querySelectorAll('a[href^="#"]')];
const previousPage = document.querySelector("#previousPage");
const nextPage = document.querySelector("#nextPage");
const currentPage = document.querySelector("#currentPage");
const totalPages = document.querySelector("#totalPages");
const currentPageTitle = document.querySelector("#currentPageTitle");
let activePage = 0;

function getPageTitle(page) {
  return page.querySelector("h1, h2")?.textContent.trim().replace(/\s+/g, " ") || "RAG Orange Lab";
}

function showPage(index, updateHistory = true) {
  activePage = Math.max(0, Math.min(index, pages.length - 1));
  pages.forEach((page, pageIndex) => {
    const active = pageIndex === activePage;
    page.hidden = !active;
    page.classList.toggle("active-page", active);
    page.setAttribute("aria-hidden", String(!active));
  });

  const page = pages[activePage];
  currentPage.textContent = activePage + 1;
  totalPages.textContent = pages.length;
  currentPageTitle.textContent = getPageTitle(page);
  previousPage.disabled = activePage === 0;
  nextPage.disabled = activePage === pages.length - 1;
  document.querySelectorAll(".sidebar nav a").forEach((link) => {
    link.classList.toggle("active", link.hash === `#${page.id}`);
  });

  if (updateHistory && location.hash !== `#${page.id}`) {
    history.pushState(null, "", `#${page.id}`);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
}

pageLinks.forEach((link) => {
  const index = pages.findIndex((page) => `#${page.id}` === link.hash);
  if (index < 0) return;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(index);
  });
});

previousPage.addEventListener("click", () => showPage(activePage - 1));
nextPage.addEventListener("click", () => showPage(activePage + 1));
window.addEventListener("popstate", () => {
  const index = pages.findIndex((page) => `#${page.id}` === location.hash);
  showPage(index < 0 ? 0 : index, false);
});
window.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select, button, [contenteditable]")) return;
  if (event.key === "ArrowLeft") showPage(activePage - 1);
  if (event.key === "ArrowRight") showPage(activePage + 1);
});

document.body.classList.add("page-mode");
history.replaceState(null, "", "#intro");
showPage(0, false);

const completeButtons = [...document.querySelectorAll("[data-complete]")];
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
let savedSteps = new Set();
try {
  savedSteps = new Set(JSON.parse(localStorage.getItem("rag-steps") || "[]"));
} catch {
  savedSteps = new Set();
}

function renderProgress() {
  completeButtons.forEach((button) => {
    const done = savedSteps.has(button.dataset.complete);
    button.classList.toggle("done", done);
    button.textContent = done ? "✓ 완료됨" : "✓ 이 단계 완료";
  });
  progressText.textContent = `${savedSteps.size} / ${completeButtons.length}`;
  progressBar.style.width = `${(savedSteps.size / completeButtons.length) * 100}%`;
  try {
    localStorage.setItem("rag-steps", JSON.stringify([...savedSteps]));
  } catch {
    // Progress still works for this visit when storage is unavailable.
  }
}

completeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const step = button.dataset.complete;
    savedSteps.has(step) ? savedSteps.delete(step) : savedSteps.add(step);
    renderProgress();
  });
});
renderProgress();

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".code-card").querySelector("code").textContent;
    await navigator.clipboard.writeText(code);
    button.textContent = "복사됨 ✓";
    setTimeout(() => (button.textContent = "복사"), 1200);
  });
});

const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const messages = document.querySelector("#chatMessages");
const submitButton = form.querySelector("button");

function addMessage(role, text, sources = []) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  const label = document.createElement("span");
  label.textContent = role === "user" ? "YOU" : "BOT";
  const body = document.createElement("p");
  body.textContent = text;
  message.append(label, body);

  if (sources.length) {
    const sourceList = document.createElement("div");
    sourceList.className = "sources";
    sources.forEach((source) => {
      const item = document.createElement("small");
      item.textContent = `${source.title} · 유사도 ${source.score.toFixed(4)}`;
      sourceList.append(item);
    });
    message.append(sourceList);
  }
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;

  addMessage("user", question);
  input.value = "";
  submitButton.disabled = true;
  const loading = addMessage("bot loading", "로컬 모델이 문서를 검색하고 답변을 만드는 중입니다…");

  try {
    const apiUrl = location.port === "8000" ? "/api/chat" : "http://127.0.0.1:8000/api/chat";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const body = await response.text();
    if (!body) throw new Error("챗봇 서버가 빈 응답을 보냈습니다. server.py를 다시 실행하세요.");
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      throw new Error("챗봇 API 대신 다른 웹 서버에 연결되었습니다. http://127.0.0.1:8000에서 접속하세요.");
    }
    if (!response.ok) throw new Error(data.error || "답변을 가져오지 못했습니다.");
    loading.remove();
    addMessage("bot", data.answer, data.sources);
  } catch (error) {
    loading.remove();
    addMessage("bot", `오류: ${error.message} server.py와 Qdrant 실행 상태를 확인하세요.`);
  } finally {
    submitButton.disabled = false;
    input.focus();
  }
});

document.querySelectorAll(".suggestions button").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.textContent;
    input.focus();
  });
});
