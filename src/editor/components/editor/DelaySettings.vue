<template>
  <div class="delay-settings">
    <n-switch v-model:value="enabled" size="small" />
    <span class="label">пауза</span>
    <template v-if="enabled">
      <n-input-number
        v-model:value="seconds"
        :min="1"
        :max="30"
        :show-button="false"
        size="small"
        class="input"
      />
      <span class="unit">с</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NSwitch, NInputNumber } from 'naive-ui'

const enabled = ref(localStorage.getItem('scribe:delayEnabled') !== 'false')
const seconds = ref(Number(localStorage.getItem('scribe:delaySec')) || 3)

watch(enabled, v => localStorage.setItem('scribe:delayEnabled', String(v)))
watch(seconds, v => localStorage.setItem('scribe:delaySec', String(v)))

defineExpose({ enabled, seconds })
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as v;

.delay-settings {
  display: flex;
  align-items: center;
  gap: v.$gap-xs;
}

.label,
.unit {
  font-size: v.$font-label;
  color: v.$text-dim;
  transition: color 0.2s ease;
}

.input {
  width: 48px;
}
</style>
