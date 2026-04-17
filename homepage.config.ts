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
	name: '柳清扬',
	gender: '男',
	address: '陕西西安',
	school: '武汉理工大学',
	grade: '二〇二一级',
	major: '人工智能',
	email: '01@liushen.fun',
	qq: '3162475700',
	birthday: '2003/01/01',
}

// 性格类型
const personality = {
	type: 'ENFJ-T',
	typeName: '主人公',
	svg: '/config/img/enfj.svg',
	url: 'https://cdn.jsdmirror.com/gh/zsxcoder/github-img@main/img/infj.avif',
	description: '富有魅力和鼓舞人心的领导者，能够吸引和激励他人。',
}

// 个人描述及社交链接
const descriptionAndSocial = {
	description: '大家好！这里是清羽飞扬的小站。为什么叫清羽飞扬呢？因为"清扬"是我的名字，而"飞扬"代表着自由和轻盈，这与我的性格不谋而合。我是一个充满热情、富有同情心的人，喜欢与人交流，乐于分享我的想法和见解。在这里，我会分享我的生活点滴、兴趣爱好以及对世界的观察和思考。希望我的小站能给大家带来一些启发和乐趣。',
	socialLinks: [
		{ platform: 'GitHub', url: 'https://github.com/willow-god', icon: 'ri:github-line' },
		{ platform: 'Gitee', url: 'https://gitee.com/willow-god', icon: 'ri:git-repository-line' },
		{ platform: 'QQ', url: 'https://qm.qq.com/cgi-bin/qm_share/open_source_page?uin=3162475700&jump_from=webapi', icon: 'ri:qq-line' },
	],
}

// 技能列表（使用图标链接）
const skills = {
	technical: [
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/633005bf0fd1e.jpg',
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/63300647df7fa.png',
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/63300647e1f10.png',
		'https://img02.anheyu.com/adminuploads/1/2022/09/26/6330ff27e5c9b.png',
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/63300647dea51.png',
		'https://img02.anheyu.com/adminuploads/1/2023/05/09/645a45854e093.png',
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/633001374747b.png',
	],
	general: [
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/633006cc55e07.png',
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/633006eee047b.png',
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/633006f9ab27d.png',
		'https://img02.anheyu.com/adminuploads/1/2023/04/11/6434a635e9726.webp',
		'https://img02.anheyu.com/adminuploads/1/2022/09/25/633007087a4dc.webp',
	],
	learning: '正在持续学习中',
}

// 项目列表
const projects = [
	{ name: 'Friend-Circle-lite', description: '轻量化友链朋友圈', url: 'https://github.com/willow-god/Friend-Circle-Lite' },
	{ name: 'Hexo-Safego', description: 'hexo插件之安全跳转中转页', url: 'https://github.com/willow-god/hexo-safego' },
]

// 兴趣爱好
const hobbies = ['阅读', '写作', '编程', '摄影']

// 自我评价
const selfEvaluation = {
	thoughts: '思想上乐观开朗，乐于助人，具有团队协作精神及创新意识。',
	work: '工作上极富责任心与信念感，对待工作认真负责，有较强的组织管理及动手能力。',
	summary: '人嘎嘎好！',
}

// ==================== 主页配置导出 ====================

const homepageConfig = {
	title: '纸鹿 (@L33Z22L11)',
	subtitle: '纸鹿至麓不知路，支炉制露不止漉',
	description: '纸鹿（也称作纸鹿本鹿、Zhilu、L33Z22L11）是一名开源爱好者，这是纸鹿的个人主页。他有一个博客「纸鹿摸鱼处」，记录了他在生活和技术学习中的点滴经历，充满启发与思考。他的个人主页和博客界面简洁美观，内容丰富实用，人气互动活跃，涵盖了编程、生活、学习等多个领域，为读者提供了卓越的阅读体验。',
	author,
	language: 'zh-CN',
	timeZone: 'Asia/Shanghai',
	favicon: '/icon.png',
	url: 'https://www.zhilu.site/',
	blogAtom: 'https://blog.zhilu.site/atom.xml',
	// 主页个人配置
	topInfo,
	personalInfo,
	personality,
	descriptionAndSocial,
	skills,
	projects,
	hobbies,
	selfEvaluation,
}

// https://nitro.build/config#routerules
export const routeRules: NitroConfig['routeRules'] = {
	'/api/avatar.png': { redirect: author.avatar },
	'/api/icon.png': { redirect: homepageConfig.favicon },
	'/favicon.ico': { redirect: homepageConfig.favicon },
}

export default homepageConfig
