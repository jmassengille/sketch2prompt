import { Monitor, Server, Database, Sparkles, ChevronDown, Check } from 'lucide-react'
import { useState } from 'react'
import { useWizard } from '../context/WizardContext'
import {
  getStackOptionsForPlatform,
  getAllLanguages,
  getFrameworksForLanguage,
  requiresAiProvider,
  STACK_CATEGORIES,
  STACK_OPTIONS,
} from '@/core/onboarding'

/**
 * StackStep - Two-Column Stack Builder
 *
 * Redesigned to elegantly handle fullstack projects where users need:
 * - Frontend: TypeScript + Next.js/React
 * - Backend: Python + FastAPI (or TypeScript + Express)
 *
 * Design: Side-by-side columns with visual language→framework groupings
 * Aesthetic: Blueprint precision with teal/purple accents for frontend/backend
 */

// Group frameworks by their role
const FRONTEND_FRAMEWORKS = ['nextjs', 'react-vite', 'vue', 'angular', 'svelte', 'electron', 'tauri']
const BACKEND_FRAMEWORKS = ['express', 'fastapi', 'spring-boot', 'aspnet-core', 'django', 'gin', 'actix-web', 'hono']

// Languages commonly used for each role
const FRONTEND_LANGUAGES = ['typescript', 'javascript']
const BACKEND_LANGUAGES = ['typescript', 'javascript', 'python', 'java', 'csharp', 'go', 'rust']

