<script setup lang="ts">
import type { TimetableViewModel, TimetableData } from '~/types/timetable'
import { buildTimetableViewModel, resolveCurrentWeek, parseTimetableData } from '~/utils/timetable'
import timetableData from '~/data/timetable/大三下.json'
// 从 homepage.config.ts 导入个人配置
import homepageConfig from '~~/homepage.config'
import LiveTimetableStatus from '~/components/content/LiveTimetableStatus.vue'

useHead({ title: '' })

definePageMeta({
	alias: ['/'],
	title: '主页',
})

const _appConfig = useAppConfig()

// 解构配置数据
const {
	topInfo,
	personalInfo,
	personality,
	descriptionAndSocial,
	skills,
	projects,
	hobbies,
	selfEvaluation,
} = homepageConfig

// 浮动文字数据（分左右两侧）
const floatTextsLeft = topInfo.floatText.slice(0, 4)
const floatTextsRight = topInfo.floatText.slice(4, 8)

// 个人描述
const description = descriptionAndSocial.description

// 社交链接
const socialLinks = descriptionAndSocial.socialLinks

// 课表数据
const coursesByDay = computed(() => {
	try {
		const parsedData: TimetableData = timetableData as TimetableData
		const currentWeek = resolveCurrentWeek(
			parsedData.settings.startDate,
			parsedData.settings.maxWeek,
		)
		const viewModel = buildTimetableViewModel(parsedData, currentWeek)
		return viewModel.coursesByDay
	}
	catch {
		return {}
	}
})
</script>

<template>
<div class="home-container">
	<!-- 顶部区域 -->
	<section class="top-section">
		<div class="top-content">
			<div class="float-texts float-texts-left">
				<div
					v-for="(text, index) in floatTextsLeft"
					:key="`left-${index}`"
					class="float-text"
					:style="{ animationDelay: `${index * 0.5}s` }"
				>
					{{ text }}
				</div>
			</div>
			<div class="avatar-container">
				<ZhiluAvatar class="avatar" />
			</div>
			<div class="float-texts float-texts-right">
				<div
					v-for="(text, index) in floatTextsRight"
					:key="`right-${index}`"
					class="float-text"
					:style="{ animationDelay: `${(index + 4) * 0.5}s` }"
				>
					{{ text }}
				</div>
			</div>
		</div>
		<h1 class="site-name">
			{{ topInfo.siteName }}
		</h1>
		<p class="motto">
			{{ topInfo.motto }}
		</p>
		<a
			id="card-info-btn"
			href="https://github.com/Kemeow0815/smtp-feed/issues/new?template=subscribe.yml"
			target="_blank"
			rel="noopener noreferrer"
			class="github-subscribe-btn"
		>
			<Icon name="ri:github-fill" />
			<span>Follow Me 🛫</span>
		</a>

		<!-- 课程表状态卡片 -->
		<NuxtLink v-if="Object.keys(coursesByDay).length > 0" to="/timetable" class="timetable-link">
			<LiveTimetableStatus :courses-by-day="coursesByDay" />
		</NuxtLink>
	</section>

	<!-- 信息区域 -->
	<section class="info-section">
		<div class="left-column card">
			<div class="personal-info">
				<h2 class="section-title">
					个人信息
				</h2>
				<div class="info-grid">
					<p><strong>姓名:</strong> {{ personalInfo.name }}</p>
					<p><strong>性别:</strong> {{ personalInfo.gender }}</p>
					<p><strong>地址:</strong> {{ personalInfo.address }}</p>
					<p><strong>学校:</strong> {{ personalInfo.school }}</p>
					<p><strong>年级:</strong> {{ personalInfo.grade }}</p>
					<p><strong>专业:</strong> {{ personalInfo.major }}</p>
					<p><strong>邮箱:</strong> <a :href="`mailto:${personalInfo.email}`">{{ personalInfo.email }}</a></p>
					<p><strong>QQ:</strong> {{ personalInfo.qq }}</p>
					<p><strong>生日:</strong> {{ personalInfo.birthday }}</p>
				</div>
			</div>
		</div>
		<div class="right-column">
			<div class="personality card">
				<div class="personality-info">
					<p class="type">
						{{ personality.type }}
					</p>
					<p class="type-name">
						{{ personality.typeName }}
					</p>
					<p class="personality-desc">
						{{ personality.description }}
					</p>
				</div>
				<div class="personality-icon">
					<img :src="personality.svg" :alt="personality.type" class="personality-svg">
				</div>
			</div>
			<div class="description-and-social card">
				<p class="description">
					{{ description }}
				</p>
				<div class="social-links">
					<a
						v-for="link in socialLinks"
						:key="link.platform"
						:href="link.url"
						target="_blank"
						rel="noopener noreferrer"
						class="social-link"
					>
						<Icon :name="link.icon" />
						<span>{{ link.platform }}</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- 技能与项目区域 -->
	<section class="skills-and-projects">
		<div class="skills card">
			<h2 class="section-title">
				技能
			</h2>
			<div class="skills-content">
				<div class="skill-category">
					<h4>技术</h4>
					<div class="skill-icons">
						<img
							v-for="(icon, index) in skills.technical"
							:key="`tech-${index}`"
							:src="icon"
							alt="技术图标"
							class="skill-icon"
						>
					</div>
				</div>
				<div class="skill-category">
					<h4>通用</h4>
					<div class="skill-icons">
						<img
							v-for="(icon, index) in skills.general"
							:key="`general-${index}`"
							:src="icon"
							alt="通用图标"
							class="skill-icon"
						>
					</div>
				</div>
			</div>
			<p class="learning">
				{{ skills.learning }}
			</p>
		</div>
		<div class="projects card">
			<h2 class="section-title">
				项目
			</h2>
			<div class="projects-grid">
				<a
					v-for="project in projects"
					:key="project.name"
					:href="project.url"
					target="_blank"
					rel="noopener noreferrer"
					class="project"
				>
					<h3>{{ project.name }}</h3>
					<p>{{ project.description }}</p>
				</a>
			</div>
		</div>
	</section>

	<!-- 爱好与评价区域 -->
	<section class="hobbies-and-evaluation">
		<div class="hobbies card">
			<h2 class="section-title">
				爱好
			</h2>
			<ul class="hobbies-list">
				<li v-for="hobby in hobbies" :key="hobby">
					{{ hobby }}
				</li>
			</ul>
		</div>
		<div class="self-evaluation card">
			<h2 class="section-title">
				评价
			</h2>
			<div class="evaluation-content">
				<p><strong>思想:</strong> {{ selfEvaluation.thoughts }}</p>
				<p><strong>工作:</strong> {{ selfEvaluation.work }}</p>
				<p class="summary">
					<strong>总结:</strong> {{ selfEvaluation.summary }}
				</p>
			</div>
		</div>
	</section>

	<!-- 感谢区域 -->
	<section class="thanks-section card">
		<p>
			感谢
			<ZBadge link="https://github.com/KazariEX" text="KazariEX" />
			<ZBadge link="https://github.com/isYangs" text="isYangs" />
			等众多朋友为个人主页提供帮助。
		</p>
		<p>
			主页开源在
			<ZLink to="https://github.com/L33Z22L11/homepage-v5" icon="ri:github-line">L33Z22L11/homepage-v5</ZLink>
			上，欢迎使用、参考样式：
		</p>
		<p class="fork-badges">
			<ZBadge v-for="item in _appConfig.fork" :key="item.link" v-bind="item" />
		</p>
	</section>
