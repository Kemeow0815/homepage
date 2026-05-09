<script setup lang="ts">
import PageBanner from '~/components/partial/PageBanner.vue'

useHead({
	title: '友链监控',
})

definePageMeta({
	headerText: '友链可访问性监测',
})

// API 配置
const API_URL = 'https://blog-link-monitor.268682.xyz'

// 类型定义
interface MonitorSite {
	url: string
	title: string
	avatar?: string
	screenshot?: string
	status: string
	available: boolean
}

interface DayStat {
	date: string
	totalChecks: number
	successfulChecks: number
	failedChecks: number
	totalResponseTime: number
}

interface SiteStats {
	url: string
	stats: DayStat[]
}

interface MonthlySummary {
	month: string
	totalChecks: number
	successfulChecks: number
	failedChecks: number
	totalResponseTime: number
}

interface ApiResponse<T> {
	success: boolean
	data: T
}

// 生成最近30天的日期
function generateRecentDates(): string[] {
	const dates: string[] = []
	const today = new Date()
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Shanghai',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	})

	for (let i = 29; i >= 0; i--) {
		const d = new Date(today)
		d.setDate(today.getDate() - i)
		const parts = formatter.formatToParts(d)
		const map: Record<string, string> = {}
		parts.forEach((p) => {
			if (p.type !== 'literal') map[p.type] = p.value
		})
		dates.push(`${map.year}-${map.month}-${map.day}`)
	}
	return dates
}

// 使用 useFetch 获取站点数据（支持 SSR）
const { data: sitesData, pending: sitesLoading, error: sitesError } = useFetch<ApiResponse<MonitorSite[]>>(
	() => `${API_URL}/api/data`,
	{
		key: 'monitor-sites',
		server: true,
		default: () => ({ success: false, data: [] }),
		transform: (response) => {
			if (response.success && response.data) {
				return {
					success: true,
					data: response.data.reverse(),
				}
			}
			return response
		},
	}
)

// 使用 useFetch 获取最近30天统计数据（支持 SSR）
const { data: statsData } = useFetch<ApiResponse<SiteStats[]>>(
	() => `${API_URL}/api/recent-stats`,
	{
		key: 'monitor-stats',
		server: true,
		default: () => ({ success: false, data: [] }),
	}
)

// 计算属性
const sites = computed(() => sitesData.value?.data || [])
const loading = computed(() => sitesLoading.value)
const error = computed(() => sitesError.value ? `加载失败: ${sitesError.value.message}` : '')
const recentDates = computed(() => generateRecentDates())

// 统计数据 Map
const statsMap = computed(() => {
	const map = new Map<string, SiteStats>()
	if (statsData.value?.success && Array.isArray(statsData.value.data)) {
		statsData.value.data.forEach((item: SiteStats) => {
			if (item.url) {
				map.set(item.url, item)
			}
		})
	}
	return map
})

// 历史记录弹窗状态
const showModal = ref(false)
const modalTitle = ref('')
const modalUrl = ref('')
const modalLoading = ref(false)
const modalStats = ref<DayStat[]>([])
const showDetail = ref(false)

// 打开历史记录弹窗
async function openModal(site: MonitorSite) {
	modalTitle.value = `${site.title} - 历史记录`
	modalUrl.value = site.url
	showModal.value = true
	modalLoading.value = true
	modalStats.value = []
	showDetail.value = false

	try {
		const response = await fetch(`${API_URL}/api/recent-stats?url=${encodeURIComponent(site.url)}`)
		const result: ApiResponse<{ stats: DayStat[] }> = await response.json()

		if (result.success && result.data?.stats) {
			modalStats.value = result.data.stats
		}
	}
	catch (err) {
		console.error('获取历史记录失败:', err)
	}
	finally {
		modalLoading.value = false
	}
}

// 关闭弹窗
function closeModal() {
	showModal.value = false
}

// 计算可用率
function calculateUptime(stat: DayStat): number {
	if (stat.totalChecks === 0) return 0
	return (stat.successfulChecks / stat.totalChecks) * 100
}

