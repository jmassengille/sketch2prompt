import type { NodeType } from '../types'

export type AIProvider = 'anthropic' | 'openai'

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
