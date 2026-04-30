<script setup lang="ts">
import type { CardProps } from '~/components/partial/Card.vue'
import { ZLink } from '#components'
import PageViewCounter from '~/components/partial/PageViewCounter.vue'

useHead({ title: '站点' })
definePageMeta({ headerText: '一些网站' })

const webSites: Array<CardProps> = [
	{
		name: '我的主博客',
		nameAlt: 'Gridea-pro-flavor-theme',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://kemeow0815.github.io' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/Gridea-pro-flavor-theme' },
		],
		desc: '基于Gridea-Pro的flavor主题自改使用。”。',
	},
	{
		name: '我的主页',
		nameAlt: 'Homepage',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://www.kemiaosw.top' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/homepage' },
		],
		desc: '纸鹿的主页自用。',
	},
	{
		name: '克喵の友链屋',
		nameAlt: 'miaoluoge-links',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://www.kemiaosw.top' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/miaoluoge-links' },
		],
		desc: '克喵の友链屋',
	},
	{
		name: '克喵のGists',
		nameAlt: 'opengist',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://gist.268682.xyz' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/opengist' },
		],
		desc: '克喵の代码片段',
	},
	{
		name: '克喵の多端截图',
		nameAlt: 'screenshot',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://screenshot.268682.xyz' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/screenshot' },
		],
		desc: '克喵の多端截图',
	},
	{
		name: '克喵の内容中转',
		nameAlt: 'paste-share',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://paste.268682.xyz' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/paste-share' },
		],
		desc: '克喵の内容中转',
	},
	{
		name: '我的图床',
		nameAlt: 'KeMiao ImgBed',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://imgbed.268682.xyz' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/img-bed' },
		],
		desc: '我的图床',
	},
	{
		name: '我的封面生成器',
		nameAlt: 'KeMiao Cover Generator',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://kemeow0815.github.io/cover' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/cover' },
		],
		desc: '我的封面生成器',
	},
	{
		name: '我的音乐播放器',
		nameAlt: 'KeMiao Music',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://kemeow0815.github.io/music' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/music' },
		],
		desc: '基于HeoMusic的自用音乐播放器',
	},
	{
		name: '我的课表',
		nameAlt: 'KeMiao TimeTable',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://kemeow0815.github.io/timetable' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/timetable' },
		],
		desc: '我的自用课表',
	},
	{
		name: '支付二维码合并版',
		nameAlt: 'PayQrCode',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://qrcode.268682.xyz' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/PayQrcode' },
		],
		desc: '韩小寒的支付二维码合并版',
	},
	{
		name: '我的赞助页',
		nameAlt: 'Sponsor',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://kemeow0815.github.io/sponsor' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/sponsor' },
		],
		desc: '我的赞助页',
	},
	{
		name: 'Gwitter',
		nameAlt: 'Gwitter',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://gwitter.268682.xyz' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/gwitter' },
		],
		desc: '说说',
	},
	{
		name: 'Ke Miao Analytics',
		nameAlt: 'web-analytics',
		buttons: [
			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://analytics.268682.xyz' },
			{ icon: 'ph:github-logo-duotone', text: 'GitHub', to: 'https://github.com/Kemeow0815/HanAnalytics' },
		],
		desc: '基于github的网站分析',
	},
]

// const orgSites: Array<CardProps> = [
// 	{
// 		name: '西邮Linux兴趣小组',
// 		nameAlt: 'Xiyou Linux Group',
// 		buttons: [
// 			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://xiyoulinux.com' },
// 		],
// 		desc: '西安邮电大学计算机学院2006年9月建立的一个兴趣小组。本人于2022年10月22日成为其中一员，于2024年3月16日使用VitePress重建官网。',
// 	},
// 	{
// 		name: '野生技协',
// 		nameAlt: 'TECHYES',
// 		buttons: [
// 			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://thisis.host' },
// 		],
// 		desc: [
// 			'宝鸡中学校内的一个自发性的技术协助组织、无门槛的技术交流群，旨在信息分享、交流与公开，于2020年7月20日对外开放，多个',
// 			h(ZLink, { to: 'https://thisis.host/site', text: '二级域名' }),
// 			'为校友提供项目部署服务。官网于2021年8月8日建立，并于2024年2月3日升级为博客。',
// 		],
// 	},
// 	{
// 		name: '邮立方',
// 		nameAlt: 'Cube of Posts',
// 		buttons: [
// 			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://cop.cooo.site' },
// 		],
// 		desc: [
// 			'西安邮电大学校内的Minecraft兴趣交流团体，',
// 			h(ZLink, { to: 'https://www.mualliance.cn/', text: 'Minecraft高校联盟(MUA)' }),
// 			'成员，于2023年10月6日对外开放。官网于2024年1月1日建立，并于2024年2月10日升级为博客。',
// 		],
// 	},
// 	{
// 		name: '方块茶话会',
// 		nameAlt: 'Block Tea Reception',
// 		buttons: [
// 			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://btr.thisis.host/' },
// 		],
// 		desc: [
// 			'宝鸡中学校内的Minecraft爱好群体，由',
// 			h(ZLink, { icon: 'ph:github-logo-duotone', to: 'https://github.com/guuguai/', text: '古古怪怪GuuGuai' }),
// 			'于2020年7月17日建立。帮助文档网站于2022年6月12日建立，并于2024年2月21日迁移。',
// 		],
// 	},
// 	{
// 		name: '相侵相碍异家人',
// 		nameAlt: 'Alien Family Hub',
// 		buttons: [
// 			{ icon: 'ph:planet-duotone', text: '访问', to: 'https://alienfamily.us.kg/' },
// 		],
// 		desc: 'Hexo博客交流群“糖果屋”的群友组织的Minecraft服务器，于2024年7月18日建群。2025年2月2日创建了成员列表页面。',
// 	},
// ]
</script>

<template>
<ZTitle>我的站点</ZTitle>
<ZCardList :data-list="webSites" />
<!-- <ZTitle>组织门户</ZTitle>
<ZCardList :data-list="orgSites" /> -->
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
</style>
