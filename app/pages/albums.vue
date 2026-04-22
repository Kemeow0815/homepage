<script setup lang="ts">
import type { AlbumPhoto } from '~/data/albums'
import PageBanner from '~/components/partial/PageBanner.vue'
import { formatDate, formatFileSize, getAllPhotos, getPhotoById } from '~/data/albums'

useHead({
	title: '相册',
})

definePageMeta({
	headerText: '相册',
})

const photos = ref<AlbumPhoto[]>([])
const isLoading = ref(true)
const selectedPhoto = ref<AlbumPhoto | null>(null)
const showLightbox = ref(false)
const lightboxImageLoaded = ref(false)
const showBoundaryTip = ref('')
let boundaryTipTimer: ReturnType<typeof setTimeout> | null = null

// 加载照片
onMounted(() => {
	photos.value = getAllPhotos()
	isLoading.value = false
	document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
	document.removeEventListener('keydown', handleKeydown)
	if (boundaryTipTimer) {
		clearTimeout(boundaryTipTimer)
	}
})

const currentIndex = computed(() => {
	if (!selectedPhoto.value)
		return -1
	return photos.value.findIndex(p => p.id === selectedPhoto.value?.id)
})

function openPhoto(photo: AlbumPhoto) {
	selectedPhoto.value = photo
	showLightbox.value = true
	lightboxImageLoaded.value = false
}

function closeLightbox() {
	showLightbox.value = false
	selectedPhoto.value = null
	lightboxImageLoaded.value = false
}

function showTip(tip: string) {
	showBoundaryTip.value = tip
	if (boundaryTipTimer) {
		clearTimeout(boundaryTipTimer)
	}
	boundaryTipTimer = setTimeout(() => {
		showBoundaryTip.value = ''
	}, 1500)
}

function navigatePhoto(direction: 'prev' | 'next') {
	if (!selectedPhoto.value || photos.value.length === 0)
		return

	const index = currentIndex.value
	if (index === -1)
		return

	let newIndex: number

	if (direction === 'prev') {
		if (index === 0) {
			showTip('已经是第一张了')
			return
		}
		newIndex = index - 1
	}
	else {
		if (index === photos.value.length - 1) {
			showTip('已经是最后一张了')
			return
		}
		newIndex = index + 1
	}

	const newPhoto = photos.value[newIndex]
	if (newPhoto) {
		selectedPhoto.value = newPhoto
		lightboxImageLoaded.value = false
	}
}

function handleKeydown(e: KeyboardEvent) {
	if (!showLightbox.value)
		return

	if (e.key === 'Escape') {
		closeLightbox()
	}
	else if (e.key === 'ArrowLeft') {
		navigatePhoto('prev')
	}
	else if (e.key === 'ArrowRight') {
		navigatePhoto('next')
	}
}
</script>

