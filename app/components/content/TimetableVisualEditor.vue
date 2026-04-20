<script setup lang="ts">
import type { TimetableCourseView, TimetableData, TimetableViewModel } from '~/types/timetable'
import { buildTimetableViewModel, parseTimetableData } from '~/utils/timetable'

interface Props {
	viewModel: TimetableViewModel
	baselineText: string
}

const props = defineProps<Props>()

const _emit = defineEmits<{
	(e: 'update:viewModel', value: TimetableViewModel): void
}>()

const editMode = ref(false)
const isDirty = ref(false)
const validationError = ref('')

// 解析基线数据
const baselineParsed = shallowRef<TimetableData | null>(null)
const draftParsed = shallowRef<TimetableData | null>(null)

// 课程卡片分组
interface ArrangementCardItem {
	arrangementIndex: number
	title: string
	teacher: string
	room: string
	nodeText: string
	weekText: string
	color: string
}

interface ArrangementCardGroup {
	day: number
	label: string
	items: ArrangementCardItem[]
}

const dayLabels: Record<number, string> = {
	1: '周一',
	2: '周二',
	3: '周三',
	4: '周四',
	5: '周五',
	6: '周六',
	7: '周日',
}

const arrangementCards = computed<ArrangementCardGroup[]>(() => {
	if (!draftParsed.value)
		return []

	const previewViewModel = buildTimetableViewModel(draftParsed.value, props.viewModel.currentWeek)

	return previewViewModel.dayColumns.map((dayColumn) => {
		const cards = previewViewModel.coursesByDay[dayColumn.day] ?? []
		const items = cards
			.map((courseView: TimetableCourseView) => {
				const arrangementIndex = draftParsed.value?.schedules.findIndex(
					arrangement =>
						arrangement.id === courseView.courseId
						&& arrangement.day === courseView.day
						&& arrangement.startNode === courseView.startNode
						&& arrangement.startWeek === courseView.startWeek
						&& arrangement.endWeek === courseView.endWeek,
				)

				if (arrangementIndex === undefined || arrangementIndex < 0) {
					return null
				}

				return {
					arrangementIndex,
					title: courseView.courseName,
					teacher: courseView.teacher,
					room: courseView.room,
					nodeText: courseView.nodeText,
					weekText: `${courseView.startWeek}-${courseView.endWeek}周`,
					color: courseView.color,
				}
			})
			.filter((item): item is ArrangementCardItem => Boolean(item))

		return {
			day: dayColumn.day,
			label: dayLabels[dayColumn.day] ?? `周${dayColumn.day}`,
			items,
		}
	})
})

// 初始化
onMounted(() => {
	try {
		baselineParsed.value = parseTimetableData(props.baselineText)
	}
	catch (error) {
		console.error('Failed to parse timetable data:', error)
	}
})

function enterEditMode() {
	if (baselineParsed.value) {
		draftParsed.value = JSON.parse(JSON.stringify(baselineParsed.value))
	}
	editMode.value = true
	isDirty.value = false
	validationError.value = ''
}

function cancelEditMode() {
	editMode.value = false
	draftParsed.value = null
	isDirty.value = false
	validationError.value = ''
}

function exportJson() {
	if (!draftParsed.value)
		return

	const text = JSON.stringify(draftParsed.value, null, 2)
	const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `${draftParsed.value?.settings?.tableName || 'timetable'}.json`
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)

	cancelEditMode()
}

function resetDraft() {
	if (baselineParsed.value) {
		draftParsed.value = JSON.parse(JSON.stringify(baselineParsed.value))
	}
	isDirty.value = false
	validationError.value = ''
}
</script>

<template>
<div class="timetable-editor">
	<div class="editor-actions">
		<template v-if="editMode">
			<button type="button" class="editor-btn" @click="cancelEditMode">
				退出编辑
			</button>
			<button type="button" class="editor-btn" :disabled="!isDirty" @click="resetDraft">
				重置
			</button>
			<button type="button" class="editor-btn primary" @click="exportJson">
				导出 JSON
			</button>
		</template>
		<button v-else type="button" class="editor-btn" @click="enterEditMode">
			编辑课表
		</button>
	</div>

	<div v-if="editMode" class="editor-panel">
		<div class="editor-hint">
			当前为临时编辑模式：导出后将自动退出并恢复原始课表展示。
		</div>

		<div v-if="validationError" class="editor-error">
			{{ validationError }}
		</div>

		<section class="arrangement-list">
			<h3 class="section-title">
				可视化课程列表（当前周）
			</h3>
			<div class="day-groups">
				<div v-for="dayGroup in arrangementCards" :key="dayGroup.day" class="day-group">
					<div class="day-label">
						{{ dayGroup.label }}
					</div>
					<div v-if="dayGroup.items.length === 0" class="no-course">
						本日暂无课程
					</div>
					<div v-else class="course-items">
						<div
							v-for="item in dayGroup.items"
							:key="item.arrangementIndex"
							class="course-item"
						>
							<div class="course-title" :style="{ color: item.color }">
								{{ item.title }}
							</div>
							<div class="course-meta">
								{{ item.nodeText }} · {{ item.weekText }}
							</div>
							<div class="course-detail">
								{{ item.teacher }} / {{ item.room }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
	<div v-else class="editor-hint">
		点击"编辑课表"进入图形化编辑模式，导出后会自动还原页面临时修改。
	</div>
</div>
</template>

<style lang="scss" scoped>
.timetable-editor {
	margin-bottom: 16px;
}

.editor-actions {
	display: flex;
	gap: 8px;
	margin-bottom: 16px;
}

.editor-btn {
	padding: 8px 16px;
	border: 1px solid var(--c-border);
	border-radius: 8px;
	background: var(--c-bg-1);
	color: var(--c-text-2);
	font-size: 13px;
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

	&.primary {
		background: var(--c-primary);
		border-color: var(--c-primary);
		color: white;

		&:hover {
			opacity: 0.9;
		}
	}
}

.editor-panel {
	padding: 16px;
	border: 1px solid var(--c-border);
	border-radius: 12px;
	background: var(--c-bg-soft);
}

.editor-hint {
	padding: 10px 12px;
	border-radius: 8px;
	background: var(--c-bg-soft);
	font-size: 12px;
	color: var(--c-text-2);
	margin-bottom: 12px;
}

.editor-error {
	padding: 12px;
	border-radius: 8px;
	background: rgba(239, 68, 68, 0.1);
	border: 1px solid rgba(239, 68, 68, 0.3);
	font-size: 13px;
	color: #ef4444;
	margin-bottom: 12px;
}

.section-title {
	font-size: 14px;
	font-weight: 600;
	color: var(--c-text-1);
	margin-bottom: 12px;
}

.day-groups {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 12px;
}

.day-group {
	padding: 12px;
	border: 1px solid var(--c-border);
	border-radius: 8px;
	background: var(--c-bg-1);
}

.day-label {
	font-size: 13px;
	font-weight: 500;
	color: var(--c-text-1);
	margin-bottom: 8px;
}

.no-course {
	font-size: 12px;
	color: var(--c-text-3);
}

.course-items {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.course-item {
	padding: 10px;
	border: 1px solid var(--c-border);
	border-radius: 6px;
	background: var(--c-bg-soft);
}

.course-title {
	font-size: 13px;
	font-weight: 600;
	margin-bottom: 4px;
}

.course-meta {
	font-size: 11px;
	color: var(--c-text-3);
	margin-bottom: 2px;
}

.course-detail {
	font-size: 11px;
	color: var(--c-text-2);
}
</style>
