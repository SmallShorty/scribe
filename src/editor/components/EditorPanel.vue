<template>
  <div class="panel editor-panel">
    <div class="panel-header">
      <span class="panel-label">Ответ</span>
      <span class="char-counter">{{ replyText.length }}</span>
    </div>

    <div class="panel-body">
      <n-input
        v-model:value="replyText"
        type="textarea"
        placeholder="Введите текст ответа…"
        class="reply-input"
        :resizable="false"
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
        Отправить в VK
      </n-button>

      <span class="hint">Ctrl+Enter</span>

      <transition name="fade">
        <span v-if="statusMsg" :class="['status', statusType]">{{ statusMsg }}</span>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, type Component } from 'vue'
import { NButton, NIcon, NInput } from 'naive-ui'
import { useMessageStore } from '../stores/message'
import type { MessageAction, MessageResponse } from '../../types/messages'

const store = useMessageStore()

const replyText = ref('')
const sending = ref(false)
const statusMsg = ref('')
const statusType = ref<'success' | 'error'>('success')
let statusTimer: ReturnType<typeof setTimeout> | undefined

const IconSend: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '1em', height: '1em' }, [
    h('path', { d: 'M5.739 15.754q-1.029 2.782-1.293 3.91c-.553 2.362-.956 2.894 1.107 1.771 2.062-1.122 12.046-6.683 14.274-7.919 2.904-1.611 2.942-1.485-.156-3.196-2.36-1.302-12.227-6.718-14.118-7.782-1.892-1.063-1.66-.59-1.107 1.772q.268 1.142 1.311 3.944a4 4 0 0 0 2.988 2.531l5.765 1.117a.1.1 0 0 1 0 .196l-5.778 1.116a4 4 0 0 0-2.993 2.54' }),
  ])

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    sendReply()
  }
}

function setStatus(msg: string, type: 'success' | 'error') {
  statusMsg.value = msg
  statusType.value = type
  clearTimeout(statusTimer)
  statusTimer = setTimeout(() => { statusMsg.value = '' }, 3000)
}

async function sendReply() {
  const text = replyText.value.trim()
  if (!text || !store.vkTabId || sending.value) return

  sending.value = true
  try {
    const msg: MessageAction = { action: 'sendReply', text, vkTabId: store.vkTabId }
    const response = await new Promise<MessageResponse>((resolve, reject) => {
      chrome.runtime.sendMessage(msg, (res: MessageResponse) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(res)
        }
      })
    })
    if (response?.success) {
      setStatus('Отправлено!', 'success')
      replyText.value = ''
    } else {
      setStatus(response?.error ?? 'Ошибка отправки', 'error')
    }
  } catch (err) {
    setStatus(err instanceof Error ? err.message : 'Ошибка', 'error')
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #1e1e26;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #2a2a30;
  flex-shrink: 0;
}

.panel-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #7c7c8a;
}

.char-counter {
  font-size: 11px;
  color: #56565e;
  font-variant-numeric: tabular-nums;
}

.panel-body {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reply-input {
  flex: 1;
  height: 100%;
}

/* Растягиваем textarea на всю высоту панели */
.reply-input :deep(.n-input) {
  height: 100%;
}

.reply-input :deep(.n-input__textarea-el) {
  height: 100% !important;
  resize: none !important;
}

.panel-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #2a2a30;
  flex-shrink: 0;
}

.hint {
  font-size: 11px;
  color: #46464e;
}

.status {
  margin-left: auto;
  font-size: 13px;
}

.status.success {
  color: #63e2b7;
}

.status.error {
  color: #e07070;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
