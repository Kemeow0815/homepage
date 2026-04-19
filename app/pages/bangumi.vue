<script setup lang="ts">
import type { CollectionType, ContentType } from '~/composables/useBangumi'
import useBangumi from '~/composables/useBangumi'

useHead({
	title: '追番记录',
})

definePageMeta({
	headerText: '追番记录',
})

// 状态管理
const contentType = ref<ContentType>('anime')
const collectionType = ref<CollectionType>('wish')
const page = ref(1)
const { data, error, totalPages, refresh, status } = useBangumi(contentType, collectionType, page)

// 加载状态
const isLoading = computed(() => status.value === 'pending')

// 监听数据变化
watch([contentType, collectionType], () => {
	page.value = 1
	refresh()
}, { immediate: true })

const games = computed(() => data.value?.data || [])

const subjectMap = {
	book: '书籍',
	anime: '追番',
	game: '游戏',
	music: '音乐',
}

// 根据内容类型动态生成收藏状态标签
const orderMap = computed(() => {
	const baseMap = {
		on_hold: '搁置',
		dropped: '抛弃',
	}

	if (contentType.value === 'game') {
		return {
			wish: '想玩',
			do: '在玩',
			collect: '玩过',
			...baseMap,
		}
	} else if (contentType.value === 'music') {
		return {
			wish: '想听',
			do: '在听',
			collect: '听过',
			...baseMap,
		}
	} else {
		// anime 和 book 使用默认的看/读
		return {
			wish: '想看',
			do: '在看',
			collect: '看过',
			...baseMap,
		}
	}
})
</script>

<template>
	<div class="bangumi-page">
		<!-- 内容类型导航 -->
		<div class="bangumi-nav">
			<div
				v-for="(label, key) in subjectMap"
				:key="key"
				class="nav-item"
				:class="{ active: contentType === key }"
				@click="contentType = key as ContentType"
			>
				{{ label }}
			</div>
		</div>

		<!-- 收藏类型导航 -->
		<div class="bangumi-nav type-nav">
			<button
				v-for="(label, key) in orderMap"
				:key="key"
				class="type-item"
				:class="{ active: collectionType === key }"
				@click="collectionType = key as CollectionType"
			>
				{{ label }}
			</button>
		</div>

		<!-- 加载状态 -->
		<div v-if="isLoading" class="loading">
			<Icon name="ri:loader-4-line" class="spin" />
			<span>加载中...</span>
		</div>

		<!-- 错误状态 -->
		<div v-else-if="error" class="error">
			<Icon name="ri:error-warning-line" />
			<p>加载失败，请稍后重试</p>
			<button @click="refresh()">重新加载</button>
		</div>

		<!-- 数据列表 -->
		<div v-else class="bangumi-list">
			<template v-if="games.length > 0">
				<BgmCard
					v-for="game in games"
					:key="`${game.subject_id}-${contentType}`"
					:bangumi-collection-item="game"
				/>
			</template>
			<div v-else class="empty">
				<Icon name="ri:folder-open-line" />
				<p>暂无数据</p>
			</div>
		</div>

		<!-- 版权信息 -->
		<div class="bangumi-footer">
			<p>
				数据来自 <a href="https://bgm.tv" target="_blank" rel="noopener noreferrer">Bangumi</a>
			</p>
			<p>共计 {{ data?.total || 0 }} 部作品</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.bangumi-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 20px;
}

// 导航样式
.bangumi-nav {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 1.5rem;

	&.type-nav {
		gap: 0.5rem;
	}
}

.nav-item {
	font-size: 1rem;
	cursor: pointer;
	border-bottom: 2px solid transparent;
	transition: all 0.3s ease;
	padding: 0.5rem 0;
	color: var(--c-text-2);

	&:hover {
		color: var(--c-text-1);
	}

	&.active {
		border-color: var(--c-primary);
		color: var(--c-primary);
		font-weight: 600;
	}
}

.type-item {
	cursor: pointer;
	font-size: 0.8rem;
	font-weight: 500;
	border: 1px solid var(--c-border);
	border-radius: 999rem;
	padding: 0.4rem 1rem;
	background: var(--c-bg-1);
	color: var(--c-text-2);
	transition: all 0.3s ease;

	&:hover {
		border-color: var(--c-primary);
		color: var(--c-primary);
	}

	&.active {
		background: var(--c-primary);
		border-color: var(--c-primary);
		color: var(--c-bg);
	}
}

// 加载状态
.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 4rem 0;
	gap: 1rem;
	color: var(--c-text-2);

	.spin {
		font-size: 2rem;
		animation: spin 1s linear infinite;
	}
}

// 错误状态
.error {
	text-align: center;
	padding: 4rem 0;
	color: var(--c-text-2);

	.iconify {
		font-size: 3rem;
		margin-bottom: 1rem;
		color: #ef4444;
	}

	button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background: var(--c-primary);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			opacity: 0.9;
		}
	}
}

// 列表样式
.bangumi-list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

// 空状态
.empty {
	text-align: center;
	padding: 4rem 0;
	color: var(--c-text-2);

	.iconify {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}
}

// 底部信息
.bangumi-footer {
	text-align: center;
	margin-top: 2rem;
	padding-top: 1rem;
	border-top: 1px solid var(--c-border);
	font-size: 0.8rem;
	color: var(--c-text-2);

	p {
		margin: 0.25rem 0;
	}

	a {
		color: var(--c-primary);
		text-decoration: none;

		&:hover {
			text-decoration: underline;
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

// 响应式
@media (max-width: 768px) {
	.bangumi-page {
		padding: 10px;
	}

	.bangumi-nav {
		gap: 0.5rem;

		&.type-nav {
			gap: 0.3rem;
		}
	}

	.nav-item {
		font-size: 0.9rem;
		padding: 0.4rem 0;
	}

	.type-item {
		font-size: 0.75rem;
		padding: 0.3rem 0.8rem;
	}
}
</style>
