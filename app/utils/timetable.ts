import type {
	TimetableCourse,
	TimetableCourseView,
	TimetableData,
	TimetableDayColumn,
	TimetableNodeRow,
	TimetableSchedule,
	TimetableSettings,
	TimetableTimeSlot,
	TimetableViewModel,
} from '~/types/timetable'

const WEEKDAY_LABELS: Record<number, string> = {
	1: '周一',
	2: '周二',
	3: '周三',
	4: '周四',
	5: '周五',
	6: '周六',
	7: '周日',
}

function hashText(input: string): number {
	let hash = 0
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash * 31 + input.charCodeAt(i)) | 0
	}
	return Math.abs(hash)
}

function buildCourseColor(courseName: string, courseId: number): string {
	const seed = hashText(`${courseName}-${courseId}`)
	const hue = seed % 360
	const saturation = 78
	const lightness = 68
	return `hsl(${hue} ${saturation}% ${lightness}%)`
}

function parseDateFromYmd(ymd: string): Date | null {
	const parts = ymd.split('-').map(part => Number(part))
	if (parts.length !== 3 || parts.some(part => !Number.isFinite(part))) {
		return null
	}
	const [year, month, day] = parts
	return new Date(year, month - 1, day)
}

export function resolveCurrentWeek(
	startDateText: string,
	maxWeek: number,
	now: Date = new Date(),
): number {
	const startDate = parseDateFromYmd(startDateText)
	if (!startDate) {
		return 1
	}

	const msPerDay = 24 * 60 * 60 * 1000
	const diffDays = Math.floor((now.getTime() - startDate.getTime()) / msPerDay)
	const week = Math.floor(diffDays / 7) + 1

	if (week < 1) {
		return 1
	}
	if (week > maxWeek) {
		return 1
	}
	return week
}

function toNodeRows(timeTable: TimetableTimeSlot[], nodes: number): TimetableNodeRow[] {
	const rows = timeTable
		.filter(item => item.node >= 1 && item.node <= nodes)
		.sort((a, b) => a.node - b.node)
		.map(item => ({
			node: item.node,
			startTime: item.startTime,
			endTime: item.endTime,
		}))

	if (rows.length > 0) {
		return rows
	}

	return Array.from({ length: nodes }, (_, index) => {
		const node = index + 1
		return {
			node,
			startTime: '--:--',
			endTime: '--:--',
		}
	})
}

function toDayColumns(settings: TimetableSettings, currentWeek: number): TimetableDayColumn[] {
	const columns: TimetableDayColumn[] = [
		{ day: 1, label: WEEKDAY_LABELS[1] },
		{ day: 2, label: WEEKDAY_LABELS[2] },
		{ day: 3, label: WEEKDAY_LABELS[3] },
		{ day: 4, label: WEEKDAY_LABELS[4] },
		{ day: 5, label: WEEKDAY_LABELS[5] },
	]

	// 检查是否有特定周次的周末显示配置
	const weekendConfig = settings.weekendDisplay
	const hasWeekendConfig = weekendConfig?.enabled && weekendConfig.weeks.length > 0

	// 如果启用了特定周次配置
	if (hasWeekendConfig) {
		// 只在指定周次显示周末
		const isTargetWeek = weekendConfig.weeks.includes(currentWeek)
		if (isTargetWeek) {
			if (weekendConfig.days.includes('sat')) {
				columns.push({ day: 6, label: WEEKDAY_LABELS[6] })
			}
			if (weekendConfig.days.includes('sun')) {
				columns.push({ day: 7, label: WEEKDAY_LABELS[7] })
			}
		}
		// 非指定周次不显示周末
	}
	else {
		// 使用基础设置
		if (settings.showSat) {
			columns.push({ day: 6, label: WEEKDAY_LABELS[6] })
		}
		if (settings.showSun) {
			columns.push({ day: 7, label: WEEKDAY_LABELS[7] })
		}
	}
	return columns
}

