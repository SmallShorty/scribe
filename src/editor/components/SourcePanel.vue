<template>
  <PanelShell variant="source">
    <template #label>Исходное сообщение</template>
    <template #actions>
      <n-button size="tiny" quaternary @click="pasteText">
        <template #icon><n-icon :component="IconClipboard" /></template>
        Вставить
      </n-button>
    </template>

    <n-scrollbar class="panel-body">
      <p v-if="!store.sourceText" class="empty-hint">(нет текста)</p>
      <p v-else class="message-text">{{ store.sourceText }}</p>
    </n-scrollbar>
  </PanelShell>
</template>

<script setup lang="ts">
import { h, type Component } from 'vue'
import { NButton, NIcon, NScrollbar, useMessage } from 'naive-ui'
import PanelShell from './layout/PanelShell.vue'
import { useMessageStore } from '../stores/message'

const store = useMessageStore()
const notify = useMessage()

const IconClipboard: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '1em', height: '1em' }, [
    h('path', { d: 'M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z' }),
  ])

async function pasteText() {
  try {
    const text = await navigator.clipboard.readText()
    store.sourceText = text
  } catch {
    notify.error('Ошибка вставки из буфера обмена')
  }
}
</script>

<style lang="scss" scoped src="./SourcePanel.scss"></style>
