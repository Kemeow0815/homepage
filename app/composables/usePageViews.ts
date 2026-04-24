// 页面浏览量统计
const TRACKER_BASE_URL = 'https://cf-um.268682.xyz'

interface PageViewResponse {
	pathname: string
	views: number
}

export function usePageViews() {
	// 获取当前页面浏览量
	const getPageViews = async (pathname?: string): Promise<number> => {
		const path = pathname || window.location.pathname
		try {
			const response = await fetch(`${TRACKER_BASE_URL}/share?pathname=${encodeURIComponent(path)}`)
			if (!response.ok) return 0
			const data: PageViewResponse = await response.json()
			return data.views || 0
		}
		catch {
			return 0
		}
	}

	// 批量获取多个页面浏览量
	const getBatchPageViews = async (paths: string[]): Promise<number[]> => {
		try {
			const response = await fetch(`${TRACKER_BASE_URL}/batch`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(paths),
			})
			if (!response.ok) return paths.map(() => 0)
			return await response.json()
		}
		catch {
			return paths.map(() => 0)
		}
	}

	// 格式化浏览量数字
	const formatViews = (views: number): string => {
		if (views >= 10000) {
			return (views / 10000).toFixed(1) + 'w'
		}
		if (views >= 1000) {
			return (views / 1000).toFixed(1) + 'k'
		}
		return String(views)
	}

	return {
		getPageViews,
		getBatchPageViews,
		formatViews,
	}
}
