<script setup lang="ts">
import type { TimetableData, TimetableViewModel } from '~/types/timetable'
// @ts-ignore
import timetableData from '~/data/timetable/大三下.json'
import { buildTimetableViewModel, parseTimetableData, resolveCurrentWeek } from '~/utils/timetable'

useHead({
	title: '课程表',
})

definePageMeta({
	headerText: '课程表',
})

const route = useRoute()
const router = useRouter()

// 解析课表数据
const parsedData = shallowRef<TimetableData | null>(null)
const loadError = ref('')

// 当前选中的周
const currentWeek = ref(1)
const isCurrentWeek = ref(false)

// 视图模型
const viewModel = shallowRef<TimetableViewModel | null>(null)

// 初始化
onMounted(() => {
	try {
		const baselineText = JSON.stringify(timetableData)
		parsedData.value = parseTimetableData(baselineText)

		// 获取 URL 中的周次参数
		const weekParam = Number(route.query.week)
		const calculatedCurrentWeek = resolveCurrentWeek(
			parsedData.value.settings.startDate,
			parsedData.value.settings.maxWeek,
		)

		// 使用 URL 参数或当前周
		currentWeek.value = Number.isInteger(weekParam) && weekParam > 0
			? weekParam
			: calculatedCurrentWeek
		isCurrentWeek.value = currentWeek.value === calculatedCurrentWeek

		viewModel.value = buildTimetableViewModel(parsedData.value, currentWeek.value)
	}
	catch (error) {
		loadError.value = error instanceof Error ? error.message : '课表数据加载失败'
	}
})

