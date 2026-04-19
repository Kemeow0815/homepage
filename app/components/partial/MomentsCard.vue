<script setup lang="ts">
import type { MomentItem } from '~/types/moments'
import homepageConfig from '~~/homepage.config'
import { useMomentsStore } from '~/stores/moments'
import { hasMarkdown, renderMarkdown } from '~/utils/markdown'

const props = defineProps<{
	moment: MomentItem
}>()

const momentsStore = useMomentsStore()

// 客户端时间，避免 SSR 和客户端不一致
const now = ref<Date | null>(null)

// 内容容器引用
const contentRef = ref<HTMLDivElement>()

onMounted(() => {
	now.value = new Date()

	// 使用事件委托处理标签点击
	if (contentRef.value) {
		contentRef.value.addEventListener('click', handleTagClick)
	}
})

onUnmounted(() => {
	// 清理事件监听
	if (contentRef.value) {
		contentRef.value.removeEventListener('click', handleTagClick)
	}
})

// 处理标签点击
function handleTagClick(event: MouseEvent) {
	const target = event.target as HTMLElement
	if (target.classList.contains('content-tag')) {
		event.preventDefault()
		event.stopPropagation()
		const tag = target.getAttribute('data-tag')
		if (tag) {
			momentsStore.toggleFilterTag(tag)
		}
	}
}

// 渲染内容（支持 HTML 和 Markdown）
const renderedContent = computed(() => {
	const content = props.moment.content || ''

	// 如果内容包含 Markdown 语法，则渲染为 Markdown
	if (hasMarkdown(content)) {
		return renderMarkdown(content)
	}

	// 否则直接返回原始内容（HTML）
	return content
})

// 全局灯箱实例
let globalLightbox: any = null

// 打开灯箱
function openLightbox(index: number) {
	if (typeof window !== 'undefined' && (window as any).Lightbox) {
		// 获取当前卡片的图片元素
		const cardImages = props.moment.images || []
		if (cardImages.length === 0)
			return

		// 如果已有灯箱实例，先关闭并清理
		if (globalLightbox) {
			globalLightbox.close()
			globalLightbox = null
		}

		// 创建新的灯箱实例
		globalLightbox = new (window as any).Lightbox({
			closeOnOverlayClick: true,
		})

		// 设置图片列表（直接使用字符串 URL 数组）
		globalLightbox.images = cardImages.map((src: string) => ({ src }))
		globalLightbox.currentIndex = index
		globalLightbox.open()
	}
}

// 格式化日期显示
function formatDate(dateStr: string): string {
	const date = new Date(dateStr)

	// 如果没有客户端时间（SSR 阶段），直接显示日期
	if (!now.value) {
		return dateStr
	}

	const diff = now.value.getTime() - date.getTime()

	// 小于1小时显示"X分钟前"
	if (diff < 60 * 60 * 1000) {
		const minutes = Math.floor(diff / (60 * 1000))
		return minutes < 1 ? '刚刚' : `${minutes}分钟前`
	}

	// 小于24小时显示"X小时前"
	if (diff < 24 * 60 * 60 * 1000) {
		const hours = Math.floor(diff / (60 * 60 * 1000))
		return `${hours}小时前`
	}

	// 小于7天显示"X天前"
	if (diff < 7 * 24 * 60 * 60 * 1000) {
		const days = Math.floor(diff / (24 * 60 * 60 * 1000))
		return `${days}天前`
	}

	// 否则显示具体日期
	return dateStr
}

// 快速评论功能
const handleComment = inject<(content?: string) => void>('handleComment')

function replyMoment(content: string): void {
	// 调用父组件提供的评论处理函数
	if (handleComment) {
		// 提取纯文本内容（移除 HTML 标签）
		const plainText = content.replace(/<[^>]*>/g, '').trim()
		handleComment(plainText)
	}
}
</script>

