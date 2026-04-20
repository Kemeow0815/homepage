<script setup lang="ts">
import type { TimetableCourseView } from '~/types/timetable'

interface Props {
	course: TimetableCourseView
	compact?: boolean
	showTime?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	compact: false,
	showTime: false,
})

const borderColor = computed(() => props.course.color || '#6b7280')
</script>

<template>
	<article
		class="course-card"
		:class="{ compact }"
		:style="{ '--course-color': borderColor }"
	>
		<div class="card-header">
			<h3 class="course-name" :class="{ compact }">
				{{ course.courseName }}
			</h3>
			<span class="week-range">
				{{ course.startWeek }}-{{ course.endWeek }}周
			</span>
		</div>
		<p v-if="showTime" class="course-info" :class="{ compact }">
			时间：{{ course.timeText }}
		</p>
		<p class="course-info" :class="{ compact, 'mt-0': showTime }">
			教室：{{ course.room }}
		</p>
		<p class="course-info" :class="{ compact }">
			教师：{{ course.teacher }}
		</p>
	</article>
</template>

<style lang="scss" scoped>
.course-card {
	border-left: 4px solid var(--course-color);
	background: color-mix(in oklab, var(--c-bg-1) 82%, var(--course-color) 18%);
	box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--course-color) 38%, transparent);
	border-radius: 8px;
	padding: 12px;

	&.compact {
		padding: 10px;
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 4px;
	}

	.course-name {
		font-weight: 600;
		color: var(--c-text-1);
		line-height: 1.3;
		font-size: 14px;

		&.compact {
			font-size: 12px;
		}
	}

	.week-range {
		font-size: 10px;
		color: var(--c-text-3);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.course-info {
		font-size: 12px;
		color: var(--c-text-2);
		margin-top: 4px;

		&.compact {
			font-size: 11px;
		}

		&.mt-0 {
			margin-top: 0;
		}
	}
}
</style>
