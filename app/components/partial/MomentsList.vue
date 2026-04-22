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

// 分页配置
const PAGE_SIZE = 8

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

// 当前页显示的数据（带分页）
const paginatedList = computed(() => {
	const list = filteredMomentsList.value
	const start = 0
	const end = currentPage.value * PAGE_SIZE
	return list.slice(start, end)
})

// 是否有更多数据
const hasMoreData = computed(() => {
	return paginatedList.value.length < filteredMomentsList.value.length
})

// 加载本地数据
async function loadLocalData() {
	const sorted = [...localMoments].sort((a, b) =>
		new Date(b.date).getTime() - new Date(a.date).getTime(),
	)
	momentsList.value = sorted
	hasMore.value = sorted.length > PAGE_SIZE
	currentPage.value = 1
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
function loadMore() {
	if (loading.value || !hasMoreData.value)
		return
	currentPage.value++
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
		const sorted = [...localMoments].sort((a, b) =>
			new Date(b.date).getTime() - new Date(a.date).getTime(),
		)
		momentsList.value = sorted
		hasMore.value = sorted.length > PAGE_SIZE
		currentPage.value = 1
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
			v-for="(moment, index) in paginatedList"
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
	<template v-if="loading">
		<div class="loading-state">
			<div v-for="i in 3" :key="`skeleton-${i}`" class="skeleton">
				<div class="skeleton-meta">
					<div class="skeleton-avatar" />
					<div class="skeleton-info">
						<div class="skeleton-nick" />
						<div class="skeleton-date" />
					</div>
				</div>
				<div class="skeleton-content">
					<div class="skeleton-text" />
					<div class="skeleton-text" />
					<div class="skeleton-text" />
				</div>
				<div class="skeleton-bottom" />
			</div>
		</div>
	</template>

	<!-- 分页信息 -->
	<div v-if="!loading && filteredMomentsList.length > 0" class="pagination-info">
		<span>显示 {{ paginatedList.length }} / {{ filteredMomentsList.length }} 条</span>
	</div>

	<!-- 加载更多按钮 -->
	<div v-if="hasMoreData" class="load-more">
		<button @click="loadMore">
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
	flex-direction: column;
	gap: 1rem;
	margin: 1rem 0;
}

.skeleton {
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
	padding: 1rem;
	border-radius: 8px;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	background-color: var(--c-bg-1);
}

.skeleton-meta {
	display: flex;
	align-items: center;
	gap: 10px;
}

.skeleton-avatar {
	width: 3em;
	height: 3em;
	border-radius: 50%;
	background: linear-gradient(90deg, var(--c-bg-2) 25%, var(--c-bg-soft) 50%, var(--c-bg-2) 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
}

.skeleton-info {
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 0.3rem;
}

.skeleton-nick {
	width: 120px;
	height: 18px;
	border-radius: 4px;
	background: linear-gradient(90deg, var(--c-bg-2) 25%, var(--c-bg-soft) 50%, var(--c-bg-2) 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
}

.skeleton-date {
	width: 100px;
	height: 14px;
	border-radius: 4px;
	background: linear-gradient(90deg, var(--c-bg-2) 25%, var(--c-bg-soft) 50%, var(--c-bg-2) 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
}

.skeleton-content {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.skeleton-text {
	height: 16px;
	border-radius: 4px;
	background: linear-gradient(90deg, var(--c-bg-2) 25%, var(--c-bg-soft) 50%, var(--c-bg-2) 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;

	&:nth-child(2) {
		width: 80%;
	}

	&:nth-child(3) {
		width: 60%;
	}
}

.skeleton-bottom {
	height: 24px;
	border-radius: 4px;
	background: linear-gradient(90deg, var(--c-bg-2) 25%, var(--c-bg-soft) 50%, var(--c-bg-2) 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
}

@keyframes loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
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
	margin: 2rem 0;
	font-size: 1rem;
	text-align: center;
	color: var(--c-text-3);
}

// 分页信息
.pagination-info {
	text-align: center;
	padding: 1rem;
	color: var(--c-text-3);
	font-size: 0.85rem;
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
	margin: 1rem 0;
	padding: 3rem 1rem;
	border-radius: 8px;
	box-shadow: 0 0 0 1px var(--c-bg-soft);
	text-align: center;
	color: var(--c-text-3);

	:deep(.iconify) {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		opacity: 0.5;
	}

	p {
		font-size: 0.9rem;
		margin: 0;
	}
}
</style>
