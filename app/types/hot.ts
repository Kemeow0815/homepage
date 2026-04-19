// 热搜 API 响应类型
export interface ApiResponse {
  total: number
  updateTime: string
  data: HotItem[]
}

// 热搜单条数据结构
export interface HotItem {
  id: string
  title: string
  desc: string
  cover: string
  author: string
  timestamp: null | number
  hot: number
  url: string
  mobileUrl: string
}
