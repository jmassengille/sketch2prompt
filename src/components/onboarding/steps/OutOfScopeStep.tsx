import { useWizard } from '../context/WizardContext'
import { OUT_OF_SCOPE_CONFIGS } from '@/core/onboarding'

export function OutOfScopeStep() {
  const { data, toggleOutOfScope, setProjectTitle } = useWizard()

  return (
    <div className="space-y-10">
      {/* Project Name Input */}
      <div className="text-center space-y-4">
        <h2
          className="text-2xl md:text-3xl font-semibold text-[var(--color-workshop-text)] tracking-tight"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          Name your project
        </h2>
        <input
          type="text"
          value={data.projectTitle}
          onChange={(e) => { setProjectTitle(e.target.value); }}
          placeholder="My Awesome Project"
          className="w-full max-w-lg mx-auto block px-5 py-4
                     bg-[var(--color-workshop-surface)] border border-[var(--color-workshop-border)] rounded-xl
                     text-2xl text-[var(--color-workshop-text)] text-center font-medium
                     placeholder:text-[var(--color-workshop-text-muted)]/50
                     focus:outline-none focus:border-[var(--color-wizard-accent)]/50 focus:ring-2 focus:ring-[var(--color-wizard-accent)]/20
                     transition-all duration-200 hover:border-[var(--color-workshop-border-accent)]"
          style={{ fontFamily: 'var(--font-family-display)' }}
        />
      </div>

      {/* Out of Scope Section */}
      <div className="space-y-5 max-w-xl mx-auto">
        <div className="text-center">
          <h3
            className="text-xl font-semibold text-[var(--color-workshop-text)]"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            What's out of scope?
          </h3>
          <p className="text-base text-[var(--color-workshop-text-muted)] mt-2 leading-relaxed">
            These are{' '}
            <span className="text-[var(--color-wizard-accent)] font-medium">
              intentionally excluded
            </span>{' '}
            from v1. Uncheck to include.
          </p>
        </div>

        <div className="space-y-3">
          {OUT_OF_SCOPE_CONFIGS.map((config) => {
            const isExcluded = data.outOfScope.includes(config.id)
            return (
              <label
                key={config.id}
                className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer
                           border transition-all duration-200
                           ${
                             isExcluded
                               ? 'border-[var(--color-workshop-border)] bg-[var(--color-workshop-surface)] hover:border-[var(--color-workshop-border-accent)]'
                               : 'border-[var(--color-block-yellow)]/40 bg-[var(--color-block-yellow)]/10'
                           }`}
              >
                <input
                  type="checkbox"
                  checked={isExcluded}
                  onChange={() => { toggleOutOfScope(config.id); }}
                  className="mt-1 w-5 h-5 rounded border-[var(--color-workshop-border)] bg-[var(--color-workshop-surface)]
                             text-[var(--color-wizard-accent)]
                             focus:ring-[var(--color-wizard-accent)]/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-[var(--color-workshop-text)]">
                    {config.label}
                  </div>
                  <div className="text-sm text-[var(--color-workshop-text-muted)] mt-1 leading-relaxed">
                    {config.rationale}
                  </div>
                  {!isExcluded && config.inclusionWarning && (
                    <div className="text-sm text-[var(--color-block-yellow)] mt-2 font-medium">
                      Note: {config.inclusionWarning}
                    </div>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
