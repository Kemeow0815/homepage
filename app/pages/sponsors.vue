<script setup lang="ts">
import PageBanner from '~/components/partial/PageBanner.vue'
import PageViewCounter from '~/components/partial/PageViewCounter.vue'

interface Sponsor {
	name: string
	avatar?: string
	date: string
	amount: string
}

useHead({
	title: '赞助支持',
})

definePageMeta({
	headerText: '赞助支持',
})

const sponsors = ref<Sponsor[]>([])
const isLoading = ref(true)
const error = ref('')

// 加载赞助数据
onMounted(async () => {
	try {
		const response = await fetch('https://cdn.jsdelivr.net/gh/Kemeow0815/sponsors@main/data/sponsors/sponsors.json')
		if (!response.ok) {
			throw new Error('加载赞助数据失败')
		}
		const data = await response.json()
		sponsors.value = data.sponsors || []
	}
	catch (e) {
		error.value = '加载赞助数据失败，请稍后重试'
		console.error('Failed to load sponsors:', e)
	}
	finally {
		isLoading.value = false
	}
})

// 其他支持方式
const supportMethods = [
	{
		icon: 'material-symbols:share',
		title: '分享推荐',
		desc: '将我的博客分享给更多朋友',
	},
	{
		icon: 'material-symbols:comment',
		title: '留言互动',
		desc: '在文章下方留下您的想法',
	},
	{
		icon: 'material-symbols:star',
		title: '关注订阅',
		desc: '订阅RSS或关注社交媒体',
	},
]

// 二维码数据
const alipayQr = 'https://jsd.268682.xyz/gh/zsxcoder/github-img@main/img/alp.avif'
const wechatQr = 'https://jsd.268682.xyz/gh/zsxcoder/github-img@main/img/weixin.avif'
</script>

<template>
<div class="sponsors-page">
	<!-- 页面横幅 -->
	<PageBanner
		title="赞助支持"
		description="如果您觉得我的内容对您有帮助，欢迎支持我的创作"
		image="https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/bg.webp"
	/>

	<div class="sponsors-container">
		<!-- 介绍区域 -->
		<div class="intro-section">
			<div class="intro-header">
				<div class="header-icon">
					<Icon name="material-symbols:favorite" />
				</div>
				<h2>赞助支持</h2>
			</div>
			<p class="intro-desc">
				如果您觉得我的内容对您有帮助，欢迎通过以下方式支持我的创作。您的每一份支持都是我持续创作的动力！
			</p>
			<p class="intro-sub">
				所有赞助将用于网站维护、服务器费用以及内容创作。
			</p>
		</div>

		<!-- 支付方式 -->
		<div class="payment-section">
			<h3 class="section-title">
				<Icon name="material-symbols:payments" />
				支付方式
			</h3>
			<div class="payment-grid">
				<!-- 支付宝 -->
				<div class="payment-card">
					<div class="payment-header">
						<div class="payment-icon alipay">
							<Icon name="simple-icons:alipay" />
						</div>
						<div class="payment-info">
							<h4>支付宝</h4>
							<span>扫码支付</span>
						</div>
					</div>
					<div class="qr-container">
						<img :src="alipayQr" alt="支付宝二维码" class="qr-image">
					</div>
				</div>

				<!-- 微信支付 -->
				<div class="payment-card">
					<div class="payment-header">
						<div class="payment-icon wechat">
							<Icon name="simple-icons:wechat" />
						</div>
						<div class="payment-info">
							<h4>微信支付</h4>
							<span>扫码支付</span>
						</div>
					</div>
					<div class="qr-container">
						<img :src="wechatQr" alt="微信支付二维码" class="qr-image">
					</div>
				</div>
			</div>
		</div>

		<!-- 其他支持方式 -->
		<div class="support-section">
			<h3 class="section-title">
				<Icon name="material-symbols:handshake" />
				其他支持方式
			</h3>
			<div class="support-list">
				<div v-for="method in supportMethods" :key="method.title" class="support-item">
					<div class="support-icon">
						<Icon :name="method.icon" />
					</div>
					<div class="support-content">
						<h4>{{ method.title }}</h4>
						<p>{{ method.desc }}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- 赞助者列表 -->
		<div class="sponsors-list-section">
			<div class="section-header">
				<h3 class="section-title">
					<Icon name="material-symbols:group" />
					已赞助的小伙伴
					<span v-if="!isLoading && sponsors.length > 0" class="sponsor-count">({{ sponsors.length }})</span>
				</h3>
				<a
					href="https://github.com/Kemeow0815/sponsors/blob/main/data/sponsors/sponsors.json"
					target="_blank"
					class="add-sponsor-btn"
				>
					<Icon name="ri:add-line" />
					添加赞助
				</a>
			</div>

			<!-- 加载状态 -->
			<div v-if="isLoading" class="loading-state">
				<div v-for="i in 3" :key="`skeleton-${i}`" class="sponsor-skeleton">
					<div class="skeleton-avatar" />
					<div class="skeleton-info">
						<div class="skeleton-line" />
						<div class="skeleton-line short" />
					</div>
				</div>
			</div>

			<!-- 错误状态 -->
			<div v-else-if="error" class="error-state">
				<Icon name="material-symbols:error-outline" class="error-icon" />
				<p>{{ error }}</p>
			</div>

			<!-- 空状态 -->
			<div v-else-if="sponsors.length === 0" class="empty-state">
				<Icon name="material-symbols:info-outline" class="empty-icon" />
				<p>暂无赞助记录</p>
			</div>

			<!-- 赞助者列表 -->
			<div v-else class="sponsors-list">
				<div v-for="sponsor in sponsors" :key="sponsor.name + sponsor.date" class="sponsor-item">
					<div class="sponsor-avatar">
						<img
							v-if="sponsor.avatar"
							:src="sponsor.avatar"
							:alt="`${sponsor.name}的头像`"
							loading="lazy"
							@error="($event.target as HTMLImageElement).style.display = 'none'"
						>
						<div v-else class="avatar-placeholder">
							<Icon name="material-symbols:person" />
						</div>
					</div>
					<div class="sponsor-info">
						<h4 class="sponsor-name">
							{{ sponsor.name }}
						</h4>
						<span class="sponsor-date">{{ sponsor.date }}</span>
					</div>
					<div class="sponsor-amount">
						{{ sponsor.amount }}
					</div>
				</div>
			</div>
		</div>

		<!-- 浏览量统计 -->
		<div class="page-views-wrapper">
			<PageViewCounter />
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.sponsors-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 20px;
}

