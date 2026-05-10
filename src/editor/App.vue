<template>
  <n-config-provider :theme="themeStore.naiveTheme" :locale="ruRU" :date-locale="dateRuRU">
    <n-message-provider>
      <div class="app">
        <AppHeader />
        <main class="app-panels">
          <SourcePanel />
          <EditorPanel />
        </main>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { ruRU, dateRuRU } from 'naive-ui'
import AppHeader from './components/layout/AppHeader.vue'
import SourcePanel from './components/SourcePanel.vue'
import EditorPanel from './components/EditorPanel.vue'
import { useMessageStore } from './stores/message'
import { useThemeStore } from './stores/theme'

const store = useMessageStore()
const themeStore = useThemeStore()

onMounted(() => store.loadFromUrl())
</script>

<style lang="scss">
@use '@/styles/variables' as v;

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  overflow: hidden;
  gap: 1px;
  background: v.$border;
  transition: background-color 0.2s ease;
}
</style>
