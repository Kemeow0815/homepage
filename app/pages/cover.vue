<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

useHead({
  title: '封面生成',
})

definePageMeta({
  headerText: '封面生成',
})

// 基础状态
const leftText = ref('鸣潮')
const rightText = ref('牛逼')
const iconName = ref('arcticons:wuthering-waves')
const fontSize = ref(64)
const iconSize = ref(64)
const gap = ref(20)
const showIcon = ref(true)

// 字体状态
const customFont = ref<string | null>(null)
const customFontName = ref('')
const fontWeight = ref(400)
const localFonts = ref<{
  family: string
  fullName: string
  postscriptName: string
  style: string
}[]>([])
const localFontSearchQuery = ref('')
const isLoadingLocalFonts = ref(false)
const localFontError = ref('')

// 颜色状态
const color = ref('#000000')
const bgColor = ref('#ffffff')
const bgColorOpacity = ref(1)
const iconColor = ref('#000000')
const useOriginalIconColor = ref(true)

// 阴影状态
const textShadow = ref({ x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 })
const iconShadow = ref({ x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 })
const shadowTarget = ref<'both' | 'text' | 'icon'>('both')

// 图标背景状态
const iconBgEnabled = ref(false)
const iconBgRadius = ref(20)
const iconRadius = ref(0)
const iconBgColor = ref('#000000')
const iconBgOpacity = ref(0.2)
const iconBgBlur = ref(0)
const iconBgPadding = ref(10)

// 图标搜索
const searchQuery = ref('')
const searchResults = ref<string[]>([])
const isSearching = ref(false)
let searchDebounce: ReturnType<typeof setTimeout> | null = null

// 比例
const ratios = ref([
  { label: '1:1', w: 1, h: 1, checked: false },
  { label: '4:3', w: 4, h: 3, checked: false },
  { label: '16:9', w: 16, h: 9, checked: true },
  { label: '21:9', w: 21, h: 9, checked: false },
])

// 联动缩放
const linkScale = ref(true)
const lastFontSize = ref(64)
const lastIconSize = ref(64)

// SVG 和图标
const iconSvg = ref('')
const localIcon = ref<string | null>(null)
const svgContainer = ref<SVGSVGElement | null>(null)

// 背景图片状态
const bgImage = ref<string | null>(null)
const bgImageX = ref(0)
const bgImageY = ref(0)
const bgImageScale = ref(1)
const bgBlur = ref(0)
const bgOpacity = ref(1)
const isBgDragOver = ref(false)
const isDragging = ref(false)
let dragStartX = 0
let dragStartY = 0
let initialImageX = 0
let initialImageY = 0
let initialPinchDistance = 0
let initialScale = 1

// 导出配置
const exportConfig = ref({
  format: 'png' as 'png' | 'svg',
  scales: [1] as number[],
  filename: 'cover',
  transparentBg: false,
  exportRatios: [] as string[],
})

// 颜色联动
const linkColor = ref(true)

// 触摸状态
const activePointers = ref(new Map<number, { x: number; y: number }>())

// 计算画布尺寸
const BASE_HEIGHT = 900

const activeRatios = computed(() => ratios.value.filter(r => r.checked))
const visualRatios = computed(() => activeRatios.value.length > 0 ? activeRatios.value : [ratios.value[2]])
const maxWidthRatio = computed(() => visualRatios.value.reduce((max, r) => (r.w / r.h > max ? r.w / r.h : max), 0))
const canvasWidth = computed(() => Math.round(BASE_HEIGHT * maxWidthRatio.value))
const canvasHeight = computed(() => BASE_HEIGHT)

// 过滤后的本地字体
const filteredLocalFonts = computed(() => {
  if (!localFontSearchQuery.value) return localFonts.value
  const query = localFontSearchQuery.value.toLowerCase()
  return localFonts.value.filter(
    f => f.family.toLowerCase().includes(query) || f.fullName.toLowerCase().includes(query)
  )
})

// 初始化
onMounted(() => {
  bgColor.value = '#ffffff'
  color.value = '#000000'
  iconColor.value = '#000000'
  textShadow.value = { x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 }
  iconShadow.value = { x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 }
})

// 获取图标 SVG
watch(iconName, async (newName) => {
  if (!newName?.includes(':')) {
    iconSvg.value = ''
    return
  }
  const [prefix, name] = newName.split(':')
  try {
    const res = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`)
    if (!res.ok) throw new Error('Icon not found')
    let svg = await res.text()
    svg = svg.replace(/width="[^"]*"/g, '').replace(/height="[^"]*"/g, '')
    svg = svg.replace(/<svg\b([^>]*)>/, '<svg$1 width="100%" height="100%" preserveAspectRatio="none">')
    if (!useOriginalIconColor.value) {
      svg = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"')
    }
    iconSvg.value = svg
  } catch {
    iconSvg.value = ''
  }
}, { immediate: true })

watch(useOriginalIconColor, async (newVal) => {
  if (iconName.value?.includes(':')) {
    const [prefix, name] = iconName.value.split(':')
    try {
      const res = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`)
      if (!res.ok) throw new Error('Icon not found')
      let svg = await res.text()
      svg = svg.replace(/width="[^"]*"/g, '').replace(/height="[^"]*"/g, '')
      svg = svg.replace(/<svg\b([^>]*)>/, '<svg$1 width="100%" height="100%" preserveAspectRatio="none">')
      if (!newVal) {
        svg = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"')
      }
      iconSvg.value = svg
    } catch {
      iconSvg.value = ''
    }
  }
})

