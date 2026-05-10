<template>
  <n-config-provider :theme="settings.naiveTheme" :locale="ruRU" :date-locale="dateRuRU">
    <n-message-provider>
      <div class="app">
        <AppHeader @open-settings="settingsOpen = true" />
        <n-split
          class="app-panels"
          v-model:size="settings.splitSize"
          :min="0.2"
          :max="0.8"
        >
          <template #1>
            <SourcePanel />
          </template>
          <template #2>
            <EditorPanel />
          </template>
        </n-split>
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
