import { FileText, FolderOpen, ChevronRight } from 'lucide-react'
import { CodePreview } from './CodePreview'

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

function FileEntry({
  file,
  defaultOpen,
  indent = false,
}: {
  file: PreviewFile
  defaultOpen: boolean
  indent?: boolean
}) {
  return (
    <details
      className="group border-b border-slate-700/30 last:border-b-0"
      open={defaultOpen}
    >
      <summary className={`flex cursor-pointer list-none items-center gap-3 bg-slate-800/30 px-4 py-3 transition-colors duration-150 hover:bg-slate-800/50 [&::-webkit-details-marker]:hidden ${indent ? 'pl-8' : ''}`}>
        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-500 transition-transform group-open:rotate-90" />
        <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-200">
              {file.name.split('/').pop()}
            </span>
            <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
              {file.language}
            </span>
            <span className="font-mono text-xs text-slate-500">
              {formatSize(file.size)}
            </span>
          </div>
          {file.description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{file.description}</p>
          )}
        </div>
      </summary>
      <div className="bg-slate-900/50 px-4 py-3 border-t border-slate-700/30">
        <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">Source Preview</div>
        <CodePreview
          code={file.content}
          language={file.language}
          maxHeight="50vh"
          showLineNumbers={true}
        />
      </div>
    </details>
  )
}

export function FileTreePreview({
  files,
  defaultOpen = [],
}: FileTreePreviewProps) {
  const { root, specs } = groupFiles(files)

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/20">
      {/* Root files */}
      {root.map((file) => (
        <FileEntry
          key={file.name}
          file={file}
          defaultOpen={defaultOpen.includes(file.name)}
        />
      ))}

      {/* Specs folder */}
      {specs.length > 0 && (
        <>
          {/* Folder header */}
          <div className="flex items-center gap-2 border-b border-slate-700/30 bg-slate-800/50 px-4 py-2.5">
            <FolderOpen className="h-4 w-4 text-slate-400" />
            <span className="font-mono text-sm text-slate-300">specs/</span>
            <span className="text-xs text-slate-500">
              {specs.length} component spec{specs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Spec files */}
          {specs.map((file) => (
            <FileEntry
              key={file.name}
              file={file}
              defaultOpen={defaultOpen.includes(file.name)}
              indent
            />
          ))}
        </>
      )}
    </div>
  )
}