</div>
</template>

<style lang="scss" scoped>
// CSS 变量定义
.home-container {
	--card-bg: var(--c-bg-1);
	--card-border: 1px solid var(--c-border);
	--card-radius: 12px;
	--section-gap: 20px;

	max-width: 1000px;
	margin: 0 auto;
	padding: 20px;
}

// 卡片基础样式
.card {
	background-color: var(--card-bg);
	border: var(--card-border);
	border-radius: var(--card-radius);
	padding: 20px;
	transition: transform 0.3s ease, box-shadow 0.3s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px var(--ld-shadow);
	}
}

// 节标题样式
.section-title {
	font-family: 'SimSun', 'Microsoft YaHei', sans-serif;
	font-size: 2rem;
	font-weight: 1000;
	color: transparent;
	-webkit-text-stroke: 1px var(--c-text-2);
	margin-bottom: 1rem;
}

// 顶部区域
.top-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-bottom: 1px solid var(--c-border);
	padding-bottom: 30px;
	margin-bottom: 30px;

	.top-content {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
		gap: 20px;

		.avatar-container {
			background-color: var(--card-bg);
			width: 150px;
			height: 150px;
			border-radius: 50%;
			padding: 10px;
			border: 3px solid var(--c-primary);
			box-shadow: 0 0 20px var(--c-primary-soft);

			:deep(.avatar) {
				width: 100%;
				height: 100%;
				font-size: 120px;

				img {
					width: 100%;
					height: 100%;
					border-radius: 50%;
				}
			}
		}
	}

	.site-name {
		font-size: 1.8rem;
		font-weight: bold;
		margin: 0.5rem 0;
		color: var(--c-text-1);
	}

	.motto {
		font-size: 1rem;
		color: var(--c-text-2);
		font-style: italic;
	}

	.github-subscribe-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
		padding: 0.6rem 1.2rem;
		background-color: var(--c-bg-2);
		border: 1px solid var(--c-border);
		border-radius: 8px;
		color: var(--c-text-1);
		font-size: 0.9rem;
		text-decoration: none;
		transition: all 0.2s ease;

		&:hover {
			background-color: var(--c-primary);
			border-color: var(--c-primary);
			color: var(--c-bg);
			transform: translateY(-2px);
			box-shadow: 0 4px 12px var(--c-primary-soft);
		}

		.iconify {
			font-size: 1.2rem;
		}
	}

	// 课程表状态卡片链接
	.timetable-link {
		display: block;
		margin-top: 1rem;
		text-decoration: none;
		transition: transform 0.2s ease;

		&:hover {
			transform: translateY(-2px);
		}

		:deep(.live-status-card) {
			margin-bottom: 0;
			cursor: pointer;
		}
	}
}

