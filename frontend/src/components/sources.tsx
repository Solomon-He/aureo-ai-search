import type { Source } from '@/lib/types'

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function Favicon({ url }: { url: string }) {
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${hostname(url)}&sz=32`}
      alt=""
      loading="lazy"
      className="size-4 rounded-sm"
    />
  )
}

/** 引用来源卡片网格（AI 回答底部，仅展示被引用到的来源）。 */
export function CitedSources({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {sources.map((source) => (
        <a
          key={source.id}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col justify-between gap-2 rounded-xl border bg-card p-3 transition-colors hover:border-gold/50 hover:bg-accent"
        >
          <p className="line-clamp-2 text-xs font-medium leading-5">
            {source.title || hostname(source.url)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-semibold text-gold-strong">{source.id}</span>
            <Favicon url={source.url} />
            <span className="truncate">{hostname(source.url)}</span>
          </div>
        </a>
      ))}
    </div>
  )
}

/** 完整搜索结果列表（传统搜索引擎样式，含未被引用的结果）。 */
export function ResultsList({
  sources,
  citedIds,
}: {
  sources: Source[]
  citedIds: number[]
}) {
  if (sources.length === 0) return null
  return (
    <ol className="flex flex-col gap-5">
      {sources.map((source) => (
        <li key={source.id} className="group">
          <a href={source.url} target="_blank" rel="noreferrer" className="block">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Favicon url={source.url} />
              <span className="truncate">{hostname(source.url)}</span>
              {citedIds.includes(source.id) && (
                <span className="rounded-full bg-gold/15 px-1.5 py-px text-[10px] font-medium text-gold-strong">
                  已引用 [{source.id}]
                </span>
              )}
            </div>
            <h3 className="mt-1 line-clamp-1 font-medium text-primary underline-offset-4 group-hover:underline">
              {source.title || source.url}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {source.content}
            </p>
          </a>
        </li>
      ))}
    </ol>
  )
}
