import { cn } from '@/lib/utils'

/**
 * Decorative corner marks for selection cards
 * Drafting/blueprint aesthetic - subtle selection indicator
 */

type CornerBracketsProps = {
  active?: boolean
  color?: string
  className?: string
}

export function CornerBrackets({
  active = false,
  color = 'var(--color-wizard-accent)',
  className,
}: CornerBracketsProps) {
  const bracketStyle = {
    borderColor: active ? color : 'var(--color-workshop-border)',
  }

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Top-left */}
      <div
        className={cn(
          'absolute -top-px -left-px w-2.5 h-2.5 border-l-2 border-t-2 rounded-tl-sm transition-all duration-200',
          active ? 'opacity-100' : 'opacity-0'
        )}
        style={bracketStyle}
      />
      {/* Top-right */}
      <div
        className={cn(
          'absolute -top-px -right-px w-2.5 h-2.5 border-r-2 border-t-2 rounded-tr-sm transition-all duration-200',
          active ? 'opacity-100' : 'opacity-0'
        )}
        style={bracketStyle}
      />
      {/* Bottom-left */}
      <div
        className={cn(
          'absolute -bottom-px -left-px w-2.5 h-2.5 border-l-2 border-b-2 rounded-bl-sm transition-all duration-200',
          active ? 'opacity-100' : 'opacity-0'
        )}
        style={bracketStyle}
      />
      {/* Bottom-right */}
      <div
        className={cn(
          'absolute -bottom-px -right-px w-2.5 h-2.5 border-r-2 border-b-2 rounded-br-sm transition-all duration-200',
          active ? 'opacity-100' : 'opacity-0'
        )}
        style={bracketStyle}
      />
    </div>
  )
}
