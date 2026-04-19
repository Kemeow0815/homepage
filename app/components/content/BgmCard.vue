<script setup lang="ts">
import type { BangumiCollectionItem } from '~/types/bangumi'

const props = defineProps<{
	bangumiCollectionItem: BangumiCollectionItem
}>()

function handleClick() {
	const url = `https://bgm.tv/subject/${props.bangumiCollectionItem.subject_id}`
	window.open(url, '_blank')
}

// 计算评分星星
const score = computed(() => Math.floor(props.bangumiCollectionItem.subject.score))

const scoreClass = computed(() => (index: number) => {
	const scoreTotal = score.value / 2
	const integerPartScore = Math.floor(scoreTotal)
	const hasHalfScore = scoreTotal % 1 !== 0

	if (index < integerPartScore) {
		return 'ri:star-fill'
	} else if (index === integerPartScore && hasHalfScore) {
		return 'ri:star-half-line'
	} else {
		return 'ri:star-line'
	}
})

// 计算进度
const epStart = computed(() => props.bangumiCollectionItem.ep_status)
const epStop = computed(() => props.bangumiCollectionItem.subject.eps)
const progress = computed(() => {
	return epStop.value === 0 ? 0 : (epStart.value / epStop.value) * 100
})
</script>

<template>
	<div class="bgm-card" @click="handleClick">
		<div class="bgm-image">
			<img :src="bangumiCollectionItem.subject?.images.common" :alt="bangumiCollectionItem.subject.name" loading="lazy">
		</div>
		<div class="bgm-content">
			<div class="bgm-header">
				<h3 class="bgm-title">
					{{ bangumiCollectionItem.subject.name_cn || bangumiCollectionItem.subject.name }}
				</h3>
				<div class="bgm-score">
					<div class="stars">
						<Icon v-for="(_, index) in 5" :key="index" :name="scoreClass(index)" />
					</div>
					<span class="score-number">{{ bangumiCollectionItem.subject.score }}</span>
				</div>
			</div>
			<p class="bgm-desc">
				{{ bangumiCollectionItem.subject.short_summary }}
			</p>
			<div v-if="epStop > 0" class="bgm-progress">
				<span class="progress-text">{{ epStart }} / {{ epStop }}</span>
				<div class="progress-bar">
					<div class="progress-fill" :style="`width: ${progress}%`" />
				</div>
			</div>
			<div class="bgm-tags">
				<span v-for="tag in bangumiCollectionItem.subject.tags.slice(0, 5)" :key="tag.name" class="tag">
					{{ tag.name }}
				</span>
			</div>
			<div class="bgm-footer">
				<div class="bgm-date">
					<Icon name="ri:calendar-line" />
					{{ bangumiCollectionItem.updated_at.slice(0, 10) }}
				</div>
				<div class="bgm-source">
					<Icon name="ri:bilibili-line" />
					Bangumi
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.bgm-card {
	display: flex;
	gap: 1rem;
	padding: 1rem;
	background: var(--c-bg-1);
	border: 1px solid var(--c-border);
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.3s ease;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px var(--ld-shadow);
		border-color: var(--c-primary);
	}

	@media (max-width: 768px) {
		flex-direction: column;
		gap: 0.75rem;
	}
}

.bgm-image {
	flex-shrink: 0;
	width: 120px;
	height: 160px;
	border-radius: 8px;
	overflow: hidden;
	background: var(--c-bg-2);

	@media (max-width: 768px) {
		width: 100%;
		height: 200px;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	&:hover img {
		transform: scale(1.05);
	}
}

.bgm-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	min-width: 0;
}

.bgm-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 0.5rem;

	@media (max-width: 768px) {
		flex-direction: column;
	}
}

.bgm-title {
	font-size: 1.1rem;
	font-weight: 600;
	color: var(--c-text-1);
	margin: 0;
	line-height: 1.3;
	word-break: break-word;
}

.bgm-score {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex-shrink: 0;

	.stars {
		display: flex;
		gap: 2px;
		color: #ffc107;

		.iconify {
			font-size: 0.9rem;
		}
	}

	.score-number {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--c-text-1);
	}
}

.bgm-desc {
	color: var(--c-text-2);
	font-size: 0.85rem;
	line-height: 1.5;
	margin: 0;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.bgm-progress {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.8rem;
	color: var(--c-text-2);

	.progress-text {
		flex-shrink: 0;
	}

	.progress-bar {
		flex: 1;
		height: 4px;
		background: var(--c-bg-2);
		border-radius: 2px;
		overflow: hidden;

		.progress-fill {
			height: 100%;
			background: var(--c-primary);
			border-radius: 2px;
			transition: width 0.3s;
		}
	}
}

.bgm-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.3rem;

	.tag {
		background: var(--c-primary-soft);
		color: var(--c-primary);
		font-size: 0.7rem;
		padding: 0.15rem 0.5rem;
		border-radius: 0.25rem;
		white-space: nowrap;
	}
}

.bgm-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: auto;
	padding-top: 0.5rem;
	border-top: 1px solid var(--c-border);
	font-size: 0.75rem;
	color: var(--c-text-2);

	.bgm-date,
	.bgm-source {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
}
</style>
