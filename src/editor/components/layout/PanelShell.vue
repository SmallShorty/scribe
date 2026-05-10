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

<style lang="scss" scoped src="./PanelShell.scss"></style>
