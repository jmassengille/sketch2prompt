import { useState, useEffect, useCallback } from 'react'
import { X, Download, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileTreePreview, type PreviewFile } from './FileTreePreview'
import type {
  StreamingProgress,
  StreamingFileState,
} from '../../core/streaming-types'

interface BlueprintPreviewModalProps {
  isOpen: boolean
  files: PreviewFile[]
  projectName: string
  isAIEnhanced: boolean
  isLoading?: boolean
  /** Whether streaming is active */
  isStreaming?: boolean
  /** Current streaming progress */
  streamingProgress?: StreamingProgress | null
  /** Map of streaming file states */
  streamingFiles?: Map<string, StreamingFileState>
  onConfirm: () => void
  onCancel: () => void
}

/** Get human-readable progress label */
function getProgressLabel(progress: StreamingProgress): string {
  switch (progress.phase) {
    case 'idle':
      return 'Initializing'
    case 'generating-project-rules':
      return 'Compiling project rules'
    case 'generating-agent-protocol':
      return 'Defining agent protocol'
    case 'generating-component-specs':
      return 'Generating component specs'
    case 'complete':
      return 'Blueprint complete'
    case 'error':
      return 'Generation failed'
    default:
      return 'Processing'
  }
}

/** Get phase step number */
function getPhaseStep(progress: StreamingProgress): number {
  switch (progress.phase) {
    case 'idle':
      return 0
    case 'generating-project-rules':
      return 1
    case 'generating-agent-protocol':
      return 2
    case 'generating-component-specs':
      return 3
    case 'complete':
      return 4
    default:
      return 0
  }
}

