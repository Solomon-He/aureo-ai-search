import type { HistoryItem } from './types'

const STORAGE_KEY = 'aureo:history'
const MAX_ITEMS = 20

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(
      (item): item is HistoryItem =>
        typeof item?.query === 'string' && typeof item?.ts === 'number',
    )
  } catch {
    return []
  }
}

function save(items: HistoryItem[]): HistoryItem[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // 存储不可用时静默忽略
  }
  return items
}

export function addHistory(query: string): HistoryItem[] {
  const trimmed = query.trim()
  if (!trimmed) return loadHistory()
  const rest = loadHistory().filter((item) => item.query !== trimmed)
  return save([{ query: trimmed, ts: Date.now() }, ...rest].slice(0, MAX_ITEMS))
}

export function removeHistory(query: string): HistoryItem[] {
  return save(loadHistory().filter((item) => item.query !== query))
}

export function clearHistory(): HistoryItem[] {
  return save([])
}
