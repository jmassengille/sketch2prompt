/**
 * Hook for managing streaming AI export state
 *
 * Provides state management for file-level streaming generation.
 */
import { useState, useCallback, useMemo } from 'react'
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

export function useStreamingExport(): UseStreamingExportReturn {
  const [state, setState] = useState<StreamingExportState>({
    isStreaming: false,
    progress: null,
    streamingFiles: new Map(),
    error: null,
  })

  // Streaming callbacks
  const callbacks = useMemo<StreamingCallbacks>(
    () => ({
      onFileStart: (fileName) => {
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
    []
  )

  const startStreaming = useCallback(() => {
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
    setState((prev) => ({ ...prev, isStreaming: false }))
  }, [])

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
