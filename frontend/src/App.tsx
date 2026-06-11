import { useMemo, useState } from 'react'
import { SearchBox } from '@/components/search-box'
import { ThemeToggle } from '@/components/theme-toggle'
import { HistoryPanel } from '@/components/history-panel'
import { AnswerMarkdown, extractCitedIds } from '@/components/answer-markdown'
import { CitedSources, ResultsList } from '@/components/sources'
import { RelatedQuestions } from '@/components/related-questions'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useSearch } from '@/hooks/use-search'
import { addHistory, clearHistory, loadHistory, removeHistory } from '@/lib/history'
import { CircleAlert, Globe, Sparkles } from 'lucide-react'

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-lg font-semibold tracking-tight"
      aria-label="返回首页"
    >
      <span className="text-gold-strong">✶</span>
      aureo
    </button>
  )
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof Sparkles
  children: React.ReactNode
}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
      <Icon className="size-4 text-gold-strong" />
      {children}
    </h2>
  )
}

export default function App() {
  const { phase, query, sources, answer, related, error, search, reset } = useSearch()
  const [history, setHistory] = useState(loadHistory)

  const startSearch = (input: string) => {
    setHistory(addHistory(input))
    void search(input)
  }

  const citedIds = useMemo(() => extractCitedIds(answer), [answer])
  const citedSources = useMemo(
    () => citedIds.flatMap((id) => sources.find((s) => s.id === id) ?? []),
    [citedIds, sources],
  )
  const loading = phase === 'searching' || phase === 'streaming'

  if (phase === 'idle') {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-end gap-1 p-4">
          <HistoryPanel
            items={history}
            onSelect={startSearch}
            onRemove={(q) => setHistory(removeHistory(q))}
            onClear={() => setHistory(clearHistory())}
          />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
          <p className="mb-4 text-5xl text-gold-strong" aria-hidden>
            ✶
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">aureo</h1>
          <p className="mt-3 text-muted-foreground">提问即搜索，回答有出处</p>
          <div className="mt-8 w-full max-w-2xl">
            <SearchBox onSearch={startSearch} variant="hero" />
          </div>
          {history.length > 0 && (
            <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
              {history.slice(0, 4).map((item) => (
                <button
                  key={item.query}
                  type="button"
                  onClick={() => startSearch(item.query)}
                  className="max-w-60 truncate rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-foreground"
                >
                  {item.query}
                </button>
              ))}
            </div>
          )}
        </main>
        <footer className="p-4 text-center text-xs text-muted-foreground">
          aureo · AI 联网搜索，引用真实来源
        </footer>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-2.5">
          <Logo onClick={reset} />
          <div className="min-w-0 flex-1">
            <SearchBox
              key={query}
              onSearch={startSearch}
              variant="compact"
              initialValue={query}
              loading={loading}
            />
          </div>
          <div className="flex shrink-0 items-center">
            <HistoryPanel
              items={history}
              onSelect={startSearch}
              onRemove={(q) => setHistory(removeHistory(q))}
              onClear={() => setHistory(clearHistory())}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-6">
        <h1 className="text-2xl font-semibold leading-snug tracking-tight">{query}</h1>

        {phase === 'error' ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 text-sm text-destructive">
              <CircleAlert className="size-4 shrink-0" />
              {error}
            </p>
            <Button size="sm" variant="outline" onClick={() => startSearch(query)}>
              重试
            </Button>
          </div>
        ) : (
          <>
            <section className="flex flex-col gap-3">
              <SectionLabel icon={Sparkles}>回答</SectionLabel>
              {answer ? (
                <AnswerMarkdown
                  answer={answer}
                  sources={sources}
                  streaming={phase === 'streaming'}
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  <p className="text-sm text-muted-foreground">
                    {sources.length > 0
                      ? `已找到 ${sources.length} 条来源，正在生成回答…`
                      : '正在联网搜索…'}
                  </p>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              )}
            </section>

            {citedSources.length > 0 && (
              <section className="flex flex-col gap-3">
                <SectionLabel icon={Globe}>引用来源</SectionLabel>
                <CitedSources sources={citedSources} />
              </section>
            )}

            {related.length > 0 && (
              <section className="flex flex-col gap-1">
                <SectionLabel icon={Sparkles}>相关问题</SectionLabel>
                <RelatedQuestions questions={related} onSelect={startSearch} />
              </section>
            )}

            {sources.length > 0 && (
              <section className="flex flex-col gap-4">
                <Separator />
                <SectionLabel icon={Globe}>
                  全部搜索结果（{sources.length}）
                </SectionLabel>
                <ResultsList sources={sources} citedIds={citedIds} />
              </section>
            )}
          </>
        )}
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        AI 回答基于联网搜索结果生成，请以引用原文为准
      </footer>
    </div>
  )
}
