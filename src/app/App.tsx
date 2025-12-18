import { useState, useEffect, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import { FileOutput, Undo2, Redo2, Sun, Moon, Sparkles } from 'lucide-react'
import { Canvas } from '../components/Canvas'
import { Toolbar } from '../components/Toolbar'
import { Inspector } from '../components/Inspector'
import { ExportDrawer } from '../components/ExportDrawer'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { OnboardingWizard } from '../components/OnboardingWizard'
import { useTemporalStore, useStore } from '../core/store'
import type { DiagramNode } from '../core/types'

const ONBOARDING_STORAGE_KEY = 'sketch2prompt:onboarding-completed'

export function App() {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Show onboarding if not completed before
    if (typeof window === 'undefined') return false
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true'
  })
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  )

  const setNodes = useStore((state) => state.setNodes)
  const nodesCount = useStore((state) => state.nodes.length)

  // Use shallow comparison to prevent unnecessary re-renders
  const { undo, redo, pastStates, futureStates } = useTemporalStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      pastStates: state.pastStates,
      futureStates: state.futureStates,
    }))
  )

  // Toggle dark mode class on html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Handle wizard completion - populate canvas with generated nodes
  const handleOnboardingComplete = useCallback(
    (nodes: DiagramNode[]) => {
      setNodes(nodes)
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
      setShowOnboarding(false)
    },
    [setNodes]
  )

  // Handle wizard skip - just mark as completed
  const handleSkipOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    setShowOnboarding(false)
  }, [])

  // Handle showing onboarding again (for new project)
  const handleShowOnboarding = useCallback(() => {
    setShowOnboarding(true)
  }, [])

  // Keyboard shortcuts for undo/redo and escape for onboarding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
      // Escape to skip onboarding
      if (e.key === 'Escape' && showOnboarding) {
        handleSkipOnboarding()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [undo, redo, showOnboarding, handleSkipOnboarding])

  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-text">sketch2prompt</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                undo()
              }}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                redo()
              }}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-muted"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* New Project button - only show when canvas is empty or user might want to restart */}
          {nodesCount === 0 && (
            <button
              onClick={handleShowOnboarding}
              title="Start with guided setup"
              className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-500 transition-colors hover:bg-cyan-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Quick Start
            </button>
          )}
          <button
            onClick={() => {
              setIsDark(!isDark)
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              setIsExportOpen(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <FileOutput className="h-4 w-4" />
            Export
          </button>
        </div>
      </header>

      <ErrorBoundary>
        <ReactFlowProvider>
          <main className="flex flex-1 overflow-hidden">
            <aside className="w-14 border-r border-border bg-bg-secondary">
              <Toolbar />
            </aside>

            <div className="flex-1">
              <Canvas colorMode={isDark ? 'dark' : 'light'} />
            </div>

            <aside className="w-72 border-l border-border bg-bg-secondary">
              <Inspector />
            </aside>
          </main>
        </ReactFlowProvider>
      </ErrorBoundary>

      <ExportDrawer
        isOpen={isExportOpen}
        onClose={() => {
          setIsExportOpen(false)
        }}
      />

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}
    </div>
  )
}