// 监听 URL 参数变化
watch(() => route.query.week, (newWeek) => {
	if (!parsedData.value)
		return

	const weekNum = Number(newWeek)
	if (Number.isInteger(weekNum) && weekNum > 0) {
		goToWeek(weekNum)
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

// 构建周次链接
function buildWeekHref(week: number) {
	return `/schedule?week=${week}`
}

// 上一周
function goToPreviousWeek() {
	if (!viewModel.value)
		return
	const targetWeek = viewModel.value.currentWeek - 1
	if (viewModel.value.currentWeek > 1) {
		router.push(buildWeekHref(targetWeek))
	}
}

// 下一周
function goToNextWeek() {
	if (!viewModel.value)
		return
	const targetWeek = viewModel.value.currentWeek + 1
	if (viewModel.value.currentWeek < viewModel.value.maxWeek) {
		router.push(buildWeekHref(targetWeek))
	}
}
</script>

<template>
<div class="schedule-page">
	<!-- 错误状态 -->
	<div v-if="loadError" class="error-state">
		<Icon name="ri:error-warning-line" class="error-icon" />
		<p>加载失败：{{ loadError }}</p>
	</div>

	<!-- 课表内容 -->
	<template v-else-if="viewModel">
		<!-- 头部信息 -->
		<div class="schedule-header">
			<div class="header-left">
				<h1 class="table-name">
					{{ viewModel.tableName }}
				</h1>
				<p class="table-info">
					共 {{ viewModel.maxWeek }} 周
				</p>
			</div>
			<NuxtLink to="/" class="back-link">
				<Icon name="ri:home-line" />
				返回首页
			</NuxtLink>
		</div>

		<!-- 周次切换 -->
		<div class="week-control">
			<button
				class="week-btn"
				:disabled="viewModel.currentWeek <= 1"
				@click="goToPreviousWeek"
			>
				<Icon name="ri:arrow-left-s-line" />
			</button>
			<span class="week-text">
				第 {{ viewModel.currentWeek }} 周
				<span v-if="isCurrentWeek" class="current-badge">当前周</span>
			</span>
			<button
				class="week-btn"
				:disabled="viewModel.currentWeek >= viewModel.maxWeek"
				@click="goToNextWeek"
			>
				<Icon name="ri:arrow-right-s-line" />
			</button>
		</div>

		<!-- 桌面端网格视图 -->
		<div class="desktop-view">
			<div class="schedule-table-wrapper">
				<table class="schedule-table">
					<colgroup>
						<col class="col-time">
						<col v-for="day in viewModel.dayColumns" :key="day.day">
					</colgroup>
					<thead>
						<tr>
							<th class="th-time">
								节次
							</th>
							<th v-for="day in viewModel.dayColumns" :key="day.day" class="th-day">
								{{ day.label }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="row in viewModel.nodeRows.filter(r => r.node % 2 === 1)"
							:key="row.node"
							class="schedule-row"
						>
							<td class="td-time">
								<div class="node-label">
									第 {{ row.node }}-{{ Math.min(row.node + 1, viewModel?.nodeRows.length ?? 0) }} 节
								</div>
								<div class="time-range">
									{{ row.startTime }} -
									{{ viewModel?.nodeRows.find(item => item.node === Math.min(row.node + 1, viewModel?.nodeRows.length ?? 0))?.endTime ?? row.endTime }}
								</div>
							</td>
							<td
								v-for="day in viewModel?.dayColumns ?? []"
								:key="day.day"
								class="td-course"
							>
								<template v-if="viewModel?.coursesByDay[day.day]?.filter(c => c.startNode === row.node).length ?? 0 > 0">
									<div
										v-for="course in viewModel?.coursesByDay[day.day]?.filter(c => c.startNode === row.node) ?? []"
										:key="course.courseId"
										class="course-card"
										:style="{
											borderLeftColor: course.color,
											backgroundColor: `color-mix(in srgb, ${course.color} 10%, transparent)`,
										}"
									>
										<div class="course-name">
											{{ course.courseName }}
										</div>
										<div class="course-info">
											<div class="course-weeks">
												{{ course.startWeek }}-{{ course.endWeek }}周
											</div>
											<div class="course-room">
												教室：{{ course.room }}
											</div>
											<div class="course-teacher">
												教师：{{ course.teacher }}
											</div>
										</div>
									</div>
								</template>
								<div v-else class="no-course">
									—
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- 移动端列表视图 -->
		<div class="mobile-view">
			<div
				v-for="day in viewModel?.dayColumns ?? []"
				:key="day.day"
				class="day-card"
			>
				<div class="day-header">
					{{ day.label }}
				</div>
				<div class="day-content">
					<template v-if="viewModel?.coursesByDay[day.day]?.length ?? 0 > 0">
						<div
							v-for="course in viewModel?.coursesByDay[day.day] ?? []"
							:key="course.courseId"
							class="mobile-course-card"
							:style="{
								borderLeftColor: course.color,
								backgroundColor: `color-mix(in srgb, ${course.color} 10%, transparent)`,
							}"
						>
							<div class="course-name">
								{{ course.courseName }}
							</div>
							<div class="course-info">
								<div>时间：{{ course.timeText }}</div>
								<div>周次：{{ course.startWeek }}-{{ course.endWeek }}周</div>
								<div>教室：{{ course.room }}</div>
								<div>教师：{{ course.teacher }}</div>
							</div>
						</div>
					</template>
					<p v-else class="no-course-text">
						本周暂无课程
					</p>
				</div>
			</div>
		</div>
	</template>

	<!-- 加载状态 -->
	<div v-else class="loading-state">
		<Icon name="ri:loader-4-line" class="loading-icon" />
		<p>加载课表中...</p>
	</div>
</div>
</template>

<style lang="scss" scoped>
.schedule-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
}

// 加载和错误状态
.loading-state,
.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	color: var(--c-text-3);

	.loading-icon,
	.error-icon {
		width: 48px;
		height: 48px;
		margin-bottom: 16px;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}

	.error-icon {
		color: #ef4444;
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

// 头部
.schedule-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 24px;

	.header-left {
		.table-name {
			font-size: 1.75rem;
			font-weight: 700;
			color: var(--c-text-1);
			margin: 0 0 8px;
		}

		.table-info {
			font-size: 0.9rem;
			color: var(--c-text-3);
			margin: 0;
		}
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		font-size: 0.9rem;
		color: var(--c-text-2);
		background-color: var(--c-bg-2);
		border: 1px solid var(--c-border);
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.2s ease;

		&:hover {
			border-color: var(--c-primary);
			color: var(--c-primary);
		}

		.iconify {
			width: 1rem;
			height: 1rem;
		}
	}
}

// 周次切换
.week-control {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 24px;

	.week-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		background-color: var(--c-bg-2);
		border: 1px solid var(--c-border);
		border-radius: 8px;
		color: var(--c-text-2);
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover:not(:disabled) {
			border-color: var(--c-primary);
			color: var(--c-primary);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		.iconify {
			width: 1.25rem;
			height: 1.25rem;
		}
	}

	.week-text {
		font-size: 1rem;
		font-weight: 500;
		color: var(--c-text-1);
		min-width: 100px;
		text-align: center;
	}

	.current-badge {
		display: inline-block;
		margin-left: 8px;
		padding: 2px 8px;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--c-bg-1);
		background-color: var(--c-primary);
		border-radius: 4px;
	}
}

