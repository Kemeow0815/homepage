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

	.banner-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		padding: 1.5rem;
		color: var(--c-text-1);

		h1 {
			font-size: 1.75rem;
			font-weight: 700;
			margin: 0;
			margin-bottom: 0.5rem;
		}

		p {
			font-size: 0.9rem;
			opacity: 0.8;
			margin: 0;
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
