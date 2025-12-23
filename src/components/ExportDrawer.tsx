import { useState, useRef, useMemo, useTransition } from 'react'
import {
  X,
  Copy,
  Check,
  Download,
  Upload,
  Code,
  Package,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useStore } from '../core/store'
import { useSettingsStore, type AIProvider } from '../core/settings'
import { exportJson } from '../core/export-json'
import { importJson } from '../core/import-json'
import {
  exportBlueprint,
  downloadBlob,
} from '../core/export-blueprint'
import type { DiagramNode, DiagramEdge, NodeType } from '../core/types'
import { BlueprintPreviewModal } from './preview'
import { usePreviewContent } from '../hooks/usePreviewContent'
import { useExportProgress } from '../hooks/useExportProgress'

type Tab = 'blueprint' | 'json'

// 1MB file size limit for imports
const MAX_IMPORT_SIZE = 1024 * 1024

// Free tier node limit
const MAX_FREE_NODES = 8

interface ExportDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportDrawer({ isOpen, onClose }: ExportDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('blueprint')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [isCopying, startCopyTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [settingsExpanded, setSettingsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Diagram store
  const nodes = useStore((state) => state.nodes)
  const edges = useStore((state) => state.edges)
  const setNodes = useStore((state) => state.setNodes)
  const setEdges = useStore((state) => state.setEdges)

  // Settings store
  const projectName = useSettingsStore((state) => state.projectName)
  const setProjectName = useSettingsStore((state) => state.setProjectName)
  const apiProvider = useSettingsStore((state) => state.apiProvider)
  const setApiProvider = useSettingsStore((state) => state.setApiProvider)
  const apiKey = useSettingsStore((state) => state.apiKey)
  const setApiKey = useSettingsStore((state) => state.setApiKey)
  const modelId = useSettingsStore((state) => state.modelId)
  const setModelId = useSettingsStore((state) => state.setModelId)
  const clearApiKey = useSettingsStore((state) => state.clearApiKey)
  const hasApiKey = useSettingsStore((state) => state.hasApiKey)
  const outOfScope = useSettingsStore((state) => state.outOfScope)

  // Computed
  const useAI = hasApiKey()
  const nodeCount = nodes.length

  // Memoize expensive computations
  const jsonContent = useMemo(() => exportJson(nodes, edges), [nodes, edges])
  const previewFiles = usePreviewContent(nodes, edges, projectName || 'untitled-project', outOfScope)

  // Export progress state (parallel generation)
  const {
    progress: exportProgress,
    startExport,
    onFileComplete,
    complete: completeExport,
    setError: setExportProgressError,
    abort: abortExport,
    reset: resetExport,
  } = useExportProgress()

  // Merge preview files with AI-generated content when available
  const displayFiles = useMemo(() => {
    if (exportProgress.files.size === 0) {
      return previewFiles
    }
    return previewFiles.map((file) => {
      const content = exportProgress.files.get(file.name)
      if (content) {
        return {
          ...file,
          content,
          size: new TextEncoder().encode(content).length,
        }
      }
      return file
    })
  }, [previewFiles, exportProgress.files])

  // Validation
  const canExport = nodeCount > 0 && nodeCount <= MAX_FREE_NODES
  const validationError = useMemo(() => {
    if (nodeCount === 0) return 'Add at least one component to export.'
    if (nodeCount > MAX_FREE_NODES)
      return `Free tier limited to ${String(MAX_FREE_NODES)} nodes. You have ${String(nodeCount)}.`
    return null
  }, [nodeCount])

  const handleCopy = () => {
    startCopyTransition(async () => {
      try {
        await navigator.clipboard.writeText(jsonContent)
        setCopied(true)
        setCopyError(false)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch {
        setCopyError(true)
        setTimeout(() => {
          setCopyError(false)
        }, 2000)
      }
    })
  }

  const handleDownloadJson = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportBlueprint = async () => {
    if (!canExport) return

    setIsExporting(true)
    setExportError(null)

    // Start parallel export with abort signal
    const signal = useAI ? startExport() : undefined

    const result = await exportBlueprint(nodes, edges, {
      projectName: projectName || 'untitled-project',
      useAI,
      apiKey,
      apiProvider,
      modelId,
      outOfScope,
      signal,
      onFileComplete: useAI ? onFileComplete : undefined,
    })

    if (useAI) {
      if (result.ok) {
        completeExport()
      } else {
        setExportProgressError(result.error)
      }
    }

    setIsExporting(false)

    if (result.ok) {
      downloadBlob(result.blob, result.filename)
      setShowPreview(false)
    } else {
      setExportError(result.error)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    setImportSuccess(false)

    // Check file size
    if (file.size > MAX_IMPORT_SIZE) {
      setImportError('File is too large. Maximum size is 1MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onerror = () => {
      setImportError('Failed to read file. Please try again.')
    }

    reader.onload = (event) => {
      const content = event.target?.result as string
      const result = importJson(content)

      if (result.ok) {
        // Convert validated data back to React Flow nodes/edges
        const importedNodes: DiagramNode[] = result.data.nodes.map((n) => {
          const node: DiagramNode = {
            id: n.id,
            type: n.type as NodeType,
            position: n.position,
            data: {
              label: n.data.label,
              type: n.data.type as NodeType,
              meta: {},
            },
          }
          // Only set description if defined
          if (n.data.meta.description !== undefined) {
            node.data.meta.description = n.data.meta.description
          }
          return node
        })
        setNodes(importedNodes)

        const importedEdges: DiagramEdge[] = result.data.edges.map((e) => {
          const edge: DiagramEdge = {
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle ?? null,
            targetHandle: e.targetHandle ?? null,
            data: {},
          }
          // Only set label if defined
          if (e.data?.label !== undefined) {
            edge.data = { label: e.data.label }
          }
          return edge
        })
        setEdges(importedEdges)
        setImportSuccess(true)
        setTimeout(() => {
          setImportSuccess(false)
        }, 3000)
      } else {
        setImportError(result.error)
      }
    }

    reader.readAsText(file)

    // Reset file input
    e.target.value = ''
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[600px] max-w-[90vw] flex-col border-l border-border bg-bg shadow-xl animate-in slide-in-from-right-4 fade-in duration-300 delay-50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold text-text">Export</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => {
              setActiveTab('blueprint')
            }}
            className={`cursor-pointer flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'blueprint'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Package className="h-4 w-4" />
            Blueprint
          </button>
          <button
            onClick={() => {
              setActiveTab('json')
            }}
            className={`cursor-pointer flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'json'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Code className="h-4 w-4" />
            JSON
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'blueprint' ? (
            <div className="space-y-4">
              {/* Validation error */}
              {validationError && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {validationError}
                  </p>
                </div>
              )}

              {/* Project Name */}
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value)
                  }}
                  placeholder="my-project"
                  className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* AI Enhancement Section */}
              <div
                className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                  useAI
                    ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 ring-1 ring-amber-500/30'
                    : 'bg-gradient-to-br from-[var(--color-workshop-elevated)] to-[var(--color-workshop-surface)] ring-1 ring-[var(--color-workshop-border)]'
                }`}
              >
                {/* Shimmer effect when AI is active */}
                {useAI && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
                )}

                <button
                  onClick={() => {
                    setSettingsExpanded(!settingsExpanded)
                  }}
                  className="cursor-pointer relative flex w-full items-center justify-between px-4 py-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Sparkle icon with background */}
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${
                      useAI
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25'
                        : 'bg-[var(--color-workshop-elevated)] ring-1 ring-[var(--color-workshop-border)]'
                    }`}>
                      <Sparkles className={`h-4 w-4 ${useAI ? 'text-white' : 'text-[var(--color-workshop-text-muted)]'}`} />
                    </div>

                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${useAI ? 'text-amber-200' : 'text-[var(--color-workshop-text)]'}`}>
                        AI-Powered Specs
                      </span>
                      <span className={`text-xs ${useAI ? 'text-amber-300/70' : 'text-[var(--color-workshop-text-muted)]'}`}>
                        {useAI ? 'Smarter, context-aware output' : 'Add your API key to unlock'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      useAI
                        ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30'
                        : 'bg-[var(--color-workshop-bg)] text-[var(--color-workshop-text-subtle)] ring-1 ring-[var(--color-workshop-border)]'
                    }`}>
                      {useAI ? 'Active' : 'Off'}
                    </span>

                    {settingsExpanded ? (
                      <ChevronDown className={`h-4 w-4 ${useAI ? 'text-amber-400' : 'text-[var(--color-workshop-text-muted)]'}`} />
                    ) : (
                      <ChevronRight className={`h-4 w-4 ${useAI ? 'text-amber-400' : 'text-[var(--color-workshop-text-muted)]'}`} />
                    )}
                  </div>
                </button>

                {settingsExpanded && (
                  <div className={`space-y-3 border-t px-4 py-4 ${
                    useAI ? 'border-amber-500/20' : 'border-[var(--color-workshop-border)]'
                  }`}>
                    {/* Provider */}
                    <div>
                      <label className={`mb-1.5 block text-xs font-medium ${useAI ? 'text-amber-300/70' : 'text-[var(--color-workshop-text-muted)]'}`}>
                        Provider
                      </label>
                      <select
                        value={apiProvider}
                        onChange={(e) => {
                          setApiProvider(e.target.value as AIProvider)
                        }}
                        className={`cursor-pointer w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                          useAI
                            ? 'border-amber-500/30 bg-black/20 text-amber-100 focus:ring-amber-500/50'
                            : 'border-[var(--color-workshop-border)] bg-[var(--color-workshop-bg)] text-[var(--color-workshop-text)] focus:ring-[var(--color-wizard-accent)]/50'
                        }`}
                      >
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="openai">OpenAI (GPT)</option>
                      </select>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className={`mb-1.5 block text-xs font-medium ${useAI ? 'text-amber-300/70' : 'text-[var(--color-workshop-text-muted)]'}`}>
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => {
                            setApiKey(e.target.value)
                          }}
                          placeholder={
                            apiProvider === 'anthropic'
                              ? 'sk-ant-...'
                              : 'sk-...'
                          }
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                            useAI
                              ? 'border-amber-500/30 bg-black/20 text-amber-100 placeholder:text-amber-300/40 focus:ring-amber-500/50'
                              : 'border-[var(--color-workshop-border)] bg-[var(--color-workshop-bg)] text-[var(--color-workshop-text)] placeholder:text-[var(--color-workshop-text-muted)] focus:ring-[var(--color-wizard-accent)]/50'
                          }`}
                        />
                        {apiKey && (
                          <button
                            onClick={clearApiKey}
                            className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
                              useAI
                                ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                                : 'border-[var(--color-workshop-border)] text-[var(--color-workshop-text-muted)] hover:bg-[var(--color-workshop-elevated)]'
                            }`}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Model */}
                    <div>
                      <label className={`mb-1.5 block text-xs font-medium ${useAI ? 'text-amber-300/70' : 'text-[var(--color-workshop-text-muted)]'}`}>
                        Model
                      </label>
                      <input
                        type="text"
                        value={modelId}
                        onChange={(e) => {
                          setModelId(e.target.value)
                        }}
                        placeholder="Model ID"
                        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                          useAI
                            ? 'border-amber-500/30 bg-black/20 text-amber-100 placeholder:text-amber-300/40 focus:ring-amber-500/50'
                            : 'border-[var(--color-workshop-border)] bg-[var(--color-workshop-bg)] text-[var(--color-workshop-text)] placeholder:text-[var(--color-workshop-text-muted)] focus:ring-[var(--color-wizard-accent)]/50'
                        }`}
                      />
                    </div>

                    {/* What AI does - value prop (only when not active) */}
                    {!useAI && (
                      <div className="rounded-lg bg-[var(--color-workshop-bg)]/50 p-3 text-xs text-[var(--color-workshop-text-muted)]">
                        <span className="font-medium text-[var(--color-workshop-text)]">What AI adds:</span> Richer component descriptions, smarter dependency detection, and context-aware implementation hints.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Export contents summary */}
              <div className="rounded-lg border border-border bg-bg-secondary p-4">
                <h3 className="mb-2 text-sm font-medium text-text">
                  Export includes:
                </h3>
                <ul className="space-y-1.5 text-sm text-text-muted">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    PROJECT_RULES.md (master instructions)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    specs/*.md ({nodeCount} component spec
                    {nodeCount !== 1 ? 's' : ''})
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">•</span>
                    diagram.json (re-import)
                  </li>
                </ul>
              </div>

              {/* Export error */}
              {exportError && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {exportError}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-bg-secondary p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-text">
                  {jsonContent}
                </pre>
              </div>

              {/* Import section */}
              <div className="mt-4 rounded-lg border border-dashed border-border p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={handleImportClick}
                  className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-bg-secondary"
                >
                  <Upload className="h-4 w-4" />
                  Import JSON
                </button>

                {importError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                    {importError}
                  </div>
                )}

                {importSuccess && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                    Diagram imported successfully!
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 border-t border-border p-4">
          {activeTab === 'blueprint' ? (
            <button
              onClick={() => {
                setShowPreview(true)
              }}
              disabled={!canExport || isExporting}
              className="cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {useAI ? 'Generating with AI...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Blueprint
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleCopy}
                disabled={isCopying}
                className={`cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                  copyError
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : copyError ? (
                  <>
                    <X className="h-4 w-4" />
                    Copy failed
                  </>
                ) : isCopying ? (
                  <>
                    <Copy className="h-4 w-4 animate-pulse" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadJson}
                className="cursor-pointer flex items-center justify-center gap-2 rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-bg-secondary"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <BlueprintPreviewModal
        isOpen={showPreview}
        files={displayFiles}
        projectName={projectName || 'Untitled System'}
        isAIEnhanced={useAI}
        isLoading={isExporting}
        exportProgress={exportProgress}
        totalFiles={2 + nodeCount}
        onConfirm={() => {
          void handleExportBlueprint()
        }}
        onCancel={() => {
          abortExport()
          resetExport()
          setShowPreview(false)
        }}
      />
    </>
  )
}
