import { ArrowUpRight } from 'lucide-react'

interface RelatedQuestionsProps {
  questions: string[]
  onSelect: (question: string) => void
}

export function RelatedQuestions({ questions, onSelect }: RelatedQuestionsProps) {
  if (questions.length === 0) return null
  return (
    <div className="flex flex-col divide-y divide-border">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          className="group flex items-center justify-between gap-3 py-3 text-left text-sm transition-colors hover:text-gold-strong"
        >
          <span>{question}</span>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-gold-strong" />
        </button>
      ))}
    </div>
  )
}
