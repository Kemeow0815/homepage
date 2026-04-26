<script setup lang="ts">
const props = defineProps<{ to?: string }>()
const external = computed(() => isExtLink(props.to))
</script>

<template>
<a v-if="to === '#'" :href="to"><slot /></a>
<span v-else-if="to === undefined"><slot /></span>
<a v-else-if="external" :href="to" target="_blank" rel="noopener noreferrer">
	<slot :external />
</a>
<NuxtLink v-else :to>
	<slot :external />
</NuxtLink>
</template>