// 辅助函数：hex 转 rgba
function hexToRgba(hex: string, alpha: number) {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 阴影更新
function updateShadow(key: string, value: string | number) {
  if (shadowTarget.value === 'both' || shadowTarget.value === 'text') {
    textShadow.value = { ...textShadow.value, [key]: value }
  }
  if (shadowTarget.value === 'both' || shadowTarget.value === 'icon') {
    iconShadow.value = { ...iconShadow.value, [key]: value }
  }
}

// 颜色处理
function handleColorChange(newColor: string, type: 'text' | 'icon') {
  if (type === 'text') {
    color.value = newColor
    if (linkColor.value) iconColor.value = newColor
  } else {
    iconColor.value = newColor
    if (linkColor.value) color.value = newColor
  }
}

// 字体大小变化
function handleFontSizeChange(e: Event) {
  const newVal = (e.target as HTMLInputElement).valueAsNumber
  if (linkScale.value) {
    const ratio = newVal / lastFontSize.value
    iconSize.value = Math.round(iconSize.value * ratio)
    lastIconSize.value = iconSize.value
  }
  fontSize.value = newVal
  lastFontSize.value = newVal
}

// 图标大小变化
function handleIconSizeChange(e: Event) {
  const newVal = (e.target as HTMLInputElement).valueAsNumber
  if (linkScale.value) {
    const ratio = newVal / lastIconSize.value
    fontSize.value = Math.round(fontSize.value * ratio)
    lastFontSize.value = fontSize.value
  }
  iconSize.value = newVal
  lastIconSize.value = newVal
}

// 背景图片上传
function handleBgImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadBgImageFile(file)
}

function loadBgImageFile(file: File) {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    bgImage.value = e.target?.result as string
    bgImageX.value = 0
    bgImageY.value = 0
    bgImageScale.value = 1
    bgBlur.value = 0
    bgOpacity.value = 1
  }
  reader.readAsDataURL(file)
}

function handleBgDragOver(e: DragEvent) {
  e.preventDefault()
  isBgDragOver.value = true
}

function handleBgDragLeave(e: DragEvent) {
  e.preventDefault()
  isBgDragOver.value = false
}

function handleBgDrop(e: DragEvent) {
  e.preventDefault()
  isBgDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) loadBgImageFile(file)
}

// 字体上传
function handleFontUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const fontData = e.target?.result as ArrayBuffer
      customFontName.value = file.name.replace(/\.[^/.]+$/, '')
      const fontFace = new FontFace(customFontName.value, fontData)
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace)
      })
    }
    reader.readAsArrayBuffer(file)
  }
}

// 加载本地字体
async function loadLocalFonts() {
  if (!('queryLocalFonts' in window)) {
    localFontError.value = '仅支持 PC端新版Chrome/Edge等Chromium内核的浏览器'
    return
  }
  isLoadingLocalFonts.value = true
  localFontError.value = ''
  try {
    const fonts = await (window as any).queryLocalFonts()
    localFonts.value = fonts.map((f: any) => ({
      family: f.family,
      fullName: f.fullName,
      postscriptName: f.postscriptName,
      style: f.style,
    }))
  } catch (e: any) {
    if (e.name === 'NotAllowedError') {
      localFontError.value = '您拒绝了字体访问权限'
    } else {
      localFontError.value = `加载本地字体失败: ${e.message}`
    }
  } finally {
    isLoadingLocalFonts.value = false
  }
}

function selectLocalFont(font: { family: string; fullName: string; postscriptName: string; style: string }) {
  customFontName.value = font.family
  customFont.value = null
  localFonts.value = []
  localFontSearchQuery.value = ''
}

// 指针事件处理
function handlePointerDown(e: PointerEvent) {
  if (!bgImage.value) return
  e.preventDefault()
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  activePointers.value.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (activePointers.value.size === 1) {
    isDragging.value = true
    dragStartX = e.clientX
    dragStartY = e.clientY
    initialImageX = bgImageX.value
    initialImageY = bgImageY.value
  } else if (activePointers.value.size === 2) {
    isDragging.value = false
    const points = Array.from(activePointers.value.values())
    initialPinchDistance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
    initialScale = bgImageScale.value
  }
}

function handlePointerMove(e: PointerEvent) {
  if (!bgImage.value || !activePointers.value.has(e.pointerId)) return
  e.preventDefault()
  activePointers.value.set(e.pointerId, { x: e.clientX, y: e.clientY })

  if (activePointers.value.size === 2) {
    const points = Array.from(activePointers.value.values())
    const currentDistance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
    if (initialPinchDistance > 0) {
      const scaleFactor = currentDistance / initialPinchDistance
      bgImageScale.value = Math.max(0.1, Math.min(initialScale * scaleFactor, 10))
    }
  } else if (activePointers.value.size === 1 && isDragging.value) {
    const deltaX = e.clientX - dragStartX
    const deltaY = e.clientY - dragStartY
    bgImageX.value = initialImageX + deltaX / bgImageScale.value
    bgImageY.value = initialImageY + deltaY / bgImageScale.value
  }
}

function handlePointerUp(e: PointerEvent) {
  activePointers.value.delete(e.pointerId)
  ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
  if (activePointers.value.size < 2) {
    initialPinchDistance = 0
  }
  if (activePointers.value.size === 0) {
    isDragging.value = false
  }
}

function handleWheel(e: WheelEvent) {
  if (!bgImage.value) return
  e.preventDefault()
  const scaleFactor = 1.1
  if (e.deltaY < 0) {
    bgImageScale.value = Math.min(bgImageScale.value * scaleFactor, 10)
  } else {
    bgImageScale.value = Math.max(bgImageScale.value / scaleFactor, 0.1)
  }
}

