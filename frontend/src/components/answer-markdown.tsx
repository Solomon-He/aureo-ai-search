import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Source } from '@/lib/types'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const CITATION_HREF = '#aureo-source-'

/** 把回答中的 [n] 引用标记转成 markdown 链接（跳过代码块）。 */
export function injectCitationLinks(markdown: string): string {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((segment) =>
      segment.startsWith('```')
        ? segment
        : segment.replace(/\[(\d{1,2})\]/g, `[$1](${CITATION_HREF}$1)`),
    )
    .join('')
}

/** 提取回答中实际引用到的来源编号（按出现顺序去重）。 */
export function extractCitedIds(markdown: string): number[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '')
  const ids: number[] = []
  for (const match of withoutCode.matchAll(/\[(\d{1,2})\]/g)) {
    const id = Number(match[1])
    if (!ids.includes(id)) ids.push(id)
  }
  return ids
}

function CitationChip({ id, source }: { id: number; source?: Source }) {
  const chip = (
    <a
      href={source?.url ?? '#'}
      target="_blank"
      rel="noreferrer"
      className="mx-0.5 inline-flex size-4.5 -translate-y-0.5 items-center justify-center rounded-full bg-gold/15 align-middle text-[10px] font-semibold text-gold-strong no-underline transition-colors hover:bg-gold/30"
    >
      {id}
    </a>
  )
  if (!source) return chip
  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent className="max-w-72">
        <p className="line-clamp-2 font-medium">{source.title}</p>
        <p className="mt-0.5 truncate text-[11px] opacity-70">
          {new URL(source.url).hostname}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

interface AnswerMarkdownProps {
  answer: string
  sources: Source[]
  streaming?: boolean
}

export function AnswerMarkdown({ answer, sources, streaming }: AnswerMarkdownProps) {
  const processed = useMemo(() => injectCitationLinks(answer), [answer])
  const sourceMap = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  )

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-7 prose-headings:font-semibold prose-pre:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href?.startsWith(CITATION_HREF)) {
              const id = Number(href.slice(CITATION_HREF.length))
              return <CitationChip id={id} source={sourceMap.get(id)} />
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            )
          },
        }}
      >
        {processed}
      </ReactMarkdown>
      {streaming && (
        <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-gold align-middle" />
      )}
    </div>
  )
}
