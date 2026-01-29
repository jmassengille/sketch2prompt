/**
 * Snippet Orchestrator
 *
 * Coordinates parallel AI generation for isolated prose snippets.
 * Uses higher concurrency than file generation since snippets are smaller.
 */
import pLimit from 'p-limit'
import type OpenAI from 'openai'
import type { z } from 'zod'
import type { DiagramNode } from '../types'
import type {
  AIProvider,
  SnippetPrompt,
  SnippetType,
  AISnippets,
  ProjectDescriptionResponse,
  BoundaryAdditionsResponse,
  ComponentDescriptionResponse,
  ComponentResponsibilitiesResponse,
  AntiResponsibilitiesResponse,
} from './types'
import {
  ProjectDescriptionSchema,
  BoundaryAdditionsSchema,
  ComponentDescriptionSchema,
  ComponentResponsibilitiesSchema,
  AntiResponsibilitiesSchema,
} from './types'
import { createClient, callAI } from './client'
import {
  buildProjectDescriptionPrompt,
  buildBoundaryAdditionsPrompt,
  buildComponentDescriptionPrompt,
  buildComponentResponsibilitiesPrompt,
  buildAntiResponsibilitiesPrompt,
} from './prompts'

/**
 * Higher concurrency for snippets (smaller, faster responses).
 * Snippets are ~50-100 tokens vs ~2000+ for full files.
 */
const SNIPPET_CONCURRENCY = 5

