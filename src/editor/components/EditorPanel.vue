<template>
  <div class="panel editor-panel">
    <div class="panel-header">
      <span class="panel-label">Рабочая область</span>
    </div>

    <div class="panel-body">
      <div
        ref="editorEl"
        class="reply-editor"
        contenteditable="true"
        spellcheck="true"
        :data-placeholder="'Введите текст ответа…'"
        @input="onInput"
        @paste.prevent="onPaste"
        @keydown="onKeydown"
      />
    </div>

    <div class="panel-footer">
      <n-button
        type="primary"
        :loading="sending"
        :disabled="!replyText.trim() || !store.vkTabId"
        @click="sendReply"
      >
        <template #icon>
          <n-icon :component="IconSend" />
        </template>
        Отправить в VK{{ messageCount > 1 ? ` (${messageCount})` : '' }}
      </n-button>

      <span class="hint">Ctrl+Enter</span>

      <transition name="fade">
        <span v-if="statusMsg" :class="['status', statusType]">{{ statusMsg }}</span>
      </transition>

      <div class="footer-right">
        <div v-if="messageCount > 1" class="delay-settings">
          <n-switch v-model:value="delayEnabled" size="small" />
          <span class="delay-label">пауза</span>
          <template v-if="delayEnabled">
            <n-input-number
              v-model:value="delaySec"
              :min="1"
              :max="30"
              :show-button="false"
              size="small"
              class="delay-input"
            />
            <span class="delay-unit">с</span>
          </template>
        </div>

        <div class="stats">
          <span class="stat">{{ replyText.length }}&nbsp;симв.</span>
          <span class="stat">{{ replyWordCount }}&nbsp;слов</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h, type Component } from 'vue'
import { NButton, NIcon, NSwitch, NInputNumber } from 'naive-ui'
import { useMessageStore } from '../stores/message'
import type { MessageAction, MessageResponse } from '../../types/messages'

const store = useMessageStore()

// --- Editor state ---

const editorEl = ref<HTMLDivElement | null>(null)
const replyText = ref('')
const replyWordCount = computed(() => {
  const t = replyText.value.trim()
  return t ? t.split(/\s+/).length : 0
})

onMounted(() => editorEl.value?.focus())

// --- VK limit & multi-message ---

const VK_LIMIT = 4096
const messageCount = computed(() => Math.max(1, Math.ceil(replyText.value.length / VK_LIMIT)))

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += VK_LIMIT) chunks.push(text.slice(i, i + VK_LIMIT))
  return chunks.length ? chunks : [text]
}

// --- DOM ↔ plain text ---
// Structure we maintain: text nodes + <br> (newlines) + .msg-sep divs (separators).
// white-space: pre-wrap makes Enter insert <br>; paste is intercepted to keep structure clean.

function extractText(el: HTMLElement): string {
  let text = ''
  for (const node of el.childNodes) {
    if (node instanceof Element) {
      if (node.hasAttribute('data-separator')) continue
      if (node.tagName === 'BR') { text += '\n'; continue }
    }
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? ''
  }
  return text
}

function buildHTML(text: string): string {
  function escape(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
  }
  const count = Math.max(1, Math.ceil(text.length / VK_LIMIT))
  return Array.from({ length: count }, (_, i) => {
    const chunk = escape(text.slice(i * VK_LIMIT, (i + 1) * VK_LIMIT))
    return i === 0 ? chunk : `<div class="msg-sep" contenteditable="false" data-separator>сообщение ${i + 1}</div>${chunk}`
  }).join('')
}

// --- Cursor save/restore (char offset in plain text, skipping separators) ---

function saveCaretOffset(el: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel?.rangeCount) return 0
  const { endContainer, endOffset } = sel.getRangeAt(0)
  let count = 0
  for (const node of el.childNodes) {
    if (node instanceof Element && node.hasAttribute('data-separator')) continue
    if (node === endContainer) { count += endOffset; break }
    if (node.nodeType === Node.TEXT_NODE) {
      if (node === endContainer) { count += endOffset; break }
      count += (node as Text).length
    } else if (node instanceof Element && node.tagName === 'BR') {
      count++
    }
  }
  return count
}

function restoreCaretOffset(el: HTMLElement, target: number) {
  const sel = window.getSelection()
  if (!sel) return
  let remaining = target
  for (const node of el.childNodes) {
    if (node instanceof Element && node.hasAttribute('data-separator')) continue
    if (node.nodeType === Node.TEXT_NODE) {
      const len = (node as Text).length
      if (remaining <= len) {
        const r = document.createRange()
        r.setStart(node, remaining)
        r.collapse(true)
        sel.removeAllRanges()
        sel.addRange(r)
        return
      }
      remaining -= len
    } else if (node instanceof Element && node.tagName === 'BR') {
      if (remaining === 0) {
        const r = document.createRange()
        r.setStartBefore(node)
        r.collapse(true)
        sel.removeAllRanges()
        sel.addRange(r)
        return
      }
      remaining--
    }
  }
  const r = document.createRange()
  r.selectNodeContents(el)
  r.collapse(false)
  sel.removeAllRanges()
  sel.addRange(r)
}

// --- Input handling ---

let prevMsgCount = 1

