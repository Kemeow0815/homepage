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
			const pubDate = item.pubDate?.[0]?._ || item.pubDate
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

			const link = item.link?.[0]?._ || item.link

			// 提取标题和摘要
			const title = item.title?.[0]?._ || item.title || ''

			// 提取摘要（前50字）
			let summary = ''
			if (item.description) {
				if (Array.isArray(item.description) && item.description[0]) {
					// 直接尝试获取内容，不管字段名
					const desc = item.description[0]
					if (typeof desc === 'string') {
						summary = desc
					}
					else if (typeof desc === 'object') {
						// 尝试所有可能的字段
						const keys = Object.keys(desc)
						for (const key of keys) {
							if (typeof desc[key] === 'string' && desc[key].length > 0) {
								summary = desc[key]
								break
							}
						}
					}
				}
				else if (typeof item.description === 'string') {
					summary = item.description
				}
				else if (typeof item.description === 'object') {
					// 处理对象类型的 description
					const keys = Object.keys(item.description)
					for (const key of keys) {
						if (typeof item.description[key] === 'string' && item.description[key].length > 0) {
							summary = item.description[key]
							break
						}
					}
				}
			}

			// 去除 HTML 标签
			summary = summary.replace(/<[^>]*>/g, '')
			// 去除多余的空白字符
			summary = summary.replace(/\s+/g, ' ').trim()
			// 截取前50字并添加省略号
			if (summary.length > 50) {
				summary = `${summary.substring(0, 50)}...`
			}

			return {
				id: item.guid?.[0]?._ || link || title,
				title,
				link: { $href: link },
				published: formattedDate,
				summary,
				category: (item.category || []).map((cat: any) => ({
					$term: cat._ || cat,
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
