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

export {}
