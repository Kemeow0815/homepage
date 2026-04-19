<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const appConfig = useAppConfig()
const sidebarStore = useSidebarStore()
const route = useRoute()

// 子菜单展开状态
const openMenuKeys = ref<Record<string, boolean>>({})

const itemKey = (groupIndex: number, itemIndex: number) => `g${groupIndex}-i${itemIndex}`

// 判断是否有子菜单
const hasSubItems = (item: any) => Boolean(item.children && item.children.length)

// 判断当前项是否激活
function isActive(item: any): boolean {
	if (item.url && item.url !== '#' && !isExtLink(item.url) && route.path === item.url)
		return true

	if (item.children?.length)
		return item.children.some(isActive)

	return false
}

const isOpen = (key: string) => Boolean(openMenuKeys.value[key])

function toggleSubMenu(key: string) {
	openMenuKeys.value[key] = !openMenuKeys.value[key]
}

// 自动展开当前激活的菜单
function openActiveMenus() {
	appConfig.nav.forEach((group, groupIndex) => {
		group.items.forEach((item, itemIndex) => {
			if (hasSubItems(item) && isActive(item))
				openMenuKeys.value[itemKey(groupIndex, itemIndex)] = true
		})
	})
}

watch(() => route.path, openActiveMenus, { immediate: true })
</script>

<template>
<aside id="z-sidebar" :class="{ show: sidebarStore.isOpen }">
	<header class="aside-header">
		<ZhiluIcon />
		<span>{{ appConfig.author.name }}</span>
		<Icon name="ri:close-line" class="close-sidebar" @click="sidebarStore.toggle()" />
	</header>
	<nav class="aside-nav scrollcheck-y">
		<template v-for="(group, groupIndex) in appConfig.nav" :key="groupIndex">
			<h2 v-if="group.title">
				{{ group.title }}
			</h2>
			<menu>
				<li v-for="(item, itemIndex) in group.items" :key="itemIndex">
					<!-- 有子菜单的情况 -->
					<template v-if="hasSubItems(item)">
						<button
							class="aside-nav-item aside-nav-item-parent"
							:class="{ open: isOpen(itemKey(groupIndex, itemIndex)), active: isActive(item) }"
							type="button"
							@click="toggleSubMenu(itemKey(groupIndex, itemIndex))"
						>
							<span class="nav-text-wrap">
								<Icon :name="item.icon" />
								<span class="nav-text">{{ item.text }}</span>
							</span>
							<Icon :name="isOpen(itemKey(groupIndex, itemIndex)) ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" />
						</button>

						<ul v-show="isOpen(itemKey(groupIndex, itemIndex))" class="aside-subnav">
							<li v-for="(subItem, subIndex) in item.children" :key="subIndex">
								<ZRawLink v-slot="{ external }" :to="subItem.url" class="aside-nav-item submenu-item" :class="{ 'router-link-active': isActive(subItem) }">
									<Icon :name="subItem.icon" />
									<span class="nav-text">{{ subItem.text }}</span>
									<Icon v-if="external" class="external-tip" name="ri:arrow-right-up-line" />
								</ZRawLink>
							</li>
						</ul>
					</template>

					<!-- 没有子菜单的情况 -->
					<template v-else>
						<ZRawLink v-slot="{ external }" :to="item.url" class="aside-nav-item" :class="{ 'router-link-active': isActive(item) }">
							<Icon :name="item.icon" />
							<span class="nav-text">{{ item.text }}</span>
							<Icon v-if="external" class="external-tip" name="ri:arrow-right-up-line" />
						</ZRawLink>
					</template>
				</li>
			</menu>
		</template>
	</nav>
	<footer class="aside-footer">
		<ZThemeToggle />
		<component :is="() => toValue(item)" v-for="(item, index) in appConfig.footer" :key="index" />
	</footer>
</aside>
<Transition>
	<div v-if="sidebarStore.isOpen" id="z-sidebar-bgmask" @click="sidebarStore.toggle()" />
</Transition>
</template>

<style lang="scss" scoped>
#z-sidebar {
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	width: 240px;
	border-right: 1px solid var(--c-border);
	background-color: var(--c-bg-1);

	.close-sidebar {
		display: none;
		cursor: pointer;
	}

	@media (max-width: $breakpoint-mobile) {
		position: fixed;
		left: 0;
		width: 320px;
		height: 100%;
		max-width: 100%;
		transform: translateX(-100%);
		transition: transform 0.2s;
		z-index: 3;

		&.show {
			box-shadow: 0 0 1rem var(--ld-shadow);
			transform: none;

			.close-sidebar {
				display: block;
			}
		}
	}
}

#z-sidebar-bgmask {
	position: fixed;
	inset: 0;
	backdrop-filter: contrast(0.8) brightness(0.9);
	transition: opacity 0.2s;
	z-index: 2;

	&.v-enter-from,
	&.v-leave-to {
		opacity: 0;
	}

	@media (min-width: $breakpoint-mobile) {
		display: none;
	}
}

.aside-header {
	display: grid;
	flex-shrink: 0;
	grid-template-columns: 1.5rem 1fr auto;
	align-items: center;
	gap: 0.5rem;
	height: 48px;
	padding-inline: 1rem;
	font-weight: 600;
}

.aside-nav {
	flex-grow: 1;
	overflow: auto;
	padding: 0 5%;
	font-size: 0.9em;

	h2 {
		margin: 2rem 0 1rem 1rem;
		font-size: 1em;
		font-weight: normal;
		color: var(--c-text-2);
	}

	li {
		margin: 0.5em 0;
	}
}

.aside-nav-item {
	display: flex;
	align-items: center;
	gap: 0.5em;
	padding: 0.5em 1em;
	border-radius: 0.5em;
	transition: all 0.2s;

	&:hover, &.router-link-active {
		background-color: var(--c-bg-soft);
		color: var(--c-text);
	}

	&.router-link-active::after {
		content: "⦁";
		width: 1em;
		text-align: center;
		color: var(--c-text-3);
	}

	.iconify {
		font-size: 1.5em;
	}

	.nav-text {
		flex-grow: 1;
	}

	.external-tip {
		opacity: 0.5;
		font-size: 1em;
	}
}

// 父级菜单按钮
.aside-nav-item-parent {
	justify-content: space-between;
	width: 100%;
	text-align: left;
	cursor: pointer;
	font-weight: 500;
	border: 1px solid transparent;

	.nav-text-wrap {
		display: flex;
		align-items: center;
		gap: 0.5em;
		flex-grow: 1;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	&:hover, &.active {
		background-color: var(--c-bg-soft);
		color: var(--c-text);
		border-color: var(--c-primary);
	}

	&.open {
		background-color: var(--c-bg-soft);
		color: var(--c-text);
	}
}

// 子菜单
.aside-subnav {
	margin: 0.2em 0 0 1.2rem;
	padding: 0;
	list-style: none;

	li {
		margin: 0.25em 0;
	}
}

.submenu-item {
	padding-left: 0.5em;
	background: transparent;
	font-size: 0.9em;

	.iconify {
		font-size: 1.1em;
	}
}

.aside-footer {
	display: grid;
	gap: 0.2rem;
	padding: 1rem;
	font-size: 0.8em;
	text-align: center;
	color: var(--c-text-2);

	> .theme-toggle {
		margin-bottom: 0.8rem;
	}
}
</style>
