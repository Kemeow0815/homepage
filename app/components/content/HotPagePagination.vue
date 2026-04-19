<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'go', page: number): void
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>

<template>
  <div class="pagination">
    <button
      class="page-btn"
      :disabled="currentPage === 1"
      @click="emit('prev')"
    >
      <Icon name="ri:arrow-left-s-line" />
      上一页
    </button>

    <div class="page-numbers">
      <button
        v-for="page in totalPages"
        :key="page"
        class="page-number"
        :class="{ active: page === currentPage }"
        @click="emit('go', page)"
      >
        {{ page }}
      </button>
    </div>

    <button
      class="page-btn"
      :disabled="currentPage === totalPages"
      @click="emit('next')"
    >
      下一页
      <Icon name="ri:arrow-right-s-line" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--c-border);

  .page-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border: 1px solid var(--c-border);
    border-radius: 6px;
    background: var(--c-bg-1);
    color: var(--c-text-1);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: var(--c-bg-2);
      border-color: var(--c-primary);
      color: var(--c-primary);
    }
  }

  .page-numbers {
    display: flex;
    gap: 4px;

    .page-number {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--c-border);
      border-radius: 6px;
      background: var(--c-bg-1);
      color: var(--c-text-1);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--c-bg-2);
        border-color: var(--c-primary);
        color: var(--c-primary);
      }

      &.active {
        background: var(--c-primary);
        color: white;
        border-color: var(--c-primary);
      }
    }
  }
}

@media (max-width: 480px) {
  .pagination {
    flex-wrap: wrap;
    gap: 8px;

    .page-btn {
      padding: 6px 12px;
      font-size: 13px;
    }

    .page-numbers {
      order: -1;
      width: 100%;
      justify-content: center;

      .page-number {
        width: 32px;
        height: 32px;
        font-size: 13px;
      }
    }
  }
}
</style>
