<template>
  <n-config-provider :theme="settings.naiveTheme" :locale="ruRU" :date-locale="dateRuRU">
    <n-message-provider>
      <div class="app">
        <AppHeader @open-settings="settingsOpen = true" />

        <n-split
          v-if="settings.layout !== 'source-hidden'"
          class="app-panels"
          v-model:size="settings.splitSize"
          :direction="settings.layout === 'horizontal' ? 'vertical' : 'horizontal'"
          :min="0.2"
          :max="0.8"
        >
          <template #1>
            <SourcePanel v-if="!settings.swapped" />
            <EditorPanel v-else />
          </template>
          <template #2>
            <EditorPanel v-if="!settings.swapped" />
            <SourcePanel v-else />
          </template>
        </n-split>

        <div v-else class="app-panels">
          <EditorPanel />
        </div>
      </div>
      <SettingsModal v-model:show="settingsOpen" />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NConfigProvider, NMessageProvider, NSplit } from 'naive-ui'
import { ruRU, dateRuRU } from 'naive-ui'
import AppHeader from './components/layout/AppHeader.vue'
import SettingsModal from './components/settings/SettingsModal.vue'
import SourcePanel from './components/SourcePanel.vue'
import EditorPanel from './components/EditorPanel.vue'
import { useMessageStore } from './stores/message'
import { useSettingsStore } from './stores/settings'

const store = useMessageStore()
const settings = useSettingsStore()
const settingsOpen = ref(false)

onMounted(() => store.loadFromUrl())
</script>

<style lang="scss" src="./App.scss"></style>
