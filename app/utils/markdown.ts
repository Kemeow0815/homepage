import { marked } from 'marked'

/**
 * 将 #标签 转换为带样式的 HTML
 * @param content 文本内容
 * @returns 处理后的 HTML
 */
function renderTags(content: string): string {
	// 匹配 #标签（标签名只能包含中文、英文、数字、下划线、连字符）
	// 避免匹配 Markdown 标题语法（# 后面有空格的情况）
	return content.replace(
		/(?:^|\s|>)(#[\u4e00-\u9fa5a-zA-Z0-9_\-]+)/g,
		'$1<span class="content-tag" data-tag="$1">$1</span>'
	)
}

/**
 * 将 Markdown 文本转换为 HTML
 * @param content Markdown 文本
 * @returns HTML 字符串
 */
export function renderMarkdown(content: string): string {
	if (!content) return ''

	// 配置 marked 选项
	marked.setOptions({
		breaks: true, // 将换行符转换为 <br>
		gfm: true, // 启用 GitHub Flavored Markdown
	})

	// 将 <br> 标签转换为换行符，以便 marked 正确解析 Markdown
	const normalizedContent = content
		.replace(/<br\s*\/?>/gi, '\n') // 将 <br> 或 <br/> 转换为 \n
		.replace(/&gt;/g, '>') // 将 HTML 转义的 &gt; 转换为 >
		.replace(/&lt;/g, '<') // 将 HTML 转义的 &lt; 转换为 <
		.replace(/&amp;/g, '&') // 将 HTML 转义的 &amp; 转换为 &

	// 解析 Markdown
	let html = marked.parse(normalizedContent) as string

	// 将 #标签 转换为标签样式
	html = renderTags(html)

	return html
}

/**
 * 检查内容是否包含 Markdown 语法
 * @param content 文本内容
 * @returns 是否包含 Markdown
 */
export function hasMarkdown(content: string): boolean {
	if (!content) return false

	// 检测常见的 Markdown 语法特征
	// 支持 \n 换行和 <br> 标签作为行分隔符
	const markdownPatterns = [
		/(?:^|\n|<br\s*\/?>)\s*#{1,6}\s/, // 标题 # Title
		/\*\*.+?\*\*/, // 粗体 **text**
		/__.+?__/, // 粗体 __text__
		/\*.+?\*/, // 斜体 *text*
		/_.+?_/, // 斜体 _text_
		/`[^`]+`/, // 行内代码 `code`
		/(?:^|\n|<br\s*\/?>)\s*[-*+]\s/, // 无序列表 - item
		/(?:^|\n|<br\s*\/?>)\s*\d+\.\s/, // 有序列表 1. item
		/(?:^|\n|<br\s*\/?>)\s*>\s/, // 引用 > quote
		/\[.+?\]\(.+?\)/, // 链接 [text](url)
		/!\[.+?\]\(.+?\)/, // 图片 ![alt](url)
		/```[\s\S]*?```/, // 代码块 ```code```
		/(?:^|\n|<br\s*\/?>)---+\s*(?:\n|$|<br)/, // 分隔线 ---
		/~~.+?~~/, // 删除线 ~~text~~
	]

	return markdownPatterns.some(pattern => pattern.test(content))
}
