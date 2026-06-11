import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchBoxProps {
  onSearch: (query: string) => void
  variant?: 'hero' | 'compact'
  initialValue?: string
  loading?: boolean
}

export function SearchBox({
  onSearch,
  variant = 'hero',
  initialValue = '',
  loading = false,
}: SearchBoxProps) {
  const [value, setValue] = useState(initialValue)
  const hero = variant === 'hero'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!loading && value.trim()) onSearch(value)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'group flex w-full items-center gap-2 rounded-2xl border bg-card shadow-sm transition-all',
        'focus-within:border-gold/60 focus-within:shadow-[0_0_0_4px_var(--gold-glow)]',
        hero ? 'p-2 pl-5' : 'rounded-xl p-1 pl-4',
      )}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="提出任何问题…"
        autoFocus={hero}
        maxLength={500}
        aria-label="搜索问题"
        className={cn(
          'min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
          hero ? 'py-3 text-lg' : 'py-1.5 text-sm',
        )}
      />
      <Button
        type="submit"
        size={hero ? 'lg' : 'sm'}
        disabled={loading || !value.trim()}
        aria-label="搜索"
        className={cn('shrink-0', hero ? 'rounded-xl px-4' : 'rounded-lg px-3')}
      >
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}
      </Button>
    </form>
  )
}
