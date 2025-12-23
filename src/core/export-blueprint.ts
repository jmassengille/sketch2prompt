/**
 * Blueprint Export Orchestrator
 *
 * Coordinates generation (AI or template) and packages into ZIP.
 */
import JSZip from 'jszip'
import { exportJson } from './export-json'
import type { DiagramNode, DiagramEdge } from './types'
import type { OutOfScopeId } from './onboarding'
import { slugify } from './utils/slugify'

export type AIProvider = 'anthropic' | 'openai'

export interface ExportOptions {
  projectName: string
  useAI: boolean
  apiKey?: string | undefined
  apiProvider?: AIProvider | undefined
  modelId?: string | undefined
  outOfScope?: OutOfScopeId[] | undefined
  signal?: AbortSignal | undefined
  onFileComplete?: ((fileName: string, content: string) => void) | undefined
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
 * Export diagram as a blueprint ZIP file
 *
 * Structure:
 * - START.md (bootstrap - read first, confirms setup, generates IDE config)
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
      // AI-enhanced generation (parallel)
      const { generateWithAI } = await import('./ai-generator')
      const result = await generateWithAI({
        nodes,
        edges,
        projectName: options.projectName,
        apiKey: options.apiKey,
        provider: options.apiProvider,
        modelId: options.modelId,
        signal: options.signal,
        onFileComplete: options.onFileComplete,
      })
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

    // Generate START.md and README.md (always template-based)
    const { generateStartMd, generateReadme } = await import('./template-generator')
    const startMd = generateStartMd(nodes, options.projectName)
    const readme = generateReadme(options.projectName)

    // Create ZIP
    const zip = new JSZip()

    // Add README.md (human quick-start)
    zip.file('README.md', readme)

    // Add START.md (LLM initialization protocol)
    zip.file('START.md', startMd)

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
