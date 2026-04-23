import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildTimetableViewModel, parseTimetableData, resolveCurrentWeek } from '../../app/utils/timetable'
import type { TimetableViewModel } from '../../app/types/timetable'

export default defineEventHandler(async (event): Promise<{ viewModel: TimetableViewModel, isCurrentWeek: boolean }> => {
	const query = getQuery(event)
	const requestedWeek = Number(query.week)

	// 读取课表数据文件（使用绝对路径）
	const filePath = join(process.cwd(), 'app/data/timetable/大三下.json')
	const fileContent = await readFile(filePath, 'utf-8')

	// 解析课表数据（标准 JSON 格式）
	const data = parseTimetableData(fileContent)

	// 计算当前周
	const currentWeek = resolveCurrentWeek(data.settings.startDate, data.settings.maxWeek)

	// 确定要显示的周次
	const selectedWeek = Number.isInteger(requestedWeek) && requestedWeek > 0
		? requestedWeek
		: currentWeek

	// 构建视图模型
	const viewModel = buildTimetableViewModel(data, selectedWeek)

	return {
		viewModel,
		isCurrentWeek: viewModel.currentWeek === currentWeek,
	}
})
