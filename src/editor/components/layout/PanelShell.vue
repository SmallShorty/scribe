<template>
  <div class="panel-shell" :class="{ 'panel-shell--source': variant === 'source' }">
    <div class="panel-header">
      <span class="panel-label"><slot name="label" /></span>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'panel' | 'source'
}>(), { variant: 'panel' })
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as v;
@use '@/styles/mixins' as m;

.panel-shell {
  @include m.panel-base;
  background: v.$bg-panel;
  transition: background-color 0.2s ease;

  &--source {
    background: v.$bg-source;
  }
}

.panel-header {
  @include m.panel-header;
}

.panel-label {
  @include m.panel-label;
}
</style>
