declare module 'vue-router' {
	interface RouteMeta {
		headerText?: string
	}
}

// 外链跳转配置类型
declare module 'nuxt/schema' {
	interface AppConfig {
		externalLinks?: {
			enabled?: boolean
			redirectPage?: string
			whitelist?: string[]
		}
	}
}

// JSON 文件模块声明
declare module '*.json' {
	const value: any
	export default value
}

export {}
