<script setup lang="ts">
import type { TimetableCourseView } from '~/types/timetable'

interface StatusLine {
	text: string
	color?: string
	strikethrough?: boolean
	bold?: boolean
}

interface TimetablePayload {
	coursesByDay: Record<number, TimetableCourseView[]>
}

// 全局会话状态存储
const TIMETABLE_STATE_KEY = '__timetable_card_state__'

// 时间范围正则表达式（模块作用域，避免重复编译）
const TIME_RANGE_REGEX = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/

interface GlobalState {
	payload: TimetablePayload | null
	statusLines: StatusLine[][]
	intervalId: number | null
}

// 从全局状态获取或初始化
function getGlobalState(): GlobalState {
	if (typeof window === 'undefined') {
		return { payload: null, statusLines: [], intervalId: null }
	}

	if (!(window as any)[TIMETABLE_STATE_KEY]) {
		(window as any)[TIMETABLE_STATE_KEY] = {
			payload: null,
			statusLines: [],
			intervalId: null,
		}
	}

	return (window as any)[TIMETABLE_STATE_KEY]
}

const statusLines = ref<StatusLine[][]>([])
const isLoading = ref(true)

// 监听全局状态变化并同步到本地状态
let syncInterval: number | null = null

function hexToRgb(hex: string): string {
	hex = hex.replace('#', '')
	if (hex.length === 8) {
		const r = Number.parseInt(hex.substring(2, 4), 16)
		const g = Number.parseInt(hex.substring(4, 6), 16)
		const b = Number.parseInt(hex.substring(6, 8), 16)
		return `rgb(${r}, ${g}, ${b})`
	}
	if (hex.length === 6) {
		const r = Number.parseInt(hex.substring(0, 2), 16)
		const g = Number.parseInt(hex.substring(2, 4), 16)
		const b = Number.parseInt(hex.substring(4, 6), 16)
		return `rgb(${r}, ${g}, ${b})`
	}
	return 'rgb(0, 0, 0)'
}

function parseTimeToMinute(text: string): number | null {
	const parts = String(text || '').split(':')
	if (parts.length !== 2)
		return null
	const hour = Number(parts[0])
	const minute = Number(parts[1])
	if (!Number.isFinite(hour) || !Number.isFinite(minute))
		return null
	return hour * 60 + minute
}

function extractRangeMinutes(timeText: string): { startMinute: number, endMinute: number } | null {
	const match = String(timeText || '').match(TIME_RANGE_REGEX)
	if (!match)
		return null
	const startMinute = parseTimeToMinute(match[1]!)
	const endMinute = parseTimeToMinute(match[2]!)
	if (startMinute === null || endMinute === null)
		return null
	return { startMinute, endMinute }
}

function formatDuration(totalSeconds: number): string {
	const safeSecs = Math.max(0, Math.floor(totalSeconds))
	const days = Math.floor(safeSecs / 86400)
	const hours = Math.floor((safeSecs % 86400) / 3600)
	const minutes = Math.floor((safeSecs % 3600) / 60)
	const seconds = safeSecs % 60

	const parts: string[] = []
	if (days > 0)
		parts.push(`${days}天`)
	if (hours > 0)
		parts.push(`${hours}时`)
	if (minutes > 0)
		parts.push(`${minutes}分钟`)
	if (seconds > 0 || parts.length === 0)
		parts.push(`${seconds}秒`)

	return parts.join('，')
}

function getTodayCourses(payload: TimetablePayload, now: Date) {
	const day = now.getDay() === 0 ? 7 : now.getDay()
	const rawCourses = payload?.coursesByDay?.[day] || []
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
		.filter(Boolean)
		.sort((a, b) => a!.startMinute - b!.startMinute)
}

function getAllCoursesThisWeek(payload: TimetablePayload): any[] {
	const allCourses: any[] = []
	for (let day = 1; day <= 7; day++) {
		const dayCourses = payload?.coursesByDay?.[day] || []
		for (const course of dayCourses) {
			const range = extractRangeMinutes(course.timeText)
			if (range) {
				allCourses.push({
					...course,
					day,
					startMinute: range.startMinute,
					endMinute: range.endMinute,
				})
			}
		}
	}
	return allCourses.sort((a, b) => {
		if (a.day !== b.day)
			return a.day - b.day
		return a.startMinute - b.startMinute
	})
}