// 图标搜索
async function handleSearch() {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  isSearching.value = true
  try {
    const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(searchQuery.value)}&limit=20`)
    const data = await res.json()
    searchResults.value = data.icons || []
  } catch {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function onSearchInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  searchQuery.value = val
  if (searchDebounce) clearTimeout(searchDebounce)
  if (val.trim()) {
    searchDebounce = setTimeout(() => {
      handleSearch()
    }, 500)
  } else {
    searchResults.value = []
  }
}

// 本地图标上传
function handleLocalIconUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      localIcon.value = e.target?.result as string
      iconName.value = '本地图片'
      iconSvg.value = ''
    }
    reader.readAsDataURL(file)
  }
}

function selectIcon(icon: string) {
  iconName.value = icon
  localIcon.value = null
}

// 导出功能
async function doExport() {
  if (!svgContainer.value) return

  const guides = svgContainer.value.querySelectorAll('.ratio-guide')
  guides.forEach(g => ((g as SVGElement).style.display = 'none'))
  const border = svgContainer.value.querySelector('.canvas-border')
  if (border) (border as SVGElement).style.display = 'none'

  const svgClone = svgContainer.value.cloneNode(true) as SVGSVGElement

  const defs = svgClone.querySelector('defs')
  if (defs) {
    const pattern = defs.querySelector('#checkerboard')
    if (pattern) pattern.remove()
  }

  const fo = svgClone.querySelector('foreignObject')
  if (fo) {
    fo.setAttribute('width', canvasWidth.value.toString())
    fo.setAttribute('height', canvasHeight.value.toString())
    // 确保 foreignObject 内部的 div 宽度高度也是绝对值
    const innerDiv = fo.querySelector('div')
    if (innerDiv) {
      innerDiv.setAttribute('style', innerDiv.getAttribute('style')?.replace(/width:\s*100%/, `width: ${canvasWidth.value}px`)?.replace(/height:\s*100%/, `height: ${canvasHeight.value}px`) || '')
    }
  }

  const bgImg = svgClone.querySelector('image')
  if (bgImg) {
    bgImg.setAttribute('width', canvasWidth.value.toString())
    bgImg.setAttribute('height', canvasHeight.value.toString())
    bgImg.style.filter = `blur(${bgBlur.value}px)`
    bgImg.style.opacity = bgOpacity.value.toString()
  }

  const bgRects = svgClone.querySelectorAll('rect')
  const checkerboardRect = bgRects[0]
  if (checkerboardRect) checkerboardRect.remove()

  const solidBgRect = bgRects[1]
  if (solidBgRect) {
    solidBgRect.setAttribute('width', canvasWidth.value.toString())
    solidBgRect.setAttribute('height', canvasHeight.value.toString())
    if (exportConfig.value.transparentBg) {
      solidBgRect.setAttribute('fill', 'none')
    } else {
      solidBgRect.setAttribute('fill', hexToRgba(bgColor.value, bgColorOpacity.value))
    }
  }

  const ratiosToExport = exportConfig.value.exportRatios.length > 0
    ? ratios.value.filter(r => exportConfig.value.exportRatios.includes(r.label))
    : activeRatios.value

  for (const ratio of ratiosToExport) {
    const ratioWidth = Math.round(BASE_HEIGHT * (ratio.w / ratio.h))
    const ratioHeight = BASE_HEIGHT
    const xOffset = (canvasWidth.value - ratioWidth) / 2

    const ratioSvgClone = svgClone.cloneNode(true) as SVGSVGElement
    ratioSvgClone.setAttribute('width', ratioWidth.toString())
    ratioSvgClone.setAttribute('height', ratioHeight.toString())
    ratioSvgClone.setAttribute('viewBox', `${xOffset} 0 ${ratioWidth} ${ratioHeight}`)

    const svgData = new XMLSerializer().serializeToString(ratioSvgClone)
    const ratioFilename = activeRatios.value.length > 1
      ? `${exportConfig.value.filename}-${ratio.label.replace(':', '-')}`
      : exportConfig.value.filename

    if (exportConfig.value.format === 'svg') {
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      downloadLink(url, `${ratioFilename}.svg`)
    } else {
      const img = new Image()
      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
      })

      const scales = exportConfig.value.scales.length > 0 ? exportConfig.value.scales : [1]
      for (const scale of scales) {
        const canvas = document.createElement('canvas')
        canvas.width = ratioWidth * scale
        canvas.height = ratioHeight * scale
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const suffix = scales.length > 1 ? `@${scale}x` : ''
        downloadLink(canvas.toDataURL('image/png'), `${ratioFilename}${suffix}.png`)
      }
    }
  }

  guides.forEach(g => ((g as SVGElement).style.display = ''))
  if (border) (border as SVGElement).style.display = ''
}

function downloadLink(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="cover-page">
    <div class="cover-container">
      <!-- Preview Area -->
      <div
        class="preview-area"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
        @pointerleave="handlePointerUp"
      >
        <svg
          ref="svgContainer"
          :width="canvasWidth"
          :height="canvasHeight"
          :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
          xmlns="http://www.w3.org/2000/svg"
          class="preview-svg"
          :style="{ cursor: bgImage ? (isDragging ? 'grabbing' : 'grab') : 'default' }"
          @wheel="handleWheel"
        >
          <defs>
            <pattern id="checkerboard" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#e0e0e0" />
              <rect x="10" y="0" width="10" height="10" fill="#ffffff" />
              <rect x="0" y="10" width="10" height="10" fill="#ffffff" />
              <rect x="10" y="10" width="10" height="10" fill="#e0e0e0" />
            </pattern>
          </defs>

          <!-- Background -->
          <rect width="100%" height="100%" fill="url(#checkerboard)" />
          <rect width="100%" height="100%" :fill="hexToRgba(bgColor, bgColorOpacity)" />

          <image
            v-if="bgImage"
            :href="bgImage"
            :x="bgImageX"
            :y="bgImageY"
            :width="canvasWidth"
            :height="canvasHeight"
            :transform="`scale(${bgImageScale})`"
            style="transform-origin: 50% 50%;"
            :style="{ filter: `blur(${bgBlur}px)`, opacity: bgOpacity }"
            preserveAspectRatio="xMidYMid meet"
          />

          <!-- Content -->
          <foreignObject x="0" y="0" width="100%" height="100%" style="pointer-events: none;">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              :style="{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `${gap}px`,
                fontFamily: customFontName || 'sans-serif',
                fontWeight: fontWeight,
                lineHeight: 1,
              }"
            >
              <span
                :style="{
                  fontSize: `${fontSize}px`,
                  color: color,
                  textShadow: `${textShadow.x}px ${textShadow.y}px ${textShadow.blur}px ${hexToRgba(textShadow.color, textShadow.alpha)}`,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }"
              >{{ leftText }}</span>

              <div
                v-if="showIcon && (iconSvg || localIcon)"
                :style="{
                  width: `${iconSize + iconBgPadding * 2}px`,
                  height: `${iconSize + iconBgPadding * 2}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: iconBgEnabled ? hexToRgba(iconBgColor, iconBgOpacity) : 'transparent',
                  backdropFilter: iconBgEnabled && iconBgBlur > 0 ? `blur(${iconBgBlur}px)` : 'none',
                  borderRadius: iconBgEnabled ? `${iconBgRadius}%` : '0',
                  flexShrink: 0,
                }"
              >
                <div
                  :style="{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    aspectRatio: '1 / 1',
                    flexShrink: 0,
                    color: useOriginalIconColor ? 'inherit' : iconColor,
                    filter: `drop-shadow(${iconShadow.x}px ${iconShadow.y}px ${iconShadow.blur}px ${hexToRgba(iconShadow.color, iconShadow.alpha)})`,
                    borderRadius: `${iconRadius}%`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }"
                >
                  <img
                    v-if="localIcon"
                    :src="localIcon"
                    :style="{ width: '100%', height: '100%', objectFit: 'contain' }"
                    alt="Local Icon"
                  />
                  <div
                    v-else
                    :style="{ width: '100%', height: '100%', aspectRatio: '1 / 1' }"
                    v-html="iconSvg"
                  />
                </div>
              </div>

              <span
                :style="{
                  fontSize: `${fontSize}px`,
                  color: color,
                  textShadow: `${textShadow.x}px ${textShadow.y}px ${textShadow.blur}px ${hexToRgba(textShadow.color, textShadow.alpha)}`,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }"
              >{{ rightText }}</span>
            </div>
          </foreignObject>

          <!-- Canvas Border -->
          <rect
            x="0"
            y="0"
            :width="canvasWidth"
            :height="canvasHeight"
            fill="none"
            stroke="rgba(255, 0, 0, 0.8)"
            stroke-width="2"
            class="canvas-border"
          />

          <!-- Ratio Guides -->
          <g v-for="ratio in visualRatios" :key="ratio.label" class="ratio-guide">
            <g v-if="(BASE_HEIGHT * (ratio.w / ratio.h)) < canvasWidth">
              <rect
                :x="(canvasWidth - (BASE_HEIGHT * (ratio.w / ratio.h))) / 2"
                y="0"
                :width="BASE_HEIGHT * (ratio.w / ratio.h)"
                :height="BASE_HEIGHT"
                fill="none"
                stroke="rgba(255, 0, 0, 0.5)"
                stroke-width="2"
                stroke-dasharray="10 5"
              />
              <text
                :x="(canvasWidth - (BASE_HEIGHT * (ratio.w / ratio.h))) / 2 + 10"
                y="30"
                fill="rgba(255, 0, 0, 0.5)"
                font-size="20"
              >{{ ratio.label }}</text>
            </g>
          </g>
        </svg>
      </div>

      <!-- Controls -->
      <div class="controls-grid">
        <!-- Left Column: Content -->
        <div class="control-column">
          <h3 class="column-title">
            <Icon name="material-symbols:edit-outline" class="icon" />
            内容设置
          </h3>

          <div class="control-group">
            <div class="form-item">
              <label class="form-label">背景图片</label>
              <div class="upload-wrapper">
                <input type="file" accept="image/*" class="hidden" id="bg-upload" @change="handleBgImageUpload">
                <label
                  for="bg-upload"
                  class="upload-area"
                  :class="{ dragover: isBgDragOver }"
                  @dragover="handleBgDragOver"
                  @dragleave="handleBgDragLeave"
                  @drop="handleBgDrop"
                >
                  <div class="upload-content">
                    <Icon name="material-symbols:upload-file" class="upload-icon" />
                    <span class="upload-text">{{ isBgDragOver ? '松开鼠标上传' : (bgImage ? '点击或拖拽更换图片' : '点击或拖拽上传背景图') }}</span>
                  </div>
                </label>
                <button
                  v-if="bgImage"
                  class="remove-btn"
                  @click="bgImage = null; bgImageScale = 1; bgImageX = 0; bgImageY = 0"
                >
                  <Icon name="material-symbols:close" class="icon-small" />
                </button>
                <template v-if="bgImage">
                  <div class="slider-group" @click.stop>
                    <div class="slider-label">
                      <label>模糊程度</label>
                      <span>{{ bgBlur }}px</span>
                    </div>
                    <input v-model.number="bgBlur" type="range" min="0" max="20" class="square-range">
                  </div>
                  <div class="slider-group" @click.stop>
                    <div class="slider-label">
                      <label>不透明度</label>
                      <span>{{ Math.round(bgOpacity * 100) }}%</span>
                    </div>
                    <input v-model.number="bgOpacity" type="range" min="0" max="1" step="0.01" class="square-range">
                  </div>
                  <p class="hint-text">提示: 拖拽移动位置，滚轮缩放大小</p>
                </template>
              </div>
            </div>

            <div class="form-item">
              <label class="form-label">左侧文字</label>
              <input v-model="leftText" type="text" class="input-field">
            </div>

            <div class="form-item">
              <label class="form-label">右侧文字</label>
              <input v-model="rightText" type="text" class="input-field">
            </div>

            <div class="form-item">
              <label class="form-label">自定义字体</label>
              <div class="upload-wrapper">
                <input type="file" accept=".ttf,.otf,.woff,.woff2" class="hidden" id="font-upload" @change="handleFontUpload">
                <label for="font-upload" class="upload-area">
                  <div class="upload-content">
                    <Icon name="material-symbols:font-download" class="upload-icon" />
                    <span class="upload-text">{{ customFontName || '点击上传字体' }}</span>
                  </div>
                </label>
                <button
                  v-if="customFontName"
                  class="remove-btn"
                  @click="customFont = null; customFontName = ''"
                >
                  <Icon name="material-symbols:close" class="icon-small" />
                </button>
              </div>
              <div class="button-group">
                <button class="action-btn" :disabled="isLoadingLocalFonts" @click="loadLocalFonts">
                  <Icon v-if="isLoadingLocalFonts" name="line-md:loading-twotone-loop" class="icon" />
                  <Icon v-else name="material-symbols:computer" class="icon" />
                  <span>读取本地字体</span>
                </button>
              </div>
              <p v-if="localFontError" class="error-text">{{ localFontError }}</p>
              <div v-if="localFonts.length > 0" class="font-list">
                <input v-model="localFontSearchQuery" type="text" placeholder="搜索字体..." class="input-field small">
                <div class="font-items">
                  <button
                    v-for="font in filteredLocalFonts"
                    :key="font.postscriptName"
                    class="font-item"
                    :style="{ fontFamily: font.family }"
                    @click="selectLocalFont(font)"
                  >
                    <span class="font-family">{{ font.family }}</span>
                    <span class="font-style">{{ font.style }}</span>
                  </button>
                </div>
                <button class="close-btn" @click="localFonts = []; localFontSearchQuery = ''">关闭</button>
              </div>
            </div>

            <div class="form-item">
              <div class="slider-label">
                <label class="form-label">字体粗细</label>
                <span class="mono">{{ fontWeight }}</span>
              </div>
              <input v-model.number="fontWeight" type="range" min="100" max="900" step="100" class="square-range">
            </div>

            <div class="form-item">
              <div class="checkbox-header">
                <label class="form-label">图标设置</label>
                <label class="checkbox-label">
                  <input v-model="showIcon" type="checkbox">
                  <span>显示图标</span>
                </label>
              </div>
              <div class="icon-grid" :class="{ disabled: !showIcon }">
                <div class="upload-wrapper">
                  <input type="file" accept="image/*" class="hidden" id="icon-upload" @change="handleLocalIconUpload">
                  <label for="icon-upload" class="upload-area small">
                    <div class="upload-content">
                      <Icon name="material-symbols:image-outline" class="upload-icon" />
                      <span class="upload-text">{{ localIcon ? '更换图片' : '上传图标' }}</span>
                    </div>
                  </label>
                  <button
                    v-if="localIcon"
                    class="remove-btn small"
                    @click="localIcon = null; iconName = ''"
                  >
                    <Icon name="material-symbols:close" class="icon-small" />
                  </button>
                </div>
                <div class="search-wrapper">
                  <input :value="searchQuery" type="text" placeholder="搜索库..." class="input-field" @input="onSearchInput">
                  <Icon v-if="isSearching" name="line-md:loading-twotone-loop" class="loading-icon" />
                </div>
              </div>
              <div v-if="searchResults.length > 0" class="icon-results">
                <button
                  v-for="icon in searchResults"
                  :key="icon"
                  class="icon-item"
                  :class="{ selected: icon === iconName }"
                  @click="selectIcon(icon)"
                >
                  <div class="icon-box" :class="{ selected: icon === iconName }">
                    <img :src="`https://api.iconify.design/${icon.split(':')[0]}/${icon.split(':')[1]}.svg`" :alt="icon">
                  </div>
                </button>
              </div>
              <div class="icon-info">
                <span class="current-icon" :title="iconName">当前: {{ iconName }}</span>
                <a href="https://icones.js.org/" target="_blank" rel="noopener noreferrer" class="link">浏览图标库 ↗</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Column: Style -->
        <div class="control-column">
          <h3 class="column-title">
            <div class="title-left">
              <Icon name="material-symbols:palette-outline" class="icon" />
              样式设置
            </div>
            <label class="checkbox-label">
              <input v-model="linkScale" type="checkbox">
              <span>等比缩放</span>
            </label>
          </h3>

          <div class="control-group">
            <div class="form-item">
              <div class="slider-label">
                <label class="form-label">字体大小</label>
                <span class="mono">{{ fontSize }}px</span>
              </div>
              <input type="range" :value="fontSize" min="20" max="700" class="square-range" @input="handleFontSizeChange">
            </div>

            <div class="form-item">
              <div class="slider-label">
                <label class="form-label">图标大小</label>
                <span class="mono">{{ iconSize }}px</span>
              </div>
              <input type="range" :value="iconSize" min="20" max="700" class="square-range" @input="handleIconSizeChange">
            </div>

            <div class="form-item">
              <div class="slider-label">
                <label class="form-label">图标圆角</label>
                <span class="mono">{{ iconRadius }}%</span>
              </div>
              <input v-model.number="iconRadius" type="range" min="0" max="50" class="square-range">
            </div>

            <div class="form-item">
              <div class="slider-label">
                <label class="form-label">间距</label>
                <span class="mono">{{ gap }}px</span>
              </div>
              <input v-model.number="gap" type="range" min="0" max="200" class="square-range">
            </div>

            <div class="divider" />

            <div class="control-group">
              <div class="checkbox-row">
                <label class="checkbox-label">
                  <input v-model="linkColor" type="checkbox">
                  <span>颜色同步</span>
                </label>
                <label class="checkbox-label">
                  <input v-model="useOriginalIconColor" type="checkbox">
                  <span>原色图标</span>
                </label>
              </div>

              <div class="color-row">
                <label class="form-label">文字颜色</label>
                <div class="color-inputs">
                  <input type="text" :value="color" class="input-field mono small" @input="handleColorChange(($event.target as HTMLInputElement).value, 'text')">
                  <div class="color-picker-wrapper">
                    <input type="color" :value="color" @input="handleColorChange(($event.target as HTMLInputElement).value, 'text')">
                  </div>
                </div>
              </div>

              <div class="color-row">
                <label class="form-label">图标颜色</label>
                <div class="color-inputs">
                  <input type="text" :value="iconColor" :disabled="useOriginalIconColor" class="input-field mono small" @input="handleColorChange(($event.target as HTMLInputElement).value, 'icon')">
                  <div class="color-picker-wrapper" :class="{ disabled: useOriginalIconColor }">
                    <input type="color" :value="iconColor" @input="handleColorChange(($event.target as HTMLInputElement).value, 'icon')">
                  </div>
                </div>
              </div>

              <div class="color-row">
                <label class="form-label">背景颜色</label>
                <div class="color-inputs stacked">
                  <div class="color-input-row">
                    <input v-model="bgColor" type="text" class="input-field mono small">
                    <div class="color-picker-wrapper">
                      <input v-model="bgColor" type="color">
                    </div>
                  </div>
                  <div class="opacity-row">
                    <span class="opacity-label">不透明度 {{ Math.round(bgColorOpacity * 100) }}%</span>
                    <input v-model.number="bgColorOpacity" type="range" min="0" max="1" step="0.01" class="square-range small">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Effects & Export -->
        <div class="control-column wide">
          <h3 class="column-title">
            <Icon name="material-symbols:auto-fix" class="icon" />
            特效与导出
          </h3>

          <!-- Icon Background -->
          <div class="card">
            <div class="card-header">
              <h4>图标背景</h4>
              <label class="toggle">
                <input v-model="iconBgEnabled" type="checkbox">
                <span class="toggle-slider" />
              </label>
            </div>
            <div v-if="iconBgEnabled" class="card-body">
              <div class="color-row small">
                <label class="form-label small">背景颜色</label>
                <div class="color-inputs">
                  <input v-model="iconBgColor" type="text" class="input-field mono small">
                  <div class="color-picker-wrapper small">
                    <input v-model="iconBgColor" type="color">
                  </div>
                </div>
              </div>
              <div class="grid-2">
                <div class="form-item compact">
                  <div class="slider-label">
                    <label class="form-label small">内边距</label>
                    <span class="small">{{ iconBgPadding }}px</span>
                  </div>
                  <input v-model.number="iconBgPadding" type="range" min="0" max="100" class="square-range">
                </div>
                <div class="form-item compact">
                  <div class="slider-label">
                    <label class="form-label small">圆角半径</label>
                    <span class="small">{{ iconBgRadius }}%</span>
                  </div>
                  <input v-model.number="iconBgRadius" type="range" min="0" max="50" class="square-range">
                </div>
                <div class="form-item compact">
                  <div class="slider-label">
                    <label class="form-label small">模糊</label>
                    <span class="small">{{ iconBgBlur }}px</span>
                  </div>
                  <input v-model.number="iconBgBlur" type="range" min="0" max="20" class="square-range">
                </div>
                <div class="form-item compact">
                  <div class="slider-label">
                    <label class="form-label small">不透明度</label>
                    <span class="small">{{ Math.round(iconBgOpacity * 100) }}%</span>
                  </div>
                  <input v-model.number="iconBgOpacity" type="range" min="0" max="1" step="0.01" class="square-range">
                </div>
              </div>
            </div>
          </div>

          <!-- Shadows -->
          <div class="card">
            <div class="card-header">
              <span class="form-label">阴影设置</span>
              <div class="shadow-targets">
                <button
                  v-for="target in [{ id: 'both', icon: 'material-symbols:layers', label: '全部' }, { id: 'text', icon: 'material-symbols:title', label: '文字' }, { id: 'icon', icon: 'material-symbols:star', label: '图标' }]"
                  :key="target.id"
                  class="target-btn"
                  :class="{ active: shadowTarget === target.id }"
                  :title="target.label"
                  @click="shadowTarget = target.id as 'both' | 'text' | 'icon'"
                >
                  <Icon :name="target.icon" class="icon" />
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="color-row small">
                <span class="form-label small">颜色 ({{ shadowTarget === 'both' ? '统一' : (shadowTarget === 'text' ? '仅文字' : '仅图标') }})</span>
                <div class="color-inputs">
                  <input type="text" :value="shadowTarget === 'icon' ? iconShadow.color : textShadow.color" class="input-field mono small" @input="updateShadow('color', ($event.target as HTMLInputElement).value)">
                  <div class="color-picker-wrapper small">
                    <input type="color" :value="shadowTarget === 'icon' ? iconShadow.color : textShadow.color" @input="updateShadow('color', ($event.target as HTMLInputElement).value)">
                  </div>
                </div>
              </div>
              <div class="grid-3">
                <div class="form-item compact">
                  <label class="form-label small">模糊</label>
                  <input type="number" :value="shadowTarget === 'icon' ? iconShadow.blur : textShadow.blur" class="input-field small" @input="updateShadow('blur', ($event.target as HTMLInputElement).valueAsNumber)">
                </div>
                <div class="form-item compact">
                  <label class="form-label small">水平偏移</label>
                  <input type="number" :value="shadowTarget === 'icon' ? iconShadow.x : textShadow.x" class="input-field small" @input="updateShadow('x', ($event.target as HTMLInputElement).valueAsNumber)">
                </div>
                <div class="form-item compact">
                  <label class="form-label small">垂直偏移</label>
                  <input type="number" :value="shadowTarget === 'icon' ? iconShadow.y : textShadow.y" class="input-field small" @input="updateShadow('y', ($event.target as HTMLInputElement).valueAsNumber)">
                </div>
              </div>
              <div class="form-item compact">
                <div class="slider-label">
                  <label class="form-label small">不透明度</label>
                  <span class="small">{{ Math.round((shadowTarget === 'icon' ? iconShadow.alpha : textShadow.alpha) * 100) }}%</span>
                </div>
                <input type="range" :value="shadowTarget === 'icon' ? iconShadow.alpha : textShadow.alpha" min="0" max="1" step="0.01" class="square-range" @input="updateShadow('alpha', ($event.target as HTMLInputElement).valueAsNumber)">
              </div>
            </div>
          </div>

          <!-- Ratios -->
          <div class="form-item">
            <label class="form-label">画板比例 (多选)</label>
            <div class="ratio-grid compact">
              <label v-for="ratio in ratios" :key="ratio.label" class="ratio-item">
                <input v-model="ratio.checked" type="checkbox">
                <span class="mono">{{ ratio.label }}</span>
              </label>
            </div>
          </div>

          <!-- Scale Ratios -->
          <div v-if="exportConfig.format === 'png'" class="form-item">
            <label class="form-label">缩放倍率 (多选)</label>
            <div class="ratio-grid compact">
              <label v-for="scale in [1, 2, 3, 4]" :key="scale" class="ratio-item">
                <input
                  type="checkbox"
                  :checked="exportConfig.scales.includes(scale)"
                  @change="(e) => {
                    if ((e.target as HTMLInputElement).checked) {
                      exportConfig.scales = [...exportConfig.scales, scale].sort()
                    } else {
                      exportConfig.scales = exportConfig.scales.filter(s => s !== scale)
                    }
                  }"
                >
                <span class="mono">{{ scale }}x</span>
              </label>
            </div>
            <p class="size-info">{{ Math.round(canvasWidth) }}x{{ Math.round(canvasHeight) }} px</p>
          </div>

          <!-- Export -->
          <div class="card">
            <h4 class="card-title">导出设置</h4>
            <div class="card-body">
              <div class="form-item compact">
                <label class="form-label small">文件名</label>
                <input v-model="exportConfig.filename" type="text" class="input-field">
              </div>

              <div class="form-item compact">
                <label class="form-label small">格式</label>
                <div class="format-buttons">
                  <label class="format-btn" :class="{ active: exportConfig.format === 'png' }">
                    <input v-model="exportConfig.format" type="radio" value="png" class="hidden">
                    <span>PNG</span>
                  </label>
                  <label class="format-btn" :class="{ active: exportConfig.format === 'svg' }">
                    <input v-model="exportConfig.format" type="radio" value="svg" class="hidden">
                    <span>SVG</span>
                  </label>
                </div>
              </div>

              <label class="checkbox-row-item">
                <span class="form-label small">背景透明</span>
                <input v-model="exportConfig.transparentBg" type="checkbox">
              </label>

              <div class="form-item compact">
                <label class="form-label small">导出尺寸 (可多选)</label>
                <div v-if="activeRatios.length > 1" class="export-ratios">
                  <label
                    v-for="ratio in ratios.filter(r => activeRatios.find(ar => ar.label === r.label))"
                    :key="ratio.label"
                    class="ratio-tag"
                    :class="{ active: exportConfig.exportRatios.includes(ratio.label) }"
                  >
                    <input
                      type="checkbox"
                      class="hidden"
                      :checked="exportConfig.exportRatios.includes(ratio.label)"
                      @change="(e) => {
                        if ((e.target as HTMLInputElement).checked) {
                          exportConfig.exportRatios = [...exportConfig.exportRatios, ratio.label]
                        } else {
                          exportConfig.exportRatios = exportConfig.exportRatios.filter(r => r !== ratio.label)
                        }
                      }"
                    >
                    <span class="mono">{{ ratio.label }}</span>
                  </label>
                </div>
                <p v-if="activeRatios.length === 0" class="error-text">请至少选择一个画板比例以进行导出</p>
                <p v-else-if="activeRatios.length === 1" class="hint-text">当前仅预览 {{ activeRatios[0].label }}，将导出此尺寸</p>
                <p v-else class="hint-text right">不选默认导出预览选中比例</p>
              </div>
            </div>

            <button
              class="export-btn"
              :disabled="activeRatios.length === 0"
              @click="doExport"
            >
              <Icon name="material-symbols:download" class="icon" />
              导出图片
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cover-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cover-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

