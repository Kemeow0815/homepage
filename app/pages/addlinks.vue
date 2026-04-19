<script setup lang="ts">
import { myFeed } from '~/data/feeds'
import homepageConfig from '~~/homepage.config'

useHead({
	title: '申请友链',
	meta: [
		{ name: 'description', content: '期待与您建立友好的互联网连接，欢迎申请友链！' },
	],
})

definePageMeta({
	headerText: '申请友链',
})

// 复制字段
const copyFields = {
	博主: myFeed.author,
	标题: myFeed.sitenick,
	介绍: myFeed.desc,
	网址: myFeed.link,
	头像: myFeed.avatar,
	截图: myFeed.screenshot,
}

// 表单数据
const formData = reactive({
	name: '',
	title: '',
	desc: '',
	avatarType: 'qq' as 'qq' | 'github' | 'url',
	avatar: '',
	screenshot: '',
	github: '',
	website: '',
	feed: '',
	confirm: {
		accessible: false,
		reciprocal: false,
		authentic: false,
	},
})

// 表单验证错误
const errors = reactive<Record<string, string>>({})

// 提交状态
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')
const issueUrl = ref('')

// 头像类型选项
const avatarTypeOptions = [
	{ value: 'qq', label: 'QQ 头像', placeholder: '例如：123456789' },
	{ value: 'github', label: 'GitHub 头像', placeholder: '例如：Kemeow0815' },
	{ value: 'url', label: '自定义链接', placeholder: '例如：https://example.com/avatar.png' },
]

// 获取当前头像类型的占位符
const avatarPlaceholder = computed(() => {
	const option = avatarTypeOptions.find(opt => opt.value === formData.avatarType)
	return option?.placeholder || ''
})

// 验证表单
function validateForm(): boolean {
	errors.name = !formData.name.trim() ? '请输入用户昵称' : ''
	errors.title = !formData.title.trim() ? '请输入博客名称' : ''
	errors.desc = !formData.desc.trim() ? '请输入博客介绍' : ''
	errors.avatar = !formData.avatar.trim() ? '请输入头像标识' : ''
	errors.website = !formData.website.trim()
		? '请输入博客链接'
		: !isValidUrl(formData.website)
				? '请输入有效的URL地址'
				: ''
	errors.screenshot = formData.screenshot && !isValidUrl(formData.screenshot) ? '请输入有效的截图链接' : ''
	errors.feed = formData.feed && !isValidUrl(formData.feed) ? '请输入有效的RSS链接' : ''

	if (!formData.confirm.accessible) {
		errors.confirm = '请确认您的网站可以正常访问'
	}
	else if (!formData.confirm.authentic) {
		errors.confirm = '请确认提供的信息真实有效'
	}
	else {
		errors.confirm = ''
	}

	return !Object.values(errors).some(error => error)
}

// URL验证
function isValidUrl(url: string): boolean {
	return URL.canParse(url)
}

// 提交表单
async function handleSubmit() {
	if (!validateForm()) return

	isSubmitting.value = true
	submitError.value = ''

	try {
		const response = await $fetch('/api/friend-link/apply', {
			method: 'POST',
			body: {
				name: formData.name,
				title: formData.title,
				desc: formData.desc,
				avatarType: formData.avatarType,
				avatar: formData.avatar,
				screenshot: formData.screenshot,
				github: formData.github,
				website: formData.website,
				feed: formData.feed,
				confirm: formData.confirm,
			},
		})

		if (response.success) {
			submitSuccess.value = true
			issueUrl.value = response.issueUrl || ''

			// 重置表单
			Object.keys(formData).forEach((key) => {
				if (key === 'confirm') {
					formData.confirm = {
						accessible: false,
						reciprocal: false,
						authentic: false,
					}
				}
				else if (key === 'avatarType') {
					(formData as any)[key] = 'qq'
				}
				else {
					(formData as any)[key] = ''
				}
			})
		}
	}
	catch (error: any) {
		submitError.value = error.statusMessage || '提交失败，请稍后重试'
	}
	finally {
		isSubmitting.value = false
	}
}

// 重置表单
function resetForm() {
	Object.keys(formData).forEach((key) => {
		if (key === 'confirm') {
			formData.confirm = {
				accessible: false,
				reciprocal: false,
				authentic: false,
			}
		}
		else if (key === 'avatarType') {
			(formData as any)[key] = 'qq'
		}
		else {
			(formData as any)[key] = ''
		}
	})
	Object.keys(errors).forEach((key) => {
		errors[key] = ''
	})
	submitSuccess.value = false
	submitError.value = ''
	issueUrl.value = ''
}
</script>

