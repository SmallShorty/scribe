<template>
  <PanelShell>
    <template #label>Рабочая область</template>

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
        <DelaySettings v-if="messageCount > 1" ref="delayRef" />
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
import { NButton, NIcon } from 'naive-ui'
import PanelShell from './layout/PanelShell.vue'
import ReplyEditor from './editor/ReplyEditor.vue'
import DelaySettings from './editor/DelaySettings.vue'
import { useMessageStore } from '../stores/message'
import { useSendReply } from '../composables/useSendReply'
import { VK_LIMIT } from '../constants'

const store = useMessageStore()
const { sending, statusMsg, statusType, sendReply } = useSendReply()

const replyText = ref('')
const delayRef = ref<InstanceType<typeof DelaySettings>>()

const messageCount = computed(() => Math.max(1, Math.ceil(replyText.value.length / VK_LIMIT)))
const wordCount = computed(() => {
  const t = replyText.value.trim()
  return t ? t.split(/\s+/).length : 0
})

async function handleSend() {
  const success = await sendReply(replyText.value, {
    delayEnabled: delayRef.value?.enabled ?? false,
    delaySec: delayRef.value?.seconds ?? 3,
  })
  if (success) replyText.value = ''
}

const IconSend: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '1em', height: '1em' }, [
    h('path', { d: 'M5.739 15.754q-1.029 2.782-1.293 3.91c-.553 2.362-.956 2.894 1.107 1.771 2.062-1.122 12.046-6.683 14.274-7.919 2.904-1.611 2.942-1.485-.156-3.196-2.36-1.302-12.227-6.718-14.118-7.782-1.892-1.063-1.66-.59-1.107 1.772q.268 1.142 1.311 3.944a4 4 0 0 0 2.988 2.531l5.765 1.117a.1.1 0 0 1 0 .196l-5.778 1.116a4 4 0 0 0-2.993 2.54' }),
  ])
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as v;

.editor-body {
  flex: 1;
  min-height: 0;
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