function toCourseView(
	schedule: TimetableSchedule,
	courseName: string,
	color: string,
	nodeRows: TimetableNodeRow[],
): TimetableCourseView {
	const fixedDurationNodes = 2
	const maxNode = Math.max(
		...nodeRows.map(row => row.node),
		schedule.startNode,
	)
	const endNode = Math.min(
		schedule.startNode + fixedDurationNodes - 1,
		maxNode,
	)
	const startNodeRow = nodeRows.find(
		row => row.node === schedule.startNode,
	)
	const endNodeRow = nodeRows.find(row => row.node === endNode)
	const startTime = startNodeRow?.startTime ?? '--:--'
	const endTime = endNodeRow?.endTime ?? '--:--'

	return {
		courseId: schedule.id,
		courseName,
		color,
		teacher: schedule.teacher?.trim() || '未填写',
		room: schedule.room?.trim() || '未填写',
		day: schedule.day,
		startNode: schedule.startNode,
		endNode,
		durationNodes: fixedDurationNodes,
		startWeek: schedule.startWeek,
		endWeek: schedule.endWeek,
		nodeText: `第 ${schedule.startNode}-${endNode} 节`,
		timeText: `${startTime} - ${endTime}`,
	}
}

export function buildTimetableViewModel(
	data: TimetableData,
	selectedWeek: number,
): TimetableViewModel {
	const maxWeek = Math.max(1, data.settings.maxWeek || 1)
	const week = Math.min(Math.max(1, selectedWeek), maxWeek)
	const nodeRows = toNodeRows(data.timeTable, data.settings.nodes)
	const dayColumns = toDayColumns(data.settings, week)

	const courseMap = new Map(
		data.courses.map(course => [course.id, course]),
	)

	const coursesByDay: Record<number, TimetableCourseView[]> = {}
	for (const column of dayColumns) {
		coursesByDay[column.day] = []
	}

	for (const schedule of data.schedules) {
		if (schedule.day < 1 || schedule.day > 7) {
			continue
		}
		if (week < schedule.startWeek || week > schedule.endWeek) {
			continue
		}
		if (!(schedule.day in coursesByDay)) {
			continue
		}

		const courseDef = courseMap.get(schedule.id)
		const courseName = courseDef?.courseName ?? `课程 #${schedule.id}`
		const color = courseDef?.color || buildCourseColor(courseName, schedule.id)
		coursesByDay[schedule.day].push(
			toCourseView(schedule, courseName, color, nodeRows),
		)
	}

	for (const day of Object.keys(coursesByDay)) {
		coursesByDay[Number(day)].sort(
			(a, b) =>
				a.startNode - b.startNode || a.courseName.localeCompare(b.courseName),
		)
	}

	return {
		tableName: data.settings.tableName || '课表',
		maxWeek,
		currentWeek: week,
		weeks: Array.from({ length: maxWeek }, (_, index) => index + 1),
		dayColumns,
		nodeRows,
		coursesByDay,
	}
}

// 解析单行 JSON 课表数据
export function parseTimetableData(jsonText: string): TimetableData {
	try {
		return JSON.parse(jsonText) as TimetableData
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		throw new Error(`课表数据解析失败：${message}`)
	}
}

// 解析多行 JSON 课表数据（svaf 格式）
export function parseTimetableText(rawText: string): TimetableData {
	const lines = rawText
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line.length > 0)

	if (lines.length < 4) {
		throw new Error(`课表数据结构错误：需要至少 4 段 JSON，当前为 ${lines.length} 段`)
	}

	try {
		// 第1行: 配置 (忽略)
		// 第2行: 时间表
		const timeTable = JSON.parse(lines[1]) as TimetableTimeSlot[]
		// 第3行: 设置
		const settings = JSON.parse(lines[2]) as TimetableSettings
		// 第4行: 课程定义
		const courses = JSON.parse(lines[3]) as TimetableCourse[]
		// 第5行: 课程安排
		const schedules = JSON.parse(lines[4]) as TimetableSchedule[]

		return {
			courses,
			schedules,
			settings,
			timeTable,
		}
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		throw new Error(`课表数据解析失败：${message}`)
	}
}
