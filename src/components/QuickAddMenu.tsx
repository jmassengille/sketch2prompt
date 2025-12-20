import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../core/ui-store'
import { useStore } from '../core/store'
import type { NodeType } from '../core/types'
import type { XYPosition } from '@xyflow/react'
import { NODE_OPTIONS } from '../core/node-options'

// Color classes for each node type - modernized
const NODE_COLOR_CLASSES: Record<NodeType, {
  bg: string
  bgHover: string
  text: string
  border: string
  icon: string
}> = {
  frontend: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    bgHover: 'hover:bg-blue-100 dark:hover:bg-blue-900/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200/70 dark:border-blue-700/50',
    icon: 'text-blue-500 dark:text-blue-400',
  },
  backend: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    bgHover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200/70 dark:border-emerald-700/50',
    icon: 'text-emerald-500 dark:text-emerald-400',
  },
  storage: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    bgHover: 'hover:bg-amber-100 dark:hover:bg-amber-900/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200/70 dark:border-amber-700/50',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  auth: {
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    bgHover: 'hover:bg-violet-100 dark:hover:bg-violet-900/60',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200/70 dark:border-violet-700/50',
    icon: 'text-violet-500 dark:text-violet-400',
  },
  external: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
    bgHover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/60',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200/70 dark:border-cyan-700/50',
    icon: 'text-cyan-500 dark:text-cyan-400',
  },
  background: {
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    bgHover: 'hover:bg-orange-100 dark:hover:bg-orange-900/60',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200/70 dark:border-orange-700/50',
    icon: 'text-orange-500 dark:text-orange-400',
  },
}

export function QuickAddMenu() {
  const isOpen = useUIStore((state) => state.isQuickAddOpen)
  const position = useUIStore((state) => state.quickAddPosition)
  const closeQuickAdd = useUIStore((state) => state.closeQuickAdd)
  const addNode = useStore((state) => state.addNode)
  const nodes = useStore((state) => state.nodes)
  const menuRef = useRef<HTMLDivElement>(null)

  // Calculate position for new node
  const getNodePosition = useCallback((): XYPosition => {
    if (position) {
      return position
    }
    if (nodes.length === 0) {
      return { x: 400, y: 300 }
    }
    const avgX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length
    const avgY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length
    return { x: avgX + 80, y: avgY + 80 }
  }, [position, nodes])

  const handleAddNode = useCallback(
    (type: NodeType) => {
      const pos = getNodePosition()
      addNode(type, pos)
      closeQuickAdd()
    },
    [addNode, getNodePosition, closeQuickAdd]
  )

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeQuickAdd()
        return
      }

      const numKey = parseInt(e.key)
      if (numKey >= 1 && numKey <= 6) {
        e.preventDefault()
        const option = NODE_OPTIONS[numKey - 1]
        if (option) {
          handleAddNode(option.type)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [isOpen, closeQuickAdd, handleAddNode])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeQuickAdd()
      }
    }

    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeQuickAdd])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-[3px] animate-in fade-in duration-200"
        onClick={closeQuickAdd}
      />

      {/* Modal */}
      <div
        ref={menuRef}
        className="
          relative z-50
          rounded-2xl
          border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-900
          p-5
          shadow-2xl
          animate-in scale-in fade-in duration-200
          min-w-[340px]
        "
      >
        {/* Close button */}
        <button
          onClick={closeQuickAdd}
          className="
            absolute -right-2.5 -top-2.5
            rounded-full
            border border-slate-200 dark:border-slate-700
            bg-white dark:bg-slate-800
            p-1.5
            text-slate-400 dark:text-slate-500
            shadow-md
            hover:text-slate-600 dark:hover:text-slate-300
            hover:bg-slate-50 dark:hover:bg-slate-700
            transition-all duration-150
            cursor-pointer
          "
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-4 text-center">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Quick Add Component
          </h3>
        </div>

        {/* Grid of options */}
        <div className="grid grid-cols-3 gap-2.5">
          {NODE_OPTIONS.map((option, index) => {
            const Icon = option.icon
            const colors = NODE_COLOR_CLASSES[option.type]
            const delayClass = `delay-${String((index + 1) * 50)}`

            return (
              <button
                key={option.type}
                onClick={() => { handleAddNode(option.type) }}
                className={`
                  group flex flex-col items-center gap-2 rounded-xl border p-4
                  transition-all duration-150
                  cursor-pointer
                  animate-in fade-in ${delayClass}
                  ${colors.bg} ${colors.bgHover} ${colors.border}
                  hover:shadow-md hover:-translate-y-0.5
                `}
              >
                <div className={colors.icon}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`text-[12px] font-medium ${colors.text}`}>
                  {option.label}
                </span>
                <kbd className="
                  rounded-md
                  bg-white/70 dark:bg-slate-800/70
                  border border-slate-200/50 dark:border-slate-600/50
                  px-2 py-0.5
                  font-mono text-[10px] text-slate-500 dark:text-slate-400
                  opacity-60 group-hover:opacity-100
                  transition-opacity duration-150
                ">
                  {option.shortcut}
                </kbd>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">1</kbd>-<kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">6</kbd> to add • <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}
