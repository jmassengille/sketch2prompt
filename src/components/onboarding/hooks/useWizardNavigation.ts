import { useState, useCallback, useMemo } from 'react'
import type { WizardData } from '@/core/onboarding'
import { requiresAiProvider } from '@/core/onboarding'

export type UseWizardNavigationOptions = {
  totalSteps?: number
  onComplete?: () => void
}

export type UseWizardNavigationReturn = {
  step: number
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  canProceed: (data: WizardData) => boolean
  isFirstStep: boolean
  isLastStep: boolean
  progress: number
}

export function useWizardNavigation(
  options: UseWizardNavigationOptions = {}
): UseWizardNavigationReturn {
  const { totalSteps = 5, onComplete } = options
  const [step, setStep] = useState(1)

  const nextStep = useCallback(() => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else if (onComplete) {
      onComplete()
    }
  }, [step, totalSteps, onComplete])

  const prevStep = useCallback(() => {
    if (step > 1) {
      setStep(step - 1)
    }
  }, [step])

  const canProceed = useCallback(
    (data: WizardData): boolean => {
      switch (step) {
        case 1: // Platform selection
          return data.platform !== null

        case 2: // Pattern selection
          return data.pattern !== null

        case 3: { // Stack selection
          // Platform-specific requirements
          const needsFrontend = data.platform === 'web' || data.platform === 'desktop'
          const needsBackend = data.platform === 'web' || data.platform === 'api'

          // Frontend: need language + framework
          const frontendValid = !needsFrontend || (
            data.stack.frontendLanguages.length > 0 &&
            data.stack.frontendFramework !== null
          )

          // Backend: need language + framework
          const backendValid = !needsBackend || (
            data.stack.backendLanguages.length > 0 &&
            data.stack.backendFramework !== null
          )

          if (!frontendValid || !backendValid) {
            return false
          }

          if (data.pattern && requiresAiProvider(data.pattern)) {
            return data.stack.aiProvider !== null
          }
          return true
        }

        case 4: // Capabilities
          return true

        case 5: // Project title
          return data.projectTitle.trim().length > 0

        default:
          return false
      }
    },
    [step]
  )

  const isFirstStep = useMemo(() => step === 1, [step])
  const isLastStep = useMemo(() => step === totalSteps, [step, totalSteps])
  const progress = useMemo(() => step / totalSteps, [step, totalSteps])

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    canProceed,
    isFirstStep,
    isLastStep,
    progress,
  }
}
