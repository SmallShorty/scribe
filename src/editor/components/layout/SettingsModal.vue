<template>
  <n-modal
    :show="show"
    preset="card"
    title="Настройки"
    class="settings-modal"
    :bordered="false"
    :segmented="{ footer: false }"
    @update:show="emit('update:show', $event)"
  >
    <div class="settings">

      <section class="section">
        <p class="section-label">Тема</p>
        <n-radio-group v-model:value="settings.theme" name="theme" class="theme-group">
          <n-radio-button value="dark">
            <span class="radio-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd"/>
              </svg>
              Тёмная
            </span>
          </n-radio-button>
          <n-radio-button value="light">
            <span class="radio-content">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.166 17.834a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 1 0 1.061-1.06l-1.59-1.591ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.166 6.166a.75.75 0 0 0 1.06 1.06l1.591-1.59a.75.75 0 1 0-1.06-1.061L6.166 6.166Z"/>
              </svg>
              Светлая
            </span>
          </n-radio-button>
        </n-radio-group>
      </section>

      <n-divider class="divider" />

      <section class="section">
        <div class="section-row">
          <div>
            <p class="section-label">Пауза между сообщениями</p>
            <p class="section-desc">При отправке текста длиннее 4096 символов</p>
          </div>
          <n-switch v-model:value="settings.delayEnabled" />
        </div>

        <transition name="fade">
          <div v-if="settings.delayEnabled" class="delay-control">
            <n-select
              v-model:value="selectedPreset"
              :options="presetOptions"
              size="small"
              class="delay-select"
            />
            <transition name="fade">
              <n-input-number
                v-if="selectedPreset === 'custom'"
                v-model:value="settings.delaySec"
                :min="1"
                :max="600"
                size="small"
                class="delay-input"
              >
                <template #suffix>с</template>
              </n-input-number>
            </transition>
          </div>
        </transition>
      </section>

    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NRadioGroup, NRadioButton, NSwitch, NSelect, NInputNumber, NDivider } from 'naive-ui'
import { useSettingsStore } from '../../stores/settings'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [value: boolean] }>()

const settings = useSettingsStore()

const PRESETS = [1, 3, 5, 10, 30]

const presetOptions = [
  ...PRESETS.map(v => ({ label: `${v} с`, value: v })),
  { label: 'Другое', value: 'custom' },
]

const selectedPreset = computed({
  get: (): number | 'custom' =>
    PRESETS.includes(settings.delaySec) ? settings.delaySec : 'custom',
  set: (val: number | 'custom') => {
    if (val !== 'custom') settings.delaySec = val
  },
})
</script>

<style lang="scss" scoped src="./SettingsModal.scss"></style>
