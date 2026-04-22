<script setup lang="ts">
import { snippets } from '~/data/snippets'
import { useClipboard } from '@vueuse/core'
import { codeToHtml } from 'shiki'
import { useColorMode } from '@vueuse/core'

useHead({
  title: '代码片段',
})

definePageMeta({
  headerText: '代码片段',
})

const { copy, copied } = useClipboard()
const colorMode = useColorMode()

// 分页相关
const currentPage = ref(1)
const pageSize = 5

// 折叠相关
const collapsedSnippets = ref<Record<string, boolean>>({})
const maxLinesBeforeCollapse = 16 // 超过16行折叠

// 计算代码行数
function getLineCount(code: string): number {
  return code.split('\n').length
}

// 切换折叠状态
function toggleCollapse(id: string) {
  collapsedSnippets.value[id] = !collapsedSnippets.value[id]
}

// 初始化折叠状态 - 默认折叠超过行数限制的代码
function initCollapsedState() {
  for (const snippet of snippets) {
    if (getLineCount(snippet.code) > maxLinesBeforeCollapse) {
      collapsedSnippets.value[snippet.id] = true
    }
  }
}

// 页面加载时初始化
onMounted(() => {
  initCollapsedState()
})

// 计算总页数
const totalPages = computed(() => Math.ceil(snippets.length / pageSize))

// 当前页的代码片段
const paginatedSnippets = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return snippets.slice(start, end)
})

// 页码列表
const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  }
  else {
    if (currentPage.value <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages.value)
    }
    else if (currentPage.value >= totalPages.value - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
        pages.push(i)
      }
    }
    else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages.value)
    }
  }
  return pages
})

// 切换页面
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 语言映射到 shiki 语言标识
const languageMap: Record<string, string> = {
  yaml: 'yaml',
  typescript: 'typescript',
  javascript: 'javascript',
  vue: 'vue',
  json: 'json',
  nginx: 'nginx',
}

// 语言颜色映射
const languageColors: Record<string, string> = {
  yaml: '#cb171e',
  typescript: '#3178c6',
  javascript: '#f7df1e',
  vue: '#42b883',
  json: '#292929',
  nginx: '#009639',
}

function getLanguageColor(lang: string): string {
  return languageColors[lang.toLowerCase()] || 'var(--c-primary)'
}

function handleCopy(code: string) {
  copy(code)
}

