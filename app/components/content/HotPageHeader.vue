<script setup lang="ts">
const props = defineProps<{
  miniNameType: string
  nameType: string
  categroryType: string
  hotTotal: number
  updateTime: string
}>()

const nowTimestamp = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  nowTimestamp.value = Date.now()
  timer = setInterval(() => {
    nowTimestamp.value = Date.now()
  }, 60 * 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

const relativeUpdateText = computed(() => {
  if (!props.updateTime) return '暂无更新时间'

  const updated = new Date(props.updateTime).getTime()
  if (Number.isNaN(updated)) return '暂无更新时间'

  // 服务端渲染时显示原始时间，避免水合不匹配
  if (!import.meta.client || nowTimestamp.value === null) {
    const date = new Date(props.updateTime)
    return `更新于 ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const diff = nowTimestamp.value - updated
  if (diff <= 0) return '刚刚更新'

  const totalMinutes = Math.floor(diff / 1000 / 60)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}天前更新`
  if (hours === 0 && minutes === 0) return '刚刚更新'
  if (hours <= 0 && minutes > 0) return `${minutes}分钟前更新`
  if (hours > 0 && minutes === 0) return `${hours}小时前更新`

  return `${hours}小时${minutes}分钟前更新`
})

// 平台图标映射
const platformIcons: Record<string, string> = {
  bilibili: 'ri:bilibili-line',
  weibo: 'ri:weibo-line',
  douyin: 'ri:music-line',
  zhihu: 'ri:question-answer-line',
  '36kr': 'ri:newspaper-line',
  baidu: 'ri:search-line',
}
</script>

<template>
  <div class="hot-header">
    <div class="header-icon">
      <Icon :name="platformIcons[miniNameType] || 'ri:fire-line'" />
    </div>

    <div class="header-name">
      <span class="name">{{ nameType }}</span>
      <span class="category">{{ categroryType }}</span>
    </div>

    <div class="header-meta">
      <span class="total">共 {{ hotTotal }} 条</span>
      <span class="divider">·</span>
      <span class="time">{{ relativeUpdateText }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--c-border);

  .header-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--c-primary-soft);
    border-radius: 10px;
    color: var(--c-primary);

    .iconify {
      font-size: 24px;
    }
  }

  .header-name {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .name {
      font-size: 16px;
      font-weight: 600;
      color: var(--c-text-1);
    }

    .category {
      font-size: 12px;
      color: var(--c-text-3);
    }
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--c-text-2);

    .divider {
      opacity: 0.5;
    }

    .time {
      color: var(--c-text-3);
    }
  }
}

@media (max-width: 480px) {
  .hot-header {
    flex-wrap: wrap;
    gap: 8px;

    .header-meta {
      width: 100%;
      justify-content: flex-start;
      padding-left: 52px;
    }
  }
}
</style>
