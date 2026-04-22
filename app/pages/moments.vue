<script setup lang="ts">
import MomentsList from '~/components/partial/MomentsList.vue'
import PageBanner from '~/components/partial/PageBanner.vue'
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
const momentsType = computed(() => appConfig.moments?.type || 'local')

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
</script>

<template>
<div class="moments-page">
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
</div>
</template>

<style lang="scss" scoped>
.moments-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 20px;
}

// 响应式
@media (max-width: 600px) {
	.moments-page {
		padding: 10px;
	}
}
</style>
