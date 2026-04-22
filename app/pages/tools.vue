<script setup lang="ts">
useHead({
	title: '工具',
})

definePageMeta({
	headerText: '工具',
})

// 工具列表数据
const tools = [
	{
		title: '项目',
		desc: '我的一些项目展示',
		href: '/project',
		icon: 'ri:code-line',
		order: 1,
	},
	{
		title: '装备',
		desc: '我的一些装备展示',
		href: '/equipment',
		icon: 'material-symbols:devices',
		order: 2,
	},
	{
		title: '热榜',
		desc: '今日热点',
		href: '/hot',
		icon: 'bxs:hot',
		order: 3,
	},
	{
		title: '课程表',
		desc: '我的课表',
		href: '/timetable',
		icon: 'material-symbols:calendar-month',
		order: 4,
	},
	{
		title: '追番',
		desc: '我的追番列表',
		href: '/bangumi',
		icon: 'meteor-icons:bilibili',
		order: 5,
	},
	{
		title: '封面',
		desc: '在线生成文章封面图',
		href: '/cover',
		icon: 'material-symbols:image-rounded',
		order: 6,
	},
	{
		title: '站点',
		desc: '我的站点列表',
		href: '/site',
		icon: 'ri:planet-line',
		order: 7,
	},
	{
		title: '日志',
		desc: '我的日志查看',
		href: '/log',
		icon: 'ri:history-line',
		order: 8,
	},
	{
		title: '代码片段',
		desc: '常用的代码片段收藏',
		href: '/gist',
		icon: 'material-symbols:code-blocks-outline',
		order: 9,
	},
	{
		title: '相册',
		desc: '记录生活中的美好瞬间',
		href: '/albums',
		icon: 'material-symbols:photo-library',
		order: 10,
	},
	{
		title: '留言',
		desc: '欢迎留言交流，期待与你的互动',
		href: '/message',
		icon: 'ri:message-3-line',
		order: 11,
	},
	{
		title: '赞助',
		desc: '支持我的创作',
		href: '/sponsors',
		icon: 'material-symbols:favorite',
		order: 12,
	},
	{
		title: '音乐',
		desc: '享受音乐带来的美好时光',
		href: '/music',
		icon: 'material-symbols:music-note',
		order: 13,
	},
]

// 按 order 排序
tools.sort((a, b) => a.order - b.order)
</script>

<template>
<div class="tools-page">
	<div class="tools-container">
		<div class="page-header">
			<div class="header-title">
				<Icon name="material-symbols:build-circle-rounded" class="header-icon" />
				<h1>工具</h1>
			</div>
			<p class="header-desc">
				本站提供的实用工具入口，点击即可跳转使用。
			</p>
		</div>

		<div class="tools-list">
			<NuxtLink
				v-for="tool in tools"
				:key="tool.href"
				:to="tool.href"
				class="tool-item"
			>
				<div class="tool-header">
					<Icon :name="tool.icon" class="tool-icon" />
					<span class="tool-title">{{ tool.title }}</span>
				</div>
				<p class="tool-desc">
					{{ tool.desc }}
				</p>
			</NuxtLink>
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.tools-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.tools-container {
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

.tools-list {
  display: flex;
  flex-direction: column;
}

.tool-item {
  display: block;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
  text-decoration: none;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--c-bg-2);

    .tool-title {
      color: var(--c-primary);
    }
  }

  .tool-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;

    .tool-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: var(--c-primary);
    }

    .tool-title {
      font-size: 1.125rem;
      font-weight: bold;
      color: var(--c-text-1);
      transition: color 0.2s ease;
    }
  }

  .tool-desc {
    font-size: 0.875rem;
    color: var(--c-text-2);
    margin: 0;
    margin-left: 2.25rem;
    line-height: 1.5;
  }
}

// Responsive
@media (max-width: 768px) {
  .tools-page {
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

  .tool-item {
    padding: 1rem;

    .tool-header {
      .tool-title {
        font-size: 1rem;
      }
    }

    .tool-desc {
      font-size: 0.8125rem;
      margin-left: 2rem;
    }
  }
}
</style>
