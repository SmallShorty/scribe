<template>
  <PanelShell variant="source">
    <template #label>Исходное сообщение</template>
    <template #actions>
      <n-button size="tiny" quaternary @click="copyText">
        <template #icon><n-icon :component="IconCopy" /></template>
        Копировать
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

const IconCopy: Component = () =>
  h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'currentColor', width: '1em', height: '1em' }, [
    h('path', { d: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z' }),
  ])

async function copyText() {
  try {
    await navigator.clipboard.writeText(store.sourceText)
    notify.success('Скопировано!')
  } catch {
    notify.error('Ошибка копирования')
  }
}
</script>

<style lang="scss" scoped src="./SourcePanel.scss"></style>
