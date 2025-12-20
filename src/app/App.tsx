import { useState, useEffect, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import { FileOutput, Undo2, Redo2, Play, Search, Github } from 'lucide-react'
import { Canvas } from '../components/Canvas'
import { Inspector } from '../components/Inspector'
import { ExportDrawer } from '../components/ExportDrawer'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { OnboardingWizardV2 } from '../components/onboarding'
import { FirstLaunchOverlay } from '../components/FirstLaunchOverlay'
import { CommandPalette } from '../components/CommandPalette'
import { QuickAddMenu } from '../components/QuickAddMenu'
import { useTemporalStore, useStore } from '../core/store'
import { useSettingsStore } from '../core/settings'
import { autoGenerateEdges } from '../core/auto-edges'
import { useUIStore } from '../core/ui-store'
import { useKeyboardShortcuts, SHORTCUT_KEYS } from '../hooks/useKeyboardShortcuts'
import type { DiagramNode, NodeType } from '../core/types'

const ONBOARDING_STORAGE_KEY = 'sketch2prompt:onboarding-completed'

export function App() {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  )
  const [showFirstLaunch, setShowFirstLaunch] = useState(false)
  const [firstLaunchData, setFirstLaunchData] = useState<{ projectName: string; componentCount: number } | null>(null)

  const setNodes = useStore((state) => state.setNodes)
  const setEdges = useStore((state) => state.setEdges)
  const addNode = useStore((state) => state.addNode)
  const nodes = useStore((state) => state.nodes)
  const selectedNode = useStore((state) => state.nodes.find((n) => n.selected))
  const selectedEdge = useStore((state) => state.edges.find((e) => e.selected))
  const nodesCount = nodes.length

  const setProjectName = useSettingsStore((state) => state.setProjectName)

  const openCommandPalette = useUIStore((state) => state.openCommandPalette)
  const closeAllMenus = useUIStore((state) => state.closeAllMenus)
  const openQuickAdd = useUIStore((state) => state.openQuickAdd)
  const isCommandPaletteOpen = useUIStore((state) => state.isCommandPaletteOpen)
  const isQuickAddOpen = useUIStore((state) => state.isQuickAddOpen)

  const { undo, redo, pastStates, futureStates } = useTemporalStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      pastStates: state.pastStates,
      futureStates: state.futureStates,
    }))
  )

  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0
  const hasSelection = selectedNode ?? selectedEdge

  const getCenterPosition = useCallback(() => {
    if (nodes.length === 0) {
      return { x: 400, y: 300 }
    }
    const avgX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length
    const avgY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length
    return { x: avgX + 50, y: avgY + 50 }
  }, [nodes])

  const handleAddNode = useCallback(
    (type: NodeType) => {
      const position = getCenterPosition()
      addNode(type, position)
    },
    [addNode, getCenterPosition]
  )

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  const handleOpenExport = useCallback(() => {
    setIsExportOpen(true)
  }, [])

  const handleShowOnboarding = useCallback(() => {
    setShowOnboarding(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const handleOnboardingComplete = useCallback(
    (generatedNodes: DiagramNode[], title: string) => {
      setNodes(generatedNodes)
      // Auto-generate edges based on component types
      const edges = autoGenerateEdges(generatedNodes)
      setEdges(edges)
      setProjectName(title)
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
      setShowOnboarding(false)
      // Show first launch overlay with context
      setFirstLaunchData({ projectName: title, componentCount: generatedNodes.length })
      setShowFirstLaunch(true)
    },
    [setNodes, setEdges, setProjectName]
  )

  const handleDismissFirstLaunch = useCallback(() => {
    setShowFirstLaunch(false)
    setFirstLaunchData(null)
  }, [])

  const handleSkipOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    setShowOnboarding(false)
  }, [])

  useKeyboardShortcuts(
    [
      {
        key: SHORTCUT_KEYS.COMMAND_PALETTE,
        ctrl: true,
        action: () => { openCommandPalette() },
        description: 'Open command palette',
      },
      {
        key: SHORTCUT_KEYS.QUICK_ADD,
        action: () => { openQuickAdd() },
        description: 'Open quick add menu',
      },
      {
        key: '+',
        action: () => { openQuickAdd() },
        description: 'Open quick add menu',
      },
      {
        key: SHORTCUT_KEYS.UNDO,
        ctrl: true,
        action: () => { if (canUndo) undo() },
        description: 'Undo',
      },
      {
        key: SHORTCUT_KEYS.REDO,
        ctrl: true,
        shift: true,
        action: () => { if (canRedo) redo() },
        description: 'Redo',
      },
      {
        key: SHORTCUT_KEYS.EXPORT,
        ctrl: true,
        action: () => { handleOpenExport() },
        description: 'Open export drawer',
      },
      {
        key: SHORTCUT_KEYS.DUPLICATE,
        ctrl: true,
        action: () => { handleToggleTheme() },
        description: 'Toggle dark mode',
      },
      {
        key: SHORTCUT_KEYS.ESCAPE,
        action: () => {
          if (isCommandPaletteOpen || isQuickAddOpen) {
            closeAllMenus()
          } else if (showOnboarding) {
            handleSkipOnboarding()
          }
        },
        description: 'Close menus or skip onboarding',
        when: () => true,
      },
      {
        key: SHORTCUT_KEYS.ADD_FRONTEND,
        action: () => { handleAddNode('frontend') },
        description: 'Add frontend node',
      },
      {
        key: SHORTCUT_KEYS.ADD_BACKEND,
        action: () => { handleAddNode('backend') },
        description: 'Add backend node',
      },
      {
        key: SHORTCUT_KEYS.ADD_STORAGE,
        action: () => { handleAddNode('storage') },
        description: 'Add storage node',
      },
      {
        key: SHORTCUT_KEYS.ADD_AUTH,
        action: () => { handleAddNode('auth') },
        description: 'Add auth node',
      },
      {
        key: SHORTCUT_KEYS.ADD_EXTERNAL,
        action: () => { handleAddNode('external') },
        description: 'Add external node',
      },
      {
        key: SHORTCUT_KEYS.ADD_BACKGROUND,
        action: () => { handleAddNode('background') },
        description: 'Add background node',
      },
    ],
    !showOnboarding
  )

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="relative flex h-14 items-center justify-between border-b border-[var(--color-workshop-border)] px-5 bg-[var(--color-workshop-surface)]/95 backdrop-blur-md">
        {/* Subtle top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-wizard-accent)]/20 to-transparent" />

        <div className="flex items-center gap-6">
          {/* Logo + Title */}
          <h1
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            <span className="text-[var(--color-workshop-text)]">sketch</span>
            <span className="text-[var(--color-wizard-accent)]">2</span>
            <span className="text-[var(--color-workshop-text)]">prompt</span>
          </h1>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-[var(--color-workshop-border)]" />

          {/* Search */}
          <button
            onClick={() => { openCommandPalette() }}
            title="Search commands (Ctrl+K)"
            className="flex items-center gap-3 rounded-lg border border-[var(--color-workshop-border)] bg-[var(--color-workshop-bg)]/60 px-3.5 py-2 text-[13px] text-[var(--color-workshop-text-muted)] transition-all duration-200 hover:border-[var(--color-workshop-border-accent)] hover:bg-[var(--color-workshop-elevated)] hover:text-[var(--color-workshop-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wizard-accent)]/50 cursor-pointer group"
          >
            <Search className="h-4 w-4 transition-colors group-hover:text-[var(--color-wizard-accent)]" />
            <span className="hidden sm:inline">Search commands...</span>
            <kbd className="hidden rounded bg-[var(--color-workshop-elevated)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-workshop-text-subtle)] border border-[var(--color-workshop-border)] sm:inline-block">
              ⌘K
            </kbd>
          </button>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 border-l border-[var(--color-workshop-border)] pl-4">
            <button
              onClick={() => { undo() }}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="rounded-md p-2 text-[var(--color-workshop-text-muted)] transition-all duration-150 hover:bg-[var(--color-workshop-elevated)] hover:text-[var(--color-workshop-text)] disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-wizard-accent)]/50 cursor-pointer"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => { redo() }}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="rounded-md p-2 text-[var(--color-workshop-text-muted)] transition-all duration-150 hover:bg-[var(--color-workshop-elevated)] hover:text-[var(--color-workshop-text)] disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-wizard-accent)]/50 cursor-pointer"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Start button (only when empty) */}
          {nodesCount === 0 && (
            <button
              onClick={handleShowOnboarding}
              title="Start with guided setup"
              className="flex items-center gap-2 rounded-lg border border-[var(--color-wizard-accent)]/30 bg-[var(--color-wizard-accent)]/10 px-3.5 py-2 text-[13px] font-medium text-[var(--color-wizard-accent)] transition-all duration-200 hover:bg-[var(--color-wizard-accent)]/20 hover:border-[var(--color-wizard-accent)]/50 hover:shadow-[var(--shadow-glow-subtle)] cursor-pointer"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Start</span>
            </button>
          )}

          {/* GitHub link */}
          <a
            href="https://github.com/jmassengille/sketch2prompt"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            className="group relative flex items-center justify-center rounded-lg p-2.5 text-[var(--color-workshop-text-muted)] transition-all duration-200 hover:text-[var(--color-workshop-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-wizard-accent)]/50"
          >
            <div className="absolute inset-0 rounded-lg bg-[var(--color-wizard-accent)]/0 transition-all duration-300 group-hover:bg-[var(--color-wizard-accent)]/10 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]" />
            <Github className="relative h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          </a>

          {/* Divider */}
          <div className="h-6 w-px bg-[var(--color-workshop-border)]" />

          {/* Generate button - primary CTA */}
          <button
            onClick={handleOpenExport}
            title="Generate blueprint files for AI assistants"
            className="flex items-center gap-2 rounded-lg bg-[var(--color-wizard-accent)] px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[var(--color-wizard-accent)]/90 hover:shadow-[var(--shadow-glow-subtle)] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[var(--color-wizard-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-workshop-bg)] cursor-pointer shadow-md"
          >
            <FileOutput className="h-4 w-4" />
            <span className="hidden sm:inline">Generate</span>
          </button>
        </div>
      </header>

      <ErrorBoundary>
        <ReactFlowProvider>
          <main className="relative flex flex-1 overflow-hidden">
            <div className="flex-1">
              <Canvas colorMode={isDark ? 'dark' : 'light'} />
            </div>

            <aside
              className={`
                absolute right-0 top-0 h-full w-80
                border-l border-[var(--color-workshop-border)]
                bg-[var(--color-workshop-surface)]
                shadow-lg
                transition-transform duration-200 ease-out
                ${hasSelection ? 'translate-x-0' : 'translate-x-full'}
              `}
            >
              <Inspector />
            </aside>
          </main>
        </ReactFlowProvider>
      </ErrorBoundary>

      <ExportDrawer
        isOpen={isExportOpen}
        onClose={() => { setIsExportOpen(false) }}
      />

      <CommandPalette
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenExport={handleOpenExport}
        onShowOnboarding={handleShowOnboarding}
      />

      <QuickAddMenu />

      {showOnboarding && (
        <OnboardingWizardV2
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}

      {showFirstLaunch && firstLaunchData && (
        <FirstLaunchOverlay
          projectName={firstLaunchData.projectName}
          componentCount={firstLaunchData.componentCount}
          onDismiss={handleDismissFirstLaunch}
        />
      )}
    </div>
  )
}
