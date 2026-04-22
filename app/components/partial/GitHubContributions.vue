<script setup lang="ts">
interface Props {
  username: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '659eb9',
})

const chartUrl = computed(() => {
  return `https://ghchart.rshah.org/${props.color}/${props.username}`
})
</script>

<template>
  <div class="github-contributions">
    <div class="contributions-header">
      <Icon name="ri:github-fill" class="github-icon" />
      <span class="username">{{ username }}</span>
      <span class="label">的 GitHub 贡献</span>
    </div>

    <div class="chart-container">
      <img
        :src="chartUrl"
        :alt="`${username} 的 GitHub 贡献图`"
        class="contributions-chart"
        loading="lazy"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.github-contributions {
  padding: 1.5rem;
  background-color: var(--c-bg-1);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.contributions-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--c-text-1);

  .github-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .username {
    font-weight: 600;
    color: var(--c-primary);
  }

  .label {
    color: var(--c-text-2);
  }
}

.chart-container {
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--c-border);
    border-radius: 2px;
  }
}

.contributions-chart {
  display: block;
  max-width: 100%;
  min-width: 750px;
  height: auto;
}

// 响应式
@media (max-width: 768px) {
  .github-contributions {
    padding: 1rem;
  }

  .contributions-header {
    font-size: 0.9rem;
  }
}
</style>
