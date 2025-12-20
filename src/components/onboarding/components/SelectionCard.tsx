import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CornerBrackets } from './CornerBrackets'

type SelectionCardProps = {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description: string
  badge?: string
  index?: number
  className?: string
}

export default function SelectionCard({
  selected,
  onClick,
  icon,
  label,
  description,
  badge,
  index = 0,
  className,
}: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative text-left p-5 rounded-lg border transition-all duration-200 cursor-pointer',
        'animate-in fade-in slide-in-from-bottom-2',
        selected
          ? 'border-[var(--color-wizard-accent)] bg-[var(--color-wizard-accent)]/10'
          : 'border-[var(--color-workshop-border)] bg-[var(--color-workshop-surface)] hover:bg-[var(--color-workshop-elevated)] hover:border-[var(--color-workshop-text-muted)]/30',
        className
      )}
      style={{
        animationDelay: `${String(index * 75)}ms`,
        boxShadow: selected
          ? '0 0 0 1px var(--color-wizard-accent), 0 8px 24px rgba(20, 184, 166, 0.25), 0 4px 8px rgba(0,0,0,0.2)'
          : '0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      <CornerBrackets active={selected} />

      {/* Index number - subtle */}
      <span className="absolute top-4 right-4 font-mono text-xs text-[var(--color-workshop-text-muted)]/60">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Optional badge */}
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-block-yellow)]/15 border border-[var(--color-block-yellow)]/30 text-[var(--color-block-yellow)] text-xs font-medium mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-block-yellow)]" />
          {badge}
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-all duration-300',
          selected && 'shadow-[0_0_16px_rgba(20,184,166,0.4)]'
        )}
        style={{
          backgroundColor: selected
            ? 'var(--color-wizard-accent)'
            : 'var(--color-workshop-elevated)',
          color: selected
            ? '#ffffff'
            : 'var(--color-workshop-text-muted)',
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <h3
        className="text-lg font-semibold mb-2"
        style={{
          fontFamily: 'var(--font-family-display)',
          color: 'var(--color-workshop-text)',
        }}
      >
        {label}
      </h3>
      <p className="text-base leading-relaxed text-[var(--color-workshop-text-muted)]">
        {description}
      </p>

      {/* Selection indicator */}
      {selected && (
        <div
          className="absolute bottom-4 right-4 flex items-center justify-center w-6 h-6 rounded-md"
          style={{ backgroundColor: 'var(--color-wizard-accent)' }}
        >
          <Check className="size-3.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}