// 按月聚合数据
function getMonthlySummary(): MonthlySummary[] {
	const monthly: Record<string, MonthlySummary> = {}

	modalStats.value.forEach((stat) => {
		const month = stat.date.substring(0, 7)
		if (!monthly[month]) {
			monthly[month] = {
				month,
				totalChecks: 0,
				successfulChecks: 0,
				failedChecks: 0,
				totalResponseTime: 0,
			}
		}
		monthly[month].totalChecks += stat.totalChecks
		monthly[month].successfulChecks += stat.successfulChecks
		monthly[month].failedChecks += stat.failedChecks
		monthly[month].totalResponseTime += stat.totalResponseTime
	})

	return Object.values(monthly).sort((a, b) => b.month.localeCompare(a.month))
}

// 格式化百分比
function formatPercentage(value: number): string {
	return `${value.toFixed(2)}%`
}

// 获取状态条类名
function getStatusClass(stat?: DayStat): string {
	if (!stat || stat.totalChecks === 0) return 'status-none'
	const uptime = stat.successfulChecks / stat.totalChecks
	if (uptime >= 1.0) return 'status-success'
	if (uptime > 0) return 'status-partial'
	return 'status-fail'
}

// 获取状态条提示
function getStatusTooltip(dateStr: string, stat?: DayStat): string {
	if (!stat || stat.totalChecks === 0) {
		return `${dateStr}\n无数据`
	}
	const uptime = Math.round((stat.successfulChecks / stat.totalChecks) * 100)
	const avgTime = stat.totalChecks > 0
		? Math.round(stat.totalResponseTime / stat.totalChecks)
		: 0
	return `${dateStr}\n可用率: ${uptime}%\n响应: ${avgTime}ms\n检测: ${stat.totalChecks}次`
}

// 获取某天的统计
function getDayStat(url: string, date: string): DayStat | undefined {
	const siteStats = statsMap.value.get(url)
	return siteStats?.stats.find(s => s.date === date)
}
</script>