// Preview Area
.preview-area {
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  background-color: var(--c-bg-1);
  padding: 1rem;
  border-radius: 12px;
  user-select: none;
  touch-action: none;
}

.preview-svg {
  max-width: 100%;
  height: auto;
}

// SVG 内部样式已通过内联 style 属性设置

// Controls
.controls-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
  background-color: var(--c-bg-1);
  padding: 1.5rem;
  border-radius: 12px;
  overflow: hidden;

  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.control-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
  overflow: hidden;

  &.wide {
    @media (min-width: 768px) and (max-width: 991px) {
      grid-column: span 2;
    }
  }
}

.column-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: var(--c-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
  flex-wrap: wrap;

  .title-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.compact {
    gap: 0.25rem;
  }
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text-2);

  &.small {
    font-size: 0.75rem;
  }
}

// Form Elements
.input-field {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: transparent;
  border: 1px solid var(--c-border);
  color: var(--c-text-1);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: var(--c-primary);
    box-shadow: 0 0 0 2px var(--c-primary-soft);
  }

  &.small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  &.mono {
    font-family: monospace;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Upload
.hidden {
  display: none;
}

.upload-wrapper {
  position: relative;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px dashed var(--c-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover, &.dragover {
    border-color: var(--c-primary);
    background-color: var(--c-primary-soft);
  }

  &.small {
    padding: 0.5rem;
    height: 2.5rem;
  }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--c-text-3);

  .upload-area:hover &,
  .upload-area.dragover & {
    color: var(--c-primary);
  }
}

.upload-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.upload-text {
  font-size: 0.75rem;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #dc2626;
  }

  &.small {
    top: -0.25rem;
    right: -0.25rem;
    padding: 0.125rem;
  }
}

