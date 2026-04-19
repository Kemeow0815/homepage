<script setup lang="ts">
import type { MomentItem } from '~/types/moments'
import homepageConfig from '~~/homepage.config'
import { localMoments } from '~/data/moments/local'
import { fetchTgtalkData } from '~/data/moments/tgtalk'
import { useMomentsStore } from '~/stores/moments'
import MomentsCard from './MomentsCard.vue'

const props = defineProps<{
	type: 'local' | 'ispeak' | 'tgtalk'
}>()

const momentsStore = useMomentsStore()

const momentsList = ref<MomentItem[]>([])
const loading = ref(false)
const hasMore = ref(false)
const currentPage = ref(1)
const message = ref('')

// 根据标签筛选后的列表
const filteredMomentsList = computed(() => {
	if (!momentsStore.filterTag) {
		return momentsList.value
	}

	const tag = momentsStore.filterTag.toLowerCase()
	return momentsList.value.filter((moment) => {
		// 检查内容中是否包含该标签
		const content = moment.content || ''
		// 检查 tags 数组中是否包含该标签
		const tags = moment.tags || []
		// 移除 # 号后进行匹配
		const tagWithoutHash = tag.startsWith('#') ? tag.slice(1) : tag
		const contentHasTag = content.toLowerCase().includes(`#${tagWithoutHash}`)
		const tagsHasTag = tags.some(t => t.toLowerCase() === tagWithoutHash)
		return contentHasTag || tagsHasTag
	})
})

// 加载本地数据
async function loadLocalData() {
	const pageSize = homepageConfig.moments.local.pageSize
	const sorted = [...localMoments].sort((a, b) =>
		new Date(b.date).getTime() - new Date(a.date).getTime(),
	)

	if (currentPage.value === 1) {
		momentsList.value = sorted.slice(0, pageSize)
	}
	else {
		const start = (currentPage.value - 1) * pageSize
		const end = start + pageSize
		const newItems = sorted.slice(start, end)
		momentsList.value.push(...newItems)
	}

	hasMore.value = momentsList.value.length < sorted.length
	currentPage.value++
}

// 加载 tgtalk 数据
async function loadTgtalkData() {
	const config = homepageConfig.moments.tgtalk
	if (!config?.url) {
		message.value = '未配置 tgtalk API 地址'
		return
	}

	loading.value = true
	try {
		const data = await fetchTgtalkData(config.url)
		momentsList.value = data
		hasMore.value = false // tgtalk 一次性加载全部
	}
	catch (error) {
		console.error('Error loading tgtalk data:', error)
		message.value = '加载失败'
	}
	finally {
		loading.value = false
	}
}

// 加载更多数据
async function loadMore() {
	if (loading.value || !hasMore.value)
		return

	loading.value = true

	if (props.type === 'local') {
		await loadLocalData()
	}

	loading.value = false
}

// 初始加载
onMounted(async () => {
	if (props.type === 'local') {
		await loadLocalData()
	}
	else if (props.type === 'tgtalk') {
		await loadTgtalkData()
	}
})

// 服务端渲染时加载数据
if (import.meta.server) {
	if (props.type === 'local') {
		const pageSize = homepageConfig.moments.local.pageSize
		const sorted = [...localMoments].sort((a, b) =>
			new Date(b.date).getTime() - new Date(a.date).getTime(),
		)
		momentsList.value = sorted.slice(0, pageSize)
		hasMore.value = sorted.length > pageSize
		currentPage.value = 2
	}
}
</script>

<template>
<div class="moments-list">
	<!-- 筛选状态栏 -->
	<div v-if="momentsStore.filterTag" class="filter-bar">
		<span class="filter-info">
			筛选标签: <strong>{{ momentsStore.filterTag }}</strong>
			<span class="filter-count">({{ filteredMomentsList.length }} 条)</span>
		</span>
		<button class="clear-filter" @click="momentsStore.clearFilter">
			<Icon name="ri:close-line" />
			清除筛选
		</button>
	</div>

	<!-- 列表内容 -->
	<div class="moments-container">
		<MomentsCard
			v-for="(moment, index) in filteredMomentsList"
			:key="moment.id"
			:moment="moment"
			:style="{ '--delay': `${index * 0.1}s` }"
		/>
	</div>

	<!-- 无结果提示 -->
	<div v-if="filteredMomentsList.length === 0 && momentsStore.filterTag" class="empty-state">
		<Icon name="ri:inbox-line" />
		<p>没有找到带有标签 {{ momentsStore.filterTag }} 的说说</p>
	</div>

	<!-- 加载状态 -->
	<div v-if="loading" class="loading-state">
		<Icon name="ri:loader-4-line" class="spin" />
		<span>加载中...</span>
	</div>

	<!-- 加载更多按钮 -->
	<div v-else-if="hasMore" class="load-more">
		<button :disabled="loading" @click="loadMore">
			<Icon name="ri:arrow-down-line" />
			加载更多
		</button>
	</div>

	<!-- 结束提示 -->
	<div v-else-if="message" class="end-message">
		{{ message }}
	</div>
</div>
</template>

<style lang="scss" scoped>
.moments-list {
	max-width: 800px;
	margin: 0 auto;
}

.moments-container {
	// 容器样式
}

.loading-state {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 2rem;
	color: var(--c-text-3);

	.spin {
		animation: spin 1s linear infinite;
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

.load-more {
	display: flex;
	justify-content: center;
	padding: 1.5rem;

	button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.5rem;
		border: 1px solid var(--c-border);
		background-color: var(--c-bg-1);
		color: var(--c-text-2);
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;

		&:hover {
			background-color: var(--c-bg-2);
			border-color: var(--c-primary);
			color: var(--c-primary);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}

		:deep(.iconify) {
			font-size: 1rem;
		}
	}
}

.end-message {
	text-align: center;
	padding: 2rem;
	color: var(--c-text-3);
	font-size: 0.9rem;
}

// 筛选栏样式
.filter-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem 1rem;
	margin-bottom: 1rem;
	background-color: var(--c-primary-soft, var(--c-bg-2));
	border-radius: 8px;
	border: 1px solid var(--c-primary);

	.filter-info {
		color: var(--c-text-2);
		font-size: 0.9rem;

		strong {
			color: var(--c-primary);
			font-weight: 600;
		}

		.filter-count {
			color: var(--c-text-3);
			margin-left: 0.5rem;
		}
	}

	.clear-filter {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.4rem 0.8rem;
		border: none;
		background-color: var(--c-bg-1);
		color: var(--c-text-2);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.2s ease;

		&:hover {
			background-color: var(--c-primary);
			color: white;
		}

		:deep(.iconify) {
			font-size: 1rem;
		}
	}
}

// 无结果提示样式
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 3rem;
	color: var(--c-text-3);

	:deep(.iconify) {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	p {
		font-size: 0.9rem;
	}
}
</style>
