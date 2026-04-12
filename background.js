// Background service worker for Scribe extension

// messageId -> tabId of the opened message-view tab
const openedTabs = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openMessageTab") {
    const vkTabId = sender.tab?.id;
    console.log("[Scribe BG] openMessageTab, vkTabId:", vkTabId);
    if (!vkTabId) {
      console.error("[Scribe BG] sender.tab.id is missing");
      sendResponse({ success: false, error: "no tab id" });
      return true;
    }
    openMessageTab(request.text, vkTabId);
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "sendReply") {
    chrome.tabs.sendMessage(
      request.vkTabId,
      { action: "injectReply", text: request.text },
      (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          // Switch focus back to the VK conversation tab
          chrome.tabs.update(request.vkTabId, { active: true });
          sendResponse(response);
        }
      }
    );
    return true; // async response
  }
});

function openMessageTab(messageText, vkTabId) {
  const messageId = generateMessageId(messageText);

  if (openedTabs.has(messageId)) {
    const tabId = openedTabs.get(messageId);
    chrome.tabs.update(tabId, { active: true }, () => {
      if (chrome.runtime.lastError) {
        // Tab was closed — open a new one
        openedTabs.delete(messageId);
        createNewTab(messageText, messageId, vkTabId);
      }
    });
  } else {
    createNewTab(messageText, messageId, vkTabId);
  }
}

function createNewTab(messageText, messageId, vkTabId) {
  const params = new URLSearchParams({
    text: messageText,
    vkTabId: String(vkTabId),
  });
  const url = `${chrome.runtime.getURL("message-view.html")}?${params}`;

  chrome.tabs.create({ url, active: true }, (tab) => {
    if (!tab.id) return;

    openedTabs.set(messageId, tab.id);

    chrome.tabs.onRemoved.addListener(function listener(tabId) {
      if (tabId === tab.id) {
        openedTabs.delete(messageId);
        chrome.tabs.onRemoved.removeListener(listener);
      }
    });
  });
}

function generateMessageId(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// Periodically clean up tabs that were closed without triggering onRemoved
setInterval(() => {
  chrome.tabs.query({}, (tabs) => {
    const openTabIds = new Set(tabs.map((tab) => tab.id));
    for (const [messageId, tabId] of openedTabs.entries()) {
      if (!openTabIds.has(tabId)) {
        openedTabs.delete(messageId);
      }
    }
  });
}, 30000);
