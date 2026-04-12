// Content script: вставляет кнопку Scribe в панель действий сообщений vk.com

const BTN_CLASS = 'scribe-action-btn'
const WRAPPER_SELECTOR = '.MessageActionsButtonWrapper'

const MESSAGE_SELECTORS = [
  '.ConvoHistory__messageBlock',
  '.ConvoHistory__message',
  '[class*="ConvoHistory__message"]',
  '[class*="ConvoMessage"]',
]

const TEXT_SELECTORS = [
  '.MessageText',
  '[class*="MessageText"]',
  '[class*="message__text" i]',
]

// --- Tooltip ---
// Один общий tooltip на body с position:fixed — не обрезается родительским overflow

const tooltip = document.createElement('div')
tooltip.className = 'scribe-tooltip'
tooltip.innerHTML = 'Открыть в Scribe<span class="scribe-tooltip-arrow"></span>'

function injectStyles() {
  const style = document.createElement('style')
  style.textContent = `
    .scribe-tooltip {
      background: #000000e0;
      border-radius: 4px;
      color: #fff;
      font-size: 12.5px;
      padding: 4.5px 9px;
      position: fixed;
      white-space: nowrap;
      z-index: 99999;
      pointer-events: none;
      display: none;
      transform: translateX(-50%);
    }
    .scribe-tooltip-arrow {
      border-top: 5px solid #000000e0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      display: block;
    }
  `
  document.head.appendChild(style)
  document.body.appendChild(tooltip)
}

function showTooltip(anchor: HTMLElement) {
  tooltip.style.display = 'block'
  const rect = anchor.getBoundingClientRect()
  const h = tooltip.offsetHeight
  tooltip.style.left = `${rect.left + rect.width / 2}px`
  tooltip.style.top = `${rect.top - h - 8}px`
}

function hideTooltip() {
  tooltip.style.display = 'none'
}

// --- Поиск элементов ---

function findMessageBlock(el: Element): Element | null {
  for (const sel of MESSAGE_SELECTORS) {
    const found = el.closest(sel)
    if (found) return found
  }
  return null
}

function findText(root: Element): string {
  for (const sel of TEXT_SELECTORS) {
    const el = root.querySelector(sel)
    if (el?.textContent?.trim()) return el.textContent.trim()
  }
  return ''
}

// --- Вставка кнопки ---

function processWrapper(wrapper: Element) {
  if (wrapper.querySelector(`.${BTN_CLASS}`)) return

  const dropdownWrapper = document.createElement('div')
  dropdownWrapper.className = 'MessageActionsDropdownWrapper'

  const btn = document.createElement('button')
  btn.className = `MessageActionsButton ${BTN_CLASS}`
  btn.setAttribute('aria-label', 'Открыть в Scribe')
  btn.setAttribute('type', 'button')
  btn.innerHTML = `<svg aria-hidden="true" display="block" width="16" height="16" viewBox="0 0 16 16" fill="none" style="width:16px;height:16px">
    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
      d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM4 5.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 5.75ZM4.75 8a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM4 11.25a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z"/>
  </svg>`

  btn.addEventListener('mouseenter', () => showTooltip(btn))
  btn.addEventListener('mouseleave', hideTooltip)

  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    btn.blur()
    hideTooltip()
    const msgBlock = findMessageBlock(btn)
    const text = msgBlock ? findText(msgBlock) : ''
    sendOpenTabMessage(text)
  })

  dropdownWrapper.appendChild(btn)
  wrapper.insertBefore(dropdownWrapper, wrapper.firstChild)
}

function processExisting() {
  document.querySelectorAll(WRAPPER_SELECTOR).forEach(processWrapper)
}

// --- Observers ---

function observeDOM() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue
        const el = node as Element
        if (el.matches(WRAPPER_SELECTOR)) {
          processWrapper(el)
        } else {
          el.querySelectorAll(WRAPPER_SELECTOR).forEach(processWrapper)
        }
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function onMouseOver(e: MouseEvent) {
  const msgBlock = findMessageBlock(e.target as Element)
  if (!msgBlock) return
  const wrapper = msgBlock.querySelector(WRAPPER_SELECTOR)
  if (wrapper) processWrapper(wrapper)
}

// --- Chrome messaging ---

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

// --- Init ---

listenForInjectRequests()

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectStyles()
    processExisting()
    observeDOM()
    document.addEventListener('mouseover', onMouseOver, true)
  })
} else {
  injectStyles()
  processExisting()
  observeDOM()
  document.addEventListener('mouseover', onMouseOver, true)
}
