export interface FeedEntry {
	author: string
	sitenick?: string
	link: string
	icon: string
	avatar: string
	feed?: string
	archs?: string[]
	desc?: string
	comment?: string
	date?: string
	title?: string
	error?: string
	screenshot?: string
}

export interface FeedGroup {
	name: string
	feeds: FeedEntry[]
}
