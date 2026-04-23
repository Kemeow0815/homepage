import type { TimetableViewModel } from '../../app/types/timetable'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { buildTimetableViewModel, parseTimetableData, resolveCurrentWeek } from '../../app/utils/timetable'

export default defineEventHandler(async (event): Promise<{ viewModel: TimetableViewModel, isCurrentWeek: boolean }> => {
	try {
		const query = getQuery(event)
		const requestedWeek = Number(query.week)

		// 尝试多个可能的路径
		const possiblePaths = [
			join(process.cwd(), 'public/data/timetable/大三下.json'),
			join(process.cwd(), '../public/data/timetable/大三下.json'),
			join(process.cwd(), '../../public/data/timetable/大三下.json'),
			'./public/data/timetable/大三下.json',
		]

		let fileContent: string | null = null
		let lastError: Error | null = null

		for (const filePath of possiblePaths) {
			try {
				fileContent = await readFile(filePath, 'utf-8')
				console.log('[Timetable API] Successfully read file from:', filePath)
				break
			}
			catch (err) {
				lastError = err as Error
				console.log('[Timetable API] Failed to read from:', filePath)
			}
		}

		if (!fileContent) {
			console.error('[Timetable API] All paths failed:', lastError)
			throw new Error(`无法读取课表数据文件: ${lastError?.message}`)
		}

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
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error('[Timetable API] Error:', errorMessage)
		throw createError({
			statusCode: 500,
			statusMessage: `课表数据加载失败: ${errorMessage}`,
		})
	}
})
