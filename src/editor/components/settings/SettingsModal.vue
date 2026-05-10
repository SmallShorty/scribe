<template>
  <n-modal
    v-model:show="show"
    preset="card"
    title="Настройки"
    :style="{ width: '360px' }"
    :mask-closable="true"
    :bordered="false"
  >
    <div class="settings">
      <section class="section">
        <p class="section-label">Тема</p>
        <n-radio-group v-model:value="settings.theme" name="theme">
          <n-radio-button value="dark">Тёмная</n-radio-button>
          <n-radio-button value="light">Светлая</n-radio-button>
        </n-radio-group>
      </section>

      <n-divider />

      <section class="section">
        <div class="section-row">
          <p class="section-label">Пауза между сообщениями</p>
          <n-switch v-model:value="settings.delayEnabled" size="small" />
        </div>
        <p class="section-hint">Применяется при отправке длинных ответов, разбитых на части</p>

        <div v-if="settings.delayEnabled" class="delay-row">
          <n-select
            v-model:value="selectedPreset"
            :options="presetOptions"
            size="small"
            class="preset-select"
          />
          <n-input-number
            v-if="selectedPreset === 'custom'"
            v-model:value="settings.delaySec"
            :min="1"
            :max="600"
            size="small"
            class="custom-input"
          >
            <template #suffix>с</template>
          </n-input-number>
        </div>
      </section>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  NModal, NRadioGroup, NRadioButton,
  NSwitch, NSelect, NInputNumber, NDivider,
} from 'naive-ui'
import { useSettingsStore } from '../../stores/settings'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [boolean] }>()

const show = computed({
  get: () => props.show,
  set: v => emit('update:show', v),
})

const settings = useSettingsStore()

const PRESETS = [1, 3, 5, 10, 30]

const presetOptions = [
  ...PRESETS.map(v => ({ label: `${v} с`, value: v as number | 'custom' })),
  { label: 'Другое', value: 'custom' as const },
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