<template>
<div class="moment-card">
	<!-- 头部：头像和元信息 -->
	<div class="moment-header">
		<div class="header-left">
			<img
				:src="homepageConfig.author.avatar"
				:alt="`${homepageConfig.author.name} 的头像`"
				class="avatar"
			>
			<div class="meta">
				<div class="name">
					{{ homepageConfig.author.name }}
				</div>
				<div class="time">
					<Icon name="ri:time-line" />
					{{ formatDate(props.moment.date) }}
				</div>
			</div>
		</div>
		<div v-if="props.moment.location" class="location">
			<Icon name="ri:map-pin-line" />
			{{ props.moment.location }}
		</div>
	</div>

	<!-- 内容区域 -->
	<div ref="contentRef" class="moment-content" v-html="renderedContent" />

	<!-- 图片网格 -->
	<div v-if="props.moment.images?.length" class="moment-images">
		<div
			v-for="(img, index) in props.moment.images"
			:key="index"
			class="image-item"
			:style="{ gridColumn: props.moment.images.length === 1 ? 'span 6' : '' }"
			@click="openLightbox(index)"
		>
			<img :src="img" :alt="`图片${index + 1}`" loading="lazy">
		</div>
	</div>

	<!-- 视频 -->
	<div v-if="props.moment.video" class="moment-video">
		<video
			:src="props.moment.video.id"
			:poster="props.moment.video.poster"
			controls
			preload="metadata"
		/>
	</div>

	<!-- 底部：标签和操作 -->
	<div class="moment-footer">
		<div class="tags">
			<span
				v-for="tag in props.moment.tags"
				:key="tag"
				class="tag"
			>
				<Icon name="ri:price-tag-3-line" />
				{{ tag }}
			</span>
		</div>
		<button
			class="reply-btn"
			title="发表评论"
			@click="replyMoment(props.moment.content)"
		>
			<Icon name="ri:chat-3-line" />
		</button>
	</div>
</div>
</template>

<style lang="scss" scoped>
.moment-card {
	background-color: var(--c-bg-1);
	border: 1px solid var(--c-border);
	border-radius: 12px;
	padding: 1rem;
	margin-bottom: 1rem;
	transition: transform 0.3s ease, box-shadow 0.3s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px var(--ld-shadow);
	}
}

.moment-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 0.75rem;

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;

		.avatar {
			width: 2.5rem;
			height: 2.5rem;
			border-radius: 50%;
			object-fit: cover;
		}

		.meta {
			.name {
				font-weight: 600;
				color: var(--c-text-1);
				font-size: 0.95rem;
			}

			.time {
				display: flex;
				align-items: center;
				gap: 0.25rem;
				font-size: 0.8rem;
				color: var(--c-text-3);
				margin-top: 0.15rem;

				:deep(.iconify) {
					font-size: 0.85rem;
				}
			}
		}
	}

	.location {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8rem;
		color: var(--c-text-3);

		:deep(.iconify) {
			font-size: 0.9rem;
		}
	}
}

