export const useMomentsStore = defineStore('moments', () => {
	// 当前筛选的标签
	const filterTag = ref<string>('')

	// 设置筛选标签
	const setFilterTag = (tag: string) => {
		filterTag.value = tag
	}

	// 清除筛选
	const clearFilter = () => {
		filterTag.value = ''
	}

	// 切换标签筛选（如果已经是当前标签则清除，否则设置为新标签）
	const toggleFilterTag = (tag: string) => {
		if (filterTag.value === tag) {
			filterTag.value = ''
		}
		else {
			filterTag.value = tag
		}
	}

	return {
		filterTag,
		setFilterTag,
		clearFilter,
		toggleFilterTag,
	}
})