export function StackStep() {
  const { data, updateStack } = useWizard()
  const needsAiProvider = data.pattern ? requiresAiProvider(data.pattern) : false

  // Track expanded sections
  const [frontendExpanded, setFrontendExpanded] = useState(true)
  const [backendExpanded, setBackendExpanded] = useState(true)

  // Get all available options
  const allLanguages = getAllLanguages()
  const databaseOptions = data.platform
    ? getStackOptionsForPlatform(data.platform, STACK_CATEGORIES.database)
    : []
  const aiProviderOptions = data.platform
    ? getStackOptionsForPlatform(data.platform, STACK_CATEGORIES.aiProvider)
    : []

  // Selected languages and frameworks (separate arrays)
  const selectedFrontendLanguages = data.stack.frontendLanguages
  const selectedBackendLanguages = data.stack.backendLanguages
  const selectedFrontendFramework = data.stack.frontendFramework
  const selectedBackendFramework = data.stack.backendFramework

  // Check if framework is frontend or backend (for filtering available options)
  const isFrameworkFrontend = (frameworkId: string) => FRONTEND_FRAMEWORKS.includes(frameworkId)
  const isFrameworkBackend = (frameworkId: string) => BACKEND_FRAMEWORKS.includes(frameworkId)

  // Helper to get language IDs from labels
  const getLanguageIds = (labels: string[]) =>
    labels
      .map((label) => STACK_OPTIONS.find((o) => o.category === STACK_CATEGORIES.language && o.label === label)?.id)
      .filter((id): id is string => id !== undefined)

  // Get compatible frameworks for frontend languages
  const frontendLangIds = getLanguageIds(selectedFrontendLanguages)
  const frontendCompatibleFrameworks = data.platform
    ? getFrameworksForLanguage(data.platform, frontendLangIds)
    : []
  const frontendFrameworks = frontendCompatibleFrameworks.filter((fw) => {
    const meta = STACK_OPTIONS.find((o) => o.label === fw.label)
    return meta && isFrameworkFrontend(meta.id)
  })

  // Get compatible frameworks for backend languages
  const backendLangIds = getLanguageIds(selectedBackendLanguages)
  const backendCompatibleFrameworks = data.platform
    ? getFrameworksForLanguage(data.platform, backendLangIds)
    : []
  const backendFrameworks = backendCompatibleFrameworks.filter((fw) => {
    const meta = STACK_OPTIONS.find((o) => o.label === fw.label)
    return meta && isFrameworkBackend(meta.id)
  })

  // Toggle frontend language selection
  const toggleFrontendLanguage = (label: string) => {
    const current = data.stack.frontendLanguages
    const updated = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label]

    // Check if frontend framework is still compatible
    let newFrontendFramework = data.stack.frontendFramework
    if (newFrontendFramework && data.platform) {
      const newLangIds = getLanguageIds(updated)
      const compatibleFrameworks = getFrameworksForLanguage(data.platform, newLangIds)
      const stillValid = compatibleFrameworks.some((fw) => fw.label === newFrontendFramework)
      if (!stillValid) newFrontendFramework = null
    }

    updateStack({
      frontendLanguages: updated,
      frontendFramework: newFrontendFramework,
    })
  }

  // Toggle backend language selection
  const toggleBackendLanguage = (label: string) => {
    const current = data.stack.backendLanguages
    const updated = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label]

    // Check if backend framework is still compatible
    let newBackendFramework = data.stack.backendFramework
    if (newBackendFramework && data.platform) {
      const newLangIds = getLanguageIds(updated)
      const compatibleFrameworks = getFrameworksForLanguage(data.platform, newLangIds)
      const stillValid = compatibleFrameworks.some((fw) => fw.label === newBackendFramework)
      if (!stillValid) newBackendFramework = null
    }

    updateStack({
      backendLanguages: updated,
      backendFramework: newBackendFramework,
    })
  }

  // Select frontend framework
  const selectFrontendFramework = (label: string) => {
    updateStack({ frontendFramework: label })
  }

  // Select backend framework
  const selectBackendFramework = (label: string) => {
    updateStack({ backendFramework: label })
  }

  // Check if columns have languages selected
  const hasFrontendLanguage = selectedFrontendLanguages.length > 0
  const hasBackendLanguage = selectedBackendLanguages.length > 0

  // Platform determines if we show both columns
  const showFrontend = data.platform === 'web' || data.platform === 'desktop'
  const showBackend = data.platform === 'web' || data.platform === 'api'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2
          className="text-2xl md:text-3xl font-semibold text-[var(--color-workshop-text)] tracking-tight"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          Build your stack
        </h2>
        <p className="mt-3 text-base text-[var(--color-workshop-text-muted)] leading-relaxed max-w-md mx-auto">
          Select languages and frameworks for your project.
          {data.platform === 'web' && ' For fullstack apps, pick both frontend and backend technologies.'}
        </p>
      </div>

      {/* Two-Column Stack Builder */}
      <div className={`grid gap-6 ${showFrontend && showBackend ? 'md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
        {/* Frontend Stack Column */}
        {showFrontend && (
          <StackColumn
            title="Frontend"
            icon={<Monitor className="size-5" />}
            accentColor="teal"
            expanded={frontendExpanded}
            onToggle={() => { setFrontendExpanded(!frontendExpanded); }}
            languages={allLanguages.filter((l) => FRONTEND_LANGUAGES.includes(l.id))}
            selectedLanguages={selectedFrontendLanguages}
            onToggleLanguage={toggleFrontendLanguage}
            frameworks={frontendFrameworks}
            selectedFramework={selectedFrontendFramework}
            onSelectFramework={selectFrontendFramework}
            hasCompatibleLanguage={hasFrontendLanguage}
          />
        )}

        {/* Backend Stack Column */}
        {showBackend && (
          <StackColumn
            title="Backend"
            icon={<Server className="size-5" />}
            accentColor="purple"
            expanded={backendExpanded}
            onToggle={() => { setBackendExpanded(!backendExpanded); }}
            languages={allLanguages.filter((l) => BACKEND_LANGUAGES.includes(l.id))}
            selectedLanguages={selectedBackendLanguages}
            onToggleLanguage={toggleBackendLanguage}
            frameworks={backendFrameworks}
            selectedFramework={selectedBackendFramework}
            onSelectFramework={selectBackendFramework}
            hasCompatibleLanguage={hasBackendLanguage}
          />
        )}
      </div>

      {/* Selected Stack Summary */}
      {(selectedFrontendLanguages.length > 0 || selectedBackendLanguages.length > 0 ||
        selectedFrontendFramework || selectedBackendFramework) && (
        <div className="mt-6 p-4 bg-[var(--color-workshop-elevated)] rounded-xl border border-[var(--color-workshop-border)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-wizard-accent)] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-workshop-text-muted)]">
              Your Stack
            </span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Frontend stack */}
            {(selectedFrontendLanguages.length > 0 || selectedFrontendFramework) && (
              <>
                {selectedFrontendLanguages.map((lang) => (
                  <span
                    key={`fe-${lang}`}
                    className="px-3 py-1.5 bg-[var(--color-wizard-accent)]/10 text-[var(--color-wizard-accent)]
                               text-sm font-medium rounded-lg border border-[var(--color-wizard-accent)]/20"
                  >
                    {lang}
                  </span>
                ))}
                {selectedFrontendFramework && (
                  <>
                    <span className="text-[var(--color-workshop-text-subtle)] self-center">+</span>
                    <span
                      className="px-3 py-1.5 bg-[var(--color-wizard-accent)]/15 text-[var(--color-wizard-accent)]
                                 text-sm font-medium rounded-lg border border-[var(--color-wizard-accent)]/30"
                    >
                      {selectedFrontendFramework}
                    </span>
                  </>
                )}
              </>
            )}
            {/* Separator between frontend and backend */}
            {(selectedFrontendLanguages.length > 0 || selectedFrontendFramework) &&
             (selectedBackendLanguages.length > 0 || selectedBackendFramework) && (
              <span className="text-[var(--color-workshop-text-subtle)] self-center px-2">|</span>
            )}
            {/* Backend stack */}
            {(selectedBackendLanguages.length > 0 || selectedBackendFramework) && (
              <>
                {selectedBackendLanguages.map((lang) => (
                  <span
                    key={`be-${lang}`}
                    className="px-3 py-1.5 bg-[var(--color-block-purple)]/10 text-[var(--color-block-purple)]
                               text-sm font-medium rounded-lg border border-[var(--color-block-purple)]/20"
                  >
                    {lang}
                  </span>
                ))}
                {selectedBackendFramework && (
                  <>
                    <span className="text-[var(--color-workshop-text-subtle)] self-center">+</span>
                    <span
                      className="px-3 py-1.5 bg-[var(--color-block-purple)]/15 text-[var(--color-block-purple)]
                                 text-sm font-medium rounded-lg border border-[var(--color-block-purple)]/30"
                    >
                      {selectedBackendFramework}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Database & AI Provider - Cell-based selection */}
      <div className={`grid gap-6 ${needsAiProvider ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        <StackSelector
          label="Database"
          icon={<Database className="size-5" />}
          accentColor="amber"
          value={data.stack.database}
          options={databaseOptions}
          onChange={(val) => { updateStack({ database: val }); }}
        />

        {needsAiProvider && (
          <StackSelector
            label="AI Provider"
            icon={<Sparkles className="size-5" />}
            accentColor="amber"
            value={data.stack.aiProvider}
            options={aiProviderOptions}
            onChange={(val) => { updateStack({ aiProvider: val }); }}
            required
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// STACK COLUMN COMPONENT
// ============================================================================

type StackColumnProps = {
  title: string
  icon: React.ReactNode
  accentColor: 'teal' | 'purple'
  expanded: boolean
  onToggle: () => void
  languages: Array<{ id: string; label: string }>
  selectedLanguages: string[]
  onToggleLanguage: (label: string) => void
  frameworks: Array<{ id: string; label: string }>
  selectedFramework: string | null
  onSelectFramework: (label: string) => void
  hasCompatibleLanguage: boolean
}

function StackColumn({
  title,
  icon,
  accentColor,
  expanded,
  onToggle,
  languages,
  selectedLanguages,
  onToggleLanguage,
  frameworks,
  selectedFramework,
  onSelectFramework,
  hasCompatibleLanguage,
}: StackColumnProps) {
  const accentStyles = {
    teal: {
      bg: 'bg-[var(--color-wizard-accent)]/5',
      border: 'border-[var(--color-wizard-accent)]/20',
      text: 'text-[var(--color-wizard-accent)]/80',
      glow: 'none',
    },
    purple: {
      bg: 'bg-[var(--color-block-purple)]/5',
      border: 'border-[var(--color-block-purple)]/20',
      text: 'text-[var(--color-block-purple)]/80',
      glow: 'none',
    },
  }

  const accent = accentStyles[accentColor]
  const selectedInColumn = languages.filter((l) => selectedLanguages.includes(l.label)).length
  const frameworkSelected = frameworks.some((f) => f.label === selectedFramework)

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        expanded ? accent.border : 'border-[var(--color-workshop-border)]'
      } ${accent.bg}`}
      style={{ boxShadow: expanded ? accent.glow : 'none' }}
    >
      {/* Column Header */}
      <button
        onClick={onToggle}
        className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className={accent.text}>{icon}</div>
          <span className="font-semibold text-lg text-[var(--color-workshop-text)]">
            {title}
          </span>
          {selectedInColumn > 0 && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${accent.bg} ${accent.text}`}>
              {selectedInColumn} lang{selectedInColumn > 1 ? 's' : ''}
            </span>
          )}
          {frameworkSelected && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${accent.bg} ${accent.text}`}>
              <Check className="size-3 inline-block mr-1" />
              {selectedFramework}
            </span>
          )}
        </div>
        <ChevronDown
          className={`size-5 text-[var(--color-workshop-text-muted)] transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable Content */}
      {expanded && (
        <div className="p-4 pt-0 space-y-4 animate-in fade-in duration-200">
          {/* Languages */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-workshop-text-muted)] mb-2">
              Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.label)
                return (
                  <button
                    key={lang.id}
                    onClick={() => { onToggleLanguage(lang.label); }}
                    className={`
                      cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                      ${isSelected
                        ? `${accent.bg} ${accent.text} ${accent.border} border`
                        : 'bg-[var(--color-workshop-surface)] text-[var(--color-workshop-text-muted)] border border-transparent hover:border-[var(--color-workshop-border)] hover:text-[var(--color-workshop-text)]'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {isSelected && <Check className="size-3.5" />}
                      {lang.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Frameworks - Only show if language selected */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-workshop-text-muted)] mb-2">
              Framework
            </label>
            {!hasCompatibleLanguage ? (
              <p className="text-sm text-[var(--color-workshop-text-subtle)] italic">
                Select a language to see frameworks
              </p>
            ) : frameworks.length === 0 ? (
              <p className="text-sm text-[var(--color-workshop-text-subtle)] italic">
                No {title.toLowerCase()} frameworks for selected languages
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {frameworks.map((fw) => {
                  const isSelected = selectedFramework === fw.label
                  return (
                    <button
                      key={fw.id}
                      onClick={() => { onSelectFramework(fw.label); }}
                      className={`
                        cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                        ${isSelected
                          ? `${accent.bg} ${accent.text} ${accent.border} border ring-2 ring-offset-1 ring-offset-[var(--color-workshop-bg)] ring-current`
                          : 'bg-[var(--color-workshop-surface)] text-[var(--color-workshop-text-muted)] border border-transparent hover:border-[var(--color-workshop-border)] hover:text-[var(--color-workshop-text)]'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <Check className="size-3.5" />}
                        {fw.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// STACK SELECTOR COMPONENT - Cell-based single selection
// ============================================================================

type StackSelectorProps = {
  label: string
  icon: React.ReactNode
  accentColor: 'teal' | 'purple' | 'amber'
  value: string | null
  options: Array<{ id: string; label: string }>
  onChange: (value: string) => void
  required?: boolean
}

function StackSelector({
  label,
  icon,
  accentColor,
  value,
  options,
  onChange,
  required,
}: StackSelectorProps) {
  const accentStyles = {
    teal: {
      bg: 'bg-[var(--color-wizard-accent)]/5',
      bgSelected: 'bg-[var(--color-wizard-accent)]/10',
      border: 'border-[var(--color-wizard-accent)]/20',
      borderSelected: 'border-[var(--color-wizard-accent)]/40',
      text: 'text-[var(--color-wizard-accent)]',
      ring: 'ring-[var(--color-wizard-accent)]/30',
    },
    purple: {
      bg: 'bg-[var(--color-block-purple)]/5',
      bgSelected: 'bg-[var(--color-block-purple)]/10',
      border: 'border-[var(--color-block-purple)]/20',
      borderSelected: 'border-[var(--color-block-purple)]/40',
      text: 'text-[var(--color-block-purple)]',
      ring: 'ring-[var(--color-block-purple)]/30',
    },
    amber: {
      bg: 'bg-[var(--color-accent-warm)]/5',
      bgSelected: 'bg-[var(--color-accent-warm)]/10',
      border: 'border-[var(--color-accent-warm)]/20',
      borderSelected: 'border-[var(--color-accent-warm)]/40',
      text: 'text-[var(--color-accent-warm)]',
      ring: 'ring-[var(--color-accent-warm)]/30',
    },
  }

  const accent = accentStyles[accentColor]
  const hasSelection = value !== null && value !== ''

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        hasSelection ? accent.border : 'border-[var(--color-workshop-border)]'
      } ${accent.bg}`}
    >
      {/* Header - matches StackColumn styling */}
      <div className="flex items-center gap-3 p-4 pb-0">
        <div className={hasSelection ? accent.text : 'text-[var(--color-workshop-text-muted)]'}>
          {icon}
        </div>
        <span className="font-semibold text-lg text-[var(--color-workshop-text)]">
          {label}
        </span>
        {required && <span className="text-[var(--color-wizard-accent)] text-sm">*</span>}
        {hasSelection && (
          <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${accent.bgSelected} ${accent.text}`}>
            <Check className="size-3 inline-block mr-1" />
            {value}
          </span>
        )}
      </div>

      {/* Selection cells */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const isSelected = value === opt.label
            return (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.label); }}
                className={`
                  cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isSelected
                    ? `${accent.bgSelected} ${accent.text} ${accent.borderSelected} border ring-2 ring-offset-1 ring-offset-[var(--color-workshop-bg)] ${accent.ring}`
                    : 'bg-[var(--color-workshop-surface)] text-[var(--color-workshop-text-muted)] border border-transparent hover:border-[var(--color-workshop-border)] hover:text-[var(--color-workshop-text)]'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {isSelected && <Check className="size-3.5" />}
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
