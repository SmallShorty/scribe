<template>
  <PanelShell>
    <template #label>Рабочая область</template>
    <template #actions>
      <n-button size="tiny" quaternary :disabled="!replyText" @click="copyText">
        <template #icon><n-icon :component="IconCopy" /></template>
        Копировать
      </n-button>
    </template>

    <ReplyEditor v-model="replyText" class="editor-body" @submit="handleSend" />

    <div class="panel-footer">
      <n-button
        type="primary"
        :loading="sending"
        :disabled="!replyText.trim() || !store.vkTabId"
        @click="handleSend"
      >
        <template #icon><n-icon :component="IconSend" /></template>
        Отправить в VK{{ messageCount > 1 ? ` (${messageCount})` : '' }}
      </n-button>

      <span class="hint">Ctrl+Enter</span>

      <transition name="fade">
        <span v-if="statusMsg" :class="['status', statusType]">{{ statusMsg }}</span>
      </transition>

      <div class="footer-right">
        <div class="stats">
          <span class="stat">{{ replyText.length }}&nbsp;симв.</span>
          <span class="stat">{{ wordCount }}&nbsp;слов</span>
        </div>
      </div>
    </div>
  </PanelShell>
</template>

<script setup lang="ts">
import { ref, computed, h, type Component } from 'vue'
import { NButton, NIcon, useMessage } from 'naive-ui'
import PanelShell from './layout/PanelShell.vue'
import ReplyEditor from './editor/ReplyEditor.vue'
import { useMessageStore } from '../stores/message'
import { useSendReply } from '../composables/useSendReply'
import { VK_LIMIT } from '../constants'

const store = useMessageStore()
const { sending, statusMsg, statusType, sendReply } = useSendReply()
const notify = useMessage()

const replyText = ref('')

const messageCount = computed(() => Math.max(1, Math.ceil(replyText.value.length / VK_LIMIT)))
const wordCount = computed(() => {
  const t = replyText.value.trim()
  return t ? t.split(/\s+/).length : 0
})

async function handleSend() {
  const success = await sendReply(replyText.value)
  if (success) replyText.value = ''
}

async function copyText() {
  try {
    await navigator.clipboard.writeText(replyText.value)
    notify.success('Скопировано!')
  } catch {
    notify.error('Ошибка копирования')
  }
}

const IconCopy: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '1em', height: '1em' }, [
    h('path', { d: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' }),
  ])

const IconSend: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '1em', height: '1em' }, [
    h('path', { d: 'M5.739 15.754q-1.029 2.782-1.293 3.91c-.553 2.362-.956 2.894 1.107 1.771 2.062-1.122 12.046-6.683 14.274-7.919 2.904-1.611 2.942-1.485-.156-3.196-2.36-1.302-12.227-6.718-14.118-7.782-1.892-1.063-1.66-.59-1.107 1.772q.268 1.142 1.311 3.944a4 4 0 0 0 2.988 2.531l5.765 1.117a.1.1 0 0 1 0 .196l-5.778 1.116a4 4 0 0 0-2.993 2.54' }),
  ])
</script>

<style lang="scss" scoped src="./EditorPanel.scss"></style>
