<script setup lang="ts">
import type { TimetableViewModel } from '~/types/timetable'

interface Props {
	viewModel: TimetableViewModel
}

defineProps<Props>()
</script>

<template>
	<div class="timetable-day-list">
		<section
			v-for="day in viewModel.dayColumns"
			:key="day.day"
			class="day-section"
		>
			<h2 class="day-label">{{ day.label }}</h2>
			<div v-if="viewModel.coursesByDay[day.day]?.length" class="course-list">
				<TimetableCourseCard
					v-for="course in viewModel.coursesByDay[day.day]"
					:key="`${course.courseId}-${course.startNode}`"
					:course="course"
					:show-time="true"
				/>
			</div>
			<p v-else class="no-course">
				本周暂无课程
			</p>
		</section>
	</div>
</template>

<style lang="scss" scoped>
.timetable-day-list {
	display: flex;
	flex-direction: column;
	gap: 16px;

	@media (min-width: 769px) {
		display: none;
	}
}

.day-section {
	padding: 16px;
	border-bottom: 1px solid var(--c-border);

	&:last-child {
		border-bottom: none;
	}
}

.day-label {
	font-size: 14px;
	font-weight: 600;
	color: var(--c-text-1);
	margin-bottom: 12px;
}

.course-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.no-course {
	font-size: 12px;
	color: var(--c-text-3);
}
</style>
