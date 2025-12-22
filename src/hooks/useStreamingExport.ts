/**
 * Hook for managing streaming AI export state
 *
 * Provides state management for streaming generation with token batching
 * to prevent excessive re-renders during high-frequency token events.
 */
import { useState, useCallback, useRef, useMemo } from 'react'
import type {
  StreamingProgress,
  StreamingFileState,
  StreamingCallbacks,
} from '../core/streaming-types'
import type { PreviewFile } from '../components/preview/FileTreePreview'

interface StreamingExportState {
  /** Whether streaming is active */
  isStreaming: boolean
  /** Current generation progress */
  progress: StreamingProgress | null
  /** Map of file name -> streaming state */
  streamingFiles: Map<string, StreamingFileState>
  /** Error message if generation failed */
  error: string | null
}

interface UseStreamingExportReturn extends StreamingExportState {
  /** Callbacks to pass to streaming generator */
  callbacks: StreamingCallbacks
  /** Start streaming (resets state) */
  startStreaming: () => void
  /** Stop streaming */
  stopStreaming: () => void
  /** Get files merged with streaming content */
  getMergedFiles: (initialFiles: PreviewFile[]) => PreviewFile[]
}

/** Flush interval for token batching (ms) */
const TOKEN_FLUSH_INTERVAL = 50

export function useStreamingExport(): UseStreamingExportReturn {
  const [state, setState] = useState<StreamingExportState>({
    isStreaming: false,
    progress: null,
    streamingFiles: new Map(),
    error: null,
  })

  // Use refs for mutable token buffer to avoid re-renders on every token
  const tokenBufferRef = useRef<Map<string, string>>(new Map())
  const flushTimeoutRef = useRef<number | null>(null)

  // Flush accumulated tokens to state
  const flushTokens = useCallback(() => {
    if (tokenBufferRef.current.size === 0) return

    setState((prev) => {
      const updated = new Map(prev.streamingFiles)
      for (const [fileName, tokens] of tokenBufferRef.current) {
        const existing = updated.get(fileName)
        if (existing) {
          updated.set(fileName, {
            ...existing,
            content: existing.content + tokens,
          })
        }
      }
      return { ...prev, streamingFiles: updated }
    })

    tokenBufferRef.current.clear()
    flushTimeoutRef.current = null
  }, [])

  // Schedule token flush with debounce
  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current === null) {
      flushTimeoutRef.current = window.setTimeout(flushTokens, TOKEN_FLUSH_INTERVAL)
    }
  }, [flushTokens])

  // Streaming callbacks
  const callbacks = useMemo<StreamingCallbacks>(
    () => ({
      onToken: (fileName, token) => {
        const current = tokenBufferRef.current.get(fileName) ?? ''
        tokenBufferRef.current.set(fileName, current + token)
        scheduleFlush()
      },

      onFileStart: (fileName) => {
        // Flush any pending tokens first
        if (flushTimeoutRef.current) {
          clearTimeout(flushTimeoutRef.current)
          flushTokens()
        }

        setState((prev) => ({
          ...prev,
          streamingFiles: new Map(prev.streamingFiles).set(fileName, {
            name: fileName,
            content: '',
            isComplete: false,
            isActive: true,
          }),
        }))
      },

      onFileComplete: (fileName, content) => {
        // Clear any buffered tokens for this file
        tokenBufferRef.current.delete(fileName)

        setState((prev) => {
          const updated = new Map(prev.streamingFiles)
          updated.set(fileName, {
            name: fileName,
            content,
            isComplete: true,
            isActive: false,
          })
          return { ...prev, streamingFiles: updated }
        })
      },

      onProgress: (progress) => {
        setState((prev) => ({ ...prev, progress }))
      },

      onError: (error) => {
        // Clear any pending flush
        if (flushTimeoutRef.current) {
          clearTimeout(flushTimeoutRef.current)
          flushTimeoutRef.current = null
        }

        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: error.message,
          progress: prev.progress
            ? { ...prev.progress, phase: 'error', error: error.message }
            : null,
        }))
      },
    }),
    [flushTokens, scheduleFlush]
  )

  const startStreaming = useCallback(() => {
    // Clear any pending flush
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current)
      flushTimeoutRef.current = null
    }
    tokenBufferRef.current.clear()

    setState({
      isStreaming: true,
      progress: {
        phase: 'idle',
        currentFile: null,
        filesCompleted: 0,
        totalFiles: 0,
      },
      streamingFiles: new Map(),
      error: null,
    })
  }, [])

  const stopStreaming = useCallback(() => {
    // Flush any remaining tokens
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current)
      flushTokens()
    }

    setState((prev) => ({ ...prev, isStreaming: false }))
  }, [flushTokens])

  // Merge streaming files with initial template files
  const getMergedFiles = useCallback(
    (initialFiles: PreviewFile[]): PreviewFile[] => {
      if (!state.isStreaming && state.streamingFiles.size === 0) {
        return initialFiles
      }

      return initialFiles.map((file) => {
        const streaming = state.streamingFiles.get(file.name)
        if (streaming && streaming.content) {
          return {
            ...file,
            content: streaming.content,
            size: new TextEncoder().encode(streaming.content).length,
          }
        }
        return file
      })
    },
    [state.isStreaming, state.streamingFiles]
  )

  return {
    ...state,
    callbacks,
    startStreaming,
    stopStreaming,
    getMergedFiles,
  }
}
