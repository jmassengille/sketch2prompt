import type { NodeType } from '../types'

// ==============================================
// PLATFORMS
// ==============================================

export const PLATFORMS = {
  web: 'web',
  api: 'api',
  cli: 'cli',
  desktop: 'desktop',
} as const

export type Platform = (typeof PLATFORMS)[keyof typeof PLATFORMS]

// ==============================================
// PRIMARY PATTERNS
// ==============================================

export const PATTERNS = {
  crud: 'crud',
  aiChat: 'ai-chat',
  docProcessing: 'doc-processing',
  searchRag: 'search-rag',
  automation: 'automation',
  custom: 'custom',
} as const

export type PrimaryPattern = (typeof PATTERNS)[keyof typeof PATTERNS]

// ==============================================
// STACK CATEGORIES
// ==============================================

export const STACK_CATEGORIES = {
  language: 'language',
  framework: 'framework',
  database: 'database',
  aiProvider: 'ai-provider',
} as const

export type StackCategory = (typeof STACK_CATEGORIES)[keyof typeof STACK_CATEGORIES]

// ==============================================
// STACK OPTION
// ==============================================

export type StackOption = {
  id: string
  label: string
  category: StackCategory
  platforms: Platform[]
  suggestedForPatterns?: PrimaryPattern[]
  nodeType: NodeType
  priority?: number
  /** For frameworks: which language IDs this framework works with */
  compatibleLanguages?: string[]
}

// ==============================================
// CAPABILITIES
// ==============================================

export const CAPABILITIES = {
  auth: 'auth',
  fileUpload: 'file-upload',
  vectorStore: 'vector-store',
  backgroundJobs: 'background-jobs',
  externalApis: 'external-apis',
} as const

export type CapabilityId = (typeof CAPABILITIES)[keyof typeof CAPABILITIES]

export type CapabilityConfig = {
  id: CapabilityId
  label: string
  description: string
  nodeType: NodeType
  defaultTech: string
  techAlternatives: string[]
  enabledByPatterns: PrimaryPattern[]
  suggestedByPatterns?: PrimaryPattern[]
  maxTechChoices?: number
}

// ==============================================
// OUT OF SCOPE ITEMS
// ==============================================

export const OUT_OF_SCOPE_ITEMS = {
  caching: 'caching',
  messageQueues: 'message-queues',
  multiTenancy: 'multi-tenancy',
  horizontalScaling: 'horizontal-scaling',
  realtime: 'realtime',
} as const

export type OutOfScopeId = (typeof OUT_OF_SCOPE_ITEMS)[keyof typeof OUT_OF_SCOPE_ITEMS]

export type OutOfScopeConfig = {
  id: OutOfScopeId
  label: string
  description: string
  rationale: string
  inclusionWarning?: string
  defaultExcluded: boolean
}

// ==============================================
// PLATFORM CONFIG
// ==============================================

export type PlatformConfig = {
  id: Platform
  label: string
  description: string
  availablePatterns: PrimaryPattern[]
  iconId: string
}

// ==============================================
// PATTERN CONFIG
// ==============================================

export type PatternConfig = {
  id: PrimaryPattern
  label: string
  description: string
  platforms: Platform[]
  defaultCapabilities: CapabilityId[]
  suggestedStack?: {
    language?: string
    framework?: string
    database?: string
    aiProvider?: string
  }
  iconId: string
}

// ==============================================
// WIZARD STATE
// ==============================================

export type WizardCapabilityState = {
  id: CapabilityId
  enabled: boolean
  selectedTech: string[]
}

export type WizardStackSelection = {
  /** Frontend languages (TypeScript, JavaScript) */
  frontendLanguages: string[]
  /** Backend languages (Python, TypeScript, Go, etc.) */
  backendLanguages: string[]
  /** Frontend framework (Next.js, React, Vue, etc.) - required for web/desktop */
  frontendFramework: string | null
  /** Backend framework (FastAPI, Express, etc.) - required for web/api */
  backendFramework: string | null
  database: string | null
  aiProvider: string | null
}

export type WizardData = {
  platform: Platform | null
  pattern: PrimaryPattern | null
  stack: WizardStackSelection
  capabilities: WizardCapabilityState[]
  outOfScope: OutOfScopeId[]
  projectTitle: string
}

// ==============================================
// INITIAL STATE
// ==============================================

export const INITIAL_WIZARD_DATA: WizardData = {
  platform: null,
  pattern: null,
  stack: {
    frontendLanguages: [],
    backendLanguages: [],
    frontendFramework: null,
    backendFramework: null,
    database: null,
    aiProvider: null,
  },
  capabilities: [],
  outOfScope: [],
  projectTitle: '',
}