<template>
	<div class="monitor-page">
		<!-- 页面横幅 -->
		<PageBanner
			title="友链监控"
			description="实时监测友链站点的可访问性状态"
			image="https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/bg.webp"
		/>

		<!-- 监控容器 -->
		<div id="monitoring-container">
			<!-- 加载状态 -->
			<div v-if="loading" class="loading-message">
				<Icon name="ri:loader-4-line" class="loading-icon" />
				<span>正在加载监控数据...</span>
			</div>

			<!-- 错误状态 -->
			<div v-else-if="error" class="error-message">
				<Icon name="ri:error-warning-line" />
				<span>{{ error }}</span>
			</div>

			<!-- 空状态 -->
			<div v-else-if="sites.length === 0" class="none-message">
				<Icon name="ri:inbox-line" />
				<span>暂无监控数据</span>
			</div>

			<!-- 监控卡片列表 -->
			<template v-else>
				<div
					v-for="site in sites"
					:key="site.url"
					class="monitor-item"
					:class="site.available ? 'status-available' : 'status-unavailable'"
				>
					<!-- 头部 -->
					<div class="site-header">
						<div class="site-header-left">
							<div class="site-avatar">
								<img
									:src="site.avatar || 'https://www.drluo.top/img/err_avatar.webp'"
									:alt="site.title"
									@error="($event.target as HTMLImageElement).src = 'https://www.drluo.top/img/err_avatar.webp'"
								>
							</div>
							<div class="site-meta">
								<div class="site-title" :title="site.title">
									{{ site.title || site.url }}
								</div>
								<a
									:href="site.url"
									target="_blank"
									rel="noopener noreferrer"
									class="site-url"
									:title="site.url"
								>
									{{ site.url }}
								</a>
							</div>
						</div>
						<div class="site-header-right">
							<button
								class="history-btn"
								title="查看历史记录"
								@click="openModal(site)"
							>
								<Icon name="ri:history-line" />
							</button>
						</div>
					</div>

					<!-- 截图 -->
					<div v-if="site.screenshot" class="site-screenshot">
						<img :src="site.screenshot" :alt="`Screenshot of ${site.title}`" loading="lazy">
					</div>

					<!-- 每日状态条 -->
					<div class="daily-status-container">
						<div
							v-for="date in recentDates"
							:key="date"
							class="daily-status-item"
							:class="getStatusClass(getDayStat(site.url, date))"
							:title="getStatusTooltip(date, getDayStat(site.url, date))"
						/>
					</div>
				</div>
			</template>
		</div>

		<!-- 历史记录弹窗 -->
		<Teleport to="body">
			<div
				v-if="showModal"
				class="history-modal"
				:class="{ active: showModal }"
				@click.self="closeModal"
			>
				<div class="history-modal-content">
					<div class="history-modal-header">
						<div class="history-modal-title">{{ modalTitle }}</div>
						<button class="history-modal-close" @click="closeModal">
							<Icon name="ri:close-line" />
						</button>
					</div>
					<div class="history-modal-body">
						<!-- 加载中 -->
						<div v-if="modalLoading" class="modal-loading">
							<Icon name="ri:loader-4-line" class="loading-icon" />
							<span>加载中...</span>
						</div>

						<!-- 无数据 -->
						<div v-else-if="modalStats.length === 0" class="modal-none">
							<Icon name="ri:inbox-line" />
							<span>暂无历史记录</span>
						</div>

						<!-- 数据展示 -->
						<template v-else>
							<!-- 月度统计 -->
							<div class="history-section-title">
								月度存活率统计 (最近30天)
							</div>
							<ul class="history-list">
								<li
									v-for="summary in getMonthlySummary()"
									:key="summary.month"
									class="history-item history-monthly"
									:class="{
										success: summary.successfulChecks / summary.totalChecks >= 1.0,
										warning: summary.successfulChecks / summary.totalChecks >= 0.95 && summary.successfulChecks / summary.totalChecks < 1.0,
										fail: summary.successfulChecks / summary.totalChecks < 0.95,
									}"
								>
									<div class="history-time">{{ summary.month }}</div>
									<div class="history-status">
										<div class="progress-bar">
											<div
												class="progress-bar-fill"
												:style="{
													width: `${(summary.successfulChecks / summary.totalChecks) * 100}%`,
													backgroundColor: summary.successfulChecks / summary.totalChecks >= 1.0
														? '#10b981'
														: summary.successfulChecks / summary.totalChecks >= 0.9
															? '#f59e0b'
															: '#ef4444',
												}"
											/>
										</div>
									</div>
									<div class="history-meta">
										<span
											:style="{
												color: summary.successfulChecks / summary.totalChecks >= 1.0
													? '#10b981'
													: summary.successfulChecks / summary.totalChecks >= 0.9
														? '#f59e0b'
														: '#ef4444',
												fontWeight: 'bold',
											}"
										>
											{{ formatPercentage((summary.successfulChecks / summary.totalChecks) * 100) }}
										</span>
									</div>
								</li>
							</ul>

							<!-- 每日明细 -->
							<div class="history-section-title toggle" @click="showDetail = !showDetail">
								<span>每日明细</span>
								<Icon
									name="ri:arrow-down-s-line"
									class="toggle-icon"
									:style="{ transform: showDetail ? 'rotate(0deg)' : 'rotate(-90deg)' }"
								/>
							</div>
							<ul v-show="showDetail" class="history-list history-detail-list">
								<li
									v-for="stat in [...modalStats].sort((a, b) => b.date.localeCompare(a.date))"
									:key="stat.date"
									class="history-item"
									:class="{
										success: calculateUptime(stat) >= 100,
										warning: calculateUptime(stat) > 0 && calculateUptime(stat) < 100,
										fail: calculateUptime(stat) === 0,
									}"
								>
									<div class="history-time">{{ stat.date }}</div>
									<div class="history-status">
										{{ calculateUptime(stat) >= 100 ? '正常' : calculateUptime(stat) > 0 ? '部分异常' : '异常' }}
									</div>
									<div class="history-meta">
										<span>{{ formatPercentage(calculateUptime(stat)) }}</span>
										<span class="separator">|</span>
										<span>{{ stat.totalChecks > 0 ? Math.round(stat.totalResponseTime / stat.totalChecks) : 0 }}ms</span>
									</div>
								</li>
							</ul>
						</template>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<style lang="scss" scoped>