function resolveLiveState(payload: TimetablePayload): StatusLine[][] {
	const now = new Date()
	const currentSecond = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
	const currentMinute = Math.floor(currentSecond / 60)
	const day = now.getDay() === 0 ? 7 : now.getDay()

	// 周末
	if (day >= 6) {
		const allCourses = getAllCoursesThisWeek(payload)
		const nextWeekFirstCourse = allCourses.find(c => c.day === 1)

		if (nextWeekFirstCourse) {
			const daysUntilMonday = day === 6 ? 2 : 1
			const secondsUntilCourse = daysUntilMonday * 86400 + nextWeekFirstCourse.startMinute * 60 - (currentMinute * 60 + now.getSeconds())

			return [
				[{ text: '### 本周课毕' }],
				[
					{ text: '下周首节：' },
					{ text: `${nextWeekFirstCourse.courseName} - ${nextWeekFirstCourse.room || '未知'}`, bold: true, color: hexToRgb(nextWeekFirstCourse.color) },
				],
				[
					{ text: '距上课还有：' },
					{ text: formatDuration(secondsUntilCourse), bold: true },
				],
			]
		}

		return [[{ text: '### 周末' }]]
	}

	const courses = getTodayCourses(payload, now)

	// 今日无课
	if (courses.length === 0) {
		const allCourses = getAllCoursesThisWeek(payload)
		const nextDayCourse = allCourses.find(c => c.day > day)

		if (nextDayCourse) {
			const daysUntil = nextDayCourse.day - day
			const secondsUntilCourse = daysUntil * 86400 + nextDayCourse.startMinute * 60 - (currentMinute * 60 + now.getSeconds())

			return [
				[{ text: '### 今日课毕' }],
				[
					{ text: '翌日首节：' },
					{ text: `${nextDayCourse.courseName} - ${nextDayCourse.room || '未知'}`, bold: true, color: hexToRgb(nextDayCourse.color) },
				],
				[
					{ text: '距上课还有：' },
					{ text: formatDuration(secondsUntilCourse), bold: true },
				],
			]
		}

		return [[{ text: '### 今日无课' }]]
	}

	// 查找当前状态
	for (let index = 0; index < courses.length; index += 1) {
		const current = courses[index]!
		const prev = index > 0 ? courses[index - 1]! : null
		const next = courses[index + 1] || null

		// 上课中
		if (currentMinute >= current.startMinute && currentMinute < current.endMinute) {
			const remainSeconds = current.endMinute * 60 - currentSecond

			return [
				[{ text: '### 上课' }],
				...(prev
					? [[
							{ text: '上节：', strikethrough: true },
							{ text: `${prev.courseName} - ${prev.room || '未知'}`, strikethrough: true, color: hexToRgb(prev.color) },
						]]
					: []),
				[
					{ text: '本节：' },
					{ text: `${current.courseName} - ${current.room || '未知'}`, bold: true, color: hexToRgb(current.color) },
				],
				...(next
					? [[
							{ text: '下节：' },
							{ text: `${next.courseName} - ${next.room || '未知'}`, color: hexToRgb(next.color) },
						]]
					: []),
				[
					{ text: '距下课还有：' },
					{ text: formatDuration(remainSeconds), bold: true },
				],
			]
		}

		// 课间
		if (next && currentMinute >= current.endMinute && currentMinute < next.startMinute) {
			const remainSeconds = next.startMinute * 60 - currentSecond

			return [
				[{ text: '### 课间' }],
				[
					{ text: '上节：', strikethrough: true },
					{ text: `${current.courseName} - ${current.room || '未知'}`, strikethrough: true, color: hexToRgb(current.color) },
				],
				[
					{ text: '下节：' },
					{ text: `${next.courseName} - ${next.room || '未知'}`, bold: true, color: hexToRgb(next.color) },
				],
				[
					{ text: '距上课还有：' },
					{ text: formatDuration(remainSeconds), bold: true },
				],
			]
		}
	}

	// 今日课毕
	const lastCourse = courses[courses.length - 1]!
	if (currentMinute >= lastCourse.endMinute) {
		const allCourses = getAllCoursesThisWeek(payload)
		const nextDayCourse = allCourses.find(c => c.day > day)

		if (nextDayCourse) {
			const daysUntil = nextDayCourse.day - day
			const secondsUntilCourse = daysUntil * 86400 + nextDayCourse.startMinute * 60 - (currentMinute * 60 + now.getSeconds())

			return [
				[{ text: '### 今日课毕' }],
				[
					{ text: '翌日首节：' },
					{ text: `${nextDayCourse.courseName} - ${nextDayCourse.room || '未知'}`, bold: true, color: hexToRgb(nextDayCourse.color) },
				],
				[
					{ text: '距上课还有：' },
					{ text: formatDuration(secondsUntilCourse), bold: true },
				],
			]
		}

		return [[{ text: '### 今日课毕' }]]
	}

	// 第一节课前
	const firstCourse = courses[0]!
	const remainSeconds = firstCourse.startMinute * 60 - currentSecond

	return [
		[{ text: '### 课前' }],
		[
			{ text: '首节：' },
			{ text: `${firstCourse.courseName} - ${firstCourse.room || '未知'}`, bold: true, color: hexToRgb(firstCourse.color) },
		],
		[
			{ text: '距上课还有：' },
			{ text: formatDuration(remainSeconds), bold: true },
		],
	]
}

function updateStatus(payload: TimetablePayload) {
	const newStatusLines = resolveLiveState(payload)
	statusLines.value = newStatusLines
	isLoading.value = false
	const state = getGlobalState()
	state.statusLines = newStatusLines
}