export function BlueprintPreviewModal({
  isOpen,
  files,
  projectName,
  isAIEnhanced,
  isLoading = false,
  isStreaming = false,
  streamingProgress,
  streamingFiles,
  onConfirm,
  onCancel,
}: BlueprintPreviewModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Fade in on mount
  useEffect(() => {
    if (isOpen) {
      setIsExiting(false)
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 50)
      return () => {
        clearTimeout(timer)
      }
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
      if (e.key === 'Escape' && !isStreaming) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose, isStreaming])

  if (!isOpen && !isVisible) return null

  const fileCount = files.length
  const progressPercent = streamingProgress?.totalFiles
    ? (streamingProgress.filesCompleted / streamingProgress.totalFiles) * 100
    : 0

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center transition-all duration-500',
        isVisible && !isExiting ? 'opacity-100' : 'opacity-0'
      )}
      onClick={isStreaming ? undefined : handleClose}
    >
      {/* Backdrop with blueprint grid */}
      <div className="absolute inset-0">
        {/* Dark base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(20, 184, 166, 0.03) 0%, transparent 50%), radial-gradient(ellipse at center, var(--color-workshop-bg) 0%, #050508 100%)',
          }}
        />

        {/* Blueprint grid - fine lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-wizard-accent) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-wizard-accent) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            opacity: 0.03,
          }}
        />

        {/* Blueprint grid - major lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-wizard-accent) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-wizard-accent) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            opacity: 0.05,
          }}
        />

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

      {/* Content card */}
      <div
        className={cn(
          'relative z-10 max-w-4xl w-full mx-4 sm:mx-6 transition-all duration-500',
          isVisible && !isExiting
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-95'
        )}
        onClick={(e) => {
          e.stopPropagation()
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        {/* Main content */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, var(--color-workshop-surface) 0%, var(--color-workshop-bg) 100%)',
            border: '1px solid var(--color-workshop-border)',
            boxShadow:
              '0 0 0 1px rgba(20, 184, 166, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 80px -20px rgba(20, 184, 166, 0.15)',
          }}
        >
          {/* Corner brackets - refined with animation */}
          <div
            className={cn(
              'absolute -top-px -left-px w-6 h-6 border-l-2 border-t-2 transition-all duration-500',
              isStreaming ? 'border-[var(--color-wizard-accent)]' : 'border-[var(--color-wizard-accent)]/50'
            )}
            style={{
              boxShadow: isStreaming ? '0 0 10px var(--color-wizard-accent-glow)' : 'none',
            }}
          />
          <div
            className={cn(
              'absolute -top-px -right-px w-6 h-6 border-r-2 border-t-2 transition-all duration-500',
              isStreaming ? 'border-[var(--color-wizard-accent)]' : 'border-[var(--color-wizard-accent)]/50'
            )}
            style={{
              boxShadow: isStreaming ? '0 0 10px var(--color-wizard-accent-glow)' : 'none',
            }}
          />
          <div
            className={cn(
              'absolute -bottom-px -left-px w-6 h-6 border-l-2 border-b-2 transition-all duration-500',
              isStreaming ? 'border-[var(--color-wizard-accent)]' : 'border-[var(--color-wizard-accent)]/50'
            )}
            style={{
              boxShadow: isStreaming ? '0 0 10px var(--color-wizard-accent-glow)' : 'none',
            }}
          />
          <div
            className={cn(
              'absolute -bottom-px -right-px w-6 h-6 border-r-2 border-b-2 transition-all duration-500',
              isStreaming ? 'border-[var(--color-wizard-accent)]' : 'border-[var(--color-wizard-accent)]/50'
            )}
            style={{
              boxShadow: isStreaming ? '0 0 10px var(--color-wizard-accent-glow)' : 'none',
            }}
          />

          {/* Header */}
          <div
            className="flex items-start justify-between gap-4 px-6 py-5"
            style={{ borderBottom: '1px solid var(--color-workshop-border)' }}
          >
            <div className="flex items-start gap-4">
              {/* Blueprint icon indicator */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded transition-all duration-300',
                  isStreaming
                    ? 'bg-[var(--color-wizard-accent)]/20'
                    : 'bg-[var(--color-workshop-elevated)]'
                )}
                style={{
                  border: `1px solid ${isStreaming ? 'var(--color-wizard-accent)' : 'var(--color-workshop-border)'}`,
                  boxShadow: isStreaming ? 'var(--shadow-glow-subtle)' : 'none',
                }}
              >
                {isStreaming ? (
                  <Zap
                    className="size-5 text-[var(--color-wizard-accent)]"
                    style={{
                      filter: 'drop-shadow(0 0 4px var(--color-wizard-accent))',
                    }}
                  />
                ) : (
                  <svg
                    className="size-5 text-[var(--color-workshop-text-muted)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="1" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="9" x2="9" y2="21" />
                  </svg>
                )}
              </div>

              <div>
                <h2
                  id="preview-modal-title"
                  className="text-lg font-medium tracking-tight"
                  style={{
                    fontFamily: 'var(--font-family-sans)',
                    color: 'var(--color-workshop-text)',
                  }}
                >
                  {isStreaming ? 'Generating Blueprint' : 'Blueprint Preview'}
                </h2>
                <div
                  className="flex items-center gap-3 mt-1"
                  style={{ fontFamily: 'var(--font-family-mono)' }}
                >
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-workshop-text-muted)' }}
                  >
                    {projectName || 'Untitled System'}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-workshop-text-subtle)' }}
                  >
                    •
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-workshop-text-subtle)' }}
                  >
                    {fileCount} artifact{fileCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={isStreaming}
              className={cn(
                'rounded p-2 transition-all duration-200',
                isStreaming
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-[var(--color-workshop-elevated)] text-[var(--color-workshop-text-muted)] hover:text-[var(--color-workshop-text)]'
              )}
              aria-label="Close preview"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Streaming Progress Section */}
          {isStreaming && streamingProgress && (
            <div
              className="px-6 py-4"
              style={{
                borderBottom: '1px solid var(--color-workshop-border)',
                background:
                  'linear-gradient(90deg, var(--color-wizard-accent-subtle) 0%, transparent 100%)',
              }}
            >
              {/* Progress header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Animated signal indicator */}
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        background: 'var(--color-wizard-accent)',
                        opacity: 0.2,
                        animationDuration: '1.5s',
                      }}
                    />
                    <div
                      className="relative w-2.5 h-2.5 rounded-full"
                      style={{
                        background: 'var(--color-wizard-accent)',
                        boxShadow: '0 0 8px var(--color-wizard-accent)',
                      }}
                    />
                  </div>

                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: 'var(--color-workshop-text)',
                        fontFamily: 'var(--font-family-sans)',
                      }}
                    >
                      {getProgressLabel(streamingProgress)}
                    </span>
                    <span
                      className="text-xs ml-2"
                      style={{ color: 'var(--color-workshop-text-subtle)' }}
                    >
                      Phase {getPhaseStep(streamingProgress)}/3
                    </span>
                  </div>
                </div>

                {/* Numeric progress */}
                <div
                  className="flex items-baseline gap-1"
                  style={{ fontFamily: 'var(--font-family-mono)' }}
                >
                  <span
                    className="text-xl font-light tabular-nums"
                    style={{ color: 'var(--color-wizard-accent)' }}
                  >
                    {streamingProgress.filesCompleted}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-workshop-text-subtle)' }}
                  >
                    / {streamingProgress.totalFiles}
                  </span>
                </div>
              </div>

              {/* Progress bar track */}
              <div
                className="relative h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--color-workshop-elevated)' }}
              >
                {/* Animated background shimmer */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, var(--color-wizard-accent) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease-in-out infinite',
                  }}
                />

                {/* Progress fill */}
                <div
                  className="relative h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    background:
                      'linear-gradient(90deg, var(--color-wizard-accent) 0%, #2DD4BF 100%)',
                    boxShadow: '0 0 12px var(--color-wizard-accent-glow)',
                  }}
                />
              </div>

              {/* Current file indicator */}
              {streamingProgress.currentFile && (
                <div
                  className="flex items-center gap-2 mt-3"
                  style={{ fontFamily: 'var(--font-family-mono)' }}
                >
                  <svg
                    className="size-3.5 animate-pulse"
                    style={{ color: 'var(--color-wizard-accent)' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  <span
                    className="text-xs truncate"
                    style={{ color: 'var(--color-workshop-text-muted)' }}
                  >
                    {streamingProgress.currentFile}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Body - Scrollable */}
          <div
            className="overflow-y-auto max-h-[55vh] custom-scrollbar p-6"
            style={{ background: 'var(--color-workshop-bg)' }}
          >
            <FileTreePreview
              files={files}
              {...(streamingFiles ? { streamingFiles } : {})}
              isStreaming={isStreaming}
            />

            {/* AI Enhancement Note - only show when not streaming */}
            {isAIEnhanced && !isStreaming && (
              <div
                className="mt-4 flex items-center gap-3 rounded px-4 py-3"
                style={{
                  background: 'var(--color-wizard-accent-subtle)',
                  border: '1px solid var(--color-wizard-accent)',
                  borderLeftWidth: '3px',
                }}
              >
                <Sparkles
                  className="size-4 flex-shrink-0"
                  style={{ color: 'var(--color-wizard-accent)' }}
                />
                <span
                  className="text-sm"
                  style={{ color: 'var(--color-workshop-text-muted)' }}
                >
                  AI will enhance this content on export
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between gap-4 px-6 py-4"
            style={{
              borderTop: '1px solid var(--color-workshop-border)',
              background: 'var(--color-workshop-surface)',
            }}
          >
            {/* Left side - status indicator */}
            <div
              className="flex items-center gap-2"
              style={{ fontFamily: 'var(--font-family-mono)' }}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isStreaming ? 'animate-pulse' : ''
                )}
                style={{
                  background: isStreaming
                    ? 'var(--color-wizard-accent)'
                    : 'var(--color-success)',
                  boxShadow: isStreaming
                    ? '0 0 8px var(--color-wizard-accent)'
                    : 'none',
                }}
              />
              <span
                className="text-xs"
                style={{ color: 'var(--color-workshop-text-subtle)' }}
              >
                {isStreaming ? 'Processing...' : 'Ready'}
              </span>
            </div>

            {/* Right side - actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading || isStreaming}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded transition-all duration-200',
                  isLoading || isStreaming
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-[var(--color-workshop-elevated)]'
                )}
                style={{
                  color: 'var(--color-workshop-text-muted)',
                  border: '1px solid var(--color-workshop-border)',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={isLoading || isStreaming}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded transition-all duration-200',
                  isLoading || isStreaming
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:brightness-110'
                )}
                style={{
                  background: isStreaming
                    ? 'var(--color-workshop-elevated)'
                    : 'linear-gradient(135deg, var(--color-wizard-accent) 0%, #0D9488 100%)',
                  color: isStreaming
                    ? 'var(--color-workshop-text-muted)'
                    : 'white',
                  border: isStreaming
                    ? '1px solid var(--color-workshop-border)'
                    : 'none',
                  boxShadow: isStreaming
                    ? 'none'
                    : '0 4px 12px rgba(20, 184, 166, 0.3)',
                }}
              >
                {isLoading || isStreaming ? (
                  <>
                    <svg
                      className="size-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>{isStreaming ? 'Generating...' : 'Preparing...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    <span>Export Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