<template>
	<div class="addlinks-page">
		<!-- 页面标题区域 -->
		<div class="page-header-section">
			<h1 class="page-title">
				<Icon name="ri:links-line" />
				期待与您建立友好的互联网连接
			</h1>
			<p class="page-subtitle">
				欢迎来到 {{ homepageConfig.title }}！如果您想申请友链，请先阅读下方的友链要求，
				若符合要求请填写表单提交申请，感谢您的赏识！
			</p>
		</div>

		<!-- 使用 Tab 组件 -->
		<Tab :tabs="['我的博客信息', '申请友链']" center border>
			<template #tab1>
				<div class="link-tab">
					<FeedCard v-bind="myFeed" />
					<Copy v-for="(code, prompt) in copyFields" :key="prompt" :prompt="prompt" :code="code" />
				</div>
			</template>
			<template #tab2>
				<div class="apply-tab">
					<!-- 注意事项 -->
					<section class="content-section notice-section">
						<h2 class="section-title">
							<Icon name="ri:alert-line" />
							注意事项
						</h2>
						<div class="notice-content">
							<p>欢迎来到 {{ homepageConfig.title }}！如果想申请友链，请点击查看友链要求，若符合要求请填写下方表单提交申请，发送您网站相关内容，感谢您的赏识！</p>
						</div>
					</section>

					<!-- 友链要求 -->
					<section class="content-section requirements-section">
						<h2 class="section-title">
							<Icon name="ri:file-list-3-line" />
							友链要求
						</h2>

						<div class="update-badge">
							<Icon name="ri:refresh-line" />
							更新记录
						</div>

						<div class="requirements-content">
							<p class="update-date">2026-04-19规则更新：</p>

							<ol class="requirements-list">
								<li>如果想直接申请友链，请尽量确保贵站的文章数量大于10篇，这样更能展现您对网站长期维护的决心。</li>
								<li>
									友链友链，先友后链，如果愿意和我多交流，成为朋友（例如多次留言且多次过来玩），完全可以取消10篇文章的限制，前提是贵站满足以下条件：
									<ul class="sub-list">
										<li>站点内容积极向上，无不良广告或违规内容。</li>
										<li>页面设计美观，展现出长期用心经营的态度。</li>
									</ul>
								</li>
								<li>即便取消文章数量的要求，也希望贵站能保持定期更新，这样我们的交流会更有活力！</li>
							</ol>

							<p class="thanks-text">感谢理解，期待与您成为朋友！如果有任何不便，敬请包涵。</p>

							<ol class="requirements-list" start="4">
								<li><strong>网站性质：</strong>申请的网站应为<strong>非营利性质</strong>，例如个人博客或博客组织等，体现内容分享的初心与乐趣，原则上不接受商业化严重的站点。</li>
								<li><strong>内容要求：</strong>博客内容建议以原创为主，避免采集站和严重同质化的内容（如"60秒读懂全世界"等）；同时，需要有一定数量的文章（建议15篇以上），展现长期经营的决心。</li>
								<li><strong>界面设计：</strong>希望贵站有清晰、美观的界面设计，避免过多广告或影响阅读体验的元素，给访客留下良好的第一印象。</li>
								<li><strong>更新频率：</strong>希望贵站能保持一定的更新频率，哪怕是每月一篇，也能体现您对博客的用心与坚持。</li>
								<li><strong>互动意愿：</strong>友链不仅是链接，更是友谊的桥梁。如果您愿意多交流、常互动，友链的意义会更加丰富！</li>
							</ol>
						</div>
					</section>

					<!-- 申请表单 -->
					<section class="content-section form-section">
						<h2 class="section-title">
							<Icon name="ri:edit-line" />
							提交申请
						</h2>

						<!-- 成功提示 -->
						<div v-if="submitSuccess" class="success-message">
							<Icon name="ri:checkbox-circle-line" />
							<h3>提交成功！</h3>
							<p>感谢您的申请，我会尽快审核并添加您的友链。</p>
							<div class="success-actions">
								<a
									v-if="issueUrl"
									:href="issueUrl"
									target="_blank"
									rel="noopener noreferrer"
									class="btn-primary"
								>
									<Icon name="ri:external-link-line" />
									查看 Issue
								</a>
								<button class="btn-secondary" @click="resetForm">
									<Icon name="ri:refresh-line" />
									继续申请
								</button>
							</div>
						</div>

						<!-- 表单 -->
						<form v-else class="apply-form" @submit.prevent="handleSubmit">
							<!-- 用户昵称 -->
							<div class="form-group">
								<label for="name">
									<Icon name="ri:user-line" />
									用户昵称 <span class="required">*</span>
								</label>
								<input
									id="name"
									v-model="formData.name"
									type="text"
									placeholder="您希望在友链列表中显示的名称"
									:class="{ error: errors.name }"
								>
								<span v-if="errors.name" class="error-message">{{ errors.name }}</span>
							</div>

							<!-- 博客名称 -->
							<div class="form-group">
								<label for="title">
									<Icon name="ri:global-line" />
									博客名称 <span class="required">*</span>
								</label>
								<input
									id="title"
									v-model="formData.title"
									type="text"
									placeholder="您的博客标题"
									:class="{ error: errors.title }"
								>
								<span v-if="errors.title" class="error-message">{{ errors.title }}</span>
							</div>

							<!-- 博客介绍 -->
							<div class="form-group">
								<label for="desc">
									<Icon name="ri:article-line" />
									博客/用户介绍 <span class="required">*</span>
								</label>
								<textarea
									id="desc"
									v-model="formData.desc"
									rows="3"
									placeholder="简短介绍您的博客或自己"
									:class="{ error: errors.desc }"
								/>
								<span v-if="errors.desc" class="error-message">{{ errors.desc }}</span>
							</div>

							<!-- 头像类型 -->
							<div class="form-group">
								<label for="avatarType">
									<Icon name="ri:image-line" />
									头像类型 <span class="required">*</span>
								</label>
								<select
									id="avatarType"
									v-model="formData.avatarType"
									class="form-select"
								>
									<option v-for="opt in avatarTypeOptions" :key="opt.value" :value="opt.value">
										{{ opt.label }}
									</option>
								</select>
								<span class="form-tip">
									选择头像来源类型：QQ 头像、GitHub 头像或自定义链接
								</span>
							</div>

							<!-- 头像标识 -->
							<div class="form-group">
								<label for="avatar">
									<Icon name="ri:user-smile-line" />
									头像标识 <span class="required">*</span>
								</label>
								<input
									id="avatar"
									v-model="formData.avatar"
									type="text"
									:placeholder="avatarPlaceholder"
									:class="{ error: errors.avatar }"
								>
								<span v-if="errors.avatar" class="error-message">{{ errors.avatar }}</span>
								<span class="form-tip">
									<span v-if="formData.avatarType === 'qq'">填写 QQ 号码，将自动获取 QQ 头像</span>
									<span v-else-if="formData.avatarType === 'github'">填写 GitHub 用户名，将自动获取 GitHub 头像</span>
									<span v-else>填写头像图片的完整 URL 链接</span>
								</span>
							</div>

							<!-- 网站截图 -->
							<div class="form-group">
								<label for="screenshot">
									<Icon name="ri:screenshot-line" />
									网站截图链接
								</label>
								<input
									id="screenshot"
									v-model="formData.screenshot"
									type="url"
									placeholder="https://blog.example.com/screenshot.png（可选）"
									:class="{ error: errors.screenshot }"
								>
								<span v-if="errors.screenshot" class="error-message">{{ errors.screenshot }}</span>
								<span class="form-tip">用于展示网站预览（可选）</span>
							</div>

							<!-- GitHub 用户名 -->
							<div class="form-group">
								<label for="github">
									<Icon name="ri:github-line" />
									GitHub 用户名
								</label>
								<input
									id="github"
									v-model="formData.github"
									type="text"
									placeholder="例如：Kemeow0815（可选）"
									:class="{ error: errors.github }"
								>
							</div>

							<!-- 博客链接 -->
							<div class="form-group">
								<label for="website">
									<Icon name="ri:link" />
									博客链接 <span class="required">*</span>
								</label>
								<input
									id="website"
									v-model="formData.website"
									type="url"
									placeholder="https://blog.example.com/"
									:class="{ error: errors.website }"
								>
								<span v-if="errors.website" class="error-message">{{ errors.website }}</span>
							</div>

							<!-- RSS 订阅 -->
							<div class="form-group">
								<label for="feed">
									<Icon name="ri:rss-line" />
									博客 RSS 订阅链接
								</label>
								<input
									id="feed"
									v-model="formData.feed"
									type="url"
									placeholder="https://blog.example.com/atom.xml（可选）"
									:class="{ error: errors.feed }"
								>
								<span v-if="errors.feed" class="error-message">{{ errors.feed }}</span>
								<span class="form-tip">用于文章聚合（可选）</span>
							</div>

							<!-- 确认事项 -->
							<div class="form-group checkbox-group">
								<label class="checkbox-label">
									<Icon name="ri:shield-check-line" />
									确认事项 <span class="required">*</span>
								</label>
								<div class="checkbox-list">
									<label class="checkbox-item">
										<input
											v-model="formData.confirm.accessible"
											type="checkbox"
										>
										<span>我的网站可以正常访问</span>
									</label>
									<label class="checkbox-item">
										<input
											v-model="formData.confirm.reciprocal"
											type="checkbox"
										>
										<span>我已添加本站友链（推荐）</span>
									</label>
									<label class="checkbox-item">
										<input
											v-model="formData.confirm.authentic"
											type="checkbox"
										>
										<span>我确认提供的信息真实有效</span>
									</label>
								</div>
								<span v-if="errors.confirm" class="error-message">{{ errors.confirm }}</span>
							</div>

							<div v-if="submitError" class="error-alert">
								<Icon name="ri:error-warning-line" />
								{{ submitError }}
							</div>

							<div class="form-actions">
								<button type="button" class="btn-secondary" @click="resetForm">
									<Icon name="ri:refresh-line" />
									重置
								</button>
								<button type="submit" class="btn-primary" :disabled="isSubmitting">
									<Icon v-if="isSubmitting" name="ri:loader-4-line" class="spin" />
									<Icon v-else name="ri:send-plane-line" />
									{{ isSubmitting ? '提交中...' : '提交申请' }}
								</button>
							</div>
						</form>
					</section>
				</div>
			</template>
		</Tab>
	</div>
