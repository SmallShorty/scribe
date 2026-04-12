import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMessageStore = defineStore('message', () => {
  const sourceText = ref('')
  const vkTabId = ref(0)
  const openedAt = ref(new Date())

  const charCount = computed(() => sourceText.value.length)
  const wordCount = computed(() => {
    const trimmed = sourceText.value.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  })

  /**
   * Extension mode: загружает данные из URL-параметров.
   * Для серверного деплоя — добавить loadFromApi(messageId) рядом
   * и вызывать его вместо этого метода в main.ts.
   */
  function loadFromUrl() {
    const params = new URLSearchParams(window.location.search)
    sourceText.value = params.get('text') ?? ''
    vkTabId.value = parseInt(params.get('vkTabId') ?? '0', 10)
    openedAt.value = new Date()
  }

  return {
    sourceText,
    vkTabId,
    openedAt,
    charCount,
    wordCount,
    loadFromUrl,
  }
})
