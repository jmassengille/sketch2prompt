/**
 * Typography-only Logo for sketch2prompt
 *
 * Design: Variable weight wordmark with the "2" as a distinctive
 * accent element in teal with subtle glow effect.
 *
 * Aesthetic: Technical precision meets playful energy
 */

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

const sizes = {
  sm: {
    text: 'text-lg',
    numeral: 'text-xl',
    tagline: 'text-[10px]',
    gap: 'gap-0',
  },
  md: {
    text: 'text-2xl',
    numeral: 'text-3xl',
    tagline: 'text-xs',
    gap: 'gap-0.5',
  },
  lg: {
    text: 'text-3xl',
    numeral: 'text-4xl',
    tagline: 'text-sm',
    gap: 'gap-1',
  },
}

export function Logo({ size = 'md', showTagline = true }: LogoProps) {
  const s = sizes[size]

  return (
    <div className="flex flex-col">
      <h1
        className={`font-sans tracking-tight flex items-baseline ${s.gap}`}
        style={{ fontFamily: 'var(--font-family-display)' }}
      >
        {/* "sketch" - light weight, muted color */}
        <span
          className={`font-light text-[var(--color-workshop-text-muted)] ${s.text}`}
        >
          sketch
        </span>

        {/* "2" - bold, teal accent with glow */}
        <span className="relative inline-flex items-center justify-center mx-0.5">
          {/* Glow layer */}
          <span
            className="absolute inset-0 blur-lg opacity-60"
            style={{
              background: 'var(--color-wizard-accent)',
              borderRadius: '50%',
              transform: 'scale(1.5)',
            }}
            aria-hidden="true"
          />
          {/* Numeral */}
          <span
            className={`relative font-black text-[var(--color-wizard-accent)] ${s.numeral}`}
            style={{
              textShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
            }}
          >
            2
          </span>
        </span>

        {/* "prompt" - medium weight, brighter color */}
        <span
          className={`font-medium text-[var(--color-workshop-text)] ${s.text}`}
        >
          prompt
        </span>
      </h1>

      {/* Tagline */}
      {showTagline && (
        <p
          className={`text-[var(--color-workshop-text-subtle)] font-medium tracking-wide ${s.tagline}`}
          style={{ fontFamily: 'var(--font-family-mono)' }}
        >
          Plan before you build
        </p>
      )}
    </div>
  )
}

/**
 * Compact logo variant for header/inline use
 */
export function LogoCompact() {
  return (
    <span
      className="font-sans tracking-tight inline-flex items-baseline"
      style={{ fontFamily: 'var(--font-family-display)' }}
    >
      <span className="font-light text-[var(--color-workshop-text-muted)] text-base">
        sketch
      </span>
      <span
        className="font-black text-[var(--color-wizard-accent)] text-lg mx-px"
        style={{ textShadow: '0 0 12px rgba(20, 184, 166, 0.4)' }}
      >
        2
      </span>
      <span className="font-medium text-[var(--color-workshop-text)] text-base">
        prompt
      </span>
    </span>
  )
}