</template>

<style lang="scss" scoped>
.addlinks-page {
	max-width: 800px;
	margin: 0 auto;
	padding: 20px;
}

// 页面标题区域
.page-header-section {
	text-align: center;
	margin-bottom: 2rem;
	padding: 1.5rem 0;

	.page-title {
		font-size: 1.6rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;

		:deep(.iconify) {
			color: var(--c-primary);
			font-size: 1.8rem;
		}
	}

	.page-subtitle {
		font-size: 0.9rem;
		color: var(--c-text-2);
		line-height: 1.7;
		max-width: 600px;
		margin: 0 auto;
	}
}

// Tab 内容区域
.link-tab {
	padding: 1rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;

	// Copy 组件保持全宽
	:deep(.copy) {
		width: 100%;
		max-width: 100%;
	}
}

.apply-tab {
	padding: 0.5rem 0;
}

// 内容区块
.content-section {
	margin-bottom: 1.5rem;

	&:last-child {
		margin-bottom: 0;
	}
}

.section-title {
	font-size: 1.1rem;
	font-weight: 600;
	color: var(--c-text-1);
	margin-bottom: 1rem;
	display: flex;
	align-items: center;
	gap: 0.4rem;

	:deep(.iconify) {
		color: var(--c-primary);
		font-size: 1.2rem;
	}
}

