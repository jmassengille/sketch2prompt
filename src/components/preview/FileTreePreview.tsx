import { FileText, FolderOpen, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CodePreview } from './CodePreview'
import type { StreamingFileState } from '../../core/streaming-types'

export interface PreviewFile {
  name: string // e.g., "PROJECT_RULES.md" or "specs/web-app.yaml"
  content: string // File content
  language: 'markdown' | 'yaml' | 'json'
  size: number // Bytes
  description?: string // Short description of file purpose
}

interface FileTreePreviewProps {
  files: PreviewFile[]
  defaultOpen?: string[] // File names to open by default
  /** Map of streaming file states */
  streamingFiles?: Map<string, StreamingFileState>
  /** Whether streaming is active */
  isStreaming?: boolean
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

interface GroupedFiles {
  root: PreviewFile[]
  specs: PreviewFile[]
}

function groupFiles(files: PreviewFile[]): GroupedFiles {
  const root: PreviewFile[] = []
  const specs: PreviewFile[] = []

  for (const file of files) {
    if (file.name.startsWith('specs/')) {
      specs.push(file)
    } else {
      root.push(file)
    }
  }

  return { root, specs }
}

/** Get language badge color */
function getLanguageColor(language: string): { bg: string; text: string } {
  switch (language) {
    case 'markdown':
      return { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA' }
    case 'yaml':
      return { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24' }
    case 'json':
      return { bg: 'rgba(167, 139, 250, 0.15)', text: '#A78BFA' }
    default:
      return { bg: 'var(--color-workshop-elevated)', text: 'var(--color-workshop-text-muted)' }
  }
}

function FileEntry({
  file,
  defaultOpen,
  indent = false,
  isFileStreaming = false,
  isFileComplete = false,
  index = 0,
}: {
  file: PreviewFile
  defaultOpen: boolean
  indent?: boolean
  /** Whether this file is currently streaming */
  isFileStreaming?: boolean
  /** Whether this file has completed streaming */
  isFileComplete?: boolean
  /** Index for staggered animations */
  index?: number
}) {
  // Only open if explicitly set as default
  const shouldBeOpen = defaultOpen
  const langColor = getLanguageColor(file.language)

  return (
    <details
      className={cn(
        'group transition-all duration-300',
        isFileStreaming && 'relative'
      )}
      open={shouldBeOpen}
      style={{
        borderBottom: '1px solid var(--color-workshop-border)',
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Streaming highlight border */}
      {isFileStreaming && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5"
          style={{
            background: 'linear-gradient(180deg, var(--color-wizard-accent) 0%, transparent 100%)',
            boxShadow: '0 0 8px var(--color-wizard-accent)',
          }}
        />
      )}

      <summary
        className={cn(
          'flex cursor-pointer list-none items-center gap-3 px-4 py-3 transition-all duration-200 [&::-webkit-details-marker]:hidden',
          indent && 'pl-7'
        )}
        style={{
          background: isFileStreaming
            ? 'linear-gradient(90deg, var(--color-wizard-accent-subtle) 0%, transparent 50%)'
            : 'transparent',
        }}
      >
        {/* Chevron */}
        <ChevronRight
          className={cn(
            'size-3.5 flex-shrink-0 transition-transform duration-200 group-open:rotate-90',
            isFileStreaming ? 'text-[var(--color-wizard-accent)]' : 'text-[var(--color-workshop-text-subtle)]'
          )}
        />

        {/* File icon with status indicator */}
        <div className="relative flex-shrink-0">
          <FileText
            className={cn(
              'size-4 transition-colors duration-200',
              isFileStreaming
                ? 'text-[var(--color-wizard-accent)]'
                : isFileComplete
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-workshop-text-muted)]'
            )}
          />

          {/* Streaming pulse indicator */}
          {isFileStreaming && (
            <>
              <div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping"
                style={{
                  background: 'var(--color-wizard-accent)',
                  animationDuration: '1s',
                }}
              />
              <div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{
                  background: 'var(--color-wizard-accent)',
                  boxShadow: '0 0 6px var(--color-wizard-accent)',
                }}
              />
            </>
          )}

          {/* Completed checkmark */}
          {isFileComplete && !isFileStreaming && (
            <div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--color-success)',
                boxShadow: '0 0 6px rgba(22, 163, 74, 0.5)',
              }}
            >
              <Check className="size-2 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span
            className={cn(
              'text-sm font-medium transition-colors duration-200',
              isFileStreaming
                ? 'text-[var(--color-wizard-accent)]'
                : 'text-[var(--color-workshop-text)]'
            )}
            style={{ fontFamily: 'var(--font-family-mono)' }}
          >
            {file.name.split('/').pop()}
          </span>

