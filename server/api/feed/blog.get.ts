import { XMLParser } from 'fast-xml-parser'
import homepageConfig from '~~/homepage.config'

export default defineCachedEventHandler(async (_event) => {
	const parser = new XMLParser({
		attributeNamePrefix: '$',
		cdataPropName: '$',
		ignoreAttributes: false,
		isArray: name => name === 'item' || name === 'category',
		textNodeName: '_',
	})

	try {
		const resp = await fetch(homepageConfig.blog.atom)

		if (!resp.ok) {
			throw new Error(`HTTP error! status: ${resp.status}`)
		}

		const text = await resp.text()
		const objRSS = parser.parse(text)

		const entries = objRSS.rss?.channel?.item || []

		// 转换为前端期望的格式
		const transformedEntries = entries.map((item: any) => {
			// 安全获取字段值的辅助函数
			// RSS 字段可能是：字符串、{_:'文本'}、['文本']、[{_:'文本'}]
			const getFieldValue = (field: any): string => {
				if (field === undefined || field === null) return ''
				// 字符串直接返回
				if (typeof field === 'string') return field
				// 数组取第一个元素
				if (Array.isArray(field)) {
					if (field.length === 0) return ''
					const first = field[0]
					if (typeof first === 'string') return first
					if (typeof first === 'object' && first !== null) {
						// 优先取 _ (textNodeName)，然后是 $ (cdataPropName)
						return first._ || first.$ || ''
					}
					return ''
				}
				// 对象取 _ 或 $
				if (typeof field === 'object') {
					return field._ || field.$ || ''
				}
				return ''
			}

			const pubDate = getFieldValue(item.pubDate)
			let formattedDate = pubDate

			// 将 RSS 日期格式转换为 ISO 格式
			if (pubDate) {
				try {
					const date = new Date(pubDate)
					if (!Number.isNaN(date.getTime())) {
						formattedDate = date.toISOString()
					}
				}
				catch {
					formattedDate = pubDate
				}
			}

			const link = getFieldValue(item.link)

			// 提取标题和摘要
			const title = getFieldValue(item.title)

			// 提取摘要（前50字）
			let summary = getFieldValue(item.description)

			// 去除 HTML 标签
			summary = summary.replace(/<[^>]*>/g, '')
			// 去除多余的空白字符
			summary = summary.replace(/\s+/g, ' ').trim()
			// 截取前50字并添加省略号
			if (summary.length > 50) {
				summary = `${summary.substring(0, 50)}...`
			}

			return {
				id: getFieldValue(item.guid) || link || title,
				title,
				link: { $href: link },
				published: formattedDate,
				summary,
				category: (item.category || []).map((cat: any) => ({
					$term: typeof cat === 'string' ? cat : (cat?._ || cat?.$ || ''),
					$scheme: '',
				})),
			}
		})

		return transformedEntries
	}
	catch (error) {
		console.error('Error fetching feed:', error)
		return []
	}
}, {
	maxAge: 60 * 5, // 5分钟缓存
})