// 注意事项
.notice-section {
	padding: 1rem;
	background: linear-gradient(135deg, var(--c-primary-soft) 0%, var(--c-bg-1) 100%);
	border-radius: 8px;

	.notice-content {
		color: var(--c-text-2);
		line-height: 1.8;
		font-size: 0.9rem;
	}
}

// 友链要求
.requirements-section {
	.update-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.6rem;
		background-color: var(--c-primary-soft);
		color: var(--c-primary);
		border-radius: 20px;
		font-size: 0.8rem;
		margin-bottom: 0.75rem;
	}

	.requirements-content {
		color: var(--c-text-2);
		line-height: 1.7;
		font-size: 0.9rem;
	}

	.update-date {
		font-weight: 500;
		color: var(--c-text-1);
		margin-bottom: 0.5rem;
		font-size: 0.85rem;
	}

	.requirements-list {
		padding-left: 1.2rem;
		margin-bottom: 0.75rem;

		li {
			margin-bottom: 0.5rem;

			strong {
				color: var(--c-text-1);
			}
		}
	}

	.sub-list {
		margin-top: 0.3rem;
		margin-left: 0.8rem;

		li {
			margin-bottom: 0.15rem;
			list-style-type: circle;
		}
	}

	.thanks-text {
		background-color: var(--c-bg-2);
		padding: 0.6rem 0.8rem;
		border-radius: 6px;
		border-left: 3px solid var(--c-primary);
		margin: 0.75rem 0;
		font-size: 0.85rem;
	}
}

