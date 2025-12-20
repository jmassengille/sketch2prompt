import { useState, useEffect, useCallback } from 'react'
import { MousePointer2, ArrowRight, Link2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FirstLaunchOverlayProps {
  projectName: string
  componentCount: number
  onDismiss: () => void
}

export function FirstLaunchOverlay({
  projectName,
  componentCount,
  onDismiss,
}: FirstLaunchOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [stage, setStage] = useState(0)

  // Staged reveal animation
  useEffect(() => {
    const timers = [
      setTimeout(() => setIsVisible(true), 50),
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 400),
      setTimeout(() => setStage(3), 600),
      setTimeout(() => setStage(4), 800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss()
    }, 400)
  }, [onDismiss])

  // Dismiss on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDismiss])

  const tips = [
    {
      icon: <MousePointer2 className="size-4" />,
      text: 'Drag to arrange your architecture',
      color: 'var(--color-block-purple)',
    },
    {
      icon: <Link2 className="size-4" />,
      text: 'Connect nodes to map data flow',
      color: 'var(--color-block-cyan)',
    },
    {
      icon: <Sparkles className="size-4" />,
      text: 'Generate rules for AI assistants',
      color: 'var(--color-block-yellow)',
    },
  ]

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center transition-all duration-500',
        isVisible && !isExiting ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleDismiss}
    >
      {/* Backdrop with radial gradient */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%,
              rgba(20, 184, 166, 0.08) 0%,
              rgba(9, 9, 11, 0.98) 70%
            ),
            var(--color-workshop-bg)
          `,
        }}
      />

      {/* Animated grid pattern */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-1000',
          stage >= 1 ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent)',
        }}
      />

      {/* Floating accent blocks - decorative geometry */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left block cluster */}
        <div
          className={cn(
            'absolute w-3 h-8 rounded-sm transition-all duration-700',
            stage >= 2 ? 'opacity-40 translate-y-0' : 'opacity-0 -translate-y-4'
          )}
          style={{
            background: 'var(--color-block-purple)',
            top: '15%',
            left: '20%',
            transform: `rotate(-12deg) ${stage >= 2 ? 'translateY(0)' : 'translateY(-16px)'}`,
          }}
        />
        <div
          className={cn(
            'absolute w-4 h-4 rounded-sm transition-all duration-700 delay-100',
            stage >= 2 ? 'opacity-30 translate-y-0' : 'opacity-0 -translate-y-4'
          )}
          style={{
            background: 'var(--color-block-cyan)',
            top: '18%',
            left: '22%',
          }}
        />

        {/* Top-right block */}
        <div
          className={cn(
            'absolute w-5 h-5 rounded-sm transition-all duration-700 delay-200',
            stage >= 2 ? 'opacity-35 translate-y-0' : 'opacity-0 -translate-y-4'
          )}
          style={{
            background: 'var(--color-block-yellow)',
            top: '20%',
            right: '18%',
            transform: 'rotate(15deg)',
          }}
        />

        {/* Bottom blocks */}
        <div
          className={cn(
            'absolute w-6 h-3 rounded-sm transition-all duration-700 delay-300',
            stage >= 2 ? 'opacity-25 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{
            background: 'var(--color-block-blue)',
            bottom: '25%',
            left: '15%',
            transform: 'rotate(-8deg)',
          }}
        />
        <div
          className={cn(
            'absolute w-4 h-6 rounded-sm transition-all duration-700 delay-150',
            stage >= 2 ? 'opacity-30 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{
            background: 'var(--color-block-pink)',
            bottom: '22%',
            right: '22%',
            transform: 'rotate(20deg)',
          }}
        />
      </div>

      {/* Content card */}
      <div
        className={cn(
          'relative z-10 max-w-lg w-full mx-6 transition-all duration-600',
          isVisible && !isExiting
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card glow effect */}
        <div
          className={cn(
            'absolute -inset-px rounded-2xl transition-opacity duration-700',
            stage >= 1 ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), transparent 50%, rgba(124, 58, 237, 0.15))',
            filter: 'blur(1px)',
          }}
        />

        {/* Main card */}
        <div
          className="relative rounded-2xl border border-[var(--color-workshop-border)] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, var(--color-workshop-surface) 0%, rgba(19, 19, 22, 0.95) 100%)',
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.03),
              0 24px 48px rgba(0, 0, 0, 0.5),
              0 0 80px rgba(20, 184, 166, 0.1)
            `,
          }}
        >
          {/* Top accent line */}
          <div
            className={cn(
              'h-px transition-all duration-700',
              stage >= 1 ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              background: 'linear-gradient(90deg, transparent, var(--color-wizard-accent), transparent)',
            }}
          />

          <div className="p-8 md:p-10">
            {/* Success indicator with animated blocks */}
            <div
              className={cn(
                'flex items-center gap-4 mb-8 transition-all duration-500',
                stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}
            >
              {/* Geometric icon - stacked blocks */}
              <div className="relative w-14 h-14">
                {/* Base block */}
                <div
                  className={cn(
                    'absolute bottom-0 left-1 w-8 h-5 rounded-sm transition-all duration-500',
                    stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  )}
                  style={{
                    background: 'var(--color-block-cyan)',
                    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.4)',
                  }}
                />
                {/* Middle block */}
                <div
                  className={cn(
                    'absolute bottom-4 left-3 w-6 h-6 rounded-sm transition-all duration-500 delay-75',
                    stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  )}
                  style={{
                    background: 'var(--color-block-purple)',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
                  }}
                />
                {/* Top block - the crown */}
                <div
                  className={cn(
                    'absolute bottom-9 left-5 w-4 h-4 rounded-sm transition-all duration-500 delay-150',
                    stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  )}
                  style={{
                    background: 'var(--color-block-yellow)',
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)',
                  }}
                />
              </div>

              <div>
                <div
                  className="text-xs font-medium tracking-widest uppercase mb-1"
                  style={{
                    color: 'var(--color-wizard-accent)',
                    fontFamily: 'var(--font-family-mono)',
                  }}
                >
                  Foundation Complete
                </div>
                <div
                  className="text-sm text-[var(--color-workshop-text-muted)]"
                  style={{ fontFamily: 'var(--font-family-sans)' }}
                >
                  {componentCount} component{componentCount !== 1 ? 's' : ''} scaffolded
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2
              className={cn(
                'text-3xl md:text-4xl font-semibold leading-tight mb-4 transition-all duration-500 delay-100',
                stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              <span className="text-[var(--color-workshop-text)]">
                {projectName || 'Your system'}
              </span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--color-wizard-accent), var(--color-block-cyan))',
                }}
              >
                is ready to build
              </span>
            </h2>

            <p
              className={cn(
                'text-[var(--color-workshop-text-muted)] leading-relaxed mb-8 max-w-md transition-all duration-500 delay-150',
                stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}
              style={{ fontFamily: 'var(--font-family-sans)' }}
            >
              Arrange your architecture, connect the pieces, then generate the rules AI coding assistants will follow.
            </p>

            {/* Tips - horizontal layout */}
            <div
              className={cn(
                'grid grid-cols-3 gap-4 mb-8 transition-all duration-500 delay-200',
                stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}
            >
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="group flex flex-col items-center text-center p-3 rounded-xl transition-all duration-300 hover:bg-white/[0.02]"
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg mb-2 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${tip.color} 15%, transparent)`,
                      color: tip.color,
                      boxShadow: `0 0 20px color-mix(in srgb, ${tip.color} 20%, transparent)`,
                    }}
                  >
                    {tip.icon}
                  </div>
                  <span
                    className="text-xs text-[var(--color-workshop-text-muted)] leading-snug"
                    style={{ fontFamily: 'var(--font-family-sans)' }}
                  >
                    {tip.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleDismiss}
              className={cn(
                'group w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 cursor-pointer',
                stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}
              style={{
                background: 'linear-gradient(135deg, var(--color-wizard-accent), #0D9488)',
                color: 'white',
                boxShadow: `
                  0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                  0 4px 16px rgba(20, 184, 166, 0.3),
                  0 8px 32px rgba(20, 184, 166, 0.2)
                `,
                fontFamily: 'var(--font-family-display)',
              }}
            >
              <span>Start Building</span>
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {/* Dismiss hint */}
            <p
              className={cn(
                'text-center text-xs mt-5 transition-all duration-500 delay-300',
                stage >= 4 ? 'opacity-60' : 'opacity-0'
              )}
              style={{
                color: 'var(--color-workshop-text-subtle)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              Press{' '}
              <kbd
                className="px-1.5 py-0.5 rounded bg-[var(--color-workshop-elevated)] text-[var(--color-workshop-text-muted)] text-[10px] border border-[var(--color-workshop-border)]"
              >
                Esc
              </kbd>
              {' '}or click anywhere to dismiss
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