<template>
<div class="albums-page">
	<!-- 页面横幅 -->
	<PageBanner
		title="相册"
		description="记录生活中的美好瞬间"
		image="https://jsd.268682.xyz/gh/Kemeow0815/img@main/img/bg.webp"
	/>

	<div class="albums-container">
		<!-- 加载状态 -->
		<template v-if="isLoading">
			<div class="loading-state">
				<div v-for="i in 12" :key="`skeleton-${i}`" class="skeleton-item">
					<div class="skeleton-image" />
				</div>
			</div>
		</template>

		<!-- 空状态 -->
		<template v-else-if="photos.length === 0">
			<div class="empty-state">
				<Icon name="material-symbols:images-outline" class="empty-icon" />
				<p>暂无照片</p>
			</div>
		</template>

		<!-- 照片网格 -->
		<template v-else>
			<div class="masonry-grid">
				<div
					v-for="(photo, index) in photos"
					:key="photo.id"
					class="masonry-item"
					:style="{ '--delay': `${index * 0.03}s` }"
					@click="openPhoto(photo)"
				>
					<div class="image-wrapper">
						<img
							:src="photo.thumbnailUrl"
							:alt="photo.title || '照片'"
							class="image-thumb"
							loading="lazy"
						>
						<div class="photo-overlay">
							<div class="overlay-content">
								<Icon name="material-symbols:fullscreen" class="expand-icon" />
								<div v-if="photo.title" class="photo-title">
									{{ photo.title }}
								</div>
								<div v-if="photo.dateTaken" class="photo-date">
									{{ formatDate(photo.dateTaken) }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="albums-footer">
				<p>共 {{ photos.length }} 张照片</p>
			</div>
		</template>
	</div>
</div>

<!-- 灯箱 -->
<Teleport to="body">
	<Transition name="lightbox">
		<div v-if="showLightbox && selectedPhoto" class="lightbox" @click.self="closeLightbox">
			<button class="lightbox-close" @click="closeLightbox">
				<Icon name="material-symbols:close" />
			</button>

			<button class="lightbox-nav prev" @click="navigatePhoto('prev')">
				<Icon name="material-symbols:chevron-left" />
			</button>

			<button class="lightbox-nav next" @click="navigatePhoto('next')">
				<Icon name="material-symbols:chevron-right" />
			</button>

			<Transition name="tip">
				<div v-if="showBoundaryTip" class="boundary-tip">
					{{ showBoundaryTip }}
				</div>
			</Transition>

			<div class="lightbox-content">
				<div class="lightbox-image-container">
					<img
						:src="selectedPhoto.thumbnailUrl"
						:alt="selectedPhoto.title || '照片'"
						class="lightbox-image thumb"
						:class="{ hidden: lightboxImageLoaded }"
					>
					<img
						v-show="lightboxImageLoaded"
						:src="selectedPhoto.originalUrl"
						:alt="selectedPhoto.title || '照片'"
						class="lightbox-image full"
						:class="{ visible: lightboxImageLoaded }"
						@load="lightboxImageLoaded = true"
					>
					<div v-if="!lightboxImageLoaded" class="loading-spinner">
						<Icon name="line-md:loading-twotone-loop" class="spin" />
					</div>
				</div>

				<div class="lightbox-info">
					<div class="info-header">
						<div v-if="selectedPhoto.title" class="info-title">
							{{ selectedPhoto.title }}
						</div>
						<div v-if="selectedPhoto.description" class="info-desc">
							{{ selectedPhoto.description }}
						</div>
					</div>

					<div class="info-meta">
						<div v-if="selectedPhoto.dateTaken" class="meta-item">
							<Icon name="material-symbols:calendar-month" />
							<span>{{ formatDate(selectedPhoto.dateTaken) }}</span>
						</div>
						<div v-if="selectedPhoto.fileSize" class="meta-item">
							<Icon name="material-symbols:folder" />
							<span>{{ formatFileSize(selectedPhoto.fileSize) }}</span>
						</div>
						<div v-if="selectedPhoto.width && selectedPhoto.height" class="meta-item">
							<Icon name="material-symbols:aspect-ratio" />
							<span>{{ selectedPhoto.width }} x {{ selectedPhoto.height }}</span>
						</div>
					</div>

					<div v-if="selectedPhoto.tags?.length" class="info-tags">
						<span v-for="tag in selectedPhoto.tags" :key="tag" class="tag">
							{{ tag }}
						</span>
					</div>

					<div class="info-counter">
						{{ currentIndex + 1 }} / {{ photos.length }}
					</div>
				</div>
			</div>
		</div>
	</Transition>
</Teleport>
</template>

<style lang="scss" scoped>
.albums-page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
}

.albums-container {
	margin-top: 1.5rem;
}

// 加载状态
.loading-state {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 0.5rem;

	@media (min-width: 640px) {
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	@media (min-width: 1024px) {
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}
}

.skeleton-item {
	overflow: hidden;
	aspect-ratio: 1;
	border-radius: 8px;
}

.skeleton-image {
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, var(--c-bg-2) 25%, var(--c-bg-soft) 50%, var(--c-bg-2) 75%);
	background-size: 200% 100%;
	animation: loading 1.5s infinite;
}

@keyframes loading {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 4rem 2rem;
	border-radius: 12px;
	background-color: var(--c-bg-1);
	border: 1px solid var(--c-border);

	.empty-icon {
		width: 4rem;
		height: 4rem;
		margin-bottom: 1rem;
		color: var(--c-text-3);
	}

	p {
		font-size: 1rem;
		color: var(--c-text-3);
		margin: 0;
	}
}

// 瀑布流网格
.masonry-grid {
	column-count: 2;
	column-gap: 0.5rem;

	@media (min-width: 640px) {
		column-count: 3;
		column-gap: 0.75rem;
	}

	@media (min-width: 1024px) {
		column-count: 4;
		column-gap: 1rem;
	}
}

.masonry-item {
	overflow: hidden;
	margin-bottom: 0.5rem;
	border-radius: 8px;
	border: 1px solid var(--c-border);
	transition: transform 0.3s, box-shadow 0.3s;
	animation: float-in 0.3s backwards;
	animation-delay: var(--delay);
	cursor: pointer;
	break-inside: avoid;

	@media (min-width: 640px) {
		margin-bottom: 0.75rem;
	}

	@media (min-width: 1024px) {
		margin-bottom: 1rem;
	}

	&:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
		transform: translateY(-4px);

		.photo-overlay {
			opacity: 1;
		}
	}
}

.image-wrapper {
	position: relative;
	width: 100%;
	line-height: 0;
}

.image-thumb {
	display: block;
	width: 100%;
	height: auto;
}

.photo-overlay {
	display: flex;
	align-items: flex-end;
	position: absolute;
	opacity: 0;
	inset: 0;
	padding: 0.75rem;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%);
	transition: opacity 0.3s;
}

