import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ToggleItem = {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  enabled: boolean
  techStack?: string
  techAlternatives?: string[]
}

type ToggleGroupProps = {
  items: ToggleItem[]
  onToggle: (id: string) => void
  onTechChange?: (id: string, tech: string) => void
  categoryLabel?: string
  categoryIcon?: React.ReactNode
}

export default function ToggleGroup({
  items,
  onToggle,
  onTechChange,
  categoryLabel,
  categoryIcon,
}: ToggleGroupProps) {
  return (
    <div>
      {/* Category header */}
      {categoryLabel && (
        <div className="flex items-center gap-3 mb-4">
          {categoryIcon && (
            <span className="text-[var(--color-blueprint-accent)]">
              {categoryIcon}
            </span>
          )}
          <span className="text-sm font-semibold text-slate-200">
            {categoryLabel}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
        </div>
      )}

      {/* Items list */}
      <div className={cn('space-y-2', categoryLabel && 'pl-7')}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={cn(
              'group relative flex items-center gap-4 px-4 py-3.5 rounded-sm border transition-all duration-300',
              'animate-in fade-in',
              item.enabled
                ? 'border-[var(--color-blueprint-accent)]/25 bg-[var(--color-blueprint-accent)]/[0.04]'
                : 'border-slate-700/40 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-600/50'
            )}
            style={{ animationDelay: `${String(idx * 50)}ms` }}
          >
            {/* Checkbox */}
            <Checkbox
              id={item.id}
              checked={item.enabled}
              onCheckedChange={() => {
                onToggle(item.id)
              }}
              className="border-slate-500 data-[state=checked]:border-[var(--color-blueprint-accent)] data-[state=checked]:bg-[var(--color-blueprint-accent)] data-[state=checked]:text-slate-900"
            />

            {/* Label with icon */}
            <label
              htmlFor={item.id}
              className={cn(
                'flex flex-1 cursor-pointer items-center gap-3 min-w-0',
                item.enabled ? 'text-white' : 'text-slate-400'
              )}
            >
              {item.icon && (
                <span
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    item.enabled ? 'text-[var(--color-blueprint-accent)]' : ''
                  )}
                >
                  {item.icon}
                </span>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-medium truncate">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-xs text-slate-500 truncate">
                    {item.description}
                  </span>
                )}
              </div>
            </label>

            {/* Tech stack selector (if enabled and has alternatives) */}
            {item.enabled &&
              item.techStack &&
              item.techAlternatives &&
              item.techAlternatives.length > 0 &&
              onTechChange && (
                <Select
                  value={item.techStack}
                  onValueChange={(v) => {
                    onTechChange(item.id, v)
                  }}
                >
                  <SelectTrigger className="h-8 w-28 sm:w-36 border-slate-600/50 bg-slate-800/60 text-sm text-slate-200 rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-600 bg-slate-800 rounded-sm">
                    {[
                      item.techStack,
                      ...item.techAlternatives.filter(
                        (t) => t !== item.techStack
                      ),
                    ].map((tech) => (
                      <SelectItem
                        key={tech}
                        value={tech}
                        className="text-sm text-slate-200 focus:bg-slate-700 focus:text-white"
                      >
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
          </div>
        ))}
      </div>
    </div>
  )
}