          {/* Language badge */}
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide"
            style={{
              background: langColor.bg,
              color: langColor.text,
            }}
          >
            {file.language}
          </span>

          {/* File size */}
          <span
            className="text-xs tabular-nums"
            style={{
              color: 'var(--color-workshop-text-subtle)',
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            {formatSize(file.size)}
          </span>

          {/* Streaming indicator text */}
          {isFileStreaming && (
            <span
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide"
              style={{ color: 'var(--color-wizard-accent)' }}
            >
              <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none">
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
              generating
            </span>
          )}
        </div>
      </summary>

      {/* File content preview */}
      <div
        className="px-4 py-4 transition-all duration-300"
        style={{
          background: 'var(--color-workshop-bg)',
          borderTop: '1px solid var(--color-workshop-border)',
        }}
      >
        {/* Section label */}
        <div
          className="flex items-center gap-2 mb-3"
          style={{ fontFamily: 'var(--font-family-mono)' }}
        >
          {isFileStreaming ? (
            <>
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: 'var(--color-wizard-accent)',
                  boxShadow: '0 0 6px var(--color-wizard-accent)',
                }}
              />
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--color-wizard-accent)' }}
              >
                Streaming content
              </span>
            </>
          ) : (
            <>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--color-workshop-text-subtle)' }}
              />
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--color-workshop-text-subtle)' }}
              >
                Source preview
              </span>
            </>
          )}
        </div>

        <CodePreview
          code={file.content}
          language={file.language}
          maxHeight="45vh"
          showLineNumbers={true}
          isStreaming={isFileStreaming}
        />
      </div>
    </details>
  )
}

export function FileTreePreview({
  files,
  defaultOpen = [],
  streamingFiles,
  isStreaming = false,
}: FileTreePreviewProps) {
  const { root, specs } = groupFiles(files)

  // Helper to get streaming state for a file
  const getFileStreamingState = (fileName: string) => {
    if (!isStreaming || !streamingFiles) {
      return { isFileStreaming: false, isFileComplete: false }
    }
    const state = streamingFiles.get(fileName)
    return {
      isFileStreaming: state?.isActive ?? false,
      isFileComplete: state?.isComplete ?? false,
    }
  }

  return (
    <div
      className="overflow-hidden rounded"
      style={{
        border: '1px solid var(--color-workshop-border)',
        background: 'var(--color-workshop-surface)',
      }}
    >
      {/* Root files */}
      {root.map((file, index) => {
        const { isFileStreaming, isFileComplete } = getFileStreamingState(file.name)
        return (
          <FileEntry
            key={file.name}
            file={file}
            defaultOpen={defaultOpen.includes(file.name)}
            isFileStreaming={isFileStreaming}
            isFileComplete={isFileComplete}
            index={index}
          />
        )
      })}

      {/* Specs folder */}
      {specs.length > 0 && (
        <>
          {/* Folder header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: 'var(--color-workshop-elevated)',
              borderBottom: '1px solid var(--color-workshop-border)',
            }}
          >
            <FolderOpen
              className="size-4"
              style={{ color: 'var(--color-wizard-accent)' }}
            />
            <span
              className="text-sm font-medium"
              style={{
                color: 'var(--color-workshop-text)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              specs/
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--color-wizard-accent-subtle)',
                color: 'var(--color-wizard-accent)',
                fontFamily: 'var(--font-family-mono)',
              }}
            >
              {specs.length} spec{specs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Spec files */}
          {specs.map((file, index) => {
            const { isFileStreaming, isFileComplete } = getFileStreamingState(file.name)
            return (
              <FileEntry
                key={file.name}
                file={file}
                defaultOpen={defaultOpen.includes(file.name)}
                indent
                isFileStreaming={isFileStreaming}
                isFileComplete={isFileComplete}
                index={root.length + index}
              />
            )
          })}
        </>
      )}
    </div>
  )
}
