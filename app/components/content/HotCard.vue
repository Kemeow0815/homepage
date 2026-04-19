<script setup lang="ts">
import type { HotItem } from '~/types/hot'

const props = defineProps<{
  item: HotItem
  rank: number
}>()

const itemLink = computed(() => {
  const url = props.item.url || props.item.mobileUrl || ''
  return typeof url === 'string' ? url.trim() : ''
})

const hasValidLink = computed(() => !!itemLink.value)

const rankClass = computed(() => ({
  top1: props.rank === 1,
  top2: props.rank === 2,
  top3: props.rank === 3,
}))

const descText = computed(() => {
  return props.item.desc?.trim() || '暂无描述'
})

const authorText = computed(() => {
  return props.item.author?.trim() || ''
})

const hotText = computed(() => {
  return props.item.hot ? String(props.item.hot) : ''
})
</script>

<template>
  <div class="hot-item">
    <component
      :is="hasValidLink ? 'a' : 'div'"
      class="hot-item-link"
      :href="hasValidLink ? itemLink : undefined"
      :target="hasValidLink ? '_blank' : undefined"
      :rel="hasValidLink ? 'noopener noreferrer' : undefined"
    >
      <div class="rank" :class="rankClass">
        {{ rank }}
      </div>

      <div class="content">
        <div class="title">{{ item.title }}</div>
        <div class="desc">{{ descText }}</div>

        <div v-if="authorText || hotText" class="meta">
          <span v-if="authorText"><Icon name="ri:user-line" /> {{ authorText }}</span>
          <span v-if="hotText"><Icon name="ri:fire-line" /> {{ hotText }}</span>
        </div>
      </div>
    </component>
  </div>
</template>

<style lang="scss" scoped>
.hot-item {
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 12px;

  &:last-child {
    border-bottom: none;
  }

  .hot-item-link {
    display: flex;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
    padding: 8px;
    border-radius: 8px;

    &:hover {
      background: var(--c-bg-2);
    }

    .rank {
      width: 28px;
      height: 28px;
      min-width: 28px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--c-bg-2);
      border-radius: 6px;
      transition: all 0.3s;
      color: var(--c-text-2);

      &.top1 {
        background-color: #ef4444;
        color: #fff;
      }

      &.top2 {
        background-color: #f97316;
        color: #fff;
      }

      &.top3 {
        background-color: #eab308;
        color: #fff;
      }
    }

    .content {
      flex: 1;
      min-width: 0;

      .title {
        font-size: 15px;
        font-weight: 600;
        color: var(--c-text-1);
        margin-bottom: 4px;
        word-break: break-word;
        line-height: 1.4;
      }

      .desc {
        font-size: 13px;
        color: var(--c-text-2);
        margin-bottom: 6px;
        word-break: break-word;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        font-size: 12px;
        color: var(--c-text-3);

        span {
          display: flex;
          align-items: center;
          gap: 4px;

          .iconify {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
