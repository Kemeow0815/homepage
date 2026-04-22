<script setup lang="ts">
defineProps<{
	image?: string
	title: string
	description?: string
}>()
</script>

<template>
<div
	class="page-banner"
	:style="image ? { backgroundImage: `url(${image})` } : {}"
>
	<div class="banner-content">
		<h1>{{ title }}</h1>
		<p v-if="description">
			{{ description }}
		</p>
	</div>
	<div class="banner-extra">
		<slot />
	</div>
</div>
</template>

<style lang="scss" scoped>
.page-banner {
	position: relative;
	overflow: hidden;
	min-height: 200px;
	max-height: 280px;
	margin-bottom: 1.5rem;
	border-radius: 12px;
	background-position: 50%;
	background-size: cover;
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);

	// 无背景图时的渐变效果
	&:not([style*="background-image"]) {
		background: linear-gradient(135deg, var(--c-bg-2) 0%, var(--c-bg-3) 100%);
	}

	// 有背景图时添加遮罩层
	&[style*="background-image"]::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to right,
			rgba(0, 0, 0, 0.6) 0%,
			rgba(0, 0, 0, 0.4) 50%,
			rgba(0, 0, 0, 0.2) 100%
		);
		z-index: 0;
	}

	// 浅色模式使用白色遮罩
	:root[data-theme="light"] &[style*="background-image"]::before {
		background: linear-gradient(
			to right,
			rgba(255, 255, 255, 0.85) 0%,
			rgba(255, 255, 255, 0.7) 50%,
			rgba(255, 255, 255, 0.5) 100%
		);
	}

	.banner-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		padding: 1.5rem;
		color: #fff;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

		h1 {
			font-size: 1.75rem;
			font-weight: 700;
			margin: 0;
			margin-bottom: 0.5rem;
		}

		p {
			font-size: 0.9rem;
			opacity: 0.9;
			margin: 0;
			color: rgba(255, 255, 255, 0.9);
		}
	}

	// 浅色模式下文字使用深色
	:root[data-theme="light"] &[style*="background-image"] .banner-content {
		color: var(--c-text-1);
		text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);

		p {
			color: var(--c-text-2);
		}
	}

	.banner-extra {
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		position: absolute;
		right: 0;
		bottom: 0;
		margin: 1rem;
	}
}

// 响应式
@media (max-width: 768px) {
	.page-banner {
		min-height: 160px;
		border-radius: 8px;
		margin-bottom: 1rem;

		.banner-content {
			padding: 1rem;

			h1 {
				font-size: 1.5rem;
			}

			p {
				font-size: 0.85rem;
			}
		}
	}
}
</style>