.monitor-page {
	max-width: 1800px;
	margin: 0 auto;
	padding: 20px;
}

// 监控容器
#monitoring-container {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	width: 100%;
	margin: 0 auto;
	padding: 10px;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
}

// 加载/错误/空状态
.loading-message,
.none-message,
.error-message {
	grid-column: 1 / -1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	padding: 60px 40px;
	text-align: center;
	border-radius: 12px;
	background-color: var(--c-bg-1);
	color: var(--c-text-2);
	border: 1px solid var(--c-border);
	font-size: 16px;

	:deep(.iconify) {
		width: 48px;
		height: 48px;
		opacity: 0.5;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}
}

.error-message {
	color: #ff4d4f;
	background-color: rgba(255, 77, 79, 0.05);
	border-color: rgba(255, 77, 79, 0.2);

	:deep(.iconify) {
		color: #ff4d4f;
		opacity: 1;
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

// 监控卡片
.monitor-item {
	display: flex;
	flex-direction: column;
	background-color: var(--c-bg-1);
	border-radius: 12px;
	padding: 12px;
	box-shadow: 0 4px 12px var(--ld-shadow);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	overflow: hidden;
	font-size: 14px;
	border: 1px solid var(--c-border);
	position: relative;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 20px var(--ld-shadow);
	}

	&.status-available {
		border-top: 4px solid #52c41a;
	}

	&.status-unavailable {
		border-top: 4px solid #ff4d4f;
		background-color: rgba(255, 77, 79, 0.02);

		.site-title {
			color: #cf1322;
		}
	}
}

// 头部
.site-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	gap: 10px;
}

.site-header-left {
	display: flex;
	align-items: center;
	overflow: hidden;
	flex: 1;
}

.site-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 10px;
	background-color: var(--c-bg-2);
	flex-shrink: 0;
	border: 1px solid var(--c-border);

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
}

.site-meta {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	flex: 1;
}

.site-title {
	font-size: 15px;
	font-weight: 600;
	color: var(--c-text-1);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.2;
}

.site-url {
	font-size: 12px;
	color: var(--c-text-3);
	text-decoration: none;
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-top: 2px;
	opacity: 0.8;
	transition: color 0.2s;

	&:hover {
		color: var(--c-primary);
	}
}

.site-header-right {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.history-btn {
	background: transparent;
	border: none;
	cursor: pointer;
	padding: 6px;
	border-radius: 50%;
	color: var(--c-text-3);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;

	:deep(.iconify) {
		width: 18px;
		height: 18px;
	}

	&:hover {
		background-color: var(--c-bg-soft);
		color: var(--c-primary);
	}
}

// 截图
.site-screenshot {
	width: 100%;
	aspect-ratio: 16 / 9;
	border-radius: 6px;
	overflow: hidden;
	margin-bottom: 0;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	position: relative;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		transition: transform 0.5s ease;
	}

	&:hover img {
		transform: scale(1.05);
	}
}

// 每日状态条
.daily-status-container {
	height: 12px;
	margin-top: 12px;
	display: flex;
	gap: 1px;
	background-color: var(--c-bg-2);
	border-radius: 6px;
	overflow: hidden;
}

