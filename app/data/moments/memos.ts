import type { MomentItem } from '~/types/moments'

/**
 * Memos API 响应类型 (0.26.x)
 */
export interface MemosAttachment {
	name: string
	createTime: string
	filename: string
	content?: string
	externalLink?: string
	type?: string
	size?: string
	memo: string
}

export interface MemosMemo {
	name: string
	state: string
	creator: string
	createTime: string
	updateTime: string
	displayTime: string
	content: string
	visibility: string
	tags: string[]
	pinned: boolean
	attachments: MemosAttachment[]
	relations: any[]
	reactions: any[]
	property?: {
		hasLink?: boolean
		hasTaskList?: boolean
		hasCode?: boolean
		hasIncompleteTasks?: boolean
	}
	parent?: string
	snippet?: string
}

export interface MemosListResponse {
	memos: MemosMemo[]
	nextPageToken?: string
}

/**
 * 从 Memos API 获取即刻短文数据 (0.26.x)
 * @param baseUrl Memos 实例地址，如 https://m.314926.xyz
 * @param pageSize 每页数量
 * @returns 转换后的 MomentItem 数组
 */
export async function fetchMemosData(
	baseUrl: string,
	pageSize: number = 50,
): Promise<MomentItem[]> {
	try {
		// 确保 baseUrl 不以 / 结尾
		const cleanUrl = baseUrl.replace(/\/$/, '')
		const apiUrl = `${cleanUrl}/api/v1/memos?pageSize=${pageSize}&filter=visibility=="PUBLIC"`

		const response = await fetch(apiUrl)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data: MemosListResponse = await response.json()

		// 转换数据格式
		return data.memos.map((memo) => {
			// 将 ISO 时间转换为本地日期字符串
			const date = new Date(memo.displayTime || memo.createTime)
			const dateStr = date.toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})

			// 提取图片附件
			const images = memo.attachments
				?.filter((att) => att.type?.startsWith('image/'))
				.map((att) => att.externalLink || `${cleanUrl}/api/v1/${att.name}`) || []

			return {
				id: memo.name.replace('memos/', ''),
				content: memo.content,
				date: dateStr,
				images: images.length > 0 ? images : undefined,
				tags: memo.tags,
			}
		})
	}
	catch (error) {
		console.error('Error fetching memos data:', error)
		return []
	}
}

/**
 * 获取本地缓存的 memos 数据（用于 SSR）
 * 如果获取失败则返回空数组
 */
export async function getMemosMoments(
	baseUrl: string,
	pageSize?: number,
): Promise<MomentItem[]> {
	// 在服务端直接获取
	if (import.meta.server) {
		return await fetchMemosData(baseUrl, pageSize)
	}

	// 在客户端也获取最新数据
	return await fetchMemosData(baseUrl, pageSize)
}
