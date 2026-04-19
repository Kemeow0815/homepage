import type { FeedGroup } from '~/types/feed'

export const myFeed = {
	author: '喵洛阁',
	sitenick: 'Kemeow0815',
	link: 'https://www.kemiaosw.top',
	icon: 'https://wsrv.nl/?url=github.com%2FKemeow0815.png',
	avatar: 'https://wsrv.nl/?url=github.com%2FKemeow0815.png',
	feed: 'https://kemeow0815.github.io/feed.xml',
	desc: '每一段旅行，都有终点。',
	screenshot: 'https://imgbed.050815.xyz/file/cover/timetable/screenshot.webp',
}

export const friendFeeds: FeedGroup[] = [
	{
		name: '朋友们',
		feeds: [
			{
				author: '示例博主',
				sitenick: 'Example',
				link: 'https://example.com',
				icon: 'https://example.com/favicon.ico',
				avatar: 'https://example.com/avatar.jpg',
				archs: ['vue', 'nuxt'],
				desc: '这是一个示例友链',
			},
		],
	},
]

export default friendFeeds
