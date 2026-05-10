import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { darkTheme, type GlobalTheme } from 'naive-ui'

export type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>((localStorage.getItem('scribe:theme') as Theme) ?? 'dark')

  const naiveTheme = computed<GlobalTheme | null>(() =>
    theme.value === 'dark' ? darkTheme : null
  )

  function applyToDOM(t: Theme) {
    document.documentElement.classList.remove('theme-dark', 'theme-light')
    document.documentElement.classList.add(`theme-${t}`)
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(theme, t => {
    localStorage.setItem('scribe:theme', t)
    applyToDOM(t)
  }, { immediate: true })

  return { theme, naiveTheme, toggle }
})
