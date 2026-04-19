<script setup lang="ts">
import type { FeedEntry } from '~/types/feed'

const props = defineProps<FeedEntry>()

const appConfig = useAppConfig()

const title = computed(() => props.title ?? props.sitenick ?? props.author)
const domainTip = computed(() => getDomainType(getMainDomain(props.link, true)))
const domainIcon = computed(() => getDomainIcon(props.link))
</script>

<template>
	<div class="feed-card-wrapper">
		<ZRawLink
			class="feed-card"
			:to="error ? undefined : link"
			rel="noopener"
			:data-error="error"
		>
			<!-- 截图展示区域 -->
			<div v-if="screenshot" class="screenshot-wrapper">
				<img class="screenshot" :src="screenshot" :alt="`${author} 的网站截图`" loading="lazy">
			</div>

			<!-- 信息区域 -->
			<div class="info-wrapper">
				<div class="avatar" :title="feed ? undefined : '无订阅源'">
					<img class="round-cobblestone" :src="avatar" :alt="author" loading="lazy">
					<Icon v-if="appConfig.link?.remindNoFeed && !feed" class="no-feed" name="ri:notification-off-line" />
				</div>

				<div class="text-info">
					<span class="author">{{ author }}</span>
					<span class="sitenick">{{ desc || sitenick }}</span>
				</div>
			</div>
		</ZRawLink>

		<!-- Tooltip 内容 -->
		<div class="feed-tooltip">
			<div class="site-content">
				<img class="site-icon" :src="icon" :alt="title">

				<div class="site-info">
					<h3>{{ title }}</h3>

					<code class="domain" :title="domainTip">
						<span>{{ getDomain(link) }}</span>
						<Icon v-if="domainIcon" class="domain-mark" :name="domainIcon" />
					</code>
				</div>

				<Icon
					v-for="arch in archs" :key="arch"
					class="arch" :name="getArchIcon(arch)" :title="arch"
				/>
			</div>
			<div class="desc-content">
				<div v-if="date" class="date">
					{{ new Date(date).toLocaleDateString('zh-CN') }}
				</div>

				<p>{{ error ?? desc }}</p>

				<p v-if="comment">
					<Icon name="ri:message-3-line" /> {{ comment }}
				</p>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.feed-card-wrapper {
	position: relative;
	display: inline-block;
}

.feed-card {
	display: flex;
	flex-direction: column;
	width: 280px;
	margin: 0 auto 1em;
	border-radius: 12px;
	overflow: hidden;
	background-color: var(--c-bg-1);
	box-shadow: var(--box-shadow-2);
	transition: transform 0.3s, box-shadow 0.3s;
	text-decoration: none;

	&:hover {
		transform: translateY(-4px);
		box-shadow: var(--box-shadow-3);
	}

	&[data-error] {
		opacity: 0.5;
		cursor: not-allowed;
	}
}

// 截图展示区域
.screenshot-wrapper {
	width: 100%;
	height: 160px;
	overflow: hidden;
	background-color: var(--c-bg-2);

	.screenshot {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.3s;
	}

	.feed-card:hover .screenshot {
		transform: scale(1.05);
	}
}

// 信息区域
.info-wrapper {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	background-color: var(--c-bg-1);
}

.avatar {
	position: relative;
	flex-shrink: 0;

	img {
		display: block;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		box-shadow: var(--box-shadow-2);
		background-color: var(--c-bg-2);
		object-fit: cover;
	}

	.no-feed {
		position: absolute;
		inset-inline-end: -0.3em;
		bottom: 0;
		font-size: 0.7em;
		opacity: 0.6;
		color: var(--c-text-3);
	}
}

.text-info {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	overflow: hidden;
	flex: 1;

	.author {
		font-size: 1rem;
		font-weight: 600;
		color: var(--c-text-1);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sitenick {
		font-size: 0.8rem;
		color: var(--c-text-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		opacity: 0.8;
	}
}

// 无截图时的紧凑模式
.feed-card:not(:has(.screenshot-wrapper)) {
	width: auto;
	min-width: 200px;
	flex-direction: row;
	align-items: center;
	padding: 0.5em;

	.info-wrapper {
		padding: 0;
		background: transparent;
	}

	.avatar img {
		width: 2.5rem;
		height: 2.5rem;
	}

	.text-info {
		.author {
			font-size: 0.95rem;
		}

		.sitenick {
			font-size: 0.75rem;
			opacity: 0.4;
		}
	}
}

// Tooltip 样式
.feed-tooltip {
	position: absolute;
	bottom: 100%;
	left: 50%;
	transform: translateX(-50%);
	width: 280px;
	margin-bottom: 0.5rem;
	border: 1px solid var(--c-border);
	border-radius: 0.5em;
	background-color: var(--c-bg-1);
	box-shadow: var(--box-shadow-3);
	opacity: 0;
	visibility: hidden;
	transition: all 0.2s;
	z-index: 10;

	.feed-card-wrapper:hover & {
		opacity: 1;
		visibility: visible;
	}
}

.site-content {
	display: flex;
	align-items: center;
	gap: 0.5em;
	padding: 0.5em 1em;

	.site-icon {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 4px;
		object-fit: contain;
	}

	.site-info {
		flex: 1;
		margin-inline-end: 0.5em;

		h3 {
			font-size: 1em;
			font-weight: 600;
			color: var(--c-text-1);
			margin: 0;
		}

		.domain {
			font-size: 0.9em;
			color: var(--c-text-2);
		}

		.domain-mark {
			font-size: 0.8em;
			vertical-align: super;
			margin-left: 0.2em;
		}
	}

	.arch {
		font-size: 1.2em;
		color: var(--c-text-2);
	}
}

.desc-content {
	position: relative;
	padding: 0.5em 1em;
	background-color: var(--c-bg-2);
	border-radius: 0 0 0.5em 0.5em;

	p + p {
		margin-top: 0.5em;
	}

	.date {
		position: absolute;
		opacity: 0.1;
		inset-inline-end: -0.1em;
		bottom: -0.3em;
		font-size: 3em;
		font-weight: bold;
		white-space: nowrap;
		pointer-events: none;
	}
}
</style>
