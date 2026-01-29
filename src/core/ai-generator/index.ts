// Public API
export { generateWithAI } from './orchestrator'
export type { GenerateOptions } from './orchestrator'
export type { AIProvider, GenerationResult } from './types'

// Snippet API (for isolated prose generation)
export { generateSnippets } from './snippet-orchestrator'
export type { GenerateSnippetsOptions } from './snippet-orchestrator'
export type { AISnippets, SnippetType } from './types'

// Assembler API (for combining deterministic sections with AI snippets)
export {
  assembleProjectRules,
  assembleAgentProtocol,
  assembleComponentSpec,
} from './assembler'
export type {
  AssembleProjectRulesOptions,
  AssembleAgentProtocolOptions,
  AssembleComponentSpecOptions,
} from './assembler'
