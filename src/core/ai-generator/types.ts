import { z } from 'zod'
import type { NodeType } from '../types'

export type AIProvider = 'anthropic' | 'openai'

// =============================================================================
// Snippet Types
// =============================================================================

/** Snippet type identifiers */
export type SnippetType =
  | 'project-description'
  | 'boundary-additions'
  | 'component-description'
  | 'component-responsibilities'
  | 'anti-responsibilities'

/** Output from snippet prompt builder */
export interface SnippetPrompt {
  type: SnippetType
  prompt: string
  /** For component-level snippets, identifies which component */
  componentId?: string
  /** Expected max tokens in response */
  maxTokens: number
}

// =============================================================================
// Zod Schemas for AI Responses
// =============================================================================

export const ProjectDescriptionSchema = z.object({
  description: z.string().max(500),
})

export const BoundaryAdditionsSchema = z.object({
  isItems: z.array(z.string()).max(5),
  isNotItems: z.array(z.string()).max(5),
})

export const ComponentDescriptionSchema = z.object({
  description: z.string().max(300),
})

export const ComponentResponsibilitiesSchema = z.object({
  responsibilities: z.array(z.string()).min(3).max(5),
})

export const AntiResponsibilitiesSchema = z.object({
  antiResponsibilities: z.array(z.string()).min(3).max(5),
})

/** Inferred types from schemas */
export type ProjectDescriptionResponse = z.infer<typeof ProjectDescriptionSchema>
export type BoundaryAdditionsResponse = z.infer<typeof BoundaryAdditionsSchema>
export type ComponentDescriptionResponse = z.infer<typeof ComponentDescriptionSchema>
export type ComponentResponsibilitiesResponse = z.infer<typeof ComponentResponsibilitiesSchema>
export type AntiResponsibilitiesResponse = z.infer<typeof AntiResponsibilitiesSchema>

/**
 * Aggregated snippets for a generation run.
 *
 * Note: Schema types (e.g., ProjectDescriptionResponse) wrap values in objects.
 * This interface uses unwrapped values for cleaner consumption.
 * The snippet-orchestrator (M2) handles unwrapping after Zod validation.
 */
export interface AISnippets {
  projectDescription: string
  boundaryAdditions: { isItems: string[]; isNotItems: string[] }
  componentSnippets: Map<
    string,
    {
      description: string
      responsibilities: string[]
      antiResponsibilities: string[]
    }
  >
}

// =============================================================================
// Existing Types
// =============================================================================

export interface GenerationResult {
  projectRules: string
  agentProtocol: string
  componentSpecs: Map<string, string> // nodeId -> YAML content
}

export const PROVIDER_CONFIG: Record<AIProvider, { baseURL: string | undefined }> = {
  anthropic: { baseURL: 'https://api.anthropic.com/v1/' },
  openai: { baseURL: undefined }, // Uses OpenAI default
}

export const NODE_TYPE_BUILD_ORDER: Record<NodeType, number> = {
  storage: 1,
  auth: 2,
  backend: 3,
  frontend: 4,
  external: 5,
  background: 6,
}
