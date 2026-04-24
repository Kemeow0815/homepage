<script setup lang="ts">
import MomentsList from '~/components/partial/MomentsList.vue'
import PageBanner from '~/components/partial/PageBanner.vue'
import PageViewCounter from '~/components/partial/PageViewCounter.vue'
import TwikooComments from '~/components/partial/TwikooComments.vue'

useHead({
	title: '即刻',
	script: [
		{
			src: '/js/lightbox.js',
			defer: true,
		},
	],
})
definePageMeta({
	alias: ['/moments', '/essay'],
	headerText: '即刻短文',
})

const appConfig = useAppConfig()
const twikooRef = ref<InstanceType<typeof TwikooComments>>()

// 根据配置决定使用哪种数据源
type MomentsType = 'local' | 'ispeak' | 'tgtalk'
const momentsType = computed<MomentsType>(() => {
	const type = appConfig.moments?.type
	if (type === 'tgtalk' || type === 'ispeak') {
		return type
	}
	return 'local'
})

// 处理评论按钮点击
function handleComment(content?: string) {
	if (content) {
		// 有内容时插入引用
		twikooRef.value?.insertQuote(content)
	}
	else {
		// 无内容时只滚动到评论区
		twikooRef.value?.scrollToComments()
	}
}

// 提供评论处理方法给子组件
provide('handleComment', handleComment)

// Toast 提示
const showVpnToast = ref(true)

function closeVpnToast() {
	showVpnToast.value = false
}
</script>

<template>
<div class="moments-page">
	<!-- VPN 提示 Toast -->
	<Transition name="toast">
		<div v-if="showVpnToast" class="vpn-toast">
			<div class="toast-content">
				<Icon name="ri:global-line" class="toast-icon" />
				<div class="toast-text">
					<p class="toast-title">
						网络提示
					</p>
					<p class="toast-desc">
						说说数据来自非大陆地区，如遇加载失败请开启 VPN
					</p>
				</div>
				<button class="toast-close" @click="closeVpnToast">
					<Icon name="ri:close-line" />
				</button>
			</div>
		</div>
	</Transition>

	<!-- 页面横幅 -->
	<PageBanner
		title="即刻短文"
		description="记录生活中的点滴"
		image="https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/bg.webp"
	/>

	<!-- 即刻列表 -->
	<MomentsList :type="momentsType" />

	<!-- Twikoo 评论区 -->
	<TwikooComments ref="twikooRef" />

	<!-- 浏览量统计 -->
	<div class="page-views-wrapper">
		<PageViewCounter />
	</div>
</div>
</template>

<style lang="scss" scoped>
.moments-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 20px;
}

// VPN Toast
.vpn-toast {
	position: fixed;
	top: 80px;
	right: 20px;
	z-index: 100;
	width: 380px;
	max-width: calc(100vw - 40px);
}

.toast-content {
	display: flex;
	align-items: center;
	gap: 0.875rem;
	padding: 1rem 1.25rem;
	background: linear-gradient(135deg, var(--c-primary-soft) 0%, var(--c-bg-1) 100%);
	border: 1px solid var(--c-primary);
	border-radius: 12px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(10px);
}

.toast-icon {
	width: 1.5rem;
	height: 1.5rem;
	color: var(--c-primary);
	flex-shrink: 0;
}

.toast-text {
	flex: 1;
	min-width: 0;

	.toast-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin: 0 0 0.25rem 0;
	}

	.toast-desc {
		font-size: 0.85rem;
		color: var(--c-text-2);
		margin: 0;
		line-height: 1.5;
	}
}

.toast-close {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	padding: 0;
	background: none;
	border: none;
	border-radius: 6px;
	color: var(--c-text-3);
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;

	:deep(.iconify) {
		width: 1.25rem;
		height: 1.25rem;
	}

	&:hover {
		background-color: var(--c-bg-2);
		color: var(--c-primary);
	}
}

// Toast 动画
.toast-enter-active,
.toast-leave-active {
	transition: all 0.3s ease;
}

.toast-enter-from {
	opacity: 0;
	transform: translateX(20px);
}

.toast-leave-to {
	opacity: 0;
	transform: translateX(20px);
}

// 响应式
@media (max-width: 768px) {
	.vpn-toast {
		top: 70px;
		right: 10px;
		width: calc(100vw - 20px);
		max-width: 400px;
	}

	.toast-content {
		padding: 0.875rem 1rem;
	}

	.toast-text {
		.toast-title {
			font-size: 0.9rem;
		}

		.toast-desc {
			font-size: 0.8rem;
		}
	}
}

@media (max-width: 480px) {
	.vpn-toast {
		top: 60px;
		right: 10px;
		left: 10px;
		width: auto;
		max-width: none;
	}

	.toast-content {
		padding: 0.75rem 0.875rem;
	}

	.toast-icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.toast-text {
		.toast-title {
			font-size: 0.85rem;
		}

		.toast-desc {
			font-size: 0.75rem;
		}
	}

	.toast-close {
		width: 1.75rem;
		height: 1.75rem;
	}
}

@media (max-width: 600px) {
	.moments-page {
		padding: 10px;
	}
}

.page-views-wrapper {
	display: flex;
	justify-content: center;
	margin-top: 1rem;
}
</style>
