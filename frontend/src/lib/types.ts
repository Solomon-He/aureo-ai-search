/** 单条搜索来源（与后端 sources 事件对应，id 即引用编号）。 */
export interface Source {
  id: number
  title: string
  url: string
  content: string
  score?: number | null
}

export interface HistoryItem {
  query: string
  ts: number
}

export type SearchPhase = 'idle' | 'searching' | 'streaming' | 'done' | 'error'
