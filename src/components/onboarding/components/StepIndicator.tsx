import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Vertical progress indicator for wizard steps
 * Building block inspired - each step is a block being stacked
 */

type StepIndicatorProps = {
  currentStep: number
  totalSteps: number
  labels: string[]
}

// Single accent color for cleaner look
const ACCENT_COLOR = 'var(--color-wizard-accent)'

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => ({
    num: i + 1,
    label: labels[i] ?? `Step ${String(i + 1)}`,
    color: ACCENT_COLOR,
  }))

  return (
    <div className="flex flex-col items-start">
      {steps.map((step, i) => {
        const isActive = step.num === currentStep
        const isComplete = step.num < currentStep
        const isPending = step.num > currentStep

        return (
          <div key={step.num} className="flex items-start">
            {/* Left column: block + connector */}
            <div className="flex flex-col items-center">
              {/* Step block */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-11 h-11 rounded-lg font-mono text-sm font-bold transition-all duration-300',
                  isActive && 'scale-110',
                  isPending && 'opacity-35'
                )}
                style={{
                  backgroundColor: isComplete || isActive ? step.color : 'var(--color-workshop-elevated)',
                  color: isComplete || isActive ? '#ffffff' : 'var(--color-workshop-text-muted)',
                  boxShadow: isActive
                    ? '0 0 24px rgba(20, 184, 166, 0.5), 0 4px 12px rgba(0,0,0,0.3)'
                    : isComplete
                      ? '0 2px 8px rgba(0,0,0,0.2)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                }}
              >
                {isComplete ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  <span className="tabular-nums">{step.num}</span>
                )}
              </div>

              {/* Connector line - building up to next block */}
              {i < steps.length - 1 && (
                <div
                  className="w-0.5 h-10 transition-all duration-300 rounded-full"
                  style={{
                    backgroundColor: isComplete
                      ? step.color
                      : 'var(--color-workshop-border)',
                    opacity: isComplete ? 0.7 : 0.3,
                  }}
                />
              )}
            </div>

            {/* Right column: label */}
            <div className="ml-4 pt-2.5">
              <span
                className={cn(
                  'text-sm transition-all duration-300',
                  isActive && 'font-medium',
                  isPending && 'opacity-50'
                )}
                style={{
                  fontFamily: 'var(--font-family-display)',
                  color: isActive
                    ? step.color
                    : isComplete
                      ? 'var(--color-workshop-text)'
                      : 'var(--color-workshop-text-muted)',
                }}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
