<template>
  <div
    ref="editorEl"
    class="reply-editor"
    contenteditable="true"
    spellcheck="true"
    :data-placeholder="placeholder"
    @input="onInput"
    @paste.prevent="onPaste"
    @keydown="onKeydown"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { VK_LIMIT } from '../../constants'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: 'Введите текст ответа…',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
}>()

const editorEl = ref<HTMLDivElement | null>(null)

onMounted(() => editorEl.value?.focus())

// --- DOM ↔ plain text ---

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

// --- Cursor save/restore ---

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

// --- Input & keyboard ---

let prevMsgCount = 1

function onInput() {
  const el = editorEl.value
  if (!el) return
  const text = extractText(el)
  emit('update:modelValue', text)
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
    emit('submit')
  }
}

// --- Sync from outside (cleared after send) ---

watch(() => props.modelValue, (newVal) => {
  const el = editorEl.value
  if (!el) return
  const currentText = extractText(el)
  if (newVal !== currentText) {
    el.innerHTML = newVal ? buildHTML(newVal) : ''
    prevMsgCount = newVal ? Math.max(1, Math.ceil(newVal.length / VK_LIMIT)) : 1
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as v;

.reply-editor {
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
</style>
