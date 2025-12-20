import { useState, useEffect } from 'react'
import { Layers, Plus } from 'lucide-react'

export function EmptyCanvasState() {
  const [showHint, setShowHint] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setShowHint(true), 2000)
    const fadeTimer = setTimeout(() => setFadeOut(true), 8000)
    const hideTimer = setTimeout(() => setShowHint(false), 9000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Floating hint positioned toward top-right, pointing to Quick Start */}
      {showHint && (
        <div
          className={`absolute top-24 right-8 sm:right-12 flex items-end gap-2 transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
          style={{ animation: 'fadeSlideIn 0.5s ease-out' }}
        >
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] text-[var(--color-workshop-text-subtle)] tracking-wide">
              new here?
            </span>
            <span className="text-xs text-[var(--color-workshop-text-muted)]">
              try <span className="text-[var(--color-workshop-text)]">Quick Start</span> →
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="p-4 rounded-full bg-[var(--color-workshop-elevated)] border border-[var(--color-workshop-border)] animate-in fade-in duration-500">
          <Layers className="h-8 w-8 text-[var(--color-workshop-text-muted)]" />
        </div>

        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <h3 className="text-lg font-semibold text-[var(--color-workshop-text)]">
            No components yet
          </h3>
          <p className="text-sm text-[var(--color-workshop-text-muted)] leading-relaxed">
            Start defining your system architecture by adding components.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--color-workshop-text-muted)] bg-[var(--color-workshop-elevated)]/50 px-3 py-2 rounded-md animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
          <Plus className="h-3.5 w-3.5" />
          <span>Click the</span>
          <kbd className="px-1.5 py-0.5 bg-[var(--color-workshop-bg)] rounded border border-[var(--color-workshop-border)] font-mono text-[10px]">+</kbd>
          <span>button or press</span>
          <kbd className="px-1.5 py-0.5 bg-[var(--color-workshop-bg)] rounded border border-[var(--color-workshop-border)] font-mono text-[10px]">1-6</kbd>
        </div>
      </div>
    </div>
  )
}