function onInput() {
  const el = editorEl.value
  if (!el) return
  const text = extractText(el)
  replyText.value = text
  const newCount = Math.max(1, Math.ceil(text.length / VK_LIMIT))
  if (newCount !== prevMsgCount) {
    const offset = saveCaretOffset(el)
    prevMsgCount = newCount
    el.innerHTML = buildHTML(text)
    restoreCaretOffset(el, offset)
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text/plain') ?? ''
  document.execCommand('insertText', false, text)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    sendReply()
  }
}

// --- Delay settings ---

const delayEnabled = ref(localStorage.getItem('scribe:delayEnabled') !== 'false')
const delaySec = ref(Number(localStorage.getItem('scribe:delaySec')) || 3)

watch(delayEnabled, v => localStorage.setItem('scribe:delayEnabled', String(v)))
watch(delaySec, v => localStorage.setItem('scribe:delaySec', String(v)))

// --- Send ---

const sending = ref(false)
const statusMsg = ref('')
const statusType = ref<'success' | 'error'>('success')
let statusTimer: ReturnType<typeof setTimeout> | undefined

function setStatus(msg: string, type: 'success' | 'error') {
  statusMsg.value = msg
  statusType.value = type
  clearTimeout(statusTimer)
  statusTimer = setTimeout(() => { statusMsg.value = '' }, 3000)
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

async function sendOne(text: string): Promise<MessageResponse> {
  const msg: MessageAction = { action: 'sendReply', text, vkTabId: store.vkTabId }
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (res: MessageResponse) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message))
      else resolve(res)
    })
  })
}

async function sendReply() {
  const text = replyText.value.trim()
  if (!text || !store.vkTabId || sending.value) return

  const chunks = splitIntoChunks(text)
  sending.value = true

  try {
    for (let i = 0; i < chunks.length; i++) {
      if (i > 0) {
        if (delayEnabled.value) {
          setStatus(`Пауза перед ${i + 1}/${chunks.length}…`, 'success')
          await sleep(delaySec.value * 1000)
        } else {
          setStatus(`Отправка ${i + 1}/${chunks.length}…`, 'success')
        }
      }
      const response = await sendOne(chunks[i])
      if (!response?.success) {
        setStatus(response?.error ?? 'Ошибка отправки', 'error')
        return
      }
    }
    setStatus(chunks.length > 1 ? `Отправлено ${chunks.length} сообщения` : 'Отправлено!', 'success')
    replyText.value = ''
    prevMsgCount = 1
    if (editorEl.value) editorEl.value.innerHTML = ''
  } catch (err) {
    setStatus(err instanceof Error ? err.message : 'Ошибка', 'error')
  } finally {
    sending.value = false
  }
}

// --- Icon ---

const IconSend: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '1em', height: '1em' }, [
    h('path', { d: 'M5.739 15.754q-1.029 2.782-1.293 3.91c-.553 2.362-.956 2.894 1.107 1.771 2.062-1.122 12.046-6.683 14.274-7.919 2.904-1.611 2.942-1.485-.156-3.196-2.36-1.302-12.227-6.718-14.118-7.782-1.892-1.063-1.66-.59-1.107 1.772q.268 1.142 1.311 3.944a4 4 0 0 0 2.988 2.531l5.765 1.117a.1.1 0 0 1 0 .196l-5.778 1.116a4 4 0 0 0-2.993 2.54' }),
  ])
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as v;
@use '@/styles/mixins' as m;

.panel {
  @include m.panel-base;
  background: v.$bg-panel;
  transition: background-color 0.2s ease;
}

.panel-header {
  @include m.panel-header;
}

.panel-label {
  @include m.panel-label;
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reply-editor {
  flex: 1;
  min-height: 0;
  padding: v.$gap-lg;
  overflow-y: auto;
  color: v.$text;
  font-family: v.$font-ui;
  font-size: v.$font-body;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  outline: none;
  caret-color: v.$caret;
  transition: color 0.2s ease, caret-color 0.2s ease;

  &:empty::before {
    content: attr(data-placeholder);
    color: v.$placeholder;
    pointer-events: none;
  }

  :deep(.msg-sep) {
    display: block;
    border-top: 1px dashed v.$warn;
    margin: 4px 0;
    font-size: 10px;
    color: v.$warn;
    text-align: right;
    user-select: none;
    cursor: default;
    line-height: 1.6;
    transition: color 0.2s ease, border-color 0.2s ease;
  }
}

.panel-footer {
  display: flex;
  align-items: center;
  gap: v.$gap-md;
  padding: v.$gap-md v.$gap-lg;
  border-top: 1px solid v.$border;
  flex-shrink: 0;
  transition: border-color 0.2s ease;
}

.hint {
  font-size: v.$font-label;
  color: v.$text-dim;
}

.footer-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: v.$gap-lg;
}

.delay-settings {
  display: flex;
  align-items: center;
  gap: v.$gap-xs;
}

.delay-label,
.delay-unit {
  font-size: v.$font-label;
  color: v.$text-dim;
  transition: color 0.2s ease;
}

.delay-input {
  width: 48px;
}

.stats {
  display: flex;
  gap: v.$gap-md;
}

.stat {
  font-size: v.$font-label;
  color: v.$text-dim;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
}

.status {
  font-size: v.$font-hint;

  &.success { color: v.$status-ok; }
  &.error   { color: v.$status-err; }
}

.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }
</style>
