import type { DiagramNode, DiagramEdge } from '../types'
import type {
  StreamingCallbacks,
  StreamingGenerationResult,
} from '../streaming-types'
import type { AIProvider } from './types'
import { createClient, callAI } from './client'
import {
  buildProjectRulesPrompt,
  buildComponentSpecPrompt,
  buildAgentProtocolPrompt,
} from './prompts'
import { slugify } from '../utils/slugify'

/**
 * Call AI with progress callbacks
 */
async function callAIWithProgress(
  client: ReturnType<typeof createClient>,
  prompt: string,
  modelId: string,
  fileName: string,
  callbacks: StreamingCallbacks
): Promise<string> {
  callbacks.onFileStart(fileName)

  try {
    const content = await callAI(client, prompt, modelId, fileName)
    callbacks.onFileComplete(fileName, content)
    return content
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Generation failed')
    callbacks.onError(err)
    throw err
  }
}

/**
 * Generate PROJECT_RULES.md content
 */
async function generateProjectRules(
  client: ReturnType<typeof createClient>,
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  modelId: string
): Promise<string> {
  const prompt = buildProjectRulesPrompt(nodes, edges, projectName)
  return callAI(client, prompt, modelId, 'PROJECT_RULES.md')
}

/**
 * Generate AGENT_PROTOCOL.md content
 */
async function generateAgentProtocol(
  client: ReturnType<typeof createClient>,
  nodes: DiagramNode[],
  projectName: string,
  modelId: string
): Promise<string> {
  const prompt = buildAgentProtocolPrompt(nodes, projectName)
  return callAI(client, prompt, modelId, 'AGENT_PROTOCOL.md')
}

/**
 * Generate all component specs in parallel
 */
async function generateComponentSpecs(
  client: ReturnType<typeof createClient>,
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  modelId: string
): Promise<Map<string, string>> {
  const promises = nodes.map(async (node) => {
    const prompt = buildComponentSpecPrompt(node, nodes, edges)
    const yaml = await callAI(
      client,
      prompt,
      modelId,
      `component spec for ${node.data.label}`
    )
    return { nodeId: node.id, yaml }
  })

  const results = await Promise.all(promises)
  return new Map(results.map((r) => [r.nodeId, r.yaml]))
}

/**
 * Generate AI-powered project documentation from diagram
 */