.icon-small {
  width: 0.75rem;
  height: 0.75rem;
  display: block;
}

// Sliders
.slider-group {
  margin-top: 0.5rem;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;

  span {
    color: var(--c-text-3);
    font-family: monospace;
  }
}

.square-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
  border-radius: 0;
  margin-top: 0.5rem;

  &::-webkit-slider-track {
    width: 100%;
    height: 6px;
    background: var(--c-bg-3);
    border-radius: 0;
  }

  &::-moz-range-track {
    width: 100%;
    height: 6px;
    background: var(--c-bg-3);
    border-radius: 0;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: var(--c-primary);
    cursor: pointer;
    border-radius: 0;
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.2s;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: var(--c-primary);
    cursor: pointer;
    border-radius: 0;
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: transform 0.2s;
  }

  &:active::-webkit-slider-thumb {
    transform: scale(1.05);
  }

  &:active::-moz-range-thumb {
    transform: scale(1.05);
  }

  &.small {
    width: 4rem;
  }
}

// Checkboxes
.checkbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: normal;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--c-border);
  border-radius: 0.25rem;
  background: transparent;
  color: var(--c-text-2);
  transition: all 0.2s;

  &:hover {
    background: var(--c-bg-2);
  }

  input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    min-width: 16px;
    border: 2px solid var(--c-border);
    border-radius: 0;
    background: transparent;
    cursor: pointer;
    position: relative;
    display: inline-block;
    vertical-align: middle;

    &:checked {
      background: var(--c-primary);
      border-color: var(--c-primary);

      &::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 1px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }
}

.checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.checkbox-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 0.25rem;
  cursor: pointer;

  input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid var(--c-border);
    border-radius: 0;
    background: transparent;
    cursor: pointer;
    position: relative;

    &:checked {
      background: var(--c-primary);
      border-color: var(--c-primary);

      &::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 1px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }
}

// Icon Grid
.icon-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.search-wrapper {
  position: relative;
}

.loading-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-3);
}

.icon-results {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-height: 15rem;
  overflow-y: auto;
  padding: 0.5rem;
  background: var(--c-bg-2);
  border-radius: 0.5rem;
  border: 1px solid var(--c-border);
}

.icon-item {
  padding: 0.5rem;
  border-radius: 0.375rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--c-bg-3);
  }
}

.icon-box {
  width: 2rem;
  height: 2rem;
  margin: 0 auto;
  background: white;
  border: 1px solid var(--c-border);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &.selected {
    border-color: var(--c-primary);
  }

  img {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.icon-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  gap: 0.5rem;
}

.current-icon {
  color: var(--c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link {
  color: var(--c-primary);
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
}

// Font List
.font-list {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  background: var(--c-bg-2);
}

.font-items {
  max-height: 10rem;
  overflow-y: auto;
  margin-top: 0.5rem;
}

.font-item {
  width: 100%;
  text-align: left;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  color: var(--c-text-2);
  transition: background 0.2s;

  &:hover {
    background: var(--c-bg-3);
  }
}

.font-family {
  font-weight: 500;
}

.font-style {
  color: var(--c-text-3);
  margin-left: 0.25rem;
  font-size: 0.75rem;
}

.close-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: var(--c-text-3);
  cursor: pointer;
  font-size: 0.75rem;

  &:hover {
    color: #ef4444;
  }
}

// Button Group
.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border: 1px solid var(--c-border);
  border-radius: 0.25rem;
  background: transparent;
  color: var(--c-text-2);
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--c-bg-2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }
}