.overlay-content {
	width: 100%;
	color: white;
}

.expand-icon {
	position: absolute;
	opacity: 0.8;
	top: 0.75rem;
	right: 0.75rem;
	width: 1.25rem;
	height: 1.25rem;
}

.photo-title {
	overflow: hidden;
	margin-bottom: 0.25rem;
	font-size: 0.9rem;
	font-weight: 600;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.photo-date {
	opacity: 0.8;
	font-size: 0.75rem;
}

.albums-footer {
	margin: 2rem 0;
	font-size: 0.9rem;
	text-align: center;
	color: var(--c-text-3);
}

// 灯箱
.lightbox {
	display: flex;
	align-items: center;
	justify-content: center;
	position: fixed;
	inset: 0;
	padding: 1rem;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(10px);
	z-index: 1000;
}

.lightbox-close {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 1rem;
	right: 1rem;
	width: 2.5rem;
	height: 2.5rem;
	border: none;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	font-size: 1.25rem;
	color: white;
	transition: background 0.2s;
	cursor: pointer;
	z-index: 1001;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
	}
}

.lightbox-nav {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 50%;
	width: 2.5rem;
	height: 2.5rem;
	border: none;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	font-size: 1.5rem;
	color: white;
	transform: translateY(-50%);
	transition: background 0.2s;
	cursor: pointer;
	z-index: 1001;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	&.prev {
		left: 1rem;
	}

	&.next {
		right: 1rem;
	}
}

.boundary-tip {
	position: absolute;
	top: 50%;
	left: 50%;
	padding: 0.75rem 1.5rem;
	border-radius: 8px;
	background: rgba(0, 0, 0, 0.7);
	font-size: 0.9rem;
	color: white;
	transform: translate(-50%, -50%);
	pointer-events: none;
	z-index: 1002;
}

.tip-enter-active,
.tip-leave-active {
	transition: opacity 0.3s;
}

.tip-enter-from,
.tip-leave-to {
	opacity: 0;
}

.lightbox-content {
	display: flex;
	align-items: center;
	gap: 1.5rem;
	max-width: 95vw;
	max-height: 90vh;
}

.lightbox-image-container {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	position: relative;
	max-width: 65vw;
	max-height: 85vh;
}

.lightbox-image {
	max-width: 100%;
	max-height: 85vh;
	border-radius: 8px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	transition: opacity 0.4s ease;
	object-fit: contain;

	&.thumb {
		&.hidden {
			opacity: 0;
		}
	}

	&.full {
		position: absolute;
		opacity: 0;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		&.visible {
			opacity: 1;
		}
	}
}

.loading-spinner {
	position: absolute;
	top: 50%;
	left: 50%;
	font-size: 2rem;
	color: white;
	transform: translate(-50%, -50%);

	.spin {
		animation: spin 1s linear infinite;
	}
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.lightbox-info {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	overflow-y: auto;
	width: 280px;
	max-height: 85vh;
	padding: 1.5rem;
	border-radius: 12px;
	background: var(--c-bg-1);
	border: 1px solid var(--c-border);
	color: var(--c-text-1);
}

.info-header {
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--c-border);
}

.info-title {
	margin-bottom: 0.5rem;
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1.4;
}

.info-desc {
	font-size: 0.9rem;
	color: var(--c-text-2);
	line-height: 1.6;
}

.info-meta {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	font-size: 0.85rem;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: var(--c-text-2);

	.icon {
		width: 1rem;
		height: 1rem;
		color: var(--c-text-3);
	}
}

.info-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	padding-top: 1rem;
	border-top: 1px solid var(--c-border);
}

.tag {
	padding: 0.25rem 0.6rem;
	border-radius: 4px;
	background: var(--c-bg-2);
	font-size: 0.8rem;
	color: var(--c-text-2);
}

.info-counter {
	padding-top: 1rem;
	border-top: 1px solid var(--c-border);
	font-size: 0.85rem;
	text-align: center;
	color: var(--c-text-3);
}

// 响应式
@media (max-width: 768px) {
	.albums-page {
		padding: 10px;
	}

	.lightbox-content {
		flex-direction: column;
		overflow-y: auto;
		max-height: none;
	}

	.lightbox-image-container {
		max-width: 90vw;
		max-height: 50vh;
	}

	.lightbox-info {
		width: 100%;
		max-width: 90vw;
		max-height: none;
	}

	.lightbox-nav {
		width: 2rem;
		height: 2rem;
		font-size: 1.25rem;

		&.prev {
			left: 0.5rem;
		}

		&.next {
			right: 0.5rem;
		}
	}
}

.lightbox-enter-active,
.lightbox-leave-active {
	transition: opacity 0.3s;
}

.lightbox-enter-from,
.lightbox-leave-to {
	opacity: 0;
}

@keyframes float-in {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