export async function generateWithAI(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  apiKey: string,
  provider: AIProvider,
  modelId: string
): Promise<StreamingGenerationResult> {
  try {
    const client = createClient(apiKey, provider)

    const projectRules = await generateProjectRules(
      client,
      nodes,
      edges,
      projectName,
      modelId
    )
    const agentProtocol = await generateAgentProtocol(
      client,
      nodes,
      projectName,
      modelId
    )
    const componentSpecs = await generateComponentSpecs(
      client,
      nodes,
      edges,
      modelId
    )

    return { projectRules, agentProtocol, componentSpecs }
  } catch (error) {
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

/**
 * Generate component specs with streaming progress
 */
async function generateComponentSpecsStreaming(
  client: ReturnType<typeof createClient>,
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  modelId: string,
  callbacks: StreamingCallbacks,
  filesCompleted: number,
  totalFiles: number
): Promise<{ specs: Map<string, string>; completed: number }> {
  const componentSpecs = new Map<string, string>()

  for (const node of nodes) {
    const fileName = `specs/${slugify(node.data.label)}.yaml`

    callbacks.onProgress({
      phase: 'generating-component-specs',
      currentFile: fileName,
      filesCompleted,
      totalFiles,
    })

    const prompt = buildComponentSpecPrompt(node, nodes, edges)
    const yaml = await callAIWithProgress(
      client,
      prompt,
      modelId,
      fileName,
      callbacks
    )
    componentSpecs.set(node.id, yaml)
    filesCompleted++
  }

  return { specs: componentSpecs, completed: filesCompleted }
}

/**
 * Generate PROJECT_RULES.md with streaming
 */
async function generateProjectRulesStreaming(
  client: ReturnType<typeof createClient>,
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  modelId: string,
  callbacks: StreamingCallbacks,
  totalFiles: number
): Promise<string> {
  callbacks.onProgress({
    phase: 'generating-project-rules',
    currentFile: 'PROJECT_RULES.md',
    filesCompleted: 0,
    totalFiles,
  })

  const prompt = buildProjectRulesPrompt(nodes, edges, projectName)
  return callAIWithProgress(
    client,
    prompt,
    modelId,
    'PROJECT_RULES.md',
    callbacks
  )
}

/**
 * Generate AGENT_PROTOCOL.md with streaming
 */
async function generateAgentProtocolStreaming(
  client: ReturnType<typeof createClient>,
  nodes: DiagramNode[],
  projectName: string,
  modelId: string,
  callbacks: StreamingCallbacks,
  filesCompleted: number,
  totalFiles: number
): Promise<string> {
  callbacks.onProgress({
    phase: 'generating-agent-protocol',
    currentFile: 'AGENT_PROTOCOL.md',
    filesCompleted,
    totalFiles,
  })

  const prompt = buildAgentProtocolPrompt(nodes, projectName)
  return callAIWithProgress(
    client,
    prompt,
    modelId,
    'AGENT_PROTOCOL.md',
    callbacks
  )
}

/**
 * Core streaming generation logic
 */
async function performStreamingGeneration(
  client: ReturnType<typeof createClient>,
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  modelId: string,
  callbacks: StreamingCallbacks,
  totalFiles: number
): Promise<StreamingGenerationResult> {
  const projectRules = await generateProjectRulesStreaming(
    client,
    nodes,
    edges,
    projectName,
    modelId,
    callbacks,
    totalFiles
  )

  const agentProtocol = await generateAgentProtocolStreaming(
    client,
    nodes,
    projectName,
    modelId,
    callbacks,
    1,
    totalFiles
  )

  const { specs: componentSpecs } = await generateComponentSpecsStreaming(
    client,
    nodes,
    edges,
    modelId,
    callbacks,
    2,
    totalFiles
  )

  callbacks.onProgress({
    phase: 'complete',
    currentFile: null,
    filesCompleted: totalFiles,
    totalFiles,
  })

  return { projectRules, agentProtocol, componentSpecs }
}

/**
 * Generate with streaming support (OpenAI only)
 */
export async function generateWithAIStreaming(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  apiKey: string,
  provider: AIProvider,
  modelId: string,
  callbacks: StreamingCallbacks
): Promise<StreamingGenerationResult> {
  if (provider === 'anthropic') {
    return generateWithSimulatedProgress(
      nodes,
      edges,
      projectName,
      apiKey,
      provider,
      modelId,
      callbacks
    )
  }

  const client = createClient(apiKey, provider)
  const totalFiles = 2 + nodes.length

  try {
    return await performStreamingGeneration(
      client,
      nodes,
      edges,
      projectName,
      modelId,
      callbacks,
      totalFiles
    )
  } catch (error) {
    callbacks.onProgress({
      phase: 'error',
      currentFile: null,
      filesCompleted: 0,
      totalFiles,
      error: error instanceof Error ? error.message : 'Generation failed',
    })
    throw error
  }
}

/**
 * Emit progress events for completed generation
 */
function emitCompletionEvents(
  callbacks: StreamingCallbacks,
  result: StreamingGenerationResult,
  nodes: DiagramNode[],
  totalFiles: number
): void {
  callbacks.onFileComplete('PROJECT_RULES.md', result.projectRules)
  callbacks.onProgress({
    phase: 'generating-agent-protocol',
    currentFile: 'AGENT_PROTOCOL.md',
    filesCompleted: 1,
    totalFiles,
  })

  callbacks.onFileStart('AGENT_PROTOCOL.md')
  callbacks.onFileComplete('AGENT_PROTOCOL.md', result.agentProtocol)

  let filesCompleted = 2
  for (const [nodeId, yaml] of result.componentSpecs) {
    const node = nodes.find((n) => n.id === nodeId)
    const fileName = node
      ? `specs/${slugify(node.data.label)}.yaml`
      : `specs/component-${nodeId}.yaml`

    callbacks.onProgress({
      phase: 'generating-component-specs',
      currentFile: fileName,
      filesCompleted,
      totalFiles,
    })

    callbacks.onFileStart(fileName)
    callbacks.onFileComplete(fileName, yaml)
    filesCompleted++
  }

  callbacks.onProgress({
    phase: 'complete',
    currentFile: null,
    filesCompleted: totalFiles,
    totalFiles,
  })
}

/**
 * Non-streaming generation with simulated progress (for Anthropic)
 */
async function generateWithSimulatedProgress(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  apiKey: string,
  provider: AIProvider,
  modelId: string,
  callbacks: StreamingCallbacks
): Promise<StreamingGenerationResult> {
  const totalFiles = 2 + nodes.length

  callbacks.onProgress({
    phase: 'generating-project-rules',
    currentFile: 'PROJECT_RULES.md',
    filesCompleted: 0,
    totalFiles,
  })
  callbacks.onFileStart('PROJECT_RULES.md')

  try {
    const result = await generateWithAI(
      nodes,
      edges,
      projectName,
      apiKey,
      provider,
      modelId
    )

    emitCompletionEvents(callbacks, result, nodes, totalFiles)
    return result
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Generation failed')
    callbacks.onError(err)
    callbacks.onProgress({
      phase: 'error',
      currentFile: null,
      filesCompleted: 0,
      totalFiles,
      error: err.message,
    })
    throw error
  }
}
