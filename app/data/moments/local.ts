import type { MomentItem } from '~/types/moments'

/**
 * 本地即刻短文数据
 * 按照时间倒序排列，最新的在前面
 */
export const localMoments: MomentItem[] = [
	{
		id: '1',
		content: '今天天气真不错，出去散步了一下，感觉心情都变好了！',
		date: '2026-04-18 15:30',
		tags: ['生活', '日常'],
		location: '南京',
	},
	{
		id: '2',
		content: '刚刚完成了一个项目的重构，代码整洁了很多，感觉很有成就感。',
		date: '2026-04-17 22:15',
		tags: ['编程', '工作'],
	},
	{
		id: '3',
		content: '读了一本好书，收获满满，推荐给大家！',
		date: '2026-04-16 20:00',
		images: [
			'https://img02.anheyu.com/adminuploads/1/2022/09/25/633005bf0fd1e.jpg',
		],
		tags: ['阅读', '分享'],
	},
	{
		id: '4',
		content: '测试一下视频功能',
		date: '2026-04-15 18:30',
		video: {
			id: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
			poster: 'https://lf-package-cn.feishucdn.com/obj/atsx-throne/hire-fe-prod/portal/i18n/static/image/video-poster.d9fdf4be.jpeg',
		},
		tags: ['测试'],
	},
]

export default localMoments