// 高亮代码
async function highlightCode(code: string, language: string): Promise<string> {
  const lang = languageMap[language.toLowerCase()] || 'text'
  const theme = colorMode.value === 'dark' ? 'github-dark' : 'github-light'

  try {
    const html = await codeToHtml(code, {
      lang,
      theme,
      transformers: [
        {
          pre(node) {
            node.properties.style = 'margin: 0; padding: 0; background: transparent;'
          },
          code(node) {
            node.properties.style = 'font-family: inherit; background: transparent;'
          },
        },
      ],
    })
    return html
  }
  catch {
    // 如果语言不支持，返回原始代码
    return `<pre><code>${escapeHtml(code)}</code></pre>`
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 为每个代码片段生成高亮
const highlightedSnippets = ref<Record<string, string>>({})

// 监听当前页变化，高亮新加载的代码
watch(() => paginatedSnippets.value, async (newSnippets) => {
  for (const snippet of newSnippets) {
    if (!highlightedSnippets.value[snippet.id]) {
      highlightedSnippets.value[snippet.id] = await highlightCode(snippet.code, snippet.language)
    }
  }
}, { immediate: true })

// 监听主题变化，重新高亮
watch(() => colorMode.value, async () => {
  for (const snippet of paginatedSnippets.value) {
    highlightedSnippets.value[snippet.id] = await highlightCode(snippet.code, snippet.language)
  }
})
</script>

<template>
  <div class="snippets-page">
    <div class="snippets-container">
      <div class="page-header">
        <div class="header-title">
          <Icon name="material-symbols:code-blocks-outline" class="header-icon" />
          <h1>代码片段</h1>
        </div>
        <p class="header-desc">
          这些是我在日常开发中使用的代码片段，你可以直接复制过去用！
        </p>
      </div>

      <div class="snippets-list">
        <div
          v-for="snippet in paginatedSnippets"
          :key="snippet.id"
          class="snippet-card"
        >
          <div class="snippet-header">
            <div class="snippet-title-wrapper">
              <h3 class="snippet-title">{{ snippet.title }}</h3>
              <span
                class="language-badge"
                :style="{ backgroundColor: getLanguageColor(snippet.language) }"
              >
                {{ snippet.language }}
              </span>
            </div>
            <p v-if="snippet.description" class="snippet-description">
              {{ snippet.description }}
            </p>
            <p v-if="snippet.filename" class="snippet-filename">
              <Icon name="material-symbols:description-outline" class="file-icon" />
              {{ snippet.filename }}
            </p>
          </div>

          <div class="snippet-code-wrapper">
            <div class="code-toolbar">
              <span class="code-stats">
                {{ getLineCount(snippet.code) }} lines
              </span>
              <button
                class="copy-btn"
                :class="{ copied }"
                @click="handleCopy(snippet.code)"
              >
                <Icon
                  :name="copied ? 'material-symbols:check' : 'material-symbols:content-copy-outline'"
                  class="copy-icon"
                />
                <span>{{ copied ? '已复制' : '复制' }}</span>
              </button>
            </div>
            <div
              class="code-block-container"
              :class="{ collapsed: collapsedSnippets[snippet.id] && getLineCount(snippet.code) > maxLinesBeforeCollapse }"
            >
              <div
                v-if="highlightedSnippets[snippet.id]"
                class="code-block"
                v-html="highlightedSnippets[snippet.id]"
              />
              <pre v-else class="code-block loading"><code>{{ snippet.code }}</code></pre>
            </div>
            <!-- 折叠按钮 -->
            <button
              v-if="getLineCount(snippet.code) > maxLinesBeforeCollapse"
              class="collapse-toggle"
              @click="toggleCollapse(snippet.id)"
            >
              <Icon
                :name="collapsedSnippets[snippet.id] ? 'material-symbols:keyboard-arrow-down' : 'material-symbols:keyboard-arrow-up'"
                class="collapse-icon"
              />
              <span>{{ collapsedSnippets[snippet.id] ? '展开' : '收起' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <Icon name="material-symbols:chevron-left" class="page-icon" />
        </button>

        <div class="page-numbers">
          <button
            v-for="page in pageNumbers"
            :key="page"
            class="page-number"
            :class="{ active: page === currentPage, ellipsis: page === '...' }"
            :disabled="page === '...'"
            @click="typeof page === 'number' && goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <Icon name="material-symbols:chevron-right" class="page-icon" />
        </button>
      </div>

      <!-- 分页信息 -->
      <div class="pagination-info">
        共 {{ snippets.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.snippets-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.snippets-container {
  background-color: var(--c-bg-1);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  overflow: hidden;
}

.page-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--c-border);

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .header-icon {
      width: 1.75rem;
      height: 1.75rem;
      color: var(--c-primary);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--c-text-1);
      margin: 0;
    }
  }

  .header-desc {
    font-size: 0.875rem;
    color: var(--c-text-2);
    line-height: 1.6;
    margin: 0;
  }
}

.snippets-list {
  display: flex;
  flex-direction: column;
}

.snippet-card {
  padding: 1.5rem;
  border-bottom: 1px solid var(--c-border);
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--c-bg-soft);
  }
}

.snippet-header {
  margin-bottom: 1rem;
}

.snippet-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.snippet-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--c-text-1);
  margin: 0;
}

.language-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  text-transform: uppercase;
}

