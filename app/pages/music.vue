<script setup lang="ts">
import PageBanner from '~/components/partial/PageBanner.vue'
import PageViewCounter from '~/components/partial/PageViewCounter.vue'

interface Song {
	id: string
	name: string
	artist: string
	url: string
	cover: string
	lrc?: string
}

// 歌词时间标签正则表达式
const LRC_TIME_REGEX = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/

useHead({
	title: '音乐',
})

definePageMeta({
	headerText: '音乐',
})

// 本地音乐列表
const songs: Song[] = [
	{
		id: '1',
		name: '一句话形容不了的终极笔记',
		artist: '叶落梦中/御A桑/灬阿楚灬/绯言/小山xl/应有棠/霄镁/郭曦阳/堇墨安歌/天罗',
		url: '/music/1.mp3',
		cover: 'https://jsd.268682.xyz/gh/yxksw/Flist-resources@main/cover/fbc90b6413445ad65a9c44cac401e6f0.jpg',
		lrc: '/music/1.lrc',
	},
]

const audioRef = ref<HTMLAudioElement | null>(null)
const currentIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const isMuted = ref(false)
const showLyrics = ref(false)
const lyrics = ref<{ time: number, text: string }[]>([])
const currentLyricIndex = ref(-1)
const isLoading = ref(false)

const currentSong = computed<Song | undefined>(() => songs[currentIndex.value])
const progress = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)

// 格式化时间
function formatTime(sec: number) {
	const m = Math.floor(sec / 60)
	const s = Math.floor(sec % 60)
	return `${m}:${s.toString().padStart(2, '0')}`
}

// 解析歌词
async function parseLyrics(lrcUrl?: string) {
	if (!lrcUrl) {
		lyrics.value = []
		return
	}
	try {
		const response = await fetch(lrcUrl)
		const lrcText = await response.text()
		const lines = lrcText.split('\n')
		const parsed: { time: number, text: string }[] = []

		for (const line of lines) {
			if (!line)
				continue
			const match = line.match(LRC_TIME_REGEX)
			if (match && match[1] && match[2] && match[3]) {
				const minutes = Number.parseInt(match[1], 10)
				const seconds = Number.parseInt(match[2], 10)
				const ms = Number.parseInt(match[3], 10)
				if (!Number.isNaN(minutes) && !Number.isNaN(seconds) && !Number.isNaN(ms)) {
					const time = minutes * 60 + seconds + ms / 1000
					const text = match[4] ? match[4].trim() : ''
					if (text) {
						parsed.push({ time, text })
					}
				}
			}
		}
		lyrics.value = parsed.sort((a, b) => a.time - b.time)
	}
	catch {
		lyrics.value = []
	}
}

// 获取当前歌词索引
function updateCurrentLyric() {
	const lyricsList = lyrics.value
	if (!lyricsList || lyricsList.length === 0) {
		currentLyricIndex.value = -1
		return
	}
	const current = currentTime.value
	let index = -1
	for (let i = 0; i < lyricsList.length; i++) {
		const line = lyricsList[i]
		if (line && line.time <= current) {
			index = i
		}
		else {
			break
		}
	}
	currentLyricIndex.value = index
}

// 播放控制
function togglePlay() {
	if (!audioRef.value)
		return
	if (isPlaying.value) {
		audioRef.value.pause()
	}
	else {
		audioRef.value.play()
	}
}

function prev() {
	if (songs.length <= 1)
		return
	currentIndex.value = (currentIndex.value - 1 + songs.length) % songs.length
	nextTick(() => {
		const lrc = currentSong.value?.lrc
		parseLyrics(lrc)
		audioRef.value?.play()
	})
}

function next() {
	if (songs.length <= 1)
		return
	currentIndex.value = (currentIndex.value + 1) % songs.length
	nextTick(() => {
		const lrc = currentSong.value?.lrc
		parseLyrics(lrc)
		audioRef.value?.play()
	})
}

function selectSong(index: number) {
	currentIndex.value = index
	nextTick(() => {
		const lrc = currentSong.value?.lrc
		parseLyrics(lrc)
		audioRef.value?.play()
	})
}

// 进度控制
function seek(e: MouseEvent) {
	if (!currentSong.value || !audioRef.value) {
		console.warn('Cannot seek: audio not ready')
		return
	}
	const bar = e.currentTarget as HTMLElement
	const rect = bar.getBoundingClientRect()
	const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
	const newTime = percent * duration.value
	if (Number.isFinite(newTime) && newTime >= 0) {
		audioRef.value.currentTime = newTime
	}
}

