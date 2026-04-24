<script setup lang="ts">
import GitHubContributions from '~/components/partial/GitHubContributions.vue'
import PageViewCounter from '~/components/partial/PageViewCounter.vue'

useHead({ title: '日志' })
definePageMeta({ headerText: '互联网上的活动记录' })

const timeline = {
	'2026-04-18': [`开始大改主页`],
}

// GitHub 用户名
const githubUsername = 'Kemeow0815'
</script>

<template>
<div class="log-page">
	<!-- GitHub 贡献图 -->
	<GitHubContributions :username="githubUsername" />

	<!-- 时间线 -->
	<ZTimeline :timeline />

	<!-- 浏览量统计 -->
	<div class="page-views-wrapper">
		<PageViewCounter />
	</div>
</div>
</template>

<style lang="scss" scoped>
.log-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 20px;
}

@media (max-width: 768px) {
	.log-page {
		padding: 10px;
	}
}

.page-views-wrapper {
	display: flex;
	justify-content: center;
	margin-top: 1rem;
}
</style>
