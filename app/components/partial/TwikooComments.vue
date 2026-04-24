<script setup lang="ts">
const commentEl = useTemplateRef<HTMLElement>('comment')
const { copy } = useClipboard({ legacy: true })

// 声明 Twikoo 全局类型
declare global {
	interface Window {
		twikoo?: {
			init?: (options: { envId: string, el: string }) => void
		}
	}
}

onMounted(() => {
	// 加载 Twikoo
	window.twikoo?.init?.({
		envId: 'https://twikoo-homepage.268682.xyz',
		// twikoo 会把挂载后的元素变为 #twikoo
		el: '#twikoo',
	})
})

// 格式化引用文本
function formatQuote(text: string) {
	const normalized = text.replace(/\s+/g, ' ').trim()
	return normalized ? `> ${normalized}\n\n` : ''
}

// 获取评论输入框
function getCommentInput(): HTMLTextAreaElement | HTMLElement | null {
	const root = document.querySelector('#twikoo')
	if (!root)
		return null

	const inputSelectors = [
		'textarea',
		'.el-textarea__inner',
		'[contenteditable="plaintext-only"]',
		'[contenteditable="true"]',
	]

	for (const selector of inputSelectors) {
		const target = root.querySelector(selector)
		if (target instanceof HTMLTextAreaElement)
			return target
		if (target instanceof HTMLElement && target.isContentEditable)
			return target
	}

	return null
}

// 设置输入框内容
function setInputContent(target: HTMLTextAreaElement | HTMLElement, value: string) {
	if (target instanceof HTMLTextAreaElement) {
		const current = target.value.trim()
		target.value = current ? `${current}\n\n${value.trim()}` : value
		target.dispatchEvent(new Event('input', { bubbles: true }))
		target.dispatchEvent(new Event('change', { bubbles: true }))
		target.focus()
		return
	}

	const current = target.textContent?.trim()
	target.textContent = current ? `${current}\n\n${value.trim()}` : value
	target.dispatchEvent(new Event('input', { bubbles: true }))
	target.dispatchEvent(new Event('change', { bubbles: true }))
	target.focus()
}

// 等待评论输入框出现
async function waitCommentInput(timeout = 6000, step = 120): Promise<HTMLTextAreaElement | HTMLElement | null> {
	const start = Date.now()
	while ((Date.now() - start) < timeout) {
		const target = getCommentInput()
		if (target)
			return target
		await new Promise(resolve => setTimeout(resolve, step))
	}
	return null
}

// 滚动到评论区
function scrollToComments() {
	const commentsSection = document.getElementById('twikoo-comments')
	if (commentsSection) {
		commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}
}

// 插入引用
async function insertQuote(text: string): Promise<boolean> {
	if (!import.meta.client)
		return false

	const quoteText = formatQuote(text)
	if (!quoteText)
		return false

	// 滚动到评论区
	scrollToComments()

	// 等待输入框出现并插入引用
	const input = await waitCommentInput()
	if (input) {
		setInputContent(input, quoteText)
		return true
	}

	// 如果无法找到输入框，复制到剪贴板
	await copy(quoteText)
	return false
}

// 暴露方法给父组件
defineExpose({
	scrollToComments,
	insertQuote,
})
</script>

<template>
<section id="twikoo-comments" ref="comment" class="twikoo-wrapper">
	<h3 class="comments-title">
		<Icon name="ri:chat-3-line" />
		评论区
	</h3>
	<div id="twikoo">
		<p class="loading-text">
			评论加载中...
		</p>
	</div>
</section>
</template>

<style lang="scss" scoped>
.twikoo-wrapper {
	margin-top: 2rem;
	padding-top: 2rem;
	border-top: 1px solid var(--c-border);
}

.comments-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 1.1rem;
	font-weight: 600;
	color: var(--c-text-1);
	margin-bottom: 1rem;

	:deep(.iconify) {
		color: var(--c-primary);
	}
}

.loading-text {
	color: var(--c-text-3);
	text-align: center;
	padding: 2rem;
}

:deep(#twikoo) {
	margin: 1em 0;

	.tk-admin-container {
		position: fixed;
		z-index: 1000;
	}

	.tk-input {
		font-family: var(--font-monospace, monospace);
	}

	.tk-avatar {
		border-radius: 50%;

		&.tk-clickable {
			cursor: auto;
		}
	}

	.tk-time {
		color: var(--c-text-3);
	}

	.tk-content {
		margin-top: 0;
	}

	.tk-comments-title,
	.tk-nick > strong {
		font-weight: 600;
	}

	.tk-owo-emotion {
		width: auto;
		height: 1.4em;
		vertical-align: text-bottom;
	}

	.tk-extras,
	.tk-footer {
		font-size: 0.7em;
		color: var(--c-text-3);
	}

	.tk-replies:not(.tk-replies-expand) {
		mask-image: linear-gradient(to top, transparent, #fff 4em);
	}

	.tk-expand {
		border-radius: 0.5em;
		transition: background-color 0.1s;
	}

	.tk-content {
		pre {
			overflow: auto;
			border-radius: 0.5em;
			font-size: 0.85em;
		}

		p {
			margin: 0.2em 0;
		}

		img {
			border-radius: 0.5em;
		}

		menu,
		ol,
		ul {
			margin: 0.5em 0;
			padding-inline-start: 1.5em;
			font-size: 0.9rem;
			list-style: revert;

			> li {
				margin: 0.2em 0;

				&::marker {
					color: var(--c-primary);
				}
			}
		}

		blockquote {
			margin: 0.5em 0;
			padding: 0.2em 0.5em;
			border-inline-start: 4px solid var(--c-border);
			border-radius: 4px;
			background-color: var(--c-bg-2);
			font-size: 0.9em;
		}
	}
}
</style>
