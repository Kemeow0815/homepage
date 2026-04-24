import photosData from './albums/photos.json'

export interface AlbumPhoto {
	id: string
	title: string | null
	description: string | null
	width: number
	height: number
	aspectRatio: number
	dateTaken: string | null
	thumbnailUrl: string
	originalUrl: string
	fileSize?: number
	tags?: string[]
}

export interface Album {
	id: string
	title: string
	description: string | null
	coverPhotoId: string | null
	photos: AlbumPhoto[]
}

// 从本地 JSON 加载照片数据
export const photos: AlbumPhoto[] = photosData.photos

// 获取所有照片
export function getAllPhotos(): AlbumPhoto[] {
	return photos
}

// 根据ID获取照片
export function getPhotoById(id: string): AlbumPhoto | undefined {
	return photos.find(photo => photo.id === id)
}

// 格式化日期
export function formatDate(dateString: string | null): string {
	if (!dateString)
		return '未知日期'
	const date = new Date(dateString)
	return date.toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

// 格式化文件大小
export function formatFileSize(bytes?: number): string {
	if (!bytes)
		return '未知大小'
	const units = ['B', 'KB', 'MB', 'GB']
	let size = bytes
	let unitIndex = 0
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex++
	}
	return `${size.toFixed(1)} ${units[unitIndex]}`
}
