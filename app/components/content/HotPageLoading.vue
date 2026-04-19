<script setup lang="ts">
defineProps<{
  pending: boolean
  error: unknown
  isEmpty: boolean
  message: string
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div
    class="status"
    :class="{
      loading: pending,
      error: !!error,
      empty: isEmpty
    }"
  >
    <Icon v-if="pending" name="ri:loader-4-line" class="spin" />
    <Icon v-else-if="error" name="ri:error-warning-line" class="error-icon" />
    <Icon v-else-if="isEmpty" name="ri:inbox-line" class="empty-icon" />
    <span>{{ message }}</span>
    <button
      v-if="error"
      class="retry-btn"
      @click="emit('retry')"
    >
      <Icon name="ri:refresh-line" />
      重试
    </button>
  </div>
</template>

<style lang="scss" scoped>
.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--c-text-2);
  padding: 48px 0;
  text-align: center;

  .iconify {
    font-size: 2.5rem;

    &.spin {
      animation: spin 1s linear infinite;
    }

    &.error-icon {
      color: #ef4444;
    }

    &.empty-icon {
      opacity: 0.5;
    }
  }

  &.error {
    color: #ef4444;
  }

  .retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: var(--c-primary);
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
