<template>
  <n-config-provider :theme="themeStore.naiveTheme" :locale="ruRU" :date-locale="dateRuRU">
    <n-message-provider>
      <div class="app">
        <header class="app-header">
          <svg class="app-logo" width="20" height="20" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="62" fill="#4A4A4A" />
            <text x="50%" y="55%" font-family="Arial" font-size="80" font-weight="bold"
              fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">S</text>
          </svg>
          <span class="app-title">Scribe</span>

          <button class="theme-toggle" :title="themeStore.theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'" @click="themeStore.toggle()">
            <svg v-if="themeStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.166 17.834a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 1 0 1.061-1.06l-1.59-1.591ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.166 6.166a.75.75 0 0 0 1.06 1.06l1.591-1.59a.75.75 0 1 0-1.06-1.061L6.166 6.166Z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd"/>
            </svg>
          </button>
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
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { ruRU, dateRuRU } from 'naive-ui'
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

.app-header {
  display: flex;
  align-items: center;
  gap: v.$gap-sm;
  padding: 0 v.$gap-xl;
  height: v.$height-header;
  background: v.$header-bg;
  border-bottom: 1px solid v.$border;
  flex-shrink: 0;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.app-logo {
  flex-shrink: 0;
}

.app-title {
  color: v.$accent;
  font-family: v.$font-header;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: color 0.2s ease;
}

.theme-toggle {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: v.$text-muted;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: v.$border;
    color: v.$text;
  }
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
