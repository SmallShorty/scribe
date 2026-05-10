import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { darkTheme, type GlobalTheme } from 'naive-ui'

export type Theme = 'dark' | 'light'

export const useSettingsStore = defineStore('settings', () => {
  // --- Theme ---
  const theme = ref<Theme>((localStorage.getItem('scribe:theme') as Theme) ?? 'dark')

  const naiveTheme = computed<GlobalTheme | null>(() =>
    theme.value === 'dark' ? darkTheme : null
  )

  function applyThemeToDOM(t: Theme) {
    document.documentElement.classList.remove('theme-dark', 'theme-light')
    document.documentElement.classList.add(`theme-${t}`)
  }

  watch(theme, t => {
    localStorage.setItem('scribe:theme', t)
    applyThemeToDOM(t)
  }, { immediate: true })

  // --- Delay ---
  const delayEnabled = ref(localStorage.getItem('scribe:delayEnabled') !== 'false')
  const delaySec = ref(Number(localStorage.getItem('scribe:delaySec')) || 3)

  watch(delayEnabled, v => localStorage.setItem('scribe:delayEnabled', String(v)))
  watch(delaySec, v => localStorage.setItem('scribe:delaySec', String(v)))

  return { theme, naiveTheme, delayEnabled, delaySec }
})
