/**
 * AI Generation Orchestrator
 *
 * Coordinates parallel AI generation for blueprint files.
 * Uses p-limit for controlled concurrency to avoid API rate limits.
 */
import pLimit from 'p-limit'
import type { DiagramNode, DiagramEdge } from '../types'
import type { AIProvider, GenerationResult } from './types'
import { createClient, callAI } from './client'
import {
  buildProjectRulesPrompt,
  buildComponentSpecPrompt,
  buildAgentProtocolPrompt,
} from './prompts'
import { slugify } from '../utils/slugify'

/**
 * Maximum concurrent API calls.
 * Set conservatively to avoid rate limits across API tiers.
 * - OpenAI Tier 1: 500 RPM, Tier 2: 5000 RPM
 * - Anthropic: Varies by tier, typically 60-4000 RPM
 * A value of 3 is safe for most users while still providing
 * meaningful parallelism over sequential execution.
 */
const MAX_CONCURRENCY = 3

export interface GenerateOptions {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  projectName: string
  apiKey: string
  provider: AIProvider
  modelId: string
  signal?: AbortSignal | undefined
  onFileComplete?: ((fileName: string, content: string) => void) | undefined
}

/**
 * Generate AI-powered project documentation from diagram.
 * Files are generated with controlled concurrency (max 3 at a time)
 * to avoid API rate limits while maintaining good throughput.
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
    signal,
    onFileComplete,
  } = options

  const client = createClient(apiKey, provider)
  const limit = pLimit(MAX_CONCURRENCY)

  // Wrap all API calls with concurrency limiter
  // p-limit queues calls and executes up to MAX_CONCURRENCY at a time
  const projectRulesPromise = limit(() =>
    callAI(
      client,
      buildProjectRulesPrompt(nodes, edges, projectName),
      modelId,
      'PROJECT_RULES.md',
      signal
    ).then((content) => {
      onFileComplete?.('PROJECT_RULES.md', content)
      return content
    })
  )

  const agentProtocolPromise = limit(() =>
    callAI(
      client,
      buildAgentProtocolPrompt(nodes, projectName),
      modelId,
      'AGENT_PROTOCOL.md',
      signal
    ).then((content) => {
      onFileComplete?.('AGENT_PROTOCOL.md', content)
      return content
    })
  )

  const componentPromises = nodes.map((node) => {
    const fileName = `specs/${slugify(node.data.label)}.yaml`
    return limit(() =>
      callAI(
        client,
        buildComponentSpecPrompt(node, nodes, edges),
        modelId,
        fileName,
        signal
      ).then((content) => {
        onFileComplete?.(fileName, content)
        return { nodeId: node.id, yaml: content }
      })
    )
  })

  try {
    // Execute with controlled concurrency
    const [projectRules, agentProtocol, ...componentResults] = await Promise.all([
      projectRulesPromise,
      agentProtocolPromise,
      ...componentPromises,
    ])

    const componentSpecs = new Map(
      componentResults.map((r) => [r.nodeId, r.yaml])
    )

    return { projectRules, agentProtocol, componentSpecs }
  } catch (error) {
    // Wrap errors with context
    if (error instanceof Error) {
      throw new Error(
        `AI generation failed: ${error.message}. Please check your API key and try again.`
      )
    }
    throw new Error(
      'AI generation failed due to an unexpected error. Please try again.'
    )
  }
}
