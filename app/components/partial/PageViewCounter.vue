<script setup lang="ts">
const { getPageViews, formatViews } = usePageViews()

const props = defineProps<{
	pathname?: string
}>()

const views = ref(0)
const formattedViews = computed(() => formatViews(views.value))

onMounted(async () => {
	views.value = await getPageViews(props.pathname)
})
</script>

<template>
	<ClientOnly>
		<div class="page-view-counter">
			<Icon name="ri:eye-line" class="view-icon" />
			<span class="view-count">{{ formattedViews }}</span>
			<span class="view-label">浏览</span>
		</div>
		<template #fallback>
			<div class="page-view-counter">
				<Icon name="ri:eye-line" class="view-icon" />
				<span class="view-count">-</span>
				<span class="view-label">浏览</span>
			</div>
		</template>
	</ClientOnly>
</template>

<style lang="scss" scoped>
.page-view-counter {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	font-size: 0.8rem;
	color: var(--c-text-3);
	background-color: var(--c-bg-2);
	border: 1px solid var(--c-border);
	border-radius: 20px;
	transition: all 0.2s ease;

	&:hover {
		border-color: var(--c-primary);
		color: var(--c-primary);
	}

	.view-icon {
		width: 14px;
		height: 14px;
	}

	.view-count {
		font-weight: 500;
		color: var(--c-text-2);
	}

	.view-label {
		font-size: 0.75rem;
	}
}
</style>