.sponsors-container {
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

	.header-icon {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--c-primary-soft) 0%, var(--c-primary) 100%);
		border-radius: 10px;

		:deep(.iconify) {
			width: 1.25rem;
			height: 1.25rem;
			color: white;
		}
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--c-text-1);
		margin: 0;
	}
}

.intro-desc {
	font-size: 1rem;
	color: var(--c-text-1);
	line-height: 1.7;
	margin: 0 0 0.5rem 0;
}

.intro-sub {
	font-size: 0.9rem;
	color: var(--c-text-2);
	margin: 0;
}

// 区域标题
.section-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--c-text-1);
	margin: 0 0 1.25rem 0;

	:deep(.iconify) {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--c-primary);
	}

	.sponsor-count {
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--c-text-3);
	}
}

// 支付方式
.payment-section {
	padding: 2rem;
	border-bottom: 1px solid var(--c-border);
}

.payment-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1.5rem;
}

.payment-card {
	padding: 1.5rem;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	border-radius: 10px;
	transition: all 0.3s ease;

	&:hover {
		border-color: var(--c-primary-soft);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
	}
}

.payment-header {
	display: flex;
	align-items: center;
	gap: 0.875rem;
	margin-bottom: 1.25rem;
}

.payment-icon {
	width: 2.5rem;
	height: 2.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;

	&.alipay {
		background-color: #1677ff;
	}

	&.wechat {
		background-color: #07c160;
	}

	:deep(.iconify) {
		width: 1.25rem;
		height: 1.25rem;
		color: white;
	}
}

.payment-info {
	h4 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin: 0 0 0.25rem 0;
	}

	span {
		font-size: 0.8rem;
		color: var(--c-text-3);
	}
}

.qr-container {
	display: flex;
	justify-content: center;
	padding: 1rem;
	background-color: var(--c-bg-1);
	border-radius: 8px;
}

