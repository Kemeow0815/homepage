<script setup lang="ts">
import type { TimetableData, TimetableViewModel } from '~/types/timetable'
import timetableData from '~/data/timetable/大三下.json'
import { buildTimetableViewModel, parseTimetableData, resolveCurrentWeek } from '~/utils/timetable'

useHead({
	title: '课程表',
})

definePageMeta({
	headerText: '课程表',
})

// 解析课表数据
const parsedData = shallowRef<TimetableData | null>(null)
const baselineText = ref('')

// 当前选中的周
const currentWeek = ref(1)
const isCurrentWeek = ref(false)

// 视图模型
const viewModel = shallowRef<TimetableViewModel | null>(null)

// 加载状态
const loadError = ref('')

// 初始化
onMounted(() => {
	try {
		baselineText.value = JSON.stringify(timetableData)
		parsedData.value = parseTimetableData(baselineText.value)

		const calculatedCurrentWeek = resolveCurrentWeek(
			parsedData.value.settings.startDate,
			parsedData.value.settings.maxWeek,
		)

		currentWeek.value = calculatedCurrentWeek
		isCurrentWeek.value = true

		viewModel.value = buildTimetableViewModel(parsedData.value, currentWeek.value)
	}
	catch (error) {
		loadError.value = error instanceof Error ? error.message : '课表数据加载失败'
	}
})

// 切换周
function goToWeek(week: number) {
	if (!parsedData.value)
		return
	const maxWeek = parsedData.value.settings.maxWeek
	const newWeek = Math.min(Math.max(1, week), maxWeek)
	currentWeek.value = newWeek

	const calculatedCurrentWeek = resolveCurrentWeek(
		parsedData.value.settings.startDate,
		parsedData.value.settings.maxWeek,
	)
	isCurrentWeek.value = newWeek === calculatedCurrentWeek

	viewModel.value = buildTimetableViewModel(parsedData.value, newWeek)
}

function prevWeek() {
	goToWeek(currentWeek.value - 1)
}

function nextWeek() {
	goToWeek(currentWeek.value + 1)
}
</script>

<template>
<div class="timetable-page">
	<template v-if="viewModel">
		<!-- 页面头部 -->
		<div class="page-header">
			<div class="header-content">
				<div class="title-section">
					<h1 class="page-title">
						<Icon name="material-symbols:calendar-month" />
						{{ viewModel.tableName }}
					</h1>
					<span class="week-count">共 {{ viewModel.maxWeek }} 周</span>
				</div>

				<!-- 周次切换 -->
				<div class="week-nav">
					<button
						class="nav-btn"
						:disabled="currentWeek <= 1"
						@click="prevWeek"
					>
						<Icon name="material-symbols:chevron-left" />
					</button>
					<span class="current-week">第 {{ currentWeek }} 周</span>
					<button
						class="nav-btn"
						:disabled="currentWeek >= viewModel.maxWeek"
						@click="nextWeek"
					>
						<Icon name="material-symbols:chevron-right" />
					</button>
					<span v-if="isCurrentWeek" class="current-badge">当前周</span>
				</div>
			</div>
		</div>

		<!-- 实时状态 -->
		<LiveTimetableStatus :courses-by-day="viewModel.coursesByDay" />

		<!-- 可视化编辑器 -->
		<TimetableVisualEditor :view-model="viewModel" :baseline-text="baselineText" />

		<!-- 提示 -->
		<p class="timetable-hint">
			提示：周次切换后将展示该周实际有课的安排，多周课程会在对应周自动出现。
		</p>

		<!-- 课表网格（桌面端） -->
		<TimetableGrid :view-model="viewModel" />

		<!-- 课表列表（移动端） -->
		<TimetableDayList :view-model="viewModel" />
	</template>

	<!-- 错误状态 -->
	<div v-else-if="loadError" class="error-state">
		<div class="error-card">
			<Icon name="material-symbols:error" />
			<p>课表加载失败：{{ loadError }}</p>
		</div>
	</div>

	<!-- 加载状态 -->
	<div v-else class="loading-state">
		<Icon name="svg-spinners:ring-resize" />
		<p>加载中...</p>
	</div>
</div>
</template>

<style lang="scss" scoped>
.timetable-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
}

.page-header {
	margin-bottom: 20px;
	padding-bottom: 16px;
	border-bottom: 1px solid var(--c-border);
}

.header-content {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	align-items: center;
	justify-content: space-between;
}

.title-section {
	display: flex;
	align-items: center;
	gap: 12px;
}

.page-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 20px;
	font-weight: 600;
	color: var(--c-text-1);

	.iconify {
		font-size: 24px;
		color: var(--c-primary);
	}
}

.week-count {
	font-size: 13px;
	color: var(--c-text-3);
}

.week-nav {
	display: flex;
	align-items: center;
	gap: 8px;
}

.nav-btn {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--c-border);
	border-radius: 8px;
	background: var(--c-bg-1);
	color: var(--c-text-2);
	cursor: pointer;
	transition: all 0.2s;

	&:hover:not(:disabled) {
		border-color: var(--c-primary);
		color: var(--c-primary);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.iconify {
		font-size: 20px;
	}
}

.current-week {
	min-width: 80px;
	text-align: center;
	font-size: 15px;
	font-weight: 500;
	color: var(--c-text-1);
}

.current-badge {
	padding: 4px 10px;
	border-radius: 6px;
	background: rgba(34, 197, 94, 0.1);
	border: 1px solid rgba(34, 197, 94, 0.3);
	font-size: 12px;
	font-weight: 500;
	color: #22c55e;
}

.timetable-hint {
	font-size: 12px;
	color: var(--c-text-3);
	margin-bottom: 16px;
}

.error-state,
.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	gap: 12px;

	.iconify {
		font-size: 48px;
		color: var(--c-text-3);
	}

	p {
		font-size: 14px;
		color: var(--c-text-2);
	}
}

.error-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 24px;
	border-radius: 12px;
	background: rgba(239, 68, 68, 0.05);
	border: 1px solid rgba(239, 68, 68, 0.2);

	.iconify {
		color: #ef4444;
	}

	p {
		color: #ef4444;
	}
}

// 响应式
@media (max-width: 768px) {
	.timetable-page {
		padding: 12px;
	}

	.header-content {
		flex-direction: column;
		align-items: flex-start;
	}

	.page-title {
		font-size: 18px;
	}
}
</style>