.moment-content {
	color: var(--c-text-2);
	line-height: 1.7;
	margin-bottom: 0.75rem;

	// 强制 Emoji 字符使用支持彩色 Emoji 的字体
	font-family: var(--font-family), "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;

	// 隐藏 tg-emoji 的背景图片，只显示文本形式的 Emoji
	:deep(.emoji) {
		background-image: none !important;
		display: inline;
		font-style: normal;

		// 确保内部的 b 标签显示 Emoji 文本
		> b {
			font-weight: normal;
		}
	}

	// 隐藏 tg-emoji 标签的背景样式
	:deep(tg-emoji) {
		display: inline;

		.emoji {
			background-image: none !important;
		}
	}

	:deep(a) {
		color: var(--c-primary);
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}

	:deep(p) {
		margin: 0 0 0.5rem 0;

		&:last-child {
			margin-bottom: 0;
		}
	}

	// 粗体
	:deep(b),
	:deep(strong) {
		font-weight: 600;
		color: var(--c-text-1);
	}

	// 斜体
	:deep(i),
	:deep(em) {
		font-style: italic;
	}

	// 代码
	:deep(code) {
		font-family: var(--font-monospace);
		background-color: var(--c-bg-2);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
		color: var(--c-text-1);
	}

	// 代码块
	:deep(pre) {
		background-color: var(--c-bg-2);
		padding: 1rem;
		border-radius: 8px;
		overflow-x: auto;
		margin: 0.5rem 0;

		code {
			background-color: transparent;
			padding: 0;
		}
	}

	// 引用
	:deep(blockquote) {
		border-left: 3px solid var(--c-primary);
		margin: 0.5rem 0;
		padding-left: 1rem;
		color: var(--c-text-3);
	}

	// 列表
	:deep(ul),
	:deep(ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	:deep(ul) {
		list-style-type: disc;
	}

	:deep(ol) {
		list-style-type: decimal;
	}

	:deep(li) {
		margin: 0.25rem 0;
	}

	// 标题
	:deep(h1),
	:deep(h2),
	:deep(h3),
	:deep(h4),
	:deep(h5),
	:deep(h6) {
		margin: 1rem 0 0.5rem 0;
		font-weight: 600;
		color: var(--c-text-1);
	}

	:deep(h1) { font-size: 1.5rem; }
	:deep(h2) { font-size: 1.3rem; }
	:deep(h3) { font-size: 1.1rem; }
	:deep(h4),
	:deep(h5),
	:deep(h6) { font-size: 1rem; }

	// 分隔线
	:deep(hr) {
		border: none;
		border-top: 1px solid var(--c-border);
		margin: 1rem 0;
	}

	// 表格
	:deep(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 0.5rem 0;
		font-size: 0.9rem;

		th,
		td {
			padding: 0.5rem;
			border: 1px solid var(--c-border);
			text-align: left;
		}

		th {
			background-color: var(--c-bg-2);
			font-weight: 600;
		}

		tr:nth-child(even) {
			background-color: var(--c-bg-2);
		}
	}

	// 删除线
	:deep(del),
	:deep(s) {
		text-decoration: line-through;
		color: var(--c-text-3);
	}

	// 下划线
	:deep(u),
	:deep(ins) {
		text-decoration: underline;
	}

	// 上标和下标
	:deep(sup),
	:deep(sub) {
		font-size: 0.75em;
	}

	:deep(sup) {
		vertical-align: super;
	}

	:deep(sub) {
		vertical-align: sub;
	}

	// 内容中的 #标签 样式
	:deep(.content-tag) {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.8rem;
		padding: 0.15rem 0.5rem;
		background-color: var(--c-primary-soft, var(--c-bg-2));
		color: var(--c-primary);
		border-radius: 4px;
		margin: 0 0.1rem;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background-color: var(--c-primary);
			color: white;
		}
	}
}

.moment-images {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 0.25rem;
	margin-bottom: 0.75rem;
	max-width: 50%;

	.image-item {
		aspect-ratio: 1;
		border-radius: 4px;
		overflow: hidden;
		cursor: zoom-in;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.3s ease;

			&:hover {
				transform: scale(1.05);
			}
		}
	}
}

.moment-video {
	margin-bottom: 0.75rem;
	border-radius: 8px;
	overflow: hidden;

	video {
		width: 100%;
		max-height: 400px;
		border-radius: 8px;
	}
}

.moment-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 0.75rem;
	border-top: 1px solid var(--c-border);

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;

		.tag {
			display: flex;
			align-items: center;
			gap: 0.2rem;
			font-size: 0.75rem;
			padding: 0.2rem 0.5rem;
			background-color: var(--c-bg-2);
			border-radius: 4px;
			color: var(--c-text-3);

			:deep(.iconify) {
				font-size: 0.8rem;
			}
		}
	}

	.reply-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		background-color: transparent;
		color: var(--c-text-3);
		cursor: pointer;
		border-radius: 50%;
		transition: all 0.2s ease;

		&:hover {
			background-color: var(--c-bg-2);
			color: var(--c-primary);
		}

		:deep(.iconify) {
			font-size: 1.1rem;
		}
	}
}

// 响应式
@media (max-width: 600px) {
	.moment-images {
		grid-template-columns: repeat(2, 1fr);
	}
}
</style>
