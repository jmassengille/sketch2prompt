import { useState, useEffect, useCallback } from 'react'
import { X, Download, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileTreePreview, type PreviewFile } from './FileTreePreview'

interface BlueprintPreviewModalProps {
  isOpen: boolean
  files: PreviewFile[]
  projectName: string
  isAIEnhanced: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function BlueprintPreviewModal({
  isOpen,
  files,
  projectName,
  isAIEnhanced,
  isLoading = false,
  onConfirm,
  onCancel,
}: BlueprintPreviewModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Fade in on mount
  useEffect(() => {
    if (isOpen) {
      setIsExiting(false)
      const timer = setTimeout(() => { setIsVisible(true) }, 50)
      return () => { clearTimeout(timer) }
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onCancel()
    }, 300)
  }, [onCancel])

  const handleConfirm = useCallback(() => {
    onConfirm()
  }, [onConfirm])

  // Dismiss on Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [isOpen, handleClose])

  if (!isOpen && !isVisible) return null

  const fileCount = files.length

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center transition-all duration-500',
        isVisible && !isExiting ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleClose}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10, 15, 26, 0.85) 0%, rgba(10, 15, 26, 0.95) 100%)',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content card */}
      <div
        className={cn(
          'relative z-10 max-w-4xl w-full mx-6 transition-all duration-500',
          isVisible && !isExiting
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95'
        )}
        onClick={(e) => { e.stopPropagation() }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        {/* Main content */}
        <div className="relative rounded-sm border border-slate-700/50 bg-slate-900/90 backdrop-blur-md">
          {/* Corner brackets */}
          <div className="absolute -top-px -left-px w-4 h-4 border-l border-t border-[var(--color-blueprint-accent)]" />
          <div className="absolute -top-px -right-px w-4 h-4 border-r border-t border-[var(--color-blueprint-accent)]" />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-l border-b border-[var(--color-blueprint-accent)]" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-r border-b border-[var(--color-blueprint-accent)]" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-700/50 px-6 py-4">
            <div>
              <h2
                id="preview-modal-title"
                className="text-xl font-light text-white mb-1"
              >
                Preview Export
              </h2>
              <p className="text-sm text-slate-400">
                {fileCount} file{fileCount !== 1 ? 's' : ''} • {projectName || 'Untitled System'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Close preview"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Body - Scrollable */}
          <div className="overflow-y-auto max-h-[60vh] custom-scrollbar p-6">
            <FileTreePreview files={files} />

            {/* AI Enhancement Note */}
            {isAIEnhanced && (
              <div className="mt-4 flex items-center gap-2 rounded-sm border border-slate-700/50 bg-slate-800/50 px-4 py-3">
                <Sparkles className="size-4 flex-shrink-0 text-slate-400" />
                <span className="text-sm text-slate-400">
                  AI will enhance this content on download
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 px-6 py-4">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-sm border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-sm bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