// 浮动文字
.float-texts {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.float-text {
		font-size: 13px;
		font-weight: bold;
		background-color: var(--c-bg-2);
		border-radius: 20px;
		padding: 4px 16px;
		border: var(--card-border);
		width: fit-content;
		animation: floatUpDown 4s ease-in-out infinite;
		color: var(--c-text-2);
	}
}

@keyframes floatUpDown {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-6px);
	}
}

// 信息区域
.info-section {
	display: flex;
	gap: var(--section-gap);
	margin-bottom: var(--section-gap);

	.left-column {
		width: 35%;
		position: relative;

		.section-title {
			position: absolute;
			top: 10px;
			right: 10px;
			writing-mode: vertical-rl;
			text-orientation: upright;
			font-size: 1.5rem;
			margin: 0;
		}

		.info-grid {
			margin-top: 2rem;

			p {
				margin: 0.8rem 0;
				color: var(--c-text-1);

				strong {
					color: var(--c-text-2);
					margin-right: 0.5rem;
				}

				a {
					color: var(--c-primary);
					text-decoration: none;

					&:hover {
						text-decoration: underline;
					}
				}
			}
		}
	}

	.right-column {
		width: 65%;
		display: flex;
		flex-direction: column;
		gap: var(--section-gap);

		.personality {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.personality-info {
				.type {
					font-size: 1.5rem;
					font-weight: bold;
					color: var(--c-primary);
					margin: 0;
				}

				.type-name {
					font-size: 1.2rem;
					font-weight: bold;
					color: var(--c-text-1);
					margin: 0.3rem 0;
				}

				.personality-desc {
					font-size: 0.9rem;
					color: var(--c-text-2);
					margin: 0;
				}
			}

			.personality-icon {
				font-size: 4rem;
				color: var(--c-primary);
				opacity: 0.6;
				transition: transform 0.3s ease;

				.personality-svg {
					width: 100px;
					height: 100px;
					object-fit: contain;
				}

				&:hover {
					transform: rotate(15deg);
				}
			}
		}

		.description-and-social {
			.description {
				color: var(--c-text-1);
				line-height: 1.6;
				margin-bottom: 1rem;
			}

			.social-links {
				display: flex;
				gap: 12px;
				flex-wrap: wrap;

				.social-link {
					display: flex;
					align-items: center;
					gap: 6px;
					padding: 8px 16px;
					background-color: var(--c-bg-2);
					border-radius: 8px;
					color: var(--c-text-1);
					text-decoration: none;
					transition: all 0.2s ease;

					&:hover {
						background-color: var(--c-primary);
						color: var(--c-bg);
					}

					.iconify {
						font-size: 1.2rem;
					}
				}
			}
		}
	}
}

// 技能与项目区域
.skills-and-projects {
	display: flex;
	gap: var(--section-gap);
	margin-bottom: var(--section-gap);

	.skills {
		width: 60%;

		.skills-content {
			margin-top: 1rem;

			.skill-category {
				margin-bottom: 1rem;

				h4 {
					color: var(--c-text-2);
					margin-bottom: 0.5rem;
					font-size: 0.9rem;
				}

				.skill-icons {
					display: flex;
					flex-wrap: wrap;
					gap: 10px;

					.skill-icon {
						width: 50px;
						height: 50px;
						object-fit: cover;
						border-radius: 8px;
						transition: transform 0.2s ease;

						&:hover {
							transform: scale(1.1);
						}
					}
				}

				// 保留 skill-tags 样式作为备选
				.skill-tags {
					display: flex;
					flex-wrap: wrap;
					gap: 8px;

					.skill-tag {
						padding: 4px 12px;
						background-color: var(--c-bg-2);
						border-radius: 6px;
						font-size: 0.85rem;
						color: var(--c-text-1);
						transition: all 0.2s ease;

						&:hover {
							background-color: var(--c-primary-soft);
							color: var(--c-primary);
						}
					}
				}
			}
		}

		.learning {
			margin-top: 1rem;
			color: var(--c-text-2);
			font-style: italic;
			font-size: 0.9rem;
		}
	}

	.projects {
		width: 40%;

		.projects-grid {
			margin-top: 1rem;
			display: flex;
			flex-direction: column;
			gap: 12px;

			.project {
				background-color: var(--c-bg-2);
				border-radius: 8px;
				padding: 12px;
				text-decoration: none;
				transition: all 0.2s ease;

				h3 {
					margin: 0 0 4px 0;
					font-size: 1rem;
					color: var(--c-text-1);
				}

				p {
					margin: 0;
					font-size: 0.85rem;
					color: var(--c-text-2);
				}

				&:hover {
					background-color: var(--c-primary-soft);

					h3 {
						color: var(--c-primary);
					}
				}
			}
		}
	}
}

