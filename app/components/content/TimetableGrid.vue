<script setup lang="ts">
import type { TimetableViewModel, TimetableCourseView } from '~/types/timetable'

interface Props {
	viewModel: TimetableViewModel
}

const props = defineProps<Props>()

const dayIndexes = computed(() => props.viewModel.dayColumns.map(day => day.day))
const dayCount = computed(() => props.viewModel.dayColumns.length)

// 计算配对行数（每2节为一行）
const pairRowCount = computed(() => {
	return props.viewModel.nodeRows.filter(row => row.node % 2 === 1).length
})

// 构建课程映射表
const courseMapByDayAndNode = computed(() => {
	const map = new Map<string, TimetableCourseView[]>()

	for (const day of dayIndexes.value) {
		for (const course of props.viewModel.coursesByDay[day] ?? []) {
			const pairStartNode = course.startNode % 2 === 1 ? course.startNode : course.startNode - 1
			const key = `${day}-${Math.max(1, pairStartNode)}`
			const list = map.get(key) ?? []
			list.push(course)
			map.set(key, list)
		}
	}

	return map
})

const pairRows = computed(() => {
	return props.viewModel.nodeRows.filter(row => row.node % 2 === 1)
})
</script>

<template>
	<div class="timetable-grid" :style="{ '--day-count': dayCount }">
		<div class="grid-viewport">
			<div class="grid-content">
				<!-- 表头 -->
				<div class="grid-header">
					<div class="header-cell time-header">节次</div>
					<div
						v-for="day in viewModel.dayColumns"
						:key="day.day"
						class="header-cell day-header"
					>
						{{ day.label }}
					</div>
				</div>

				<!-- 行 -->
				<div
					v-for="row in pairRows"
					:key="row.node"
					class="grid-row"
				>
					<div class="time-cell">
						<p class="node-label">
							第 {{ row.node }}-{{ Math.min(row.node + 1, viewModel.nodeRows.length) }} 节
						</p>
						<p class="time-range">
							{{ row.startTime }} -
							{{ viewModel.nodeRows.find(item => item.node === Math.min(row.node + 1, viewModel.nodeRows.length))?.endTime ?? row.endTime }}
						</p>
					</div>
					<div
						v-for="day in viewModel.dayColumns"
						:key="day.day"
						class="course-cell"
					>
						<template v-if="courseMapByDayAndNode.get(`${day.day}-${row.node}`)?.length">
							<div class="course-list">
								<TimetableCourseCard
									v-for="course in courseMapByDayAndNode.get(`${day.day}-${row.node}`)"
									:key="`${course.courseId}-${course.startNode}`"
									:course="course"
									:compact="true"
								/>
							</div>
						</template>
						<div v-else class="empty-cell">—</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.timetable-grid {
	display: none;
	width: 100%;
	max-width: 100%;
	overflow: hidden;
	border-bottom: 1px solid var(--c-border);

	@media (min-width: 769px) {
		display: block;
	}
}

.grid-viewport {
	width: 100%;
	overflow-x: auto;
	overflow-y: hidden;
}

.grid-content {
	min-width: 900px;
}

.grid-header,
.grid-row {
	display: grid;
	grid-template-columns: 100px repeat(var(--day-count), minmax(180px, 1fr));
	border-bottom: 1px solid var(--c-border);

	&:last-child {
		border-bottom: none;
	}
}

.grid-header {
	background: var(--c-bg-soft);
}

.header-cell {
	padding: 10px 12px;
	font-size: 13px;
	font-weight: 600;
	color: var(--c-text-1);
	border-right: 1px solid var(--c-border);

	&:last-child {
		border-right: none;
	}
}

.time-header {
	text-align: center;
}

.time-cell {
	padding: 12px;
	border-right: 1px solid var(--c-border);
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 4px;
}

.node-label {
	font-size: 12px;
	font-weight: 500;
	color: var(--c-text-1);
}

.time-range {
	font-size: 11px;
	color: var(--c-text-3);
}

.course-cell {
	padding: 8px;
	border-right: 1px solid var(--c-border);
	min-height: 88px;
	vertical-align: top;

	&:last-child {
		border-right: none;
	}
}

.course-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.empty-cell {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 11px;
	color: var(--c-text-3);
}
</style>