// 使用 useAsyncData 在服务端获取数据
const { data: payloadData, error } = await useAsyncData<TimetablePayload>('timetable-card', async () => {
	// 服务端直接读取文件
	if (process.server) {
		const { readFile } = await import('node:fs/promises')
		const { join } = await import('node:path')
		const { buildTimetableViewModel, parseTimetableData, resolveCurrentWeek } = await import('~/utils/timetable')

		// 尝试多个可能的路径（开发环境和生产环境）
		const possiblePaths = [
			join(process.cwd(), 'app/data/timetable/大三下.json'),
			join(process.cwd(), '../app/data/timetable/大三下.json'),
			join(process.cwd(), '../../app/data/timetable/大三下.json'),
			'./app/data/timetable/大三下.json',
		]

		let fileContent: string | null = null
		let lastError: Error | null = null

		for (const filePath of possiblePaths) {
			try {
				fileContent = await readFile(filePath, 'utf-8')
				console.log('[TimetableCard] Successfully read file from:', filePath)
				break
			}
			catch (err) {
				lastError = err as Error
				console.log('[TimetableCard] Failed to read from:', filePath)
			}
		}

		if (!fileContent) {
			throw new Error(`无法读取课表数据文件: ${lastError?.message}`)
		}

		const data = parseTimetableData(fileContent)
		const currentWeek = resolveCurrentWeek(data.settings.startDate, data.settings.maxWeek)
		const viewModel = buildTimetableViewModel(data, currentWeek)

		return { coursesByDay: viewModel.coursesByDay }
	}

	// 客户端使用 API
	const response = await fetch('/api/timetable')
	if (!response.ok) {
		throw new Error(`API 请求失败: ${response.status}`)
	}
	const result = await response.json()
	if (!result.viewModel?.coursesByDay) {
		throw new Error('课表数据格式错误')
	}
	return { coursesByDay: result.viewModel.coursesByDay }
})

onMounted(() => {
	const state = getGlobalState()

	// 同步全局状态到本地（每100ms检查一次）
	syncInterval = window.setInterval(() => {
		if (state.statusLines !== statusLines.value) {
			statusLines.value = state.statusLines
		}
	}, 100)

	// 如果有数据，直接使用
	if (payloadData.value) {
		updateStatus(payloadData.value)

		// 确保定时器在运行
		if (state.intervalId === null) {
			state.intervalId = window.setInterval(() => {
				if (payloadData.value) {
					updateStatus(payloadData.value)
				}
			}, 1000)
		}
	}
	else if (error.value) {
		console.error('Failed to load timetable:', error.value)
		const errorLines = [[{ text: '### 加载失败' }]]
		statusLines.value = errorLines
		isLoading.value = false
		state.statusLines = errorLines
	}
})

onUnmounted(() => {
	// 清理同步定时器
	if (syncInterval !== null) {
		clearInterval(syncInterval)
		syncInterval = null
	}
	// 不清理全局定时器，保持会话持久化
})
</script>

<template>
<NuxtLink to="/schedule/" class="timetable-card-link">
	<div class="timetable-card">
		<!-- 加载状态 -->
		<div v-if="isLoading" class="loading-state">
			<Icon name="ri:loader-4-line" class="loading-icon" />
			<span>加载中...</span>
		</div>
		<!-- 内容 -->
		<template v-else>
			<div
				v-for="(line, lineIndex) in statusLines"
				:key="lineIndex"
				class="status-line"
			>
				<template v-for="(segment, segIndex) in line" :key="segIndex">
					<span
						v-if="segment.text.startsWith('###')"
						class="status-title"
						:style="{ color: segment.color || 'inherit' }"
					>
						{{ segment.text.replace('###', '').trim() }}
					</span>
					<span
						v-else
						class="status-text"
						:class="{
							'bold': segment.bold,
							'strikethrough': segment.strikethrough,
							'opacity-60': segment.strikethrough,
						}"
						:style="{ color: segment.color || 'inherit' }"
					>
						{{ segment.text }}
					</span>
				</template>
			</div>
		</template>
	</div>
</NuxtLink>
</template>

<style lang="scss" scoped>
.timetable-card-link {
	display: block;
	text-decoration: none;
	color: inherit;
}

.timetable-card {
	padding: 16px 20px;
	background-color: var(--c-bg-1);
	border: 1px solid var(--c-border);
	border-radius: 12px;
	transition: all 0.2s ease;
	min-height: 80px;
	margin-top: 16px;

	&:hover {
		border-color: var(--c-primary);
		box-shadow: 0 2px 8px var(--c-primary-soft);
	}
}

.loading-state {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 20px 0;
	color: var(--c-text-3);
	font-size: 0.85rem;

	.loading-icon {
		width: 16px;
		height: 16px;
		animation: spin 1s linear infinite;
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.status-line {
	font-size: 0.85rem;
	line-height: 1.6;
	margin-bottom: 8px;

	&:last-child {
		margin-bottom: 0;
	}
}

.status-title {
	font-size: 0.95rem;
	font-weight: 700;
}

.status-text {
	&.bold {
		font-weight: 600;
	}

	&.strikethrough {
		text-decoration: line-through;
	}

	&.opacity-60 {
		opacity: 0.6;
	}
}
</style>