// 音量控制
function toggleMute() {
	if (!audioRef.value)
		return
	isMuted.value = !isMuted.value
	audioRef.value.muted = isMuted.value
}

function changeVolume(e: MouseEvent) {
	const bar = e.currentTarget as HTMLElement
	const rect = bar.getBoundingClientRect()
	const percent = (e.clientX - rect.left) / rect.width
	volume.value = Math.max(0, Math.min(1, percent))
	if (audioRef.value) {
		audioRef.value.volume = volume.value
	}
	if (volume.value > 0) {
		isMuted.value = false
		audioRef.value && (audioRef.value.muted = false)
	}
}

// 事件监听
function onTimeUpdate() {
	currentTime.value = audioRef.value?.currentTime || 0
	updateCurrentLyric()
}

function onLoadedMetadata() {
	duration.value = audioRef.value?.duration || 0
}

function onEnded() {
	next()
}

// 初始化
onMounted(() => {
	const lrc = currentSong.value?.lrc
	parseLyrics(lrc)
})

watch(currentSong, () => {
	currentTime.value = 0
	duration.value = 0
	isLoading.value = true
})
</script>

<template>
<div class="music-page">
	<!-- 页面横幅 -->
	<PageBanner
		title="音乐"
		description="享受音乐带来的美好时光"
		image="https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/bg.webp"
	/>

	<div class="music-container">
		<!-- 播放器主体 -->
		<div class="player-section">
			<div class="player-card">
				<!-- 封面区域 -->
				<div class="cover-section">
					<div class="cover-wrapper" :class="{ 'is-playing': isPlaying }">
						<img
							v-if="currentSong"
							:src="currentSong.cover"
							:alt="currentSong.name"
							class="cover-image"
							@load="isLoading = false"
						>
						<div v-if="isLoading || !currentSong" class="cover-loading">
							<Icon name="line-md:loading-twotone-loop" class="spin" />
						</div>
					</div>
				</div>

				<!-- 歌曲信息 -->
				<div class="song-info">
					<h2 class="song-name">
						{{ currentSong?.name || '未知歌曲' }}
					</h2>
					<p class="song-artist">
						{{ currentSong?.artist || '未知艺术家' }}
					</p>
				</div>

				<!-- 进度条 -->
				<div class="progress-section">
					<div class="progress-bar" @click.stop.prevent="seek">
						<div class="progress-fill" :style="{ width: `${progress}%` }" />
						<div class="progress-handle" :style="{ left: `${progress}%` }" />
					</div>
					<div class="time-display">
						<span>{{ formatTime(currentTime) }}</span>
						<span>{{ formatTime(duration) }}</span>
					</div>
				</div>

				<!-- 控制按钮 -->
				<div class="controls">
					<button class="control-btn" title="上一首" @click="prev">
						<Icon name="ph:skip-back-fill" />
					</button>
					<button class="control-btn play-btn" :title="isPlaying ? '暂停' : '播放'" @click="togglePlay">
						<Icon :name="isPlaying ? 'ph:pause-fill' : 'ph:play-fill'" />
					</button>
					<button class="control-btn" title="下一首" @click="next">
						<Icon name="ph:skip-forward-fill" />
					</button>
				</div>

				<!-- 音量控制 -->
				<div class="volume-section">
					<button class="volume-btn" @click="toggleMute">
						<Icon :name="isMuted || volume === 0 ? 'ph:speaker-slash-fill' : 'ph:speaker-high-fill'" />
					</button>
					<div class="volume-bar" @click="changeVolume">
						<div class="volume-fill" :style="{ width: `${isMuted ? 0 : volume * 100}%` }" />
					</div>
				</div>

				<!-- 歌词切换 -->
				<button v-if="lyrics.length > 0" class="lyrics-toggle" @click="showLyrics = !showLyrics">
					<Icon :name="showLyrics ? 'ph:text-t-slash' : 'ph:text-t'" />
					{{ showLyrics ? '隐藏歌词' : '显示歌词' }}
				</button>
			</div>

			<!-- 歌词面板 -->
			<Transition name="lyrics">
				<div v-if="showLyrics && lyrics.length > 0" class="lyrics-panel">
					<div class="lyrics-content">
						<div
							v-for="(line, index) in lyrics"
							:key="index"
							class="lyrics-line"
							:class="{ active: index === currentLyricIndex }"
						>
							{{ line.text }}
						</div>
					</div>
				</div>
			</Transition>
		</div>

		<!-- 播放列表 -->
		<div class="playlist-section">
			<h3 class="section-title">
				<Icon name="material-symbols:queue-music" />
				播放列表
				<span class="song-count">({{ songs.length }})</span>
			</h3>
			<div class="playlist">
				<div
					v-for="(song, index) in songs"
					:key="song.id"
					class="playlist-item"
					:class="{ active: index === currentIndex, playing: index === currentIndex && isPlaying }"
					@click="selectSong(index)"
				>
					<div class="item-number">
						{{ index + 1 }}
					</div>
					<img :src="song.cover" :alt="song.name" class="item-cover">
					<div class="item-info">
						<div class="item-name">
							{{ song.name }}
						</div>
						<div class="item-artist">
							{{ song.artist }}
						</div>
					</div>
					<div v-if="index === currentIndex" class="item-status">
						<Icon :name="isPlaying ? 'line-md:loading-twotone-loop' : 'ph:pause-fill'" class="playing-icon" />
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 音频元素 -->
		<audio
			v-if="currentSong"
			ref="audioRef"
			:src="currentSong.url"
			preload="metadata"
			@ended="onEnded"
			@play="isPlaying = true"
			@pause="isPlaying = false"
			@timeupdate="onTimeUpdate"
			@loadedmetadata="onLoadedMetadata"
		/>

		<!-- 浏览量统计 -->
		<div class="page-views-wrapper">
			<PageViewCounter />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.music-page {
	max-width: 1000px;
	margin: 0 auto;
	padding: 20px;
}

