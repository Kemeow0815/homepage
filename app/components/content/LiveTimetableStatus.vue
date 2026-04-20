<script setup lang="ts">
import type { TimetableCourseView } from '~/types/timetable'

interface Props {
	coursesByDay: Record<number, TimetableCourseView[]>
}

const props = defineProps<Props>()

// 时间范围正则表达式（模块级别，避免重复编译）
const TIME_RANGE_REGEX = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/

// 解析时间字符串为分钟数
function parseTimeToMinute(text: string | undefined): number | null {
	if (!text)
		return null
	const parts = String(text).split(':')
	if (parts.length !== 2)
		return null
	const hour = Number(parts[0])
	const minute = Number(parts[1])
	if (!Number.isFinite(hour) || !Number.isFinite(minute))
		return null
	return hour * 60 + minute
}

// 从时间范围文本中提取开始和结束分钟数
function extractRangeMinutes(timeText: string): { startMinute: number, endMinute: number } | null {
	const match = String(timeText || '').match(TIME_RANGE_REGEX)
	if (!match)
		return null
	const startMinute = parseTimeToMinute(match[1])
	const endMinute = parseTimeToMinute(match[2])
	if (startMinute === null || endMinute === null)
		return null
	return { startMinute, endMinute }
}

// 格式化持续时间
function formatDuration(totalMinutes: number): string {
	const safeMinutes = Math.max(0, Math.floor(totalMinutes))
	const hours = Math.floor(safeMinutes / 60)
	const minutes = safeMinutes % 60
	if (hours > 0 && minutes > 0)
		return `${hours}小时${minutes}分钟`
	if (hours > 0)
		return `${hours}小时`
	return `${minutes}分钟`
}

// 获取今天的课程
function getTodayCourses(now: Date): Array<TimetableCourseView & { startMinute: number, endMinute: number }> {
	const day = now.getDay() === 0 ? 7 : now.getDay()
	const rawCourses = props.coursesByDay?.[day] || []
	return rawCourses
		.map((course) => {
			const range = extractRangeMinutes(course.timeText)
			if (!range)
				return null
			return {
				...course,
				startMinute: range.startMinute,
				endMinute: range.endMinute,
			}
		})
		.filter((item): item is NonNullable<typeof item> => item !== null)
		.sort((a, b) => a.startMinute - b.startMinute)
}

// 计算当前状态
const liveState = computed(() => {
	const now = new Date()
	const currentMinute = now.getHours() * 60 + now.getMinutes()
	const day = now.getDay() === 0 ? 7 : now.getDay()

	// 周末
	if (day >= 6) {
		return {
			status: '周末',
			nextDetail: '--',
			nextTail: '',
			nextColor: '',
		}
	}

	const courses = getTodayCourses(now)
	if (courses.length === 0) {
		return {
			status: '无课',
			nextDetail: '--',
			nextTail: '',
			nextColor: '',
		}
	}

	let status = '无课'
	for (let i = 0; i < courses.length; i += 1) {
		const current = courses[i]
		if (!current)
			continue
		if (currentMinute >= current.startMinute && currentMinute < current.endMinute) {
			status = `上课（${current.courseName}）`
			break
		}
		const next = courses[i + 1]
		if (next && currentMinute >= current.endMinute && currentMinute < next.startMinute) {
			status = `课间（下一节：${next.courseName}）`
			break
		}
	}

	const nextCourse = courses.find(course => course.startMinute > currentMinute) || null
	if (!nextCourse) {
		return {
			status,
			nextDetail: '--',
			nextTail: '',
			nextColor: '',
		}
	}

	const remainMinutes = nextCourse.startMinute - currentMinute
	return {
		status,
		nextDetail: `${nextCourse.courseName} - ${nextCourse.room || '未填写'}`,
		nextTail: `（${formatDuration(remainMinutes)}后）`,
		nextColor: nextCourse.color || '',
	}
})

// 定时刷新
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
	timer = setInterval(() => {
		// 触发响应式更新
	}, 30 * 1000)
})

onBeforeUnmount(() => {
	if (timer) {
		clearInterval(timer)
	}
})
</script>

<template>
<div class="live-status-card">
	<p class="status-text">
		{{ liveState.status }}
	</p>
	<p class="next-course">
		<span>下一堂课：</span>
		<span class="next-detail" :style="{ color: liveState.nextColor }">
			{{ liveState.nextDetail }}
		</span>
		<span class="next-tail">{{ liveState.nextTail }}</span>
	</p>
</div>
</template>

<style lang="scss" scoped>
.live-status-card {
	padding: 16px;
	border: 1px solid var(--c-border);
	border-radius: 12px;
	background: var(--c-bg-soft);
	margin-bottom: 16px;
}

.status-text {
	font-size: 14px;
	font-weight: 600;
	color: var(--c-text-1);
	margin-bottom: 8px;
}

.next-course {
	font-size: 13px;
	color: var(--c-text-2);
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	align-items: center;
}

.next-detail {
	font-weight: 500;
	transition: color 0.2s ease;
}

.next-tail {
	color: var(--c-text-3);
}
</style>