// Divider
.divider {
  width: 100%;
  height: 1px;
  background: var(--c-border);
  margin: 0.5rem 0;
}

// Color Inputs
.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: 0;

  &.small {
    font-size: 0.75rem;
  }
}

.color-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex-shrink: 0;

  &.stacked {
    flex-direction: column;
    align-items: flex-end;
  }
}

.color-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.opacity-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.opacity-label {
  font-size: 0.625rem;
  color: var(--c-text-3);
}

.color-picker-wrapper {
  position: relative;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid var(--c-border);
  flex-shrink: 0;

  &.small {
    width: 1.5rem;
    height: 1.5rem;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  input[type="color"] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150%;
    height: 150%;
    padding: 0;
    margin: 0;
    border: 0;
    cursor: pointer;
  }
}

// Cards
.card {
  background: transparent;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--c-border);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
  flex-wrap: wrap;

  h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--c-text-2);
    margin: 0;
    flex-shrink: 0;
  }
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text-2);
  margin: 0 0 0.75rem 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--c-border);
}

// Toggle
.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--c-bg-3);
  transition: 0.3s;
  border: 1px solid var(--c-border);

  &::before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

.toggle input:checked + .toggle-slider {
  background-color: var(--c-primary);
  border-color: var(--c-primary);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

// Shadow Targets
.shadow-targets {
  display: flex;
  background: transparent;
  border-radius: 0.375rem;
  padding: 0.25rem;
  border: 1px solid var(--c-border);
  gap: 0.25rem;
  flex-shrink: 0;
}

.target-btn {
  padding: 0.375rem;
  border-radius: 0.25rem;
  background: transparent;
  border: none;
  color: var(--c-text-3);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--c-primary);
  }

  &.active {
    background: var(--c-primary);
    color: white;
    box-shadow: 0 2px 4px var(--c-primary-soft);
  }

  .icon {
    width: 1rem;
    height: 1rem;
    display: block;
  }
}