// 桌面端视图
.desktop-view {
	display: block;

	@media (max-width: 768px) {
		display: none;
	}
}

.schedule-table-wrapper {
	background-color: var(--c-bg-1);
	border: 1px solid var(--c-border);
	border-radius: 12px;
	overflow-x: auto;
}

.schedule-table {
	width: 100%;
	border-collapse: collapse;
	min-width: 700px;
	table-layout: fixed;

	col.col-time {
		width: 100px;
	}

	th, td {
		padding: 8px;
		border-bottom: 1px solid var(--c-border);
		border-right: 1px solid var(--c-border);
		height: auto;
		min-height: 100px;
		box-sizing: border-box;

		&:last-child {
			border-right: none;
		}
	}

	.th-time {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--c-text-2);
		text-align: left;
		background-color: var(--c-bg-soft);
		height: auto;
	}

	.th-day {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--c-text-1);
		text-align: left;
		background-color: var(--c-bg-soft);
		height: auto;
	}

	.schedule-row:last-child {
		th, td {
			border-bottom: none;
		}
	}

	.td-time {
		vertical-align: top;
		background-color: var(--c-bg-soft);

		.node-label {
			font-size: 0.85rem;
			font-weight: 500;
			color: var(--c-text-1);
			margin-bottom: 4px;
		}

		.time-range {
			font-size: 0.75rem;
			color: var(--c-text-3);
		}
	}

	.td-course {
		vertical-align: top;
		min-width: 120px;
		position: relative;
	}
}

.course-card {
	padding: 6px 8px;
	border-left: 3px solid;
	border-radius: 6px;
	min-height: calc(100% - 4px);
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;

	.course-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin-bottom: 3px;
		line-height: 1.35;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		word-break: break-all;
	}

	.course-info {
		font-size: 0.65rem;
		color: var(--c-text-3);
		line-height: 1.3;

		> div {
			margin-bottom: 1px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			&:last-child {
				margin-bottom: 0;
			}
		}
	}
}

.no-course {
	text-align: center;
	font-size: 0.9rem;
	color: var(--c-text-3);
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

// 移动端视图
.mobile-view {
	display: none;
	gap: 16px;

	@media (max-width: 768px) {
		display: flex;
		flex-direction: column;
	}
}

.day-card {
	background-color: var(--c-bg-1);
	border: 1px solid var(--c-border);
	border-radius: 12px;
	overflow: hidden;
}

.day-header {
	padding: 12px 16px;
	font-size: 1rem;
	font-weight: 600;
	color: var(--c-text-1);
	background-color: var(--c-bg-soft);
	border-bottom: 1px solid var(--c-border);
}

.day-content {
	padding: 12px;
}

.mobile-course-card {
	padding: 12px;
	margin-bottom: 12px;
	border-left: 4px solid;
	border-radius: 8px;

	&:last-child {
		margin-bottom: 0;
	}

	.course-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin-bottom: 8px;
	}

	.course-info {
		font-size: 0.8rem;
		color: var(--c-text-3);
		line-height: 1.6;

		> div {
			margin-bottom: 2px;
		}
	}
}

.no-course-text {
	text-align: center;
	font-size: 0.9rem;
	color: var(--c-text-3);
	padding: 20px 0;
	margin: 0;
}
</style>
