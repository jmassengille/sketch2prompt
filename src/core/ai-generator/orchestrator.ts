/**
 * AI Generation Orchestrator
 *
 * Two-phase architecture:
 * 1. Generate AI snippets (parallel, small token calls)
 * 2. Assemble documents deterministically (no AI involved)
 *
 * This approach reduces hallucination surface area by keeping
 * structural content (package versions, tables, lists) 100% deterministic.
 */
import type { DiagramNode, DiagramEdge } from '../types'
import type { OutOfScopeId } from '../onboarding'
import type { AIProvider, GenerationResult } from './types'
import { generateSnippets } from './snippet-orchestrator'
import {
  assembleProjectRules,
  assembleAgentProtocol,
  assembleComponentSpec,
} from './assembler'
import { slugify } from '../utils/slugify'

export interface GenerateOptions {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  projectName: string
  apiKey: string
  provider: AIProvider
  modelId: string
  outOfScope?: OutOfScopeId[]
  signal?: AbortSignal | undefined
  onFileComplete?: ((fileName: string, content: string) => void) | undefined
}

/**
 * Generate AI-powered project documentation from diagram.
 *
 * Phase 1: Generates small AI snippets in parallel (~50-100 tokens each)
 * Phase 2: Assembles final documents deterministically using snippets
 */
export async function generateWithAI(
  options: GenerateOptions
): Promise<GenerationResult> {
  const {
    nodes,
    edges,
    projectName,
    apiKey,
    provider,
    modelId,
    outOfScope = [],
    signal,
    onFileComplete,
  } = options

  // Phase 1: Generate AI snippets (parallel, small token calls)
  const snippets = await generateSnippets({
    nodes,
    projectName,
    apiKey,
    provider,
    modelId,
    signal,
  })

  // Phase 2: Assemble documents deterministically
  const projectRules = assembleProjectRules({
    nodes,
    edges,
    projectName,
    snippets,
  })
  onFileComplete?.('PROJECT_RULES.md', projectRules)

  const agentProtocol = assembleAgentProtocol({
    nodes,
    projectName,
    outOfScope,
  })
  onFileComplete?.('AGENT_PROTOCOL.md', agentProtocol)

  const componentSpecs = new Map<string, string>()
  for (const node of nodes) {
    const content = assembleComponentSpec({
      node,
      allNodes: nodes,
      snippets,
    })
    const fileName = `specs/${slugify(node.data.label)}.md`
    componentSpecs.set(node.id, content)
    onFileComplete?.(fileName, content)
  }

  return { projectRules, agentProtocol, componentSpecs }
}
