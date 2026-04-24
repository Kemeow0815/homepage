<script setup lang="ts">
import PageBanner from '~/components/partial/PageBanner.vue'
import PageViewCounter from '~/components/partial/PageViewCounter.vue'
import TwikooComments from '~/components/partial/TwikooComments.vue'

useHead({
	title: '留言',
})

definePageMeta({
	headerText: '留言',
})

// 留言介绍内容
interface IntroItem {
	icon: string
	title: string
	desc: string
	link?: string
	linkText?: string
}

const introItems: IntroItem[] = [
	{
		icon: 'ri:chat-heart-line',
		title: '畅所欲言',
		desc: '无论是技术交流、生活分享还是建议反馈，都欢迎在此留言',
	},
	{
		icon: 'ri:links-line',
		title: '友情链接',
		desc: '想要交换友链的朋友，请前往',
		link: '/addlinks',
		linkText: '申请友链页面',
	},
	{
		icon: 'ri:bug-line',
		title: '问题反馈',
		desc: '发现网站问题或有改进建议，请随时告诉我',
	},
]
</script>

<template>
<div class="message-page">
	<!-- 页面横幅 -->
	<PageBanner
		title="期待与您建立友好的互联网连接……"
		description="欢迎留言交流，无论是技术探讨、生活分享还是建议反馈"
		image="https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/bg.webp"
	/>

	<div class="message-container">
		<!-- 介绍区域 -->
		<div class="intro-section">
			<div class="intro-header">
				<Icon name="ri:mail-send-line" class="intro-icon" />
				<h2>留言板</h2>
			</div>
			<p class="intro-desc">
				欢迎来到我的留言板！这里是一个开放的交流空间，期待与你的每一次互动。
			</p>

			<div class="intro-grid">
				<div v-for="item in introItems" :key="item.title" class="intro-card">
					<div class="card-icon">
						<Icon :name="item.icon" />
					</div>
					<h3>{{ item.title }}</h3>
					<p>
						{{ item.desc }}
						<NuxtLink v-if="item.link" :to="item.link" class="desc-link">
							{{ item.linkText }}
						</NuxtLink>
					</p>
				</div>
			</div>
		</div>

		<!-- 评论区 -->
		<div class="comments-section">
			<TwikooComments />
		</div>

		<!-- 浏览量统计 -->
		<div class="page-views-wrapper">
			<PageViewCounter />
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.message-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 20px;
}

.message-container {
	background-color: var(--c-bg-1);
	border: 1px solid var(--c-border);
	border-radius: 12px;
	overflow: hidden;
}

// 介绍区域
.intro-section {
	padding: 2rem;
	border-bottom: 1px solid var(--c-border);
}

.intro-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 1rem;

	.intro-icon {
		width: 1.75rem;
		height: 1.75rem;
		color: var(--c-primary);
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--c-text-1);
		margin: 0;
	}
}

.intro-desc {
	font-size: 0.95rem;
	color: var(--c-text-2);
	line-height: 1.7;
	margin: 0 0 1.5rem 0;
}

.intro-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1rem;
}

.intro-card {
	padding: 1.25rem;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	border-radius: 10px;
	transition: all 0.3s ease;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
		border-color: var(--c-primary-soft);
	}

	.card-icon {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--c-primary-soft) 0%, var(--c-primary) 100%);
		border-radius: 10px;
		margin-bottom: 0.875rem;

		:deep(.iconify) {
			width: 1.25rem;
			height: 1.25rem;
			color: white;
		}
	}

	h3 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin: 0 0 0.5rem 0;
	}

	p {
		font-size: 0.85rem;
		color: var(--c-text-2);
		line-height: 1.6;
		margin: 0;
	}

	.desc-link {
		color: var(--c-primary);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;

		&:hover {
			color: var(--c-primary-deep);
			text-decoration: underline;
		}
	}
}

// 评论区
.comments-section {
		padding: 2rem;
	}

	.page-views-wrapper {
		display: flex;
		justify-content: center;
		padding: 1rem;
		border-top: 1px solid var(--c-border);
		background-color: var(--c-bg-soft);
	}

// 响应式
@media (max-width: 768px) {
	.message-page {
		padding: 10px;
	}

	.intro-section {
		padding: 1.5rem 1rem;
	}

	.intro-header {
		h2 {
			font-size: 1.25rem;
		}
	}

	.intro-grid {
		grid-template-columns: 1fr;
		gap: 0.875rem;
	}

	.intro-card {
		padding: 1rem;
	}

	.comments-section {
		padding: 1.5rem 1rem;
	}
}
</style>
