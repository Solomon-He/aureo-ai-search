import { useCallback, useRef, useState } from 'react'
import { streamSearch } from '@/lib/sse'
import type { SearchPhase, Source } from '@/lib/types'

export function useSearch() {
  const [phase, setPhase] = useState<SearchPhase>('idle')
  const [query, setQuery] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [answer, setAnswer] = useState('')
  const [related, setRelated] = useState<string[]>([])
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setQuery(trimmed)
    setPhase('searching')
    setSources([])
    setAnswer('')
    setRelated([])
    setError('')
    window.scrollTo({ top: 0 })

    try {
      await streamSearch(
        trimmed,
        {
          onSources: setSources,
          onToken: (text) => {
            setPhase('streaming')
            setAnswer((prev) => prev + text)
          },
          onRelated: setRelated,
          onDone: () => setPhase('done'),
          onError: (message) => {
            setError(message)
            setPhase('error')
          },
        },
        controller.signal,
      )
      // 流意外结束（无 done/error 事件）时兜底
      setPhase((prev) => (prev === 'searching' || prev === 'streaming' ? 'done' : prev))
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : '网络异常，请稍后重试')
        setPhase('error')
      }
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setPhase('idle')
    setQuery('')
    setSources([])
    setAnswer('')
    setRelated([])
    setError('')
  }, [])

  return { phase, query, sources, answer, related, error, search, reset }
}
