<template>
  <n-config-provider :theme="darkTheme" :locale="ruRU" :date-locale="dateRuRU">
    <n-message-provider>
      <div class="app">
        <header class="app-header">
          <svg class="app-logo" width="20" height="20" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="62" fill="#4A4A4A" />
            <text x="50%" y="55%" font-family="Arial" font-size="80" font-weight="bold"
              fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">S</text>
          </svg>
          <span class="app-title">Scribe</span>
        </header>
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
import { NConfigProvider, NMessageProvider, darkTheme } from 'naive-ui'
import { ruRU, dateRuRU } from 'naive-ui'
import SourcePanel from './components/SourcePanel.vue'
import EditorPanel from './components/EditorPanel.vue'
import { useMessageStore } from './stores/message'

const store = useMessageStore()
onMounted(() => store.loadFromUrl())
</script>

<style>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100vh;
  overflow: hidden;
  background: #101014;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  height: 46px;
  background: #101014;
  border-bottom: 1px solid #2a2a30;
  flex-shrink: 0;
}

.app-logo {
  flex-shrink: 0;
}

.app-title {
  color: #63e2b7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.app-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  overflow: hidden;
  /* 1px separator between panels via background */
  gap: 1px;
  background: #2a2a30;
}
</style>
