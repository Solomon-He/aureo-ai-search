import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Source } from '@/lib/types'
import { CITATION_HREF, injectCitationLinks } from '@/lib/citations'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