// 表单区域
.form-section {
	.apply-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;

		label {
			display: flex;
			align-items: center;
			gap: 0.3rem;
			font-size: 0.85rem;
			font-weight: 500;
			color: var(--c-text-1);

			:deep(.iconify) {
				color: var(--c-primary);
			}

			.required {
				color: #ef4444;
			}
		}

		input,
		textarea,
		.form-select {
			padding: 0.6rem 0.8rem;
			border: 1px solid var(--c-border);
			border-radius: 6px;
			background-color: var(--c-bg);
			color: var(--c-text-1);
			font-size: 0.85rem;
			transition: all 0.2s;

			&::placeholder {
				color: var(--c-text-3);
			}

			&:focus {
				outline: none;
				border-color: var(--c-primary);
				box-shadow: 0 0 0 2px var(--c-primary-soft);
			}

			&.error {
				border-color: #ef4444;

				&:focus {
					box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
				}
			}
		}

		.form-select {
			cursor: pointer;
			appearance: none;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: right 0.7rem center;
			padding-right: 2.5rem;
		}

		textarea {
			resize: vertical;
			min-height: 70px;
			font-family: inherit;
		}

		.error-message {
			font-size: 0.75rem;
			color: #ef4444;
		}

		.form-tip {
			font-size: 0.75rem;
			color: var(--c-text-3);
		}
	}

	// 复选框组
	.checkbox-group {
		.checkbox-label {
			margin-bottom: 0.5rem;
		}

		.checkbox-list {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.checkbox-item {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			cursor: pointer;
			font-size: 0.85rem;
			font-weight: normal;
			color: var(--c-text-2);
			padding: 0.3rem 0;

			input[type="checkbox"] {
				appearance: none;
				width: 1.1rem;
				height: 1.1rem;
				cursor: pointer;
				border: 2px solid var(--c-border);
				border-radius: 4px;
				background-color: var(--c-bg);
				transition: all 0.2s;
				position: relative;
				flex-shrink: 0;

				&:hover {
					border-color: var(--c-primary);
				}

				&:checked {
					background-color: var(--c-primary);
					border-color: var(--c-primary);

					&::after {
						content: '';
						position: absolute;
						left: 50%;
						top: 45%;
						width: 0.3rem;
						height: 0.55rem;
						border: solid white;
						border-width: 0 2px 2px 0;
						transform: translate(-50%, -50%) rotate(45deg);
					}
				}

				&:focus {
					outline: none;
					box-shadow: 0 0 0 2px var(--c-primary-soft);
				}
			}

			&:hover {
				color: var(--c-text-1);
			}
		}
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;

		button,
		a {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.3rem;
			padding: 0.7rem 1.2rem;
			border-radius: 6px;
			font-size: 0.9rem;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s;
			text-decoration: none;
			border: none;

			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}

			:deep(.iconify.spin) {
				animation: spin 1s linear infinite;
			}
		}

		.btn-primary {
			background-color: var(--c-primary);
			color: white;

			&:hover:not(:disabled) {
				background-color: hsl(var(--c-primary-h) var(--c-primary-s) calc(var(--c-primary-l) - 10%));
			}
		}

		.btn-secondary {
			background-color: var(--c-bg-2);
			color: var(--c-text-1);
			border: 1px solid var(--c-border);

			&:hover {
				background-color: var(--c-bg-3);
			}
		}
	}

	.error-alert {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 0.8rem;
		background-color: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border-radius: 6px;
		font-size: 0.85rem;
	}

	.success-message {
		text-align: center;
		padding: 1.5rem;

		:deep(.iconify) {
			font-size: 3rem;
			color: #22c55e;
			margin-bottom: 0.75rem;
		}

		h3 {
			font-size: 1.25rem;
			color: var(--c-text-1);
			margin-bottom: 0.4rem;
		}

		p {
			color: var(--c-text-2);
			margin-bottom: 1rem;
			font-size: 0.9rem;
		}

		.success-actions {
			display: flex;
			gap: 0.75rem;
			justify-content: center;
			flex-wrap: wrap;
		}
	}
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

// 响应式适配
@media (max-width: 600px) {
	.addlinks-page {
		padding: 10px;
	}

	.page-header-section {
		.page-title {
			font-size: 1.3rem;
		}
	}

	.form-actions {
		flex-direction: column;
	}

	.success-actions {
		flex-direction: column;
	}
}
</style>
