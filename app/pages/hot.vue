<script setup lang="ts">
import type { ApiResponse } from '~/types/hot'
import PageViewCounter from '~/components/partial/PageViewCounter.vue'

useHead({
	title: '今日热搜',
})

definePageMeta({
	headerText: '今日热搜',
})

// 热搜平台配置
interface Platform {
	name: string
	miniName: string
	icon: string
}

const hotPlatforms: Platform[] = [
	{ name: '哔哩哔哩', miniName: 'bilibili', icon: 'ri:bilibili-line' },
	{ name: '微博', miniName: 'weibo', icon: 'ri:weibo-line' },
	{ name: '抖音', miniName: 'douyin', icon: 'ri:music-line' },
	{ name: '知乎', miniName: 'zhihu', icon: 'ri:question-answer-line' },
	{ name: '36氪', miniName: '36kr', icon: 'ri:newspaper-line' },
	{ name: '百度', miniName: 'baidu', icon: 'ri:search-line' },
]

// 当前选中的平台
const activePlatform = ref(0)
const currentPlatform = computed<Platform>(() => {
	return hotPlatforms[activePlatform.value]! || hotPlatforms[0]
})

// API 配置 - 使用免费的热搜 API
const API_BASE = 'https://hot-api.liiiu.cn'

const requestUrl = computed(() =>
	`${API_BASE}/${currentPlatform.value.miniName}`,
)

const fetchKey = computed(() => `hot-${currentPlatform.value.miniName}`)

const {
	data: responseData,
	pending,
	error,
	refresh,
} = useFetch<ApiResponse>(requestUrl, {
	key: fetchKey,
	default: () => ({ total: 0, updateTime: '', data: [] }),
	server: false,
	lazy: false,
	watch: [requestUrl],
})

const hotList = computed(() => {
	const list = responseData.value?.data
	return Array.isArray(list) ? list : []
})

const hotTotal = computed(() => {
	return typeof responseData.value?.total === 'number'
		? responseData.value.total
		: hotList.value.length
})

const updateTime = computed(() => responseData.value?.updateTime ?? '')

// 分页状态
const currentPage = ref(1)
const itemsPerPage = ref(20)

const totalPages = computed(() =>
	Math.max(1, Math.ceil(hotList.value.length / itemsPerPage.value)),
)

const paginatedList = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value
	const end = start + itemsPerPage.value
	return hotList.value.slice(start, end)
})

function goToPage(page: number) {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page
	}
}

function nextPage() {
	if (currentPage.value < totalPages.value) {
		currentPage.value++
	}
}

function prevPage() {
	if (currentPage.value > 1) {
		currentPage.value--
	}
}

// 当平台切换时，重置页码
watch(activePlatform, () => {
	currentPage.value = 1
})

// 当数据变化时，修正页码
watch(hotList, () => {
	if (currentPage.value > totalPages.value) {
		currentPage.value = totalPages.value || 1
	}
})

// 状态消息
const statusMessage = computed(() => {
	if (pending.value)
		return '加载中...'
	if (error.value) {
		return error.value instanceof Error
			? error.value.message
			: '加载失败'
	}
	if (!hotList.value.length)
		return '暂无数据'
	return ''
})
</script>

<template>
<div class="hot-page">
	<!-- 平台切换标签 -->
	<div class="platform-tabs">
		<button
			v-for="(platform, index) in hotPlatforms"
			:key="platform.miniName"
			class="platform-tab"
			:class="{ active: activePlatform === index }"
			@click="activePlatform = index"
		>
			<Icon :name="platform.icon" />
			<span>{{ platform.name }}</span>
		</button>
	</div>

	<!-- 热搜内容卡片 -->
	<div class="hot-card">
		<HotPageHeader
			:mini-name-type="currentPlatform.miniName"
			:name-type="currentPlatform.name"
			categrory-type="热搜"
			:hot-total="hotTotal"
			:update-time="updateTime"
		/>

		<div class="hot-body">
			<HotPageLoading
				v-if="pending || error || !hotList.length"
				:pending="pending"
				:error="error"
				:is-empty="!pending && !error && !hotList.length"
				:message="statusMessage"
				@retry="refresh"
			/>

			<template v-else>
				<HotCardList
					:items="paginatedList"
					:current-page="currentPage"
					:items-per-page="itemsPerPage"
				/>

				<HotPagePagination
					v-if="totalPages > 1"
					:current-page="currentPage"
					:total-pages="totalPages"
					@go="goToPage"
					@prev="prevPage"
					@next="nextPage"
				/>
			</template>
		</div>
	</div>

	<!-- 底部说明 -->
	<div class="hot-footer">
		<p>
			数据来自 <a href="https://hot-api.liiiu.cn" target="_blank" rel="noopener noreferrer">今日热榜 API</a>
		</p>
	</div>

	<!-- 浏览量统计 -->
	<div class="page-views-wrapper">
		<PageViewCounter />
	</div>
</div>
</template>

<style lang="scss" scoped>
.hot-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

// 平台切换标签
.platform-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-bottom: 20px;
  position: relative;
  width: fit-content;
  margin-inline: auto;
  font-size: 0.9em;
  line-height: 1.4;

  .platform-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    margin-bottom: 0.5em;
    padding: 0.3em 0.5em;
    border: none;
    border-radius: 0.4em;
    background: transparent;
    color: var(--c-text-2);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    .iconify {
      font-size: 18px;
    }

    &:hover {
      background-color: var(--c-bg-soft);
      color: var(--c-text);
    }

    &.active {
      box-shadow: 0 1px 0.5em var(--ld-shadow);
      background-color: var(--ld-bg-card);
      color: var(--c-text);

      &::after {
        content: "";
        position: absolute;
        bottom: -0.5em;
        left: 0.3em;
        right: 0.3em;
        height: 2px;
        border-radius: 1em;
        background-color: var(--c-primary);
        z-index: 1;
      }
    }
  }
}

// 热搜卡片
.hot-card {
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 20px;
  background: var(--c-bg-1);
  box-shadow: var(--box-shadow-2);
}

.hot-body {
  min-height: 200px;
}

// 底部说明
.hot-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: var(--c-text-3);

  a {
    color: var(--c-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

// 响应式
@media (max-width: 768px) {
	.hot-page {
		padding: 10px;
	}

	.page-views-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

  .platform-tabs {
    gap: 0.4em;
    font-size: 0.85em;

    .platform-tab {
      padding: 0.25em 0.4em;
      font-size: 13px;

      .iconify {
        font-size: 16px;
      }
    }
  }

  .hot-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .platform-tabs {
    gap: 0.3em;
    font-size: 0.8em;

    .platform-tab {
      padding: 0.2em 0.35em;
      font-size: 12px;

      span {
        font-size: 11px;
      }

      .iconify {
        font-size: 14px;
      }

      &.active::after {
        left: 0.2em;
        right: 0.2em;
        height: 2px;
      }
    }
  }
}
</style>
