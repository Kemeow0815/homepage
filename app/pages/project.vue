<script setup lang="ts">
import PageViewCounter from '~/components/partial/PageViewCounter.vue'

useHead({ title: '项目' })
definePageMeta({ headerText: '参与的开源项目' })

const projects = [
	{
		title: 'Gridea-pro-flavor-theme',
		github: 'Kemeow0815/Gridea-pro-flavor-theme',
		description: 'Gridea-pro主题自改',
	},
	{
		title: 'homepage',
		github: 'Kemeow0815/homepage',
		description: '纸鹿博客个人自用魔改',
	},
	{
		title: 'miaoluoge-links',
		github: 'Kemeow0815/miaoluoge-links',
		description: '克喵の友链屋',
	},
	{
		title: 'smtp-feed',
		github: 'Kemeow0815/smtp-feed',
		description: '订阅我的博客',
	},
]
</script>

<template>
<section>
	<ZProject v-for="project in projects" :key="project.title" v-bind="project" />
</section>
<div class="page-views-wrapper">
	<PageViewCounter />
</div>
</template>

<style lang="scss" scoped>
.page-views-wrapper {
	display: flex;
	justify-content: center;
	margin-top: 1rem;
}
</style>

<style lang="scss" scoped>
section {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
	gap: 1rem;
}
</style>
