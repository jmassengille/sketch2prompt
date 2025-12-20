import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type {
  Platform,
  PrimaryPattern,
  CapabilityId,
  OutOfScopeId,
  WizardData,
  WizardStackSelection,
} from '@/core/onboarding'
import {
  buildInitialWizardData,
  buildDefaultCapabilities,
  buildDefaultOutOfScope,
} from '@/core/onboarding'

// ==============================================
// CONTEXT VALUE TYPE
// ==============================================

type WizardContextValue = {
  // State
  step: number
  data: WizardData

  // Navigation
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  canProceed: boolean

  // Data updates
  setPlatform: (platform: Platform) => void
  setPattern: (pattern: PrimaryPattern) => void
  updateStack: (stack: Partial<WizardStackSelection>) => void
  toggleCapability: (id: CapabilityId) => void
  updateCapabilityTech: (id: CapabilityId, tech: string) => void
  toggleOutOfScope: (id: OutOfScopeId) => void
  setProjectTitle: (title: string) => void

  // Completion
  handleComplete: () => void
}

// ==============================================
// CONTEXT CREATION
// ==============================================

const WizardContext = createContext<WizardContextValue | null>(null)

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) {
    throw new Error('useWizard must be used within WizardProvider')
  }
  return ctx
}

// ==============================================
// PROVIDER PROPS
// ==============================================

type WizardProviderProps = {
  children: ReactNode
  onComplete: (data: WizardData) => void
  totalSteps?: number
}

// ==============================================
// PROVIDER COMPONENT
// ==============================================

export function WizardProvider({
  children,
  onComplete,
  totalSteps = 5,
}: WizardProviderProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(buildInitialWizardData)

  // Navigation
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Data update functions
  const setPlatform = (platform: Platform) => {
    setData((prev) => ({ ...prev, platform }))
  }

  const setPattern = (pattern: PrimaryPattern) => {
    setData((prev) => ({
      ...prev,
      pattern,
      capabilities: buildDefaultCapabilities(pattern),
      outOfScope: buildDefaultOutOfScope(),
    }))
  }

  const updateStack = (stackUpdate: Partial<WizardStackSelection>) => {
    setData((prev) => ({
      ...prev,
      stack: { ...prev.stack, ...stackUpdate },
    }))
  }

  const toggleCapability = (id: CapabilityId) => {
    setData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.map((cap) =>
        cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
      ),
    }))
  }

  const updateCapabilityTech = (id: CapabilityId, tech: string) => {
    setData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.map((cap) =>
        cap.id === id ? { ...cap, selectedTech: [tech] } : cap
      ),
    }))
  }

  const toggleOutOfScope = (id: OutOfScopeId) => {
    setData((prev) => ({
      ...prev,
      outOfScope: prev.outOfScope.includes(id)
        ? prev.outOfScope.filter((item) => item !== id)
        : [...prev.outOfScope, id],
    }))
  }

  const setProjectTitle = (title: string) => {
    setData((prev) => ({ ...prev, projectTitle: title }))
  }

  // Validation per step
  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return data.platform !== null
      case 2:
        return data.pattern !== null
      case 3: {
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

        return frontendValid && backendValid
      }
      case 4:
        // Allow proceeding even with no capabilities (custom pattern)
        return true
      case 5:
        // Out of scope is optional
        return true
      default:
        return false
    }
  }, [step, data])

  // Completion
  const handleComplete = () => {
    onComplete(data)
  }

  const value: WizardContextValue = {
    step,
    data,
    setStep,
    nextStep,
    prevStep,
    canProceed,
    setPlatform,
    setPattern,
    updateStack,
    toggleCapability,
    updateCapabilityTech,
    toggleOutOfScope,
    setProjectTitle,
    handleComplete,
  }

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}
