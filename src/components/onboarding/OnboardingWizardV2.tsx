import { useCallback } from 'react'
import type { DiagramNode } from '@/core/types'
import { WizardProvider, useWizard } from './context/WizardContext'
import { StepIndicator } from './components/StepIndicator'
import { Logo, LogoCompact } from './components/Logo'
import { useNodeGeneration } from './hooks/useNodeGeneration'
import {
  PlatformStep,
  PatternStep,
  StackStep,
  CapabilitiesStep,
  OutOfScopeStep,
} from './steps'
import { ArrowLeft, ArrowRight, Blocks } from 'lucide-react'

/**
 * OnboardingWizardV2
 *
 * Full-screen wizard with sidebar progress indicator.
 * Guides user through platform, pattern, stack, capabilities, and scope definition.
 *
 * Design: "The Workshop" aesthetic - warm, purposeful, developer-focused
 */

// ==============================================
// TYPES
// ==============================================

export type OnboardingWizardV2Props = {
  onComplete: (nodes: DiagramNode[], projectTitle: string) => void
  onSkip: () => void
}

// ==============================================
// STEP LABELS
// ==============================================

const STEP_LABELS = ['Platform', 'Pattern', 'Stack', 'Capabilities', 'Scope']

// ==============================================
// WIZARD CONTENT (INSIDE PROVIDER)
// ==============================================

function WizardContent({ onComplete, onSkip }: OnboardingWizardV2Props) {
  const { step, data, nextStep, prevStep, canProceed } = useWizard()
  const { nodes } = useNodeGeneration(data)

  const handleComplete = useCallback(() => {
    onComplete(nodes, data.projectTitle)
  }, [nodes, data.projectTitle, onComplete])

  const isValid = canProceed
  const isLastStep = step === 5

  // Render current step component
  const renderStep = () => {
    switch (step) {
      case 1:
        return <PlatformStep />
      case 2:
        return <PatternStep />
      case 3:
        return <StackStep />
      case 4:
        return <CapabilitiesStep />
      case 5:
        return <OutOfScopeStep />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-[var(--color-workshop-bg)]">
      {/* Refined grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(20, 184, 166, 0.08) 0%, transparent 50%),
            linear-gradient(var(--color-workshop-text) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-workshop-text) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 64px 64px, 64px 64px',
          opacity: 0.03,
        }}
      />

      {/* Sidebar with Logo + StepIndicator (hidden on mobile) */}
      <div className="hidden lg:flex w-72 flex-col border-r border-[var(--color-workshop-border)]">
        {/* Logo area - Pure typography */}
        <div className="p-6 border-b border-[var(--color-workshop-border)]">
          <Logo size="md" showTagline={true} />
        </div>

        {/* Step indicator */}
        <div className="flex-1 flex flex-col justify-center px-6">
          <StepIndicator currentStep={step} totalSteps={5} labels={STEP_LABELS} />
        </div>

        {/* Skip link at bottom */}
        <div className="p-6 border-t border-[var(--color-workshop-border)]">
          <button
            onClick={onSkip}
            className="cursor-pointer text-sm text-[var(--color-workshop-text-muted)] hover:text-[var(--color-workshop-text)] transition-colors"
          >
            Skip setup for now
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col">
        {/* Mobile header with logo */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--color-workshop-border)]">
          <LogoCompact />
          <button
            onClick={onSkip}
            className="cursor-pointer text-sm text-[var(--color-workshop-text-muted)] hover:text-[var(--color-workshop-text)] transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Step content (scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 lg:px-12 py-8 lg:py-12">
          <div className="max-w-2xl mx-auto">{renderStep()}</div>
        </div>

        {/* Footer with navigation */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-t border-[var(--color-workshop-border)] bg-[var(--color-workshop-surface)]/50 backdrop-blur-sm">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-workshop-text-muted)]
                       hover:text-[var(--color-workshop-text)] disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-200 rounded-lg hover:bg-[var(--color-workshop-elevated)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-wizard-accent)]/30"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>

          {/* Mobile step indicator */}
          <div className="flex lg:hidden gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-6 bg-[var(--color-wizard-accent)]'
                    : s < step
                      ? 'w-1.5 bg-[var(--color-wizard-accent)]/40'
                      : 'w-1.5 bg-[var(--color-workshop-border)]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={isLastStep ? handleComplete : nextStep}
            disabled={!isValid}
            className="cursor-pointer flex items-center gap-2 px-6 py-2.5 text-sm font-medium
                       bg-[var(--color-wizard-accent)] text-white rounded-lg
                       hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-lg
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-wizard-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-workshop-bg)]"
          >
            {isLastStep ? (
              <>
                Start Building
                <Blocks className="size-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==============================================
// PROVIDER WRAPPER
// ==============================================

export function OnboardingWizardV2(props: OnboardingWizardV2Props) {
  return (
    <WizardProvider onComplete={() => {}}>
      <WizardContent {...props} />
    </WizardProvider>
  )
}
