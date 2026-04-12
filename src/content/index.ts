// Content script: добавляет иконку Scribe к сообщениям на vk.com при наведении

const ICON_CLASS = 'scribe-icon'
const MESSAGE_SELECTOR = '.ConvoHistory__messageBlock'
const TEXT_SELECTOR = '.MessageText'

function init() {
  addIconsToExisting()
  observeNewMessages()
  setupHoverListeners()
  listenForInjectRequests()
}

function observeNewMessages() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue
        const el = node as Element
        if (el.matches(MESSAGE_SELECTOR)) addIconToMessage(el)
        el.querySelectorAll(MESSAGE_SELECTOR).forEach(addIconToMessage)
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function addIconsToExisting() {
  document.querySelectorAll(MESSAGE_SELECTOR).forEach(addIconToMessage)
}

function addIconToMessage(el: Element) {
  if (el.querySelector(`.${ICON_CLASS}`)) return
  const textEl = el.querySelector(TEXT_SELECTOR)
  if (!textEl) return

  const icon = createIcon()
  icon.addEventListener('click', (e) => {
    e.stopPropagation()
    sendOpenTabMessage(textEl.textContent ?? '')
  })

  ;(el as HTMLElement).style.position = 'relative'
  el.appendChild(icon)
}

function createIcon(): HTMLElement {
  const icon = document.createElement('div')
  icon.className = ICON_CLASS
  icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" rx="3" fill="#4A76A8"/>
    <path d="M4 5H12V11H4V5Z" fill="white"/>
    <path d="M6 7H10V9H6V7Z" fill="#4A76A8"/>
  </svg>`
  icon.style.cssText = [
    'position:absolute',
    'top:50%',
    'right:48px',
    'transform:translateY(-50%)',
    'opacity:0',
    'transition:opacity 0.2s',
    'cursor:pointer',
    'z-index:1000',
    'background:white',
    'border-radius:3px',
    'padding:2px',
    'box-shadow:0 1px 3px rgba(0,0,0,.2)',
  ].join(';')
  return icon
}

function setupHoverListeners() {
  document.addEventListener('mouseover', (e) => {
    const msg = (e.target as Element).closest(MESSAGE_SELECTOR)
    if (msg) {
      const icon = msg.querySelector<HTMLElement>(`.${ICON_CLASS}`)
      if (icon) icon.style.opacity = '1'
    }
  })

  document.addEventListener('mouseout', (e) => {
    const msg = (e.target as Element).closest(MESSAGE_SELECTOR)
    if (msg && !msg.contains((e as MouseEvent).relatedTarget as Node)) {
      const icon = msg.querySelector<HTMLElement>(`.${ICON_CLASS}`)
      if (icon) icon.style.opacity = '0'
    }
  })
}

function sendOpenTabMessage(text: string) {
  try {
    chrome.runtime.sendMessage({ action: 'openMessageTab', text }, (_res) => {
      if (chrome.runtime.lastError) {
        console.error('[Scribe]', chrome.runtime.lastError.message)
      }
    })
  } catch {
    console.warn('[Scribe] Extension context invalidated — refresh the page (F5).')
  }
}

function listenForInjectRequests() {
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'injectReply') {
      sendResponse({ success: injectReply(request.text as string) })
    }
    return true
  })
}

function injectReply(text: string): boolean {
  const composer = document.querySelector<HTMLElement>('span.ComposerInput__input')
  if (!composer) return false

  composer.focus()

  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(composer)
  selection?.removeAllRanges()
  selection?.addRange(range)

  // VK использует React, поэтому нужен ClipboardEvent с DataTransfer
  const dt = new DataTransfer()
  dt.setData('text/plain', text)
  composer.dispatchEvent(new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: dt,
  }))

  setTimeout(() => {
    document.querySelector<HTMLElement>('.ConvoComposer__sendButton--submit')?.click()
  }, 150)

  return true
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
