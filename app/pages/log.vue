<script setup lang="ts">
// import { ZhiluIcon, ZhiluIconOld } from '#components'

useHead({ title: '日志' })
definePageMeta({ headerText: '互联网上的活动记录' })

const timeline = {
	'2026-04-18': [`开始大改主页`],
}
</script>

<template>
<ZTimeline :timeline />
</template>