.music-container {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

// 播放器区域
.player-section {
	display: flex;
	gap: 1.5rem;
	background-color: var(--c-bg-1);
	border: 1px solid var(--c-border);
	border-radius: 12px;
	padding: 2rem;
	overflow: hidden;
}

.player-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
}

// 封面
.cover-section {
	position: relative;
}

.cover-wrapper {
	position: relative;
	width: 200px;
	height: 200px;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	transition: transform 0.3s ease;

	&.is-playing {
		animation: breathe 3s ease-in-out infinite;
	}
}

.cover-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.cover-loading {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--c-bg-2);

	.spin {
		width: 2rem;
		height: 2rem;
		color: var(--c-primary);
		animation: spin 1s linear infinite;
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

@keyframes breathe {
	0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
	50% { transform: scale(1.02); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25); }
}

// 歌曲信息
.song-info {
	text-align: center;

	.song-name {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--c-text-1);
		margin: 0 0 0.5rem 0;
		max-width: 400px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.song-artist {
		font-size: 0.9rem;
		color: var(--c-text-2);
		margin: 0;
		max-width: 400px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

// 进度条
.progress-section {
	width: 100%;
	max-width: 400px;
}

.progress-bar {
	position: relative;
	height: 6px;
	background-color: var(--c-bg-2);
	border-radius: 3px;
	cursor: pointer;
	transition: height 0.2s;

	&:hover {
		height: 8px;
	}

	// 扩大点击区域
	&::before {
		content: '';
		position: absolute;
		inset: -8px -0px;
		z-index: 1;
	}
}

.progress-fill {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	background: linear-gradient(90deg, var(--c-primary-soft), var(--c-primary));
	border-radius: 3px;
	transition: width 0.1s linear;
}

.progress-handle {
	position: absolute;
	top: 50%;
	width: 14px;
	height: 14px;
	background-color: var(--c-primary);
	border-radius: 50%;
	transform: translate(-50%, -50%);
	opacity: 0;
	transition: opacity 0.2s;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

	.progress-bar:hover & {
		opacity: 1;
	}
}

.time-display {
	display: flex;
	justify-content: space-between;
	margin-top: 0.5rem;
	font-size: 0.8rem;
	color: var(--c-text-3);
}

// 控制按钮
.controls {
	display: flex;
	align-items: center;
	gap: 1.5rem;
}

.control-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
	background: none;
	border: none;
	color: var(--c-text-2);
	cursor: pointer;
	transition: all 0.2s ease;

	:deep(.iconify) {
		width: 1.5rem;
		height: 1.5rem;
	}

	&:hover {
		color: var(--c-primary);
		transform: scale(1.1);
	}

	&.play-btn {
		width: 3.5rem;
		height: 3.5rem;
		background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-soft) 100%);
		border-radius: 50%;
		color: var(--c-bg);

		:deep(.iconify) {
			width: 1.5rem;
			height: 1.5rem;
		}

		&:hover {
			transform: scale(1.08);
			box-shadow: 0 4px 16px var(--c-primary-soft);
		}
	}
}

