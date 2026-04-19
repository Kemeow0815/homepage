export interface EquipmentItem {
  name: string
  category: '硬件' | '外设'
  desc: string
  info?: Record<string, string>
  tags?: string[]
  image?: string
  date?: string
  src?: string
  money?: number
}

export interface EquipmentCategory {
  key: string
  label: string
  icon: string
  color: string
}

export interface EquipmentData {
  categories: EquipmentCategory[]
  items: EquipmentItem[]
}
