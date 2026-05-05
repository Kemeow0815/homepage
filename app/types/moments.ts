// Moments 即刻短文类型定义

export interface MomentItem {
	/** 唯一标识 */
	id: string
	/** 内容文本（支持 HTML） */
	content: string
	/** 发布时间 */
	date: string
	/** 图片列表 */
	images?: string[]
	/** 视频信息 */
	video?: {
		id: string
		poster?: string
	}
	/** 标签列表 */
	tags?: string[]
	/** 地理位置 */
	location?: string
	/** 浏览次数 */
	views?: string
}

// Moments 数据源配置类型
export interface MomentsConfig {
	/** 数据源类型 */
	type: 'local' | 'tgtalk' | 'memos'
	/** tgtalk 配置 */
	tgtalk?: {
		url: string
	}
	/** memos 配置 (0.26.x) */
	memos?: {
		baseUrl: string
		pageSize?: number
	}
}

// tgtalk API 类型
export interface TgtalkMessage {
	id: string
	text: string
	image: string[]
	time: number
	views: string
}

export interface TgtalkResponse {
	nextBefore: number
	Region: string
	version: string
	ChannelMessageData: TgtalkMessage[]
}

// ispeak API 类型
export interface IspeakTag {
	bgColor: string
	createAt: Date
	description: string
	name: string
	orderNo: number
	user: string
	_id: string
}

export interface IspeakAuthor {
	nickName: string
	avatar: string
}

export interface IspeakItem {
	author: IspeakAuthor
	content: string
	createdAt: Date
	showComment: '1' | '0'
	tag: IspeakTag
	title: string
	type: '0' | '1' | '2'
	updatedAt: Date
	_id: string
}
