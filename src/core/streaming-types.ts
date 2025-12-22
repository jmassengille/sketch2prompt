/**
 * Streaming Types for AI Generation
 *
 * Defines interfaces for streaming AI output during blueprint export.
 * Supports real-time token streaming (OpenAI) and simulated progress (Anthropic).
 */

/** Current phase of streaming generation */
export type StreamingPhase =
  | 'idle'
  | 'generating-project-rules'
  | 'generating-agent-protocol'
  | 'generating-component-specs'
  | 'complete'
  | 'error'

/** State of a single file during streaming */
export interface StreamingFileState {
  /** File name (e.g., "PROJECT_RULES.md" or "specs/api.yaml") */
  name: string
  /** Current content (partial during streaming, full when complete) */
  content: string
  /** Whether generation is finished for this file */
  isComplete: boolean
  /** Whether this file is currently being generated */
  isActive: boolean
}

/** Overall streaming progress */
export interface StreamingProgress {
  /** Current generation phase */
  phase: StreamingPhase
  /** File currently being generated (null if between files) */
  currentFile: string | null
  /** Number of files fully generated */
  filesCompleted: number
  /** Total files to generate */
  totalFiles: number
  /** Error message if phase is 'error' */
  error?: string
}

/** Callbacks for streaming events */
export interface StreamingCallbacks {
  /** Called for each token received (OpenAI streaming only) */
  onToken: (fileName: string, token: string) => void
  /** Called when a file starts generating */
  onFileStart: (fileName: string) => void
  /** Called when a file finishes generating */
  onFileComplete: (fileName: string, content: string) => void
  /** Called when overall progress changes */
  onProgress: (progress: StreamingProgress) => void
  /** Called on error */
  onError: (error: Error) => void
}

/** Result from streaming generation */
export interface StreamingGenerationResult {
  projectRules: string
  agentProtocol: string
  componentSpecs: Map<string, string>
}