.daily-status-item {
	flex: 1;
	height: 100%;
	background-color: var(--c-bg-3);
	position: relative;
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.8;
	}

	&.status-success { background-color: #52c41a; }
	&.status-partial { background-color: #faad14; }
	&.status-fail { background-color: #ff4d4f; }
	&.status-none { background-color: var(--c-bg-3); }
}

// 弹窗
.history-modal {
	display: none;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 9999;
	justify-content: center;
	align-items: center;
	backdrop-filter: blur(2px);

	&.active {
		display: flex;
	}
}

.history-modal-content {
	background-color: var(--c-bg-1);
	width: 90%;
	max-width: 600px;
	max-height: 85vh;
	border-radius: 16px;
	box-shadow: 0 10px 30px var(--ld-shadow);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border: 1px solid var(--c-border);
}

.history-modal-header {
	padding: 16px 24px;
	border-bottom: 1px solid var(--c-border);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.history-modal-title {
	font-size: 18px;
	font-weight: 700;
	color: var(--c-text-1);
}

.history-modal-close {
	background: none;
	border: none;
	font-size: 24px;
	cursor: pointer;
	color: var(--c-text-3);
	transition: color 0.2s;
	padding: 4px;
	display: flex;
	align-items: center;
	justify-content: center;

	:deep(.iconify) {
		width: 24px;
		height: 24px;
	}

	&:hover {
		color: var(--c-text-1);
	}
}

.history-modal-body {
	padding: 0;
	overflow-y: auto;
	flex: 1;
}

.modal-loading,
.modal-none {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	padding: 40px;
	color: var(--c-text-3);

	:deep(.iconify) {
		width: 32px;
		height: 32px;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}
}

// 历史列表
.history-section-title {
	padding: 10px 24px;
	font-size: 12px;
	font-weight: 600;
	color: var(--c-text-3);
	background-color: var(--c-bg-soft);
	border-bottom: 1px solid var(--c-border);
	text-transform: uppercase;
	letter-spacing: 0.5px;

	&.toggle {
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20px;

		.toggle-icon {
			transition: transform 0.3s;
		}
	}
}

.history-list {
	list-style: none;
	padding: 0;
	margin: 0;
}

.history-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 14px 24px;
	border-bottom: 1px solid var(--c-border);
	font-size: 14px;
	color: var(--c-text-1);

	&.history-monthly {
		border-left: 4px solid var(--c-primary);
		background-color: var(--c-bg-soft);
	}

	&.success {
		border-left: 4px solid #52c41a;
	}

	&.warning {
		border-left: 4px solid #faad14;
	}

	&.fail {
		border-left: 4px solid #ff4d4f;
		background-color: rgba(255, 77, 79, 0.02);
	}
}

.history-time {
	color: var(--c-text-2);
	font-family: monospace;
	margin-right: 15px;
	min-width: 80px;
}

.history-status {
	flex: 2;
	margin-right: 15px;
	font-weight: 600;
}

.progress-bar {
	width: 100%;
	height: 8px;
	background: var(--c-bg-3);
	border-radius: 4px;
	overflow: hidden;
}

.progress-bar-fill {
	height: 100%;
	transition: width 0.3s ease;
}

.history-meta {
	flex: 1;
	text-align: right;
	color: var(--c-text-3);
	font-size: 13px;

	.separator {
		margin: 0 6px;
		opacity: 0.5;
	}
}

// 明细列表滚动
.history-detail-list {
	max-height: 300px;
	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-thumb {
		background-color: var(--c-border);
		border-radius: 3px;
	}

	&::-webkit-scrollbar-track {
		background-color: transparent;
	}
}

// 响应式
@media (min-width: 600px) {
	#monitoring-container {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (min-width: 800px) {
	#monitoring-container {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media (min-width: 1300px) {
	#monitoring-container {
		grid-template-columns: repeat(4, 1fr);
	}
}

@media (min-width: 1800px) {
	#monitoring-container {
		grid-template-columns: repeat(5, 1fr);
	}
}

@media (max-width: 768px) {
	.monitor-page {
		padding: 10px;
	}

	#monitoring-container {
		padding: 5px;
		gap: 12px;
	}

	.history-modal-content {
		width: 95%;
		max-height: 90vh;
	}

	.history-modal-header {
		padding: 12px 16px;
	}

	.history-modal-title {
		font-size: 16px;
	}

	.history-section-title,
	.history-item {
		padding-left: 16px;
		padding-right: 16px;
	}
}

@media (max-width: 480px) {
	.monitor-item {
		padding: 10px;
	}

	.site-avatar {
		width: 28px;
		height: 28px;
		margin-right: 8px;
	}

	.site-title {
		font-size: 14px;
	}

	.site-url {
		font-size: 11px;
	}

	.daily-status-container {
		height: 10px;
		margin-top: 10px;
	}
}
</style>