// 爱好与评价区域
.hobbies-and-evaluation {
	display: flex;
	gap: var(--section-gap);
	margin-bottom: var(--section-gap);

	.hobbies {
		width: 40%;

		.hobbies-list {
			margin-top: 1rem;
			list-style: none;
			display: flex;
			flex-wrap: wrap;
			gap: 10px;

			li {
				padding: 6px 14px;
				background-color: var(--c-bg-2);
				border-radius: 20px;
				font-size: 0.9rem;
				color: var(--c-text-1);
				transition: all 0.2s ease;

				&:hover {
					background-color: var(--c-primary-soft);
					color: var(--c-primary);
				}
			}
		}
	}

	.self-evaluation {
		width: 60%;

		.evaluation-content {
			margin-top: 1rem;

			p {
				margin: 0.8rem 0;
				color: var(--c-text-1);
				line-height: 1.5;

				strong {
					color: var(--c-text-2);
					margin-right: 0.5rem;
				}

				&.summary {
					margin-top: 1rem;
					padding-top: 1rem;
					border-top: 1px solid var(--c-border);
					color: var(--c-primary);
					font-weight: 500;
				}
			}
		}
	}
}

// 感谢区域
.thanks-section {
	text-align: center;

	p {
		margin: 0.5rem 0;
		color: var(--c-text-1);
	}

	.fork-badges {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-top: 1rem;
	}
}

// ==================== 响应式设计 ====================

// 平板端 (768px - 1024px)
@media (max-width: 1024px) {
	.home-container {
		padding: 15px;
	}

	.info-section {
		.left-column {
			width: 40%;
		}

		.right-column {
			width: 60%;
		}
	}
}

// 平板端 (600px - 768px)
@media (max-width: 768px) {
	.top-section {
		.top-content {
			.float-texts {
				display: none;
			}
		}
	}

	.info-section {
		flex-direction: column;

		.left-column {
			width: 100%;

			.section-title {
				position: static;
				writing-mode: horizontal-tb;
				text-orientation: mixed;
			}

			.info-grid {
				margin-top: 1rem;
			}
		}

		.right-column {
			width: 100%;
		}
	}

	.skills-and-projects {
		flex-direction: column;

		.skills,
		.projects {
			width: 100%;
		}
	}

	.hobbies-and-evaluation {
		flex-direction: column;

		.hobbies,
		.self-evaluation {
			width: 100%;
		}
	}
}

// 移动端 (< 600px)
@media (max-width: 600px) {
	.home-container {
		padding: 10px;
	}

	.card {
		padding: 15px;
	}

	.top-section {
		padding-bottom: 20px;
		margin-bottom: 20px;

		.top-content {
			.avatar-container {
				width: 120px;
				height: 120px;

				:deep(.avatar) {
					font-size: 100px;
				}
			}
		}

		.site-name {
			font-size: 1.5rem;
		}

		.motto {
			font-size: 0.9rem;
		}
	}

	.section-title {
		font-size: 1.5rem;
	}

	.info-section {
		.right-column {
			.personality {
				.personality-icon {
					font-size: 3rem;
				}
			}

			.description-and-social {
				.social-links {
					.social-link {
						padding: 6px 12px;
						font-size: 0.9rem;
					}
				}
			}
		}
	}

	.skills-and-projects {
		.skills {
			.skill-category {
				.skill-icons {
					.skill-icon {
						width: 40px;
						height: 40px;
					}
				}

				.skill-tags {
					.skill-tag {
						font-size: 0.8rem;
						padding: 3px 10px;
					}
				}
			}
		}
	}
}

// 小屏移动端 (< 480px)
@media (max-width: 480px) {
	.top-section {
		.top-content {
			.avatar-container {
				width: 100px;
				height: 100px;

				:deep(.avatar) {
					font-size: 80px;
				}
			}
		}
	}

	.section-title {
		font-size: 1.3rem;
	}

	.info-section {
		.right-column {
			.personality {
				flex-direction: column;
				text-align: center;
				gap: 1rem;

				.personality-icon {
					font-size: 2.5rem;
				}
			}
		}
	}
}
</style>
