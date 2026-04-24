/**
 * 获取主域名
 * @param url URL 字符串
 * @param removeWww 是否移除 www 前缀
 * @returns 主域名
 */
export function getMainDomain(url: string, removeWww = false): string {
	try {
		const urlObj = new URL(url)
		let domain = urlObj.hostname
		if (removeWww && domain.startsWith('www.')) {
			domain = domain.slice(4)
		}
		return domain
	}
	catch {
		return url
	}
}

/**
 * 获取主机名（域名）
 * @param url URL 字符串
 * @returns 主机名
 */
export function getHostname(url: string): string {
	try {
		const urlObj = new URL(url)
		return urlObj.hostname
	}
	catch {
		return url
	}
}

/**
 * 获取域名类型
 * @param domain 域名
 * @returns 域名类型描述
 */
export function getDomainType(domain: string): string {
	if (domain.endsWith('.cn'))
		return '中国大陆域名'
	if (domain.endsWith('.com'))
		return '国际通用域名'
	if (domain.endsWith('.org'))
		return '非营利组织域名'
	if (domain.endsWith('.net'))
		return '网络服务机构域名'
	if (domain.endsWith('.io'))
		return '科技/初创公司域名'
	if (domain.endsWith('.dev'))
		return '开发者域名'
	if (domain.endsWith('.me'))
		return '个人域名'
	if (domain.endsWith('.blog'))
		return '博客域名'
	return '其他域名'
}

/**
 * 获取域名图标
 * @param url URL 字符串
 * @returns 图标名称
 */
export function getDomainIcon(url: string): string | null {
	const domain = getMainDomain(url, true)

	if (domain.includes('github'))
		return 'ri:github-fill'
	if (domain.includes('gitlab'))
		return 'ri:gitlab-fill'
	if (domain.includes('gitee'))
		return 'ri:git-repository-fill'
	if (domain.includes('bilibili'))
		return 'ri:bilibili-fill'
	if (domain.includes('zhihu'))
		return 'ri:zhihu-line'
	if (domain.includes('weibo'))
		return 'ri:weibo-fill'
	if (domain.includes('twitter') || domain.includes('x.com'))
		return 'ri:twitter-x-fill'
	if (domain.includes('youtube'))
		return 'ri:youtube-fill'

	return null
}

/**
 * 获取架构图标
 * @param arch 架构名称
 * @returns 图标名称
 */
export function getArchIcon(arch: string): string {
	const archMap: Record<string, string> = {
		vue: 'ri:vuejs-line',
		react: 'ri:reactjs-line',
		angular: 'ri:angularjs-line',
		svelte: 'ri:code-s-slash-line',
		nextjs: 'ri:nextjs-line',
		nuxt: 'ri:nuxtjs-line',
		hexo: 'ri:hexo-line',
		hugo: 'ri:hugo-line',
		jekyll: 'ri:jekyll-line',
		wordpress: 'ri:wordpress-line',
		ghost: 'ri:ghost-line',
		node: 'ri:nodejs-line',
		python: 'ri:python-line',
		go: 'ri:go-line',
		rust: 'ri:rust-line',
		php: 'ri:php-line',
	}

	return archMap[arch.toLowerCase()] || 'ri:server-line'
}
