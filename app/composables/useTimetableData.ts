import type { TimetableData, TimetableViewModel } from '~/types/timetable'
import process from 'node:process'
import { buildTimetableViewModel, parseTimetableData, resolveCurrentWeek } from '~/utils/timetable'

// 服务端读取课表数据
export async function useTimetableData(): Promise<{ data: TimetableData | null, viewModel: TimetableViewModel | null, currentWeek: number, error: string }> {
	try {
		// 服务端使用 Nitro 的 storage 或读取文件
		if (process.server) {
			const { readFile } = await import('node:fs/promises')
			const { join } = await import('node:path')

			const filePath = join(process.cwd(), 'app/data/timetable/大三下.json')
			const fileContent = await readFile(filePath, 'utf-8')
			const data = parseTimetableData(fileContent)
			const currentWeek = resolveCurrentWeek(data.settings.startDate, data.settings.maxWeek)
			const viewModel = buildTimetableViewModel(data, currentWeek)

			return { data, viewModel, currentWeek, error: '' }
		}

		// 客户端使用 API
		const response = await fetch('/api/timetable')
		if (!response.ok) {
			throw new Error(`API 请求失败: ${response.status}`)
		}
		const result = await response.json()
		return {
			data: null,
			viewModel: result.viewModel,
			currentWeek: result.viewModel?.currentWeek || 1,
			error: '',
		}
	}
	catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err)
		console.error('[useTimetableData] Error:', errorMessage)
		return { data: null, viewModel: null, currentWeek: 1, error: errorMessage }
	}
}
