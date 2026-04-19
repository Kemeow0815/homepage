<script setup lang="ts">
import type { HotItem } from '~/types/hot'

defineProps<{
  items: HotItem[]
  currentPage: number
  itemsPerPage: number
}>()
</script>

<template>
  <div class="hot-list">
    <HotCard
      v-for="(item, index) in items"
      :key="item.id || index"
      :item="item"
      :rank="(currentPage - 1) * itemsPerPage + index + 1"
    />
  </div>
</template>

<style lang="scss" scoped>
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
