// message-view.js — runs in the extension page context, has access to chrome.runtime

const params = new URLSearchParams(window.location.search);
const messageText = params.get("text") || "";
const vkTabId = parseInt(params.get("vkTabId") || "0", 10);

const messageContent = document.getElementById("messageContent");
const replyTextarea = document.getElementById("replyText");
const sendButton = document.getElementById("sendButton");
const copyButton = document.getElementById("copyButton");
const notification = document.getElementById("notification");
const statusText = document.getElementById("statusText");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const timestamp = document.getElementById("timestamp");

// Populate message display (textContent is safe — no XSS)
messageContent.textContent = messageText;
charCount.textContent = messageText.length;
wordCount.textContent = messageText.trim().split(/\s+/).filter((w) => w.length > 0).length;
timestamp.textContent = new Date().toLocaleString("ru");

// Copy to clipboard
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(messageText);
    showNotification("Скопировано!");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = messageText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showNotification("Скопировано!");
  }
});

// Send reply to VK
sendButton.addEventListener("click", async () => {
  const text = replyTextarea.value.trim();
  if (!text) {
    setStatus("Введите текст сообщения", "error");
    return;
  }

  if (!vkTabId) {
    setStatus("Вкладка VK не найдена — откройте диалог и попробуйте снова", "error");
    return;
  }

  sendButton.disabled = true;
  setStatus("Отправка...", "");

  try {
    const response = await chrome.runtime.sendMessage({
      action: "sendReply",
      text,
      vkTabId,
    });

    if (response?.success) {
      setStatus("Отправлено!", "success");
      replyTextarea.value = "";
    } else {
      setStatus(response?.error || "Ошибка отправки", "error");
    }
  } catch (err) {
    setStatus("Ошибка: " + err.message, "error");
  } finally {
    sendButton.disabled = false;
  }
});

// Ctrl+Enter в textarea отправляет
replyTextarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    sendButton.click();
  }
});

function setStatus(msg, type) {
  statusText.textContent = msg;
  statusText.className = "status-text" + (type ? " " + type : "");
}

function showNotification(msg, isError = false) {
  notification.textContent = msg;
  notification.className = "notification show" + (isError ? " error" : "");
  setTimeout(() => notification.classList.remove("show"), 2500);
}
