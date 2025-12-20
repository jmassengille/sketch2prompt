import { Layers, Plus } from 'lucide-react'

export function EmptyCanvasState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-in fade-in duration-500">
        <div className="p-4 rounded-full bg-surface-1 dark:bg-surface-1 border border-border animate-in fade-in delay-100">
          <Layers className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-2 animate-in fade-in delay-200">
          <h3 className="text-lg font-semibold text-foreground">
            No components yet
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Start defining your system architecture by adding components.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md animate-in fade-in delay-400">
          <Plus className="h-3.5 w-3.5" />
          <span>Click the</span>
          <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono text-[10px]">+</kbd>
          <span>button or press</span>
          <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-mono text-[10px]">1-6</kbd>
        </div>
      </div>
    </div>
  )
}
