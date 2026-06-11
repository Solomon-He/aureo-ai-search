import type { Source } from './types'

export interface SearchCallbacks {
  onSources: (sources: Source[]) => void
  onToken: (text: string) => void
  onRelated: (questions: string[]) => void
  onDone: () => void
  onError: (message: string) => void
}

/** 消费后端 SSE 流（fetch + ReadableStream 手写解析）。 */
export async function streamSearch(
  query: string,
  callbacks: SearchCallbacks,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/search/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  })
  if (!response.ok || !response.body) {
    throw new Error(`请求失败（HTTP ${response.status}）`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const dispatch = (rawEvent: string) => {
    let event = 'message'
    const dataLines: string[] = []
    for (const line of rawEvent.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim()
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
    }
    if (dataLines.length === 0) return
    const data = JSON.parse(dataLines.join('\n'))
    switch (event) {
      case 'sources':
        callbacks.onSources(data.sources ?? [])
        break
      case 'token':
        callbacks.onToken(data.text ?? '')
        break
      case 'related':
        callbacks.onRelated(data.questions ?? [])
        break
      case 'done':
        callbacks.onDone()
        break
      case 'error':
        callbacks.onError(data.message ?? '未知错误')
        break
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let separator: number
    while ((separator = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, separator)
      buffer = buffer.slice(separator + 2)
      if (rawEvent.trim()) dispatch(rawEvent)
    }
  }
}
