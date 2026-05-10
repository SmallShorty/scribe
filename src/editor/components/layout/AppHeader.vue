<template>
  <header class="app-header">
    <svg class="logo" width="20" height="20" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="62" fill="#4A4A4A" />
      <text x="50%" y="55%" font-family="Arial" font-size="80" font-weight="bold"
        fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">S</text>
    </svg>
    <span class="title">Scribe</span>

    <div class="layout-group">
      <button
        class="icon-btn"
        :class="{ 'icon-btn--active': settings.layout === 'vertical' }"
        title="Вертикальное разделение"
        @click="settings.layout = 'vertical'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
          <rect x="1" y="1" width="6" height="14" rx="1.5"/>
          <rect x="9" y="1" width="6" height="14" rx="1.5"/>
        </svg>
      </button>
      <button
        class="icon-btn"
        :class="{ 'icon-btn--active': settings.layout === 'horizontal' }"
        title="Горизонтальное разделение"
        @click="settings.layout = 'horizontal'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
          <rect x="1" y="1" width="14" height="6" rx="1.5"/>
          <rect x="1" y="9" width="14" height="6" rx="1.5"/>
        </svg>
      </button>
      <button
        class="icon-btn"
        :class="{ 'icon-btn--active': settings.layout === 'source-hidden' }"
        title="Скрыть источник"
        @click="settings.layout = 'source-hidden'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
          <rect x="1" y="1" width="6" height="14" rx="1.5" opacity="0.25"/>
          <rect x="9" y="1" width="6" height="14" rx="1.5"/>
        </svg>
      </button>
    </div>

    <button
      class="icon-btn"
      :class="{ 'icon-btn--active': settings.swapped }"
      :title="settings.swapped ? 'Вернуть исходный порядок' : 'Поменять панели местами'"
      @click="settings.swapped = !settings.swapped"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
        <!-- arrow right: 2→14 on y=5, arrowhead at right -->
        <polygon points="14,5 11,3 11,4.2 2,4.2 2,5.8 11,5.8 11,7"/>
        <!-- arrow left: 14→2 on y=11, arrowhead at left -->
        <polygon points="2,11 5,9 5,10.2 14,10.2 14,11.8 5,11.8 5,13"/>
      </svg>
    </button>

    <button class="icon-btn" title="Настройки" @click="emit('openSettings')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clip-rule="evenodd"/>
      </svg>
    </button>
  </header>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings'

const emit = defineEmits<{ openSettings: [] }>()
const settings = useSettingsStore()
</script>

<style lang="scss" scoped src="./AppHeader.scss"></style>
