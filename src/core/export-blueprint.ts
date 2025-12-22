/**
 * Blueprint Export Orchestrator
 *
 * Coordinates generation (AI or template) and packages into ZIP.
 */
import JSZip from 'jszip'
import { exportJson } from './export-json'
import type { DiagramNode, DiagramEdge } from './types'
import type { OutOfScopeId } from './onboarding'
import type { StreamingCallbacks } from './streaming-types'

export type AIProvider = 'anthropic' | 'openai'

export interface ExportOptions {
  projectName: string
  useAI: boolean
  apiKey?: string
  apiProvider?: AIProvider
  modelId?: string
  outOfScope?: OutOfScopeId[]
}

export interface StreamingExportOptions extends ExportOptions {
  /** Callbacks for streaming progress updates */
  streamingCallbacks: StreamingCallbacks
}

export interface ExportSuccess {
  ok: true
  blob: Blob
  filename: string
}

export interface ExportError {
  ok: false
  error: string
}

export type ExportResult = ExportSuccess | ExportError

const MAX_FREE_NODES = 8

/**
 * Slugify a string for use in filenames
 */
function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'untitled'
  )
}

/**
 * Export diagram as a blueprint ZIP file
 *
 * Structure:
 * - PROJECT_RULES.md (system constitution)
 * - AGENT_PROTOCOL.md (workflow guidance)
 * - specs/*.yaml (per-component specs)
 * - diagram.json (re-import capability)
 */
export async function exportBlueprint(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  options: ExportOptions
): Promise<ExportResult> {
  // Validate node count
  if (nodes.length === 0) {
    return { ok: false, error: 'Add at least one component to export.' }
  }

  if (nodes.length > MAX_FREE_NODES) {
    return {
      ok: false,
      error: `Free tier limited to ${String(MAX_FREE_NODES)} nodes. You have ${String(nodes.length)}. Remove some components to export.`,
    }
  }

  try {
    let projectRules: string
    let agentProtocol: string
    const componentSpecs = new Map<string, string>()

    if (options.useAI && options.apiKey && options.apiProvider && options.modelId) {
      // AI-enhanced generation
      const { generateWithAI } = await import('./ai-generator')
      const result = await generateWithAI(
        nodes,
        edges,
        options.projectName,
        options.apiKey,
        options.apiProvider,
        options.modelId
      )
      projectRules = result.projectRules
      agentProtocol = result.agentProtocol
      for (const [nodeId, yaml] of result.componentSpecs) {
        componentSpecs.set(nodeId, yaml)
      }
    } else {
      // Template-based generation
      const { generateProjectRulesTemplate, generateComponentYamlTemplate, generateAgentProtocolTemplate } = await import(
        './template-generator'
      )
      projectRules = generateProjectRulesTemplate(nodes, edges, options.projectName)
      agentProtocol = generateAgentProtocolTemplate(nodes, options.projectName, options.outOfScope ?? [])
      for (const node of nodes) {
        const yaml = generateComponentYamlTemplate(node, edges, nodes)
        componentSpecs.set(node.id, yaml)
      }
    }

    // Create ZIP
    const zip = new JSZip()

    // Add PROJECT_RULES.md
    zip.file('PROJECT_RULES.md', projectRules)

    // Add AGENT_PROTOCOL.md
    zip.file('AGENT_PROTOCOL.md', agentProtocol)

    // Add specs folder with component YAMLs
    const specsFolder = zip.folder('specs')
    if (specsFolder) {
      for (const node of nodes) {
        const yaml = componentSpecs.get(node.id) ?? ''
        const filename = slugify(node.data.label) + '.yaml'
        specsFolder.file(filename, yaml)
      }
    }

    // Add diagram.json for re-import
    const diagramJson = exportJson(nodes, edges)
    zip.file('diagram.json', diagramJson)

    // Generate blob
    const blob = await zip.generateAsync({ type: 'blob' })
    const filename = `${slugify(options.projectName)}-blueprint.zip`

    return { ok: true, blob, filename }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed. Please try again.'
    return { ok: false, error: message }
  }
}

/**
 * Trigger browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export blueprint with streaming AI generation
 *
 * Provides real-time progress updates via callbacks during generation.
 * Uses streaming for OpenAI, simulated progress for Anthropic.
 */
export async function exportBlueprintStreaming(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  options: StreamingExportOptions
): Promise<ExportResult> {
  // Validate node count
  if (nodes.length === 0) {
    return { ok: false, error: 'Add at least one component to export.' }
  }

  if (nodes.length > MAX_FREE_NODES) {
    return {
      ok: false,
      error: `Free tier limited to ${String(MAX_FREE_NODES)} nodes. You have ${String(nodes.length)}. Remove some components to export.`,
    }
  }

  // Streaming requires AI settings
  if (!options.useAI || !options.apiKey || !options.apiProvider || !options.modelId) {
    return { ok: false, error: 'Streaming export requires AI settings.' }
  }

  try {
    // Import streaming generator
    const { generateWithAIStreaming } = await import('./ai-generator')

    const result = await generateWithAIStreaming(
      nodes,
      edges,
      options.projectName,
      options.apiKey,
      options.apiProvider,
      options.modelId,
      options.streamingCallbacks
    )

    // Create ZIP from streaming result
    const zip = new JSZip()

    // Add PROJECT_RULES.md
    zip.file('PROJECT_RULES.md', result.projectRules)

    // Add AGENT_PROTOCOL.md
    zip.file('AGENT_PROTOCOL.md', result.agentProtocol)

    // Add specs folder with component YAMLs
    const specsFolder = zip.folder('specs')
    if (specsFolder) {
      for (const node of nodes) {
        const yaml = result.componentSpecs.get(node.id) ?? ''
        const filename = slugify(node.data.label) + '.yaml'
        specsFolder.file(filename, yaml)
      }
    }

    // Add diagram.json for re-import
    const diagramJson = exportJson(nodes, edges)
    zip.file('diagram.json', diagramJson)

    // Generate blob
    const blob = await zip.generateAsync({ type: 'blob' })
    const filename = `${slugify(options.projectName)}-blueprint.zip`

    return { ok: true, blob, filename }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Export failed. Please try again.'
    return { ok: false, error: message }
  }
}