// 音量控制
.volume-section {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	width: 100%;
	max-width: 150px;
}

.volume-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.25rem;
	background: none;
	border: none;
	color: var(--c-text-3);
	cursor: pointer;
	transition: color 0.2s;

	:deep(.iconify) {
		width: 1.25rem;
		height: 1.25rem;
	}

	&:hover {
		color: var(--c-primary);
	}
}

.volume-bar {
	flex: 1;
	height: 4px;
	background-color: var(--c-bg-2);
	border-radius: 2px;
	cursor: pointer;
}

.volume-fill {
	height: 100%;
	background-color: var(--c-primary);
	border-radius: 2px;
	transition: width 0.1s;
}

// 歌词切换
.lyrics-toggle {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.5rem 1rem;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	border-radius: 20px;
	color: var(--c-text-2);
	font-size: 0.85rem;
	cursor: pointer;
	transition: all 0.2s ease;

	:deep(.iconify) {
		width: 1rem;
		height: 1rem;
	}

	&:hover {
		background-color: var(--c-primary-soft);
		color: var(--c-primary);
		border-color: var(--c-primary-soft);
	}
}

// 歌词面板
.lyrics-panel {
	width: 300px;
	max-height: 400px;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	border-radius: 12px;
	overflow: hidden;
}

.lyrics-content {
	height: 100%;
	max-height: 400px;
	overflow-y: auto;
	padding: 1.5rem;
	text-align: center;

	&::-webkit-scrollbar {
		width: 4px;
	}

	&::-webkit-scrollbar-thumb {
		background-color: var(--c-border);
		border-radius: 2px;
	}
}

.lyrics-line {
	padding: 0.75rem 0;
	font-size: 0.95rem;
	color: var(--c-text-2);
	transition: all 0.3s ease;
	line-height: 1.6;

	&.active {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--c-primary);
	}
}

.lyrics-enter-active,
.lyrics-leave-active {
	transition: all 0.3s ease;
}

.lyrics-enter-from,
.lyrics-leave-to {
	opacity: 0;
	transform: translateX(20px);
}

// 播放列表
.playlist-section {
		background-color: var(--c-bg-1);
		border: 1px solid var(--c-border);
		border-radius: 12px;
		padding: 1.5rem;
	}

	.page-views-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

.section-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 1rem;
	font-weight: 600;
	color: var(--c-text-1);
	margin: 0 0 1rem 0;

	:deep(.iconify) {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--c-primary);
	}

	.song-count {
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--c-text-3);
	}
}

.playlist {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.playlist-item {
	display: flex;
	align-items: center;
	gap: 0.875rem;
	padding: 0.75rem;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: var(--c-bg-soft);
		border-color: var(--c-primary-soft);
	}

	&.active {
		background-color: var(--c-primary-soft);
		border-color: var(--c-primary);
	}

	&.playing {
		.playing-icon {
			color: var(--c-primary);
		}
	}
}

.item-number {
	width: 1.5rem;
	text-align: center;
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--c-text-3);
}

.item-cover {
	width: 48px;
	height: 48px;
	border-radius: 6px;
	object-fit: cover;
}

.item-info {
	flex: 1;
	min-width: 0;

	.item-name {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--c-text-1);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-bottom: 0.25rem;
	}

	.item-artist {
		font-size: 0.8rem;
		color: var(--c-text-3);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.item-status {
	.playing-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--c-text-2);
	}
}

// 响应式
@media (max-width: 768px) {
	.music-page {
		padding: 10px;
	}

	.player-section {
		flex-direction: column;
		padding: 1.5rem 1rem;
	}

	.cover-wrapper {
		width: 160px;
		height: 160px;
	}

	.song-info {
		.song-name {
			font-size: 1.1rem;
			max-width: 280px;
		}

		.song-artist {
			max-width: 280px;
		}
	}

	.lyrics-panel {
		width: 100%;
		max-height: 250px;
	}

	.lyrics-content {
		max-height: 250px;
	}

	.playlist-section {
		padding: 1rem;
	}

	.item-cover {
		width: 40px;
		height: 40px;
	}
}
</style>
