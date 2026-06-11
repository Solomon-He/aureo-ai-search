import { History, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { HistoryItem } from '@/lib/types'

interface HistoryPanelProps {
  items: HistoryItem[]
  onSelect: (query: string) => void
  onRemove: (query: string) => void
  onClear: () => void
}

export function HistoryPanel({ items, onSelect, onRemove, onClear }: HistoryPanelProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="搜索历史">
          <History className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          搜索历史
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 text-xs font-normal text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-3" />
              清空
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            还没有搜索记录
          </p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.query}
                className="group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-accent"
              >
                <button
                  type="button"
                  onClick={() => onSelect(item.query)}
                  className="min-w-0 flex-1 truncate text-left text-sm"
                  title={item.query}
                >
                  {item.query}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.query)}
                  aria-label={`删除「${item.query}」`}
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
