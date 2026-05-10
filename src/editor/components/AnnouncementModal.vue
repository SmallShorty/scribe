<template>
  <n-modal
    :show="pending.length > 0"
    preset="card"
    title="Новости"
    :style="{ width: '460px' }"
    :mask-closable="false"
    :closable="false"
    :bordered="false"
  >
    <div class="announcements">
      <template v-for="(item, i) in pending" :key="item.id">
        <n-divider v-if="i > 0" />
        <div class="announcement">
          <p class="announcement-title">{{ item.title }}</p>
          <p class="announcement-body">{{ item.body }}</p>
        </div>
      </template>
    </div>

    <template #footer>
      <n-button type="primary" @click="dismiss">Понятно</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NButton, NDivider } from 'naive-ui'
import { useAnnouncements } from '../composables/useAnnouncements'

const { pending, dismiss } = useAnnouncements()
</script>

<style lang="scss" scoped src="./AnnouncementModal.scss"></style>
