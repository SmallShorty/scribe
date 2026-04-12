import type { MessageAction, MessageResponse } from '../types/messages'

// messageId → tabId открытой вкладки редактора
const openedTabs = new Map<string, number>()

chrome.runtime.onMessage.addListener((
  request: MessageAction,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void,
) => {
  if (request.action === 'openMessageTab') {
    const vkTabId = sender.tab?.id
    if (!vkTabId) {
      sendResponse({ success: false, error: 'no tab id' })
      return true
    }
    openMessageTab(request.text, vkTabId)
    sendResponse({ success: true })
    return true
  }

  if (request.action === 'sendReply') {
    chrome.tabs.sendMessage(
      request.vkTabId,
      { action: 'injectReply', text: request.text } satisfies MessageAction,
      (response: MessageResponse) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message })
        } else {
          chrome.tabs.update(request.vkTabId, { active: true })
          sendResponse(response)
        }
      },
    )
    return true
  }

  return false
})

function openMessageTab(messageText: string, vkTabId: number) {
  const messageId = hashText(messageText)

  if (openedTabs.has(messageId)) {
    const tabId = openedTabs.get(messageId)!
    chrome.tabs.update(tabId, { active: true }, () => {
      if (chrome.runtime.lastError) {
        openedTabs.delete(messageId)
        createNewTab(messageText, messageId, vkTabId)
      }
    })
  } else {
    createNewTab(messageText, messageId, vkTabId)
  }
}

function createNewTab(messageText: string, messageId: string, vkTabId: number) {
  const params = new URLSearchParams({ text: messageText, vkTabId: String(vkTabId) })
  const url = `${chrome.runtime.getURL('src/editor/index.html')}?${params}`

  chrome.tabs.create({ url, active: true }, (tab) => {
    if (!tab.id) return
    openedTabs.set(messageId, tab.id)

    chrome.tabs.onRemoved.addListener(function listener(tabId) {
      if (tabId === tab.id) {
        openedTabs.delete(messageId)
        chrome.tabs.onRemoved.removeListener(listener)
      }
    })
  })
}

function hashText(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash.toString()
}

// Периодически очищаем закрытые вкладки, которые не вызвали onRemoved
setInterval(() => {
  chrome.tabs.query({}, (tabs) => {
    const openTabIds = new Set(tabs.map(t => t.id))
    for (const [id, tabId] of openedTabs) {
      if (!openTabIds.has(tabId)) openedTabs.delete(id)
    }
  })
}, 30_000)