// Grids
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

// Ratios
.ratio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  &.compact {
    @media (max-width: 1100px) {
      grid-template-columns: repeat(4, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.ratio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--c-bg-2);
  }

  input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid var(--c-border);
    border-radius: 0;
    background: transparent;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;

    &:checked {
      background: var(--c-primary);
      border-color: var(--c-primary);

      &::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 1px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  span {
    color: var(--c-text-2);
  }
}

.size-info {
  font-size: 0.625rem;
  color: var(--c-text-3);
  text-align: right;
  margin-top: -0.25rem;
}

// Format Buttons
.format-buttons {
  display: flex;
  gap: 0.5rem;
}

.format-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  cursor: pointer;
  background: transparent;
  color: var(--c-text-2);
  transition: all 0.2s;
  font-size: 0.75rem;

  &:hover {
    border-color: var(--c-primary);
  }

  &.active {
    border-color: var(--c-primary);
    background: var(--c-primary-soft);
    color: var(--c-primary);
  }
}

// Export Ratios
.export-ratios {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.25rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.ratio-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: 1px solid var(--c-border);
  border-radius: 0.25rem;
  cursor: pointer;
  background: transparent;
  color: var(--c-text-2);
  transition: all 0.2s;
  font-size: 0.75rem;

  &:hover {
    border-color: var(--c-primary);
  }

  &.active {
    border-color: var(--c-primary);
    background: var(--c-primary-soft);
    color: var(--c-primary);
  }
}

// Export Button
.export-btn {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.75rem;
  background: var(--c-primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px var(--c-primary-soft);

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}

// Text Helpers
.mono {
  font-family: monospace;
}

.hint-text {
  font-size: 0.625rem;
  color: var(--c-text-3);
  margin-top: 0.25rem;
  text-align: center;

  &.right {
    text-align: right;
  }
}

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

// Responsive
@media (max-width: 991px) {
  .cover-page {
    padding: 10px;
  }

  .controls-grid {
    padding: 1rem;
  }

  .icon-results {
    grid-template-columns: repeat(4, 1fr);
  }

  .export-ratios {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 767px) {
  .icon-results {
    grid-template-columns: repeat(3, 1fr);
  }

  .export-ratios {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
