import type { Nav } from '~/types/nav'
import { h } from 'vue'
import homepageConfig from '~~/homepage.config'

// 图标查询：https://yesicon.app/ph
// 图标插件：https://marketplace.visualstudio.com/items?itemName=antfu.iconify

// @keep-sorted
export default defineAppConfig({
	...homepageConfig,

	footer: [
		`© 2026 克喵爱吃卤面 (Kemeow0815)`,
		// h('a', { href: 'https://beian.miit.gov.cn/', target: '_blank', rel: 'noopener nofollow' }, '陕ICP备2025082251号'),
	],

	// 用于在主页展示下游引用
	fork: [
		{
			img: 'https://api-space.tnxg.top/avatar?s=qq',
			link: 'https://tnxg.top/',
			text: '天翔TNXG',
		},
		{
			img: 'https://ykc.im/icon.png',
			link: 'https://ykc.im/',
			text: 'York Chou',
		},
		{
			img: 'https://q1.qlogo.cn/g?b=qq&nk=1043865083&s=2',
			link: 'https://www.xlenco.top/',
			text: 'Xlenco',
		},
		{
			img: 'https://www.mugzx.top/icon.png',
			link: 'https://www.mugzx.top/',
			text: 'Mugzx',
		},
		{
			img: 'https://q1.qlogo.cn/g?b=qq&nk=3310149631&s=2',
			link: 'https://gr114.com/',
			text: 'GreenRoc',
		},
		{
			img: 'https://wsrv.nl/?url=github.com/scfcn.png%3fsize=92',
			link: 'https://www.qxzhan.cn/',
			text: '筱序二十',
		},
		{
			img: 'https://file.furrys.im/img/logo.webp',
			link: 'https://www.furrys.im/',
			text: 'lpcay',
		},
		{
			img: 'https://wsrv.nl/?url=github.com/zsxcoder.png%3fsize=92',
			link: 'https://home.zsxcoder.top/',
			text: '钟神秀',
		},
	],

	nav: [
		{
			title: '',
			items: [
				{ icon: 'ri:id-card-line', text: '简介', url: '/' },
				{ icon: 'ri:quill-pen-line', text: '文章', url: '/article' },
				{ icon: 'ri:chat-smile-line', text: '即刻', url: '/moments' },
				{
					icon: 'ri:links-line',
					text: '友链',
					url: '#',
					children: [
						{ icon: 'tabler:friends', text: '友链屋', url: 'https://www.268682.xyz' },
						{ icon: 'ri:add-circle-line', text: '申请友链', url: '/addlinks' },
					],
				},
				// {
				// 	icon: 'material-symbols:page-footer-outline',
				// 	text: '页面',
				// 	url: '#',
				// 	children: [
				// 		{ icon: 'meteor-icons:bilibili', text: '追番', url: '/bangumi' },
				// 		{ icon: 'tdesign:device', text: '装备', url: '/equipment' },
				// 		{ icon: 'bxs:hot', text: '热榜', url: '/hot' },
				// 		{ icon: 'material-symbols:calendar-month', text: '课表', url: '/timetable' },
				// 	],
				// },
				{ icon: 'jam:tools', text: '工具', url: '/tools' },
				// { icon: 'ri:planet-line', text: '站点', url: '/site' },
				// { icon: 'ri:history-line', text: '日志', url: '/log' },
			],
		},
		{
			title: '社交',
			items: [
				{ icon: 'ri:qq-line', text: 'id: 3813596020', url: 'https://qm.qq.com/q/cX0MfAZEQg' },
				{ icon: 'ri:mail-line', text: 'mcy@kemiaosw.top', url: 'mailto:mcy@kemiaosw.top' },
				{ icon: 'ri:github-line', text: 'Github', url: 'https://github.com/Kemeow0815' },
				{ icon: 'ri:telegram-line', text: 'Telegram', url: 'https://t.me/yxksw' },
			],
		},
	] satisfies Nav,

	themes: {
		light: {
			icon: 'ri:sun-line',
			tip: '浅色模式',
		},
		system: {
			icon: 'ri:tv-2-line',
			tip: '跟随系统',
		},
		dark: {
			icon: 'ri:moon-line',
			tip: '深色模式',
		},
	},
})
