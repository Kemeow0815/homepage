<script setup lang="ts">
useHead({
	title: '安全跳转',
	meta: [
		{ name: 'robots', content: 'noindex, nofollow' },
	],
})

definePageMeta({
	layout: false,
})

const route = useRoute()

// 获取目标 URL
const targetUrl = computed(() => {
	const encoded = route.query.u as string
	if (!encoded)
		return ''

	try {
		// 尝试 Base64 解码
		const decoded = atob(encoded)
		// 验证解码结果是否是有效的 URL
		if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
			return decoded
		}
		return encoded
	}
	catch {
		// 如果不是 Base64，直接返回
		return encoded
	}
})

// 解析域名
const targetDomain = computed(() => {
	if (!targetUrl.value)
		return ''
	try {
		const url = new URL(targetUrl.value)
		return url.hostname
	}
	catch {
		return targetUrl.value
	}
})

// 倒计时
const countdown = ref(5)
const isPaused = ref(false)
let timer: NodeJS.Timeout | null = null

// 开始倒计时
function startCountdown() {
	if (timer)
		clearInterval(timer)

	timer = setInterval(() => {
		if (!isPaused.value && countdown.value > 0) {
			countdown.value--
		}

		if (countdown.value <= 0) {
			clearInterval(timer!)
			goToTarget()
		}
	}, 1000)
}

// 跳转到目标
function goToTarget() {
	if (targetUrl.value) {
		window.location.href = targetUrl.value
	}
}

// 暂停/继续倒计时
function togglePause() {
	isPaused.value = !isPaused.value
}

// 返回上一页
function goBack() {
	// 使用 history.back() 避免 Vue Router 的过渡问题
	if (window.history.length > 1) {
		window.history.back()
	}
	else {
		// 如果没有历史记录，跳转到首页
		navigateTo('/')
	}
}

onMounted(() => {
	if (targetUrl.value) {
		startCountdown()
	}
})

onUnmounted(() => {
	if (timer)
		clearInterval(timer)
})
</script>

<template>
<div class="go-page">
	<div class="go-container">
		<!-- 头部 -->
		<div class="go-header">
			<div class="avatar">
				<Icon name="ri:shield-check-fill" />
			</div>
			<h1 class="title">
				安全跳转
			</h1>
			<p class="subtitle">
				即将离开本站，请注意账号财产安全
			</p>
		</div>

		<!-- 目标链接信息 -->
		<div class="target-info">
			<div class="info-label">
				目标链接
			</div>
			<div class="url-display">
				<Icon name="ri:external-link-line" class="url-icon" />
				<span class="domain">{{ targetDomain || '未知域名' }}</span>
			</div>
			<div class="full-url" :title="targetUrl">
				{{ targetUrl }}
			</div>
		</div>

		<!-- 安全提示 -->
		<div class="security-tips">
			<div class="tip-item">
				<Icon name="ri:alert-line" class="tip-icon warning" />
				<span>请确认链接是否可信，谨防钓鱼网站</span>
			</div>
			<div class="tip-item">
				<Icon name="ri:lock-line" class="tip-icon info" />
				<span>注意保护个人隐私和账号安全</span>
			</div>
		</div>

		<!-- 倒计时和操作按钮 -->
		<div class="action-section">
			<div class="countdown-display">
				<div class="countdown-number" :class="{ paused: isPaused }">
					{{ countdown }}
				</div>
				<span class="countdown-text">秒后自动跳转</span>
			</div>

			<div class="action-buttons">
				<button class="btn btn-secondary" @click="goBack">
					<Icon name="ri:arrow-left-line" />
					返回
				</button>
				<button class="btn btn-secondary" @click="togglePause">
					<Icon :name="isPaused ? 'ri:play-line' : 'ri:pause-line'" />
					{{ isPaused ? '继续' : '暂停' }}
				</button>
				<button class="btn btn-primary" @click="goToTarget">
					<Icon name="ri:external-link-line" />
					立即跳转
				</button>
			</div>
		</div>

		<!-- 页脚 -->
		<div class="go-footer">
			<p>此页面用于保护您的浏览安全</p>
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.go-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--c-bg-2) 0%, var(--c-bg-1) 100%);
}

.go-container {
  width: 100%;
  max-width: 560px;
  padding: 2.5rem;
  background-color: var(--c-bg-1);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

// 头部
.go-header {
  text-align: center;
  margin-bottom: 2rem;

  .avatar {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--c-primary-soft) 0%, var(--c-primary) 100%);
    border-radius: 50%;

    :deep(.iconify) {
      width: 32px;
      height: 32px;
      color: white;
    }
  }

  .title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--c-text-1);
    margin: 0 0 0.5rem;
  }

  .subtitle {
    font-size: 0.9rem;
    color: var(--c-text-3);
    margin: 0;
  }
}

// 目标链接信息
.target-info {
  padding: 1.25rem;
  background-color: var(--c-bg-2);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  margin-bottom: 1.5rem;

  .info-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--c-text-3);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }

  .url-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;

    .url-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--c-primary);
    }

    .domain {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--c-text-1);
      word-break: break-all;
    }
  }

  .full-url {
    font-size: 0.85rem;
    color: var(--c-text-3);
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

// 安全提示
.security-tips {
  margin-bottom: 1.5rem;

  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: var(--c-bg-soft);
    border-radius: 8px;
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }

    .tip-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;

      &.warning {
        color: #f59e0b;
      }

      &.info {
        color: var(--c-primary);
      }
    }

    span {
      font-size: 0.9rem;
      color: var(--c-text-2);
      line-height: 1.5;
    }
  }
}

// 倒计时和操作区
.action-section {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--c-primary-soft) 0%, var(--c-bg-2) 100%);
  border-radius: 12px;
  margin-bottom: 1.5rem;

  .countdown-display {
    margin-bottom: 1.25rem;

    .countdown-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--c-primary);
      background-color: var(--c-bg-1);
      border-radius: 50%;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;

      &.paused {
        opacity: 0.5;
      }
    }

    .countdown-text {
      display: block;
      font-size: 0.9rem;
      color: var(--c-text-2);
    }
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;

    .btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.625rem 1rem;
      font-size: 0.9rem;
      font-weight: 500;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      :deep(.iconify) {
        width: 1rem;
        height: 1rem;
      }

      &.btn-primary {
        background-color: var(--c-primary);
        color: white;

        &:hover {
          background-color: var(--c-primary-deep);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--c-primary-soft);
        }
      }

      &.btn-secondary {
        background-color: var(--c-bg-1);
        color: var(--c-text-2);
        border: 1px solid var(--c-border);

        &:hover {
          background-color: var(--c-bg-soft);
          border-color: var(--c-primary);
          color: var(--c-primary);
        }
      }
    }
  }
}

// 页脚
.go-footer {
  text-align: center;

  p {
    font-size: 0.8rem;
    color: var(--c-text-3);
    margin: 0;
  }
}

// 响应式
@media (max-width: 480px) {
  .go-container {
    padding: 1.5rem;
  }

  .go-header {
    .title {
      font-size: 1.25rem;
    }
  }

  .action-buttons {
    .btn {
      flex: 1;
      justify-content: center;
    }
  }
}
</style>
