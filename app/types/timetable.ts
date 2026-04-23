// 课程表数据类型定义

// 时间槽
export interface TimetableTimeSlot {
	endTime: string
	node: number
	startTime: string
	timeTable: number
}

// 周末显示配置
export interface WeekendDisplayConfig {
	enabled: boolean
	weeks: number[]
	days: ('sat' | 'sun')[]
}

// 课程设置
export interface TimetableSettings {
	background: string
	courseTextColor: number
	id: number
	itemAlpha: number
	itemHeight: number
	itemTextSize: number
	maxWeek: number
	nodes: number
	school: string
	showOtherWeekCourse: boolean
	showSat: boolean
	showSun: boolean
	weekendDisplay?: WeekendDisplayConfig
	showTime: boolean
	startDate: string
	strokeColor: number
	sundayFirst: boolean
	tableName: string
	textColor: number
	tid: string
	timeTable: number
	type: number
	updateTime: number
	widgetCourseTextColor: number
	widgetItemAlpha: number
	widgetItemHeight: number
	widgetItemTextSize: number
	widgetStrokeColor: number
	widgetTextColor: number
}

// 课程
export interface TimetableCourse {
	color: string
	courseName: string
	credit: number
	id: number
	note: string
	tableId: number
}

// 课程安排
export interface TimetableSchedule {
	day: number
	endTime: string
	endWeek: number
	id: number
	level: number
	ownTime: boolean
	room: string
	startNode: number
	startTime: string
	startWeek: number
	step: number
	tableId: number
	teacher: string
	type: number
}

// 课表数据
export interface TimetableData {
	courses: TimetableCourse[]
	schedules: TimetableSchedule[]
	settings: TimetableSettings
	timeTable: TimetableTimeSlot[]
}

// 课程视图
export interface TimetableCourseView {
	courseId: number
	courseName: string
	color: string
	teacher: string
	room: string
	day: number
	startNode: number
	endNode: number
	durationNodes: number
	startWeek: number
	endWeek: number
	nodeText: string
	timeText: string
}

// 星期列
export interface TimetableDayColumn {
	day: number
	label: string
}

// 节次行
export interface TimetableNodeRow {
	node: number
	startTime: string
	endTime: string
}

// 课表视图模型
export interface TimetableViewModel {
	tableName: string
	maxWeek: number
	currentWeek: number
	weeks: number[]
	dayColumns: TimetableDayColumn[]
	nodeRows: TimetableNodeRow[]
	coursesByDay: Record<number, TimetableCourseView[]>
}
