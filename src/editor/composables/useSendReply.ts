import { ref } from 'vue'
import { useMessageStore } from '../stores/message'
import { useSettingsStore } from '../stores/settings'
import { VK_LIMIT } from '../constants'
import type { MessageAction, MessageResponse } from '../../types/messages'

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += VK_LIMIT) chunks.push(text.slice(i, i + VK_LIMIT))
  return chunks.length ? chunks : [text]
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function useSendReply() {
  const store = useMessageStore()
  const settings = useSettingsStore()

  const sending = ref(false)
  const statusMsg = ref('')
  const statusType = ref<'success' | 'error'>('success')
  let statusTimer: ReturnType<typeof setTimeout> | undefined

  function setStatus(msg: string, type: 'success' | 'error') {
    statusMsg.value = msg
    statusType.value = type
    clearTimeout(statusTimer)
    statusTimer = setTimeout(() => { statusMsg.value = '' }, 3000)
  }

  async function sendOne(text: string): Promise<MessageResponse> {
    const msg: MessageAction = { action: 'sendReply', text, vkTabId: store.vkTabId }
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(msg, (res: MessageResponse) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message))
        else resolve(res)
      })
    })
  }

  async function sendReply(text: string): Promise<boolean> {
    if (!text.trim() || !store.vkTabId || sending.value) return false

    const chunks = splitIntoChunks(text)
    sending.value = true

    try {
      for (let i = 0; i < chunks.length; i++) {
        if (i > 0) {
          if (settings.delayEnabled) {
            setStatus(`Пауза перед ${i + 1}/${chunks.length}…`, 'success')
            await sleep(settings.delaySec * 1000)
          } else {
            setStatus(`Отправка ${i + 1}/${chunks.length}…`, 'success')
          }
        }
        const response = await sendOne(chunks[i])
        if (!response?.success) {
          setStatus(response?.error ?? 'Ошибка отправки', 'error')
          return false
        }
      }
      setStatus(chunks.length > 1 ? `Отправлено ${chunks.length} сообщения` : 'Отправлено!', 'success')
      return true
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Ошибка', 'error')
      return false
    } finally {
      sending.value = false
    }
  }

  return { sending, statusMsg, statusType, sendReply }
}
