import type { NodeType } from '../../core/types'

/**
 * Color scheme for each node type.
 * Enhanced for better contrast and visual hierarchy.
 * Uses consistent pattern: lighter backgrounds, stronger text, clear borders.
 */
export const NODE_COLORS: Record<NodeType, {
  bg: string
  bgSelected: string
  border: string
  borderSelected: string
  accent: string
  ring: string
  textType: string
  textTypeHover: string
  handleBg: string
  // Blueprint-Precision design system
  gradientFrom: string
  gradientTo: string
  glow: string
  glowIntense: string
  glowColor?: string
  // Chip colors for inline tech
  chipBg: string
  chipText: string
  chipBorder: string
}> = {
  frontend: {
    bg: 'bg-blue-50/80 dark:bg-blue-950/40',
    bgSelected: 'bg-blue-100 dark:bg-blue-900/50',
    border: 'border-blue-200/80 dark:border-blue-700/50',
    borderSelected: 'border-blue-400 dark:border-blue-500',
    accent: 'bg-blue-500',
    ring: 'ring-blue-500/40 dark:ring-blue-400/40',
    textType: 'text-blue-600 dark:text-blue-400',
    textTypeHover: 'hover:text-blue-700 dark:hover:text-blue-300',
    handleBg: '!bg-blue-500 dark:!bg-blue-400',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.12)]',
    glowIntense: 'shadow-[0_0_24px_rgba(59,130,246,0.25)]',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    chipBg: 'bg-blue-100 dark:bg-blue-900/50',
    chipText: 'text-blue-700 dark:text-blue-300',
    chipBorder: 'border-blue-200 dark:border-blue-700/60',
  },
  backend: {
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    bgSelected: 'bg-emerald-100 dark:bg-emerald-900/50',
    border: 'border-emerald-200/80 dark:border-emerald-700/50',
    borderSelected: 'border-emerald-400 dark:border-emerald-500',
    accent: 'bg-emerald-500',
    ring: 'ring-emerald-500/40 dark:ring-emerald-400/40',
    textType: 'text-emerald-600 dark:text-emerald-400',
    textTypeHover: 'hover:text-emerald-700 dark:hover:text-emerald-300',
    handleBg: '!bg-emerald-500 dark:!bg-emerald-400',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-emerald-600',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.12)]',
    glowIntense: 'shadow-[0_0_24px_rgba(16,185,129,0.25)]',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    chipBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    chipText: 'text-emerald-700 dark:text-emerald-300',
    chipBorder: 'border-emerald-200 dark:border-emerald-700/60',
  },
  storage: {
    bg: 'bg-amber-50/80 dark:bg-amber-950/40',
    bgSelected: 'bg-amber-100 dark:bg-amber-900/50',
    border: 'border-amber-200/80 dark:border-amber-700/50',
    borderSelected: 'border-amber-400 dark:border-amber-500',
    accent: 'bg-amber-500',
    ring: 'ring-amber-500/40 dark:ring-amber-400/40',
    textType: 'text-amber-600 dark:text-amber-400',
    textTypeHover: 'hover:text-amber-700 dark:hover:text-amber-300',
    handleBg: '!bg-amber-500 dark:!bg-amber-400',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-600',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.12)]',
    glowIntense: 'shadow-[0_0_24px_rgba(245,158,11,0.25)]',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    chipBg: 'bg-amber-100 dark:bg-amber-900/50',
    chipText: 'text-amber-700 dark:text-amber-300',
    chipBorder: 'border-amber-200 dark:border-amber-700/60',
  },
  auth: {
    bg: 'bg-violet-50/80 dark:bg-violet-950/40',
    bgSelected: 'bg-violet-100 dark:bg-violet-900/50',
    border: 'border-violet-200/80 dark:border-violet-700/50',
    borderSelected: 'border-violet-400 dark:border-violet-500',
    accent: 'bg-violet-500',
    ring: 'ring-violet-500/40 dark:ring-violet-400/40',
    textType: 'text-violet-600 dark:text-violet-400',
    textTypeHover: 'hover:text-violet-700 dark:hover:text-violet-300',
    handleBg: '!bg-violet-500 dark:!bg-violet-400',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-violet-600',
    glow: 'shadow-[0_0_12px_rgba(139,92,246,0.12)]',
    glowIntense: 'shadow-[0_0_24px_rgba(139,92,246,0.25)]',
    glowColor: 'rgba(139, 92, 246, 0.3)',
    chipBg: 'bg-violet-100 dark:bg-violet-900/50',
    chipText: 'text-violet-700 dark:text-violet-300',
    chipBorder: 'border-violet-200 dark:border-violet-700/60',
  },
  external: {
    bg: 'bg-slate-50/80 dark:bg-slate-900/40',
    bgSelected: 'bg-slate-100 dark:bg-slate-800/50',
    border: 'border-slate-200/80 dark:border-slate-600/50',
    borderSelected: 'border-slate-400 dark:border-slate-500',
    accent: 'bg-slate-500',
    ring: 'ring-slate-500/40 dark:ring-slate-400/40',
    textType: 'text-slate-600 dark:text-slate-400',
    textTypeHover: 'hover:text-slate-700 dark:hover:text-slate-300',
    handleBg: '!bg-slate-500 dark:!bg-slate-400',
    gradientFrom: 'from-slate-500',
    gradientTo: 'to-slate-600',
    glow: 'shadow-[0_0_12px_rgba(100,116,139,0.12)]',
    glowIntense: 'shadow-[0_0_24px_rgba(100,116,139,0.25)]',
    glowColor: 'rgba(100, 116, 139, 0.3)',
    chipBg: 'bg-slate-100 dark:bg-slate-800/50',
    chipText: 'text-slate-700 dark:text-slate-300',
    chipBorder: 'border-slate-200 dark:border-slate-600/60',
  },
  background: {
    bg: 'bg-orange-50/80 dark:bg-orange-950/40',
    bgSelected: 'bg-orange-100 dark:bg-orange-900/50',
    border: 'border-orange-200/80 dark:border-orange-700/50',
    borderSelected: 'border-orange-400 dark:border-orange-500',
    accent: 'bg-orange-500',
    ring: 'ring-orange-500/40 dark:ring-orange-400/40',
    textType: 'text-orange-600 dark:text-orange-400',
    textTypeHover: 'hover:text-orange-700 dark:hover:text-orange-300',
    handleBg: '!bg-orange-500 dark:!bg-orange-400',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-600',
    glow: 'shadow-[0_0_12px_rgba(249,115,22,0.12)]',
    glowIntense: 'shadow-[0_0_24px_rgba(249,115,22,0.25)]',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    chipBg: 'bg-orange-100 dark:bg-orange-900/50',
    chipText: 'text-orange-700 dark:text-orange-300',
    chipBorder: 'border-orange-200 dark:border-orange-700/60',
  },
}

/**
 * Type labels for display
 */
export const TYPE_LABELS: Record<NodeType, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  storage: 'Storage',
  auth: 'Auth',
  external: 'External',
  background: 'Background',
}