.snippet-description {
  font-size: 0.875rem;
  color: var(--c-text-2);
  margin: 0 0 0.25rem 0;
  line-height: 1.5;
}

.snippet-filename {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--c-text-3);
  margin: 0;
  font-family: monospace;

  .file-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
}

.snippet-code-wrapper {
  position: relative;
  background-color: var(--c-bg-2);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  overflow: hidden;
}

.code-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: var(--c-bg-3);
  border-bottom: 1px solid var(--c-border);
}

.code-stats {
  font-size: 0.75rem;
  color: var(--c-text-3);
  font-family: monospace;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--c-text-2);
  background-color: transparent;
  border: 1px solid var(--c-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--c-bg-1);
    color: var(--c-text-1);
  }

  &.copied {
    background-color: var(--c-primary-soft);
    color: var(--c-primary);
    border-color: var(--c-primary);
  }

  .copy-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
}

.code-block-container {
  position: relative;
  max-height: none;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.collapsed {
    max-height: 24rem; // 约16行代码的高度
  }
}

.code-block {
  margin: 0;
  padding: 1rem;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
  word-wrap: normal;
  background-color: var(--c-bg-2);

  :deep(pre) {
    margin: 0;
    padding: 0;
    background: transparent;
  }

  :deep(code) {
    font-family: inherit;
    background: transparent;
    padding: 0;
  }

  &.loading {
    color: var(--c-text-1);
  }
}

// 折叠按钮
.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: var(--c-text-3);
  background: linear-gradient(to bottom, transparent, var(--c-bg-2) 30%);
  border: none;
  border-top: 1px solid var(--c-border);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--c-text-2);
    background: linear-gradient(to bottom, transparent, var(--c-bg-3) 30%);
  }

  .collapse-icon {
    width: 1rem;
    height: 1rem;
  }
}

// 分页样式
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid var(--c-border);
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: transparent;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  color: var(--c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--c-bg-2);
    color: var(--c-text-1);
    border-color: var(--c-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  background-color: transparent;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  color: var(--c-text-2);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled):not(.active) {
    background-color: var(--c-bg-2);
    color: var(--c-text-1);
    border-color: var(--c-primary);
  }

  &.active {
    background-color: var(--c-primary);
    color: white;
    border-color: var(--c-primary);
  }

  &.ellipsis {
    border: none;
    cursor: default;

    &:hover {
      background-color: transparent;
      color: var(--c-text-2);
    }
  }

  &:disabled {
    cursor: default;
  }
}

.pagination-info {
  text-align: center;
  padding: 0 1.5rem 1.5rem;
  font-size: 0.875rem;
  color: var(--c-text-3);
}

// Responsive
@media (max-width: 768px) {
  .snippets-page {
    padding: 10px;
  }

  .page-header {
    padding: 1rem;

    .header-title {
      h1 {
        font-size: 1.25rem;
      }
    }
  }

  .snippet-card {
    padding: 1rem;
  }

  .snippet-title-wrapper {
    gap: 0.5rem;
  }

  .snippet-title {
    font-size: 1rem;
  }

  .code-block {
    padding: 0.75rem;
    font-size: 0.75rem;
  }

  .pagination {
    padding: 1rem;
    gap: 0.25rem;
  }

  .page-btn,
  .page-number {
    width: 1.75rem;
    height: 1.75rem;
    min-width: 1.75rem;
    font-size: 0.75rem;
  }

  .page-icon {
    width: 1rem;
    height: 1rem;
  }
}

// Scrollbar styling
.code-block::-webkit-scrollbar {
  height: 8px;
}

.code-block::-webkit-scrollbar-track {
  background: var(--c-bg-3);
}

.code-block::-webkit-scrollbar-thumb {
  background: var(--c-border);
  border-radius: 4px;
}

.code-block::-webkit-scrollbar-thumb:hover {
  background: var(--c-text-3);
}
</style>
