// 存储 nuxt.config 和 app.config 共用的配置

import type { NitroConfig } from 'nitropack'

const author = {
	name: '克喵爱吃卤面',
	avatar: 'https://avatars-githubusercontent-webp.webp.se/Kemeow0815',
	email: 'mcy@kemiaosw.top',
	homepage: 'https://www.kemiaosw.top/',
}

// ==================== 主页个人配置 ====================

// 顶部信息
const topInfo = {
	avatar: 'https://wsrv.nl/?url=github.com%2FKemeow0815.png',
	siteName: '克喵爱吃卤面',
	motto: '每一段旅行，都有终点。',
	floatText: [
		'博客写作者',
		'主题魔改者',
		'Windows 11',
		'Android 16',
		'网络不说话',
		'小说爱好者',
		'平时爱摸鱼',
		'RSS爱好者',
	],
}

// 个人信息
const personalInfo = {
	name: 'MCY',
	gender: '男',
	address: '江苏苏州',
	school: '南京工业职业技术大学',
	grade: '二〇二三级',
	major: '自动化技术与应用',
	email: 'mcy@kemiaosw.top',
	qq: '3813596020',
	birthday: '2005/08/15',
}

// 性格类型
const personality = {
	type: 'INFJ-T',
	typeName: '提倡者',
	svg: 'https://jsd.268682.xyz/gh/zsxcoder/github-img@main/img/infj.avif',
	url: 'https://www.16personalities.com/infj-personality',
	description: '倡导者是默默的远见者，他们往往是鼓舞人心、不知疲倦的理想主义者。',
}

// 个人描述及社交链接
const descriptionAndSocial = {
	description: '大家好！这里是克喵爱吃卤面的小站。为什么叫克喵爱吃卤面呢？「克喵」来自小说《诡秘之主》的主角，「卤面」来自《宿命之环》主角卢米安·李。你可以称呼我克喵。目前在南京就学，博客是兴趣使然，没什么技术，只会CTRL CV。不常聊天，网上找我的，我会回，但是一般不会聊久，见谅。最后，欢迎您来到我的主页！',
	socialLinks: [
		{ platform: 'GitHub', url: 'https://github.com/Kemeow0815', icon: 'ri:github-line' },
		{ platform: 'Gitee', url: 'https://gitee.com/kemiaoshiwo', icon: 'ri:gitee-line' },
		{ platform: 'QQ', url: 'https://qm.qq.com/q/cX0MfAZEQg', icon: 'ri:qq-line' },
		{ platform: 'Mail', url: 'mailto:mcy@kemiaosw.top', icon: 'mynaui:mail' },
		{ platform: 'BiliBili', url: 'https://space.bilibili.com/3546643173477234', icon: 'dinkie-icons:bilibili' },
		{ platform: 'Telegram', url: 'https://t.me/yxksw', icon: 'ri:telegram-line' },
	],
}

// 技能列表（使用图标链接）
const skills = {
	technical: [
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/astro.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/css.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/git.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/html.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/js.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/markdown.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/ts.svg',
	],
	general: [
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/nextjs.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/node.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/nuxt.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/php.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/vite.svg',
		'https://jsd.268682.xyz/gh/yxksw/icons@main/skills/vue.svg',
	],
	learning: '正在持续学习中',
}

// 项目列表
const projects = [
	{ name: 'miaoluoge-links', description: '我的友链屋', url: 'https://github.com/Kemeow0815/miaoluoge-links' },
	{ name: 'Gridea-pro-flavor-theme', description: 'Grideo-pro主题自用', url: 'https://github.com/Kemeow0815/Gridea-pro-flavor-theme' },
	{ name: 'Homepage', description: '纸鹿的个人主页自用', url: 'https://github.com/Kemeow0815/homepage' },
]

// 兴趣爱好
const hobbies = ['阅读', '写作', '编程', '小说']

// 自我评价
const selfEvaluation = {
	thoughts: '思想上乐观开朗，乐于助人，具有团队协作精神及创新意识。',
	work: '工作上极富责任心与信念感，对待工作认真负责，有较强的组织管理及动手能力。',
	summary: '人嘎嘎好！',
}

// ==================== 主页配置导出 ====================

const homepageConfig = {
	title: '克喵(KeMiao)',
	subtitle: '每一段旅行，都有终点。',
	description: '欢迎来到我的主页，你可以在这里了解我的信息。',
	author,
	language: 'zh-CN',
	timeZone: 'Asia/Shanghai',
	favicon: '/icon.png',
	url: 'https://www.kemiaosw.top/',
	blog: {
		url: 'https://kemeow0815.github.io/',
		atom: 'https://kemeow0815.github.io/feed.xml',
		link: 'https://kemeow0815.github.io/links',
		archive: 'https://kemeow0815.github.io/archives',
		name: '喵洛阁',
	},

	// 主页个人配置
	topInfo,
	personalInfo,
	personality,
	descriptionAndSocial,
	skills,
	projects,
	hobbies,
	selfEvaluation,

	// Moments 即刻短文配置
	moments: {
		// 数据源类型: 'local' | 'ispeak' | 'tgtalk'
		type: 'tgtalk',
		// 本地配置
		local: {
			pageSize: 10,
		},
		// ispeak API 配置
		ispeak: {
			api: 'https://ispeak.api.example.com/',
			author: '',
			pageSize: '20',
		},
		// tgtalk API 配置
		tgtalk: {
			url: 'https://tgtalk.kemeow.top/',
		},
	},
}

// https://nitro.build/config#routerules
export const routeRules: NitroConfig['routeRules'] = {
	'/api/avatar.png': { redirect: author.avatar },
	'/api/icon.png': { redirect: homepageConfig.favicon },
	'/favicon.ico': { redirect: homepageConfig.favicon },
}

export default homepageConfig