/** Internal type for tracking raw snippet results before aggregation */
interface RawSnippetResult {
  type: SnippetType
  componentId?: string | undefined
  data: unknown
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Map snippet type to its Zod validation schema */
function getSchemaForType(type: SnippetType): z.ZodType {
  const schemas: Record<SnippetType, z.ZodType> = {
    'project-description': ProjectDescriptionSchema,
    'boundary-additions': BoundaryAdditionsSchema,
    'component-description': ComponentDescriptionSchema,
    'component-responsibilities': ComponentResponsibilitiesSchema,
    'anti-responsibilities': AntiResponsibilitiesSchema,
  }
  return schemas[type]
}

/**
 * Parse AI response as JSON and validate with Zod schema.
 * Handles common AI response issues (markdown fences, whitespace).
 */
function parseAndValidate<T>(
  response: string,
  schema: z.ZodType<T>,
  snippetType: SnippetType
): T {
  // Strip markdown code fences if present
  const cleaned = response
    .replace(/^```json?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const preview = response.slice(0, 100)
    throw new Error(`Invalid JSON from AI for ${snippetType}: ${preview}...`)
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new Error(
      `Schema validation failed for ${snippetType}: ${result.error.message}`
    )
  }
  return result.data
}

/**
 * Execute a single snippet prompt and validate response.
 */
async function executeSnippet(
  client: OpenAI,
  snippet: SnippetPrompt,
  modelId: string,
  signal?: AbortSignal
): Promise<RawSnippetResult> {
  const taskDesc = snippet.componentId
    ? `snippet:${snippet.type}:${snippet.componentId}`
    : `snippet:${snippet.type}`

  const response = await callAI(client, snippet.prompt, modelId, taskDesc, signal)
  const schema = getSchemaForType(snippet.type)
  const data = parseAndValidate(response, schema, snippet.type)

  return {
    type: snippet.type,
    componentId: snippet.componentId,
    data,
  }
}

/**
 * Build all snippet prompts for a diagram.
 */
function buildAllSnippetPrompts(
  nodes: DiagramNode[],
  projectName: string
): SnippetPrompt[] {
  const components = nodes.map((n) => ({
    label: n.data.label,
    type: n.data.type,
    description: n.data.meta.description,
    techStack: n.data.meta.techStack,
  }))

  const componentTypes = nodes.map((n) => n.data.type)

  // Project-level prompts
  const prompts: SnippetPrompt[] = [
    buildProjectDescriptionPrompt(components, projectName),
    buildBoundaryAdditionsPrompt(componentTypes, projectName),
  ]

  // Component-level prompts (3 per component)
  for (const node of nodes) {
    // Build component object, only including optional fields if defined
    const component: {
      label: string
      type: typeof node.data.type
      description?: string
      techStack?: string[]
    } = {
      label: node.data.label,
      type: node.data.type,
    }
    if (node.data.meta.description) {
      component.description = node.data.meta.description
    }
    if (node.data.meta.techStack) {
      component.techStack = node.data.meta.techStack
    }
    prompts.push(
      buildComponentDescriptionPrompt(component, node.id),
      buildComponentResponsibilitiesPrompt(component, node.id),
      buildAntiResponsibilitiesPrompt(component, node.id)
    )
  }

  return prompts
}

/** Component snippet entry type */
type ComponentSnippetEntry = {
  description: string
  responsibilities: string[]
  antiResponsibilities: string[]
}

/** Get or create a component entry in the map */
function getOrCreateComponentEntry(
  map: Map<string, ComponentSnippetEntry>,
  componentId: string
): ComponentSnippetEntry {
  const existing = map.get(componentId)
  if (existing) {
    return existing
  }
  const entry: ComponentSnippetEntry = {
    description: '',
    responsibilities: [],
    antiResponsibilities: [],
  }
  map.set(componentId, entry)
  return entry
}

/**
 * Aggregate raw snippet results into AISnippets structure.
 */
function aggregateResults(results: RawSnippetResult[]): AISnippets {
  let projectDescription = ''
  let boundaryAdditions: AISnippets['boundaryAdditions'] = { isItems: [], isNotItems: [] }
  const componentSnippets = new Map<string, ComponentSnippetEntry>()

  for (const result of results) {
    switch (result.type) {
      case 'project-description':
        projectDescription = (result.data as ProjectDescriptionResponse).description
        break
      case 'boundary-additions':
        boundaryAdditions = result.data as BoundaryAdditionsResponse
        break
      case 'component-description': {
        if (!result.componentId) break
        const entry = getOrCreateComponentEntry(componentSnippets, result.componentId)
        entry.description = (result.data as ComponentDescriptionResponse).description
        break
      }
      case 'component-responsibilities': {
        if (!result.componentId) break
        const entry = getOrCreateComponentEntry(componentSnippets, result.componentId)
        entry.responsibilities = (result.data as ComponentResponsibilitiesResponse).responsibilities
        break
      }
      case 'anti-responsibilities': {
        if (!result.componentId) break
        const entry = getOrCreateComponentEntry(componentSnippets, result.componentId)
        entry.antiResponsibilities = (result.data as AntiResponsibilitiesResponse).antiResponsibilities
        break
      }
    }
  }

  return { projectDescription, boundaryAdditions, componentSnippets }
}

// =============================================================================
// Public API
// =============================================================================

export interface GenerateSnippetsOptions {
  nodes: DiagramNode[]
  projectName: string
  apiKey: string
  provider: AIProvider
  modelId: string
  signal?: AbortSignal | undefined
  onSnippetComplete?: ((type: SnippetType, componentId?: string) => void) | undefined
}

/**
 * Generate AI snippets for all components in parallel.
 * Returns aggregated AISnippets ready for assembler consumption.
 */
export async function generateSnippets(
  options: GenerateSnippetsOptions
): Promise<AISnippets> {
  const { nodes, projectName, apiKey, provider, modelId, signal, onSnippetComplete } = options

  const client = createClient(apiKey, provider)
  const limit = pLimit(SNIPPET_CONCURRENCY)
  const prompts = buildAllSnippetPrompts(nodes, projectName)

  const resultPromises = prompts.map((snippet) =>
    limit(async () => {
      const result = await executeSnippet(client, snippet, modelId, signal)
      onSnippetComplete?.(result.type, result.componentId)
      return result
    })
  )

  try {
    const results = await Promise.all(resultPromises)
    return aggregateResults(results)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Snippet generation failed: ${error.message}`)
    }
    throw new Error('Snippet generation failed due to an unexpected error.')
  }
}
