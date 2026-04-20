import { createError, defineEventHandler, readBody } from 'h3'

interface FriendLinkRequest {
	name: string
	title: string
	desc: string
	avatarType: 'qq' | 'github' | 'url'
	avatar: string
	screenshot?: string
	github?: string
	website: string
	feed?: string
	confirm: {
		accessible: boolean
		reciprocal: boolean
		authentic: boolean
	}
}

export default defineEventHandler(async (event) => {
	const body = await readBody<FriendLinkRequest>(event)

	// 验证必填字段
	if (!body.name?.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: '请输入用户昵称',
		})
	}

	if (!body.title?.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: '请输入博客名称',
		})
	}

	if (!body.desc?.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: '请输入博客介绍',
		})
	}

	if (!body.avatarType) {
		throw createError({
			statusCode: 400,
			statusMessage: '请选择头像类型',
		})
	}

	if (!body.avatar?.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: '请输入头像标识',
		})
	}

	// 网站链接验证
	if (!body.website?.trim()) {
		throw createError({
			statusCode: 400,
			statusMessage: '请输入博客链接',
		})
	}

	if (!URL.canParse(body.website)) {
		throw createError({
			statusCode: 400,
			statusMessage: '请输入有效的博客链接',
		})
	}

	// 截图链接验证（如果提供了）
	if (body.screenshot?.trim()) {
		if (!URL.canParse(body.screenshot)) {
			throw createError({
				statusCode: 400,
				statusMessage: '请输入有效的截图链接',
			})
		}
	}

	// RSS 链接验证（如果提供了）
	if (body.feed?.trim()) {
		if (!URL.canParse(body.feed)) {
			throw createError({
				statusCode: 400,
				statusMessage: '请输入有效的 RSS 订阅链接',
			})
		}
	}

	// 确认事项验证
	if (!body.confirm?.accessible) {
		throw createError({
			statusCode: 400,
			statusMessage: '请确认您的网站可以正常访问',
		})
	}

	if (!body.confirm?.authentic) {
		throw createError({
			statusCode: 400,
			statusMessage: '请确认提供的信息真实有效',
		})
	}

	const config = useRuntimeConfig()
	const gitToken = config.gitToken

	if (!gitToken) {
		throw createError({
			statusCode: 500,
			statusMessage: '服务器配置错误：缺少 GitHub Token',
		})
	}

	// 构建 Issue 内容
	const issueTitle = `[友链申请] ${body.name}`

	// 根据头像类型构建头像显示
	let avatarDisplay = body.avatar
	if (body.avatarType === 'qq') {
		avatarDisplay = `https://q1.qlogo.cn/g?b=qq&nk=${body.avatar}&s=100`
	}
	else if (body.avatarType === 'github') {
		avatarDisplay = `https://github.com/${body.avatar}.png`
	}

	const issueBody = `## 欢迎申请友链！
请填写以下信息，我们会在审核通过后添加您的博客。

### 用户昵称
${body.name}

### 博客名称
${body.title}

### 博客/用户介绍
${body.desc}

### 头像类型
${body.avatarType}

### 头像标识
${body.avatar}

### 头像预览
![头像](${avatarDisplay})

${body.screenshot ? `### 网站截图链接\n${body.screenshot}\n` : ''}
${body.github ? `### GitHub 用户名\n@${body.github}\n` : ''}

### 博客链接
${body.website}

${body.feed ? `### 博客 RSS 订阅链接\n${body.feed}\n` : ''}

### 确认事项
- [x] 我的网站可以正常访问
- [${body.confirm.reciprocal ? 'x' : ' '}] 我已添加本站友链（推荐）
- [x] 我确认提供的信息真实有效

---

申请时间: ${new Date().toLocaleString('zh-CN')}
`

	try {
		const response = await fetch('https://api.github.com/repos/Kemeow0815/miaoluoge-links/issues', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${gitToken}`,
				'Accept': 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title: issueTitle,
				body: issueBody,
				labels: ['友链申请'],
			}),
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			console.error('GitHub API error:', errorData)
			throw createError({
				statusCode: 500,
				statusMessage: `GitHub API 错误: ${errorData.message || response.statusText}`,
			})
		}

		const data = await response.json()

		return {
			success: true,
			issueUrl: data.html_url,
			issueNumber: data.number,
			message: '友链申请提交成功',
		}
	}
	catch (error: any) {
		console.error('Error creating GitHub issue:', error)

		if (error.statusCode) {
			throw error
		}

		throw createError({
			statusCode: 500,
			statusMessage: '提交失败，请稍后重试',
		})
	}
})