.qr-image {
	width: 160px;
	height: 160px;
	border-radius: 4px;
	object-fit: cover;
}

// 其他支持方式
.support-section {
	padding: 2rem;
	border-bottom: 1px solid var(--c-border);
}

.support-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.support-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	border-radius: 8px;
	transition: all 0.2s ease;

	&:hover {
		background-color: var(--c-bg-soft);
		border-color: var(--c-primary-soft);
	}
}

.support-icon {
	width: 2rem;
	height: 2rem;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--c-primary-soft);
	border-radius: 6px;
	flex-shrink: 0;

	:deep(.iconify) {
		width: 1rem;
		height: 1rem;
		color: var(--c-primary);
	}
}

.support-content {
	flex: 1;

	h4 {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin: 0 0 0.25rem 0;
	}

	p {
		font-size: 0.85rem;
		color: var(--c-text-2);
		margin: 0;
	}
}

// 赞助者列表
.sponsors-list-section {
	padding: 2rem;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1.25rem;

	.section-title {
		margin-bottom: 0;
	}
}

.add-sponsor-btn {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.5rem 0.875rem;
	background-color: var(--c-primary);
	color: var(--c-bg);
	font-size: 0.85rem;
	font-weight: 600;
	border-radius: 6px;
	text-decoration: none;
	transition: all 0.2s ease;
	border: 1px solid var(--c-primary);

	&:hover {
		background-color: var(--c-bg);
		color: var(--c-primary);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px var(--ld-shadow);
	}

	:deep(.iconify) {
		width: 1rem;
		height: 1rem;
	}
}

// 加载状态
.loading-state {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.sponsor-skeleton {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	background-color: var(--c-bg-2);
	border-radius: 8px;
}

.skeleton-avatar {
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 50%;
	background: linear-gradient(90deg, var(--c-bg-1) 25%, var(--c-bg-soft) 50%, var(--c-bg-1) 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
	flex-shrink: 0;
}

.skeleton-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.skeleton-line {
	height: 0.875rem;
	width: 60%;
	border-radius: 4px;
	background: linear-gradient(90deg, var(--c-bg-1) 25%, var(--c-bg-soft) 50%, var(--c-bg-1) 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;

	&.short {
		width: 40%;
	}
}

@keyframes loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

// 错误和空状态
.error-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 3rem 2rem;
	background-color: var(--c-bg-2);
	border-radius: 8px;
	border: 1px dashed var(--c-border);

	.error-icon,
	.empty-icon {
		width: 3rem;
		height: 3rem;
		color: var(--c-text-3);
		margin-bottom: 1rem;
	}

	p {
		font-size: 0.95rem;
		color: var(--c-text-3);
		margin: 0;
	}
}

// 赞助者列表
.sponsors-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.sponsor-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	border-radius: 8px;
	transition: all 0.2s ease;

	&:hover {
		background-color: var(--c-bg-soft);
		border-color: var(--c-primary-soft);
	}
}

.sponsor-avatar {
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 50%;
	overflow: hidden;
	flex-shrink: 0;
	background-color: var(--c-bg-1);
	border: 1px solid var(--c-border);

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;

		:deep(.iconify) {
			width: 1.25rem;
			height: 1.25rem;
			color: var(--c-text-3);
		}
	}
}

.sponsor-info {
	flex: 1;

	.sponsor-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin: 0 0 0.25rem 0;
	}

	.sponsor-date {
		font-size: 0.8rem;
		color: var(--c-text-3);
	}
}

.sponsor-amount {
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--c-primary);
	padding: 0.25rem 0.75rem;
	background-color: var(--c-primary-soft);
	border-radius: 20px;
}

// 响应式
@media (max-width: 768px) {
	.sponsors-page {
		padding: 10px;
	}

	.page-views-wrapper {
		display: flex;
		justify-content: center;
		padding: 1rem;
		border-top: 1px solid var(--c-border);
	}

	.intro-section,
	.payment-section,
	.support-section,
	.sponsors-list-section {
		padding: 1.5rem 1rem;
	}

	.intro-header {
		h2 {
			font-size: 1.25rem;
		}
	}

	.payment-grid {
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.payment-card {
		padding: 1.25rem;
	}

	.qr-image {
		width: 140px;
		height: 140px;
	}
}
</style>
