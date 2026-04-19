<script setup lang="ts">
const props = withDefaults(defineProps<{
	prompt?: string | boolean
	code?: string
	lang?: string
}>(), {
	prompt: '$',
})

// prompt 传入空字符串会变成 true
const showPrompt = computed(() => props.prompt !== true)

const { copy, copied } = useClipboard({ source: () => props.code ?? '' })
</script>

<template>
	<code class="copy">
		<span v-if="showPrompt" class="prompt">{{ prompt }}</span>

		<div class="code scrollcheck-x">
			{{ code }}
		</div>

		<button class="operation" aria-label="复制" @click="copy()">
			<Icon :name="copied ? 'ri:check-line' : 'ri:file-copy-line'" />
		</button>
	</code>
</template>

<style lang="scss" scoped>
.copy {
	contain: paint;
	display: flex;
	overflow: auto; // prompt 溢出时滚动
	margin: 0.5rem 0;
	border: 1px solid var(--c-border);
	border-radius: 4px;
	background-color: var(--c-bg-1);
	font-size: 0.8rem;
	line-height: 2.5;
	transition: border-color 0.2s;

	&:hover {
		border-color: var(--c-primary);

		.prompt {
			border-inline-end-color: var(--c-primary);
			background-color: var(--c-primary-soft);
			color: var(--c-primary);
		}
	}

	.prompt {
		flex-shrink: 0;
		padding: 0 1em;
		border-inline-end: 1px solid var(--c-border);
		background-color: var(--c-bg-2);
		color: var(--c-text-2);
		transition: all 0.2s;
	}

	.code {
		--fadeout-width: 3ch;
		--scrollbar-height: 4px;

		flex-grow: 1;
		overflow: auto;
		padding: 0 1em;
		white-space: nowrap;
		font-family: var(--font-monospace, monospace);
		color: var(--c-text-1);
		user-select: text;

		&::-webkit-scrollbar {
			height: 4px;
			background-color: transparent;
		}
	}

	.operation {
		flex-shrink: 0;
		height: 2.5em;
		margin-inline-start: -0.5em;
		padding: 0.5em;
		color: var(--c-text-2);
		transition: color 0.2s;

		&:hover {
			color: var(--c-primary);
		}
	}
}
</style>
