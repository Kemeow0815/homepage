// 外链跳转检测 composable
// 参考 hexo-safego 插件实现

interface ExternalLinkOptions {
	// 白名单域名列表
	whitelist?: string[]
	// 跳转页面路径
	redirectPage?: string
	// 是否启用
	enabled?: boolean
	// 是否排除锚点链接
	excludeAnchors?: boolean
	// 是否排除相对路径
	excludeRelative?: boolean
}

// 默认白名单
const DEFAULT_WHITELIST = [
	// 当前域名（自动检测）
	// 常用国内平台
	'bilibili.com',
	'www.bilibili.com',
	'zhihu.com',
	'www.zhihu.com',
	'weibo.com',
	'www.weibo.com',
	'github.com',
	'www.github.com',
	// 搜索引擎
	'baidu.com',
	'www.baidu.com',
	'google.com',
	'www.google.com',
	'bing.com',
	'www.bing.com',
]

export function useExternalLinks(options: ExternalLinkOptions = {}) {
	const {
		whitelist = [],
		redirectPage = '/go',
		enabled = true,
		excludeAnchors = true,
		excludeRelative = true,
	} = options

	// 合并白名单
	const fullWhitelist = [...DEFAULT_WHITELIST, ...whitelist]

	// 获取当前域名
	const getCurrentDomain = () => {
		if (typeof window === 'undefined')
			return ''
		return window.location.hostname
	}

	// 检查是否在白名单中
	const isWhitelisted = (url: string): boolean => {
		try {
			const urlObj = new URL(url)
			const hostname = urlObj.hostname.toLowerCase()
			const currentDomain = getCurrentDomain().toLowerCase()

			// 检查是否是当前域名
			if (hostname === currentDomain || hostname.endsWith(`.${currentDomain}`)) {
				return true
			}

			// 检查白名单
			return fullWhitelist.some((domain) => {
				const d = domain.toLowerCase()
				return hostname === d || hostname.endsWith(`.${d}`)
			})
		}
		catch {
			return false
		}
	}

	// 编码 URL（Base64）
	const encodeUrl = (url: string): string => {
		try {
			// 使用 encodeURIComponent 处理中文和特殊字符，然后 Base64 编码
			return btoa(url)
		}
		catch {
			return url
		}
	}

	// 解码 URL
	const decodeUrl = (encoded: string): string => {
		try {
			// Base64 解码
			return atob(encoded)
		}
		catch {
			return encoded
		}
	}

	// 处理链接点击
	const handleLinkClick = (event: MouseEvent) => {
		if (!enabled)
			return

		const target = event.target as HTMLElement
		const link = target.closest('a') as HTMLAnchorElement | null

		if (!link)
			return

		const href = link.getAttribute('href')
		if (!href)
			return

		// 排除锚点链接
		if (excludeAnchors && href.startsWith('#'))
			return

		// 排除相对路径（如果不以 http 开头）
		if (excludeRelative && !href.startsWith('http'))
			return

		// 检查是否是外链
		if (!href.startsWith('http'))
			return

		// 检查白名单
		if (isWhitelisted(href))
			return

		// 阻止默认行为
		event.preventDefault()

		// 跳转到中间页
		const encoded = encodeUrl(href)
		navigateTo(`${redirectPage}?u=${encoded}`, { external: true })
	}

	// 初始化监听
	const init = () => {
		if (typeof window === 'undefined')
			return

		// 使用事件委托监听所有点击
		document.addEventListener('click', handleLinkClick, true)
	}

	// 清理监听
	const cleanup = () => {
		if (typeof window === 'undefined')
			return
		document.removeEventListener('click', handleLinkClick, true)
	}

	return {
		init,
		cleanup,
		isWhitelisted,
		encodeUrl,
		decodeUrl,
		handleLinkClick,
	}
}

// 全局初始化函数（用于插件或 app.vue）
export function initExternalLinks(options: ExternalLinkOptions = {}) {
	const { init, cleanup } = useExternalLinks(options)

	onMounted(() => {
		init()
	})

	onUnmounted(() => {
		cleanup()
	})
}
