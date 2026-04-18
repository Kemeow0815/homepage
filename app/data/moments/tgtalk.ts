import type { MomentItem, TgtalkResponse } from '~/types/moments'

/**
 * 从 tgtalk API 获取即刻短文数据
 * @param url API 地址
 * @returns 转换后的 MomentItem 数组
 */
export async function fetchTgtalkData(url: string): Promise<MomentItem[]> {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data: TgtalkResponse = await response.json()

		// 转换数据格式
		return data.ChannelMessageData.map((msg) => {
			// 将时间戳转换为日期字符串
			const date = new Date(msg.time)
			const dateStr = date.toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})

			// 过滤掉 Emoji 图片（telegram.org/img/emoji 路径的图片）
			const filteredImages = msg.image?.filter((img: string) =>
				!img.includes('telegram.org/img/emoji'),
			) || []

			return {
				id: msg.id,
				content: msg.text,
				date: dateStr,
				images: filteredImages,
				views: msg.views,
			}
		})
	}
	catch (error) {
		console.error('Error fetching tgtalk data:', error)
		return []
	}
}

/**
 * 获取本地缓存的 tgtalk 数据（用于 SSR）
 * 如果获取失败则返回空数组
 */
export async function getTgtalkMoments(url: string): Promise<MomentItem[]> {
	// 在服务端直接获取
	if (import.meta.server) {
		return await fetchTgtalkData(url)
	}

	// 在客户端也获取最新数据
	return await fetchTgtalkData(url)
}
