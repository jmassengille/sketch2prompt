/**
 * Hook for managing parallel AI export progress
 *
 * Provides simplified state management for parallel file generation.
 * Replaces the complex streaming callback system with completion-based updates.
 */
import { useState, useCallback, useRef } from 'react'

export interface ExportProgress {
  /** True while any generation is active */
  generating: boolean
  /** File names that have completed successfully */
  completed: Set<string>
  /** File names with their content (for UI preview updates) */
  files: Map<string, string>
  /** Error message if generation failed */
  error: string | null
  /** True if user cancelled */
  aborted: boolean
}

const initialProgress: ExportProgress = {
  generating: false,
  completed: new Set(),
  files: new Map(),
  error: null,
  aborted: false,
}

export interface UseExportProgressReturn {
  progress: ExportProgress
  /** Start export and get the AbortSignal for cancellation */
  startExport: () => AbortSignal
  /** Callback when a file completes generation */
  onFileComplete: (fileName: string, content: string) => void
  /** Mark export as complete (all files done) */
  complete: () => void
  /** Set error state */
  setError: (error: string) => void
  /** Abort the current export */
  abort: () => void
  /** Reset to initial state */
  reset: () => void
}

export function useExportProgress(): UseExportProgressReturn {
  const [progress, setProgress] = useState<ExportProgress>(initialProgress)
  const abortControllerRef = useRef<AbortController | null>(null)

  const startExport = useCallback((): AbortSignal => {
    abortControllerRef.current = new AbortController()
    setProgress({
      generating: true,
      completed: new Set(),
      files: new Map(),
      error: null,
      aborted: false,
    })
    return abortControllerRef.current.signal
  }, [])

  const onFileComplete = useCallback((fileName: string, content: string) => {
    setProgress((prev) => ({
      ...prev,
      completed: new Set(prev.completed).add(fileName),
      files: new Map(prev.files).set(fileName, content),
    }))
  }, [])

  const complete = useCallback(() => {
    abortControllerRef.current = null
    setProgress((prev) => ({ ...prev, generating: false }))
  }, [])

  const setError = useCallback((error: string) => {
    abortControllerRef.current = null
    setProgress((prev) => ({ ...prev, generating: false, error }))
  }, [])

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setProgress((prev) => ({ ...prev, generating: false, aborted: true }))
  }, [])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setProgress(initialProgress)
  }, [])

  return {
    progress,
    startExport,
    onFileComplete,
    complete,
    setError,
    abort,
    reset,
  }
}
