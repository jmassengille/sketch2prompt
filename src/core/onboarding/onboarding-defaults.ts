import type {
  PlatformConfig,
  PatternConfig,
  StackOption,
  CapabilityConfig,
  OutOfScopeConfig,
} from './onboarding-types'
import {
  PLATFORMS,
  PATTERNS,
  STACK_CATEGORIES,
  CAPABILITIES,
  OUT_OF_SCOPE_ITEMS,
} from './onboarding-types'

// ============================================================================
// PLATFORM CONFIGURATIONS
// ============================================================================

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: PLATFORMS.web,
    label: 'Web Application',
    description: 'Full-stack web app with frontend and backend',
    availablePatterns: [
      PATTERNS.crud,
      PATTERNS.aiChat,
      PATTERNS.docProcessing,
      PATTERNS.searchRag,
      PATTERNS.automation,
      PATTERNS.custom,
    ],
    iconId: 'web',
  },
  {
    id: PLATFORMS.api,
    label: 'API / Backend Service',
    description: 'Backend-only service, no frontend',
    availablePatterns: [
      PATTERNS.crud,
      PATTERNS.docProcessing,
      PATTERNS.searchRag,
      PATTERNS.automation,
      PATTERNS.custom,
    ],
    iconId: 'api',
  },
  {
    id: PLATFORMS.cli,
    label: 'CLI Tool',
    description: 'Command-line interface or script',
    availablePatterns: [
      PATTERNS.docProcessing,
      PATTERNS.automation,
      PATTERNS.custom,
    ],
    iconId: 'cli',
  },
  {
    id: PLATFORMS.desktop,
    label: 'Desktop Application',
    description: 'Native desktop app (Electron/Tauri)',
    availablePatterns: [
      PATTERNS.crud,
      PATTERNS.aiChat,
      PATTERNS.docProcessing,
      PATTERNS.custom,
    ],
    iconId: 'desktop',
  },
] satisfies PlatformConfig[]

// ============================================================================
// PATTERN CONFIGURATIONS
// ============================================================================

export const PATTERN_CONFIGS: PatternConfig[] = [
  {
    id: PATTERNS.crud,
    label: 'CRUD / Dashboard',
    description: 'Create, read, update, delete data with admin interface',
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.desktop],
    defaultCapabilities: [CAPABILITIES.auth],
    suggestedStack: {
      framework: 'Next.js',
      database: 'PostgreSQL',
    },
    iconId: 'crud',
  },
  {
    id: PATTERNS.aiChat,
    label: 'AI Chat Interface',
    description: 'Conversational AI with message history',
    platforms: [PLATFORMS.web, PLATFORMS.desktop],
    defaultCapabilities: [CAPABILITIES.auth],
    suggestedStack: {
      framework: 'Next.js',
      aiProvider: 'OpenAI',
    },
    iconId: 'ai-chat',
  },
  {
    id: PATTERNS.docProcessing,
    label: 'Document Processing',
    description: 'Parse, transform, or analyze files',
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    defaultCapabilities: [],
    suggestedStack: {
      language: 'Python',
      framework: 'FastAPI',
    },
    iconId: 'doc-processing',
  },
  {
    id: PATTERNS.searchRag,
    label: 'Search / RAG',
    description: 'Semantic search with retrieval-augmented generation',
    platforms: [PLATFORMS.web, PLATFORMS.api],
    defaultCapabilities: [CAPABILITIES.vectorStore],
    suggestedStack: {
      aiProvider: 'OpenAI',
      database: 'PostgreSQL',
    },
    iconId: 'search-rag',
  },
  {
    id: PATTERNS.automation,
    label: 'Automation / Integration',
    description: 'Scheduled tasks, webhooks, API integrations',
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli],
    defaultCapabilities: [CAPABILITIES.backgroundJobs, CAPABILITIES.externalApis],
    suggestedStack: {},
    iconId: 'automation',
  },
  {
    id: PATTERNS.custom,
    label: 'Custom',
    description: 'Start from scratch with no assumptions',
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    defaultCapabilities: [],
    suggestedStack: {},
    iconId: 'custom',
  },
] satisfies PatternConfig[]

// ============================================================================
// STACK OPTIONS
// ============================================================================

export const STACK_OPTIONS: StackOption[] = [
  // ===================
  // LANGUAGES
  // ===================
  {
    id: 'typescript',
    label: 'TypeScript',
    category: STACK_CATEGORIES.language,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    nodeType: 'frontend',
    priority: 1,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    category: STACK_CATEGORIES.language,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    nodeType: 'frontend',
    priority: 1,
  },
  {
    id: 'python',
    label: 'Python',
    category: STACK_CATEGORIES.language,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli],
    suggestedForPatterns: [PATTERNS.docProcessing, PATTERNS.searchRag],
    nodeType: 'backend',
    priority: 1,
  },
  {
    id: 'java',
    label: 'Java',
    category: STACK_CATEGORIES.language,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli],
    nodeType: 'backend',
    priority: 2,
  },
  {
    id: 'csharp',
    label: 'C# / .NET',
    category: STACK_CATEGORIES.language,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    nodeType: 'backend',
    priority: 2,
  },
  {
    id: 'go',
    label: 'Go',
    category: STACK_CATEGORIES.language,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli],
    nodeType: 'backend',
    priority: 2,
  },
  {
    id: 'rust',
    label: 'Rust',
    category: STACK_CATEGORIES.language,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    nodeType: 'backend',
    priority: 3,
  },

  // ===================
  // FRAMEWORKS - Frontend (JavaScript/TypeScript)
  // ===================
  {
    id: 'nextjs',
    label: 'Next.js',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web],
    suggestedForPatterns: [PATTERNS.crud, PATTERNS.aiChat],
    nodeType: 'frontend',
    priority: 1,
    compatibleLanguages: ['typescript', 'javascript'],
  },
  {
    id: 'react-vite',
    label: 'React (Vite)',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.desktop],
    nodeType: 'frontend',
    priority: 1,
    compatibleLanguages: ['typescript', 'javascript'],
  },
  {
    id: 'vue',
    label: 'Vue 3',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.desktop],
    nodeType: 'frontend',
    priority: 2,
    compatibleLanguages: ['typescript', 'javascript'],
  },
  {
    id: 'angular',
    label: 'Angular',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web],
    nodeType: 'frontend',
    priority: 2,
    compatibleLanguages: ['typescript'], // Angular is TypeScript-first
  },
  {
    id: 'svelte',
    label: 'SvelteKit',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web],
    nodeType: 'frontend',
    priority: 3,
    compatibleLanguages: ['typescript', 'javascript'],
  },

  // ===================
  // FRAMEWORKS - Backend
  // ===================
  {
    id: 'express',
    label: 'Express',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    nodeType: 'backend',
    priority: 1,
    compatibleLanguages: ['typescript', 'javascript'],
  },
  {
    id: 'fastapi',
    label: 'FastAPI',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    suggestedForPatterns: [PATTERNS.docProcessing, PATTERNS.searchRag],
    nodeType: 'backend',
    priority: 1,
    compatibleLanguages: ['python'],
  },
  {
    id: 'spring-boot',
    label: 'Spring Boot',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    suggestedForPatterns: [PATTERNS.crud],
    nodeType: 'backend',
    priority: 1,
    compatibleLanguages: ['java'],
  },
  {
    id: 'aspnet-core',
    label: 'ASP.NET Core',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    nodeType: 'backend',
    priority: 1,
    compatibleLanguages: ['csharp'],
  },
  {
    id: 'django',
    label: 'Django',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    suggestedForPatterns: [PATTERNS.crud],
    nodeType: 'backend',
    priority: 2,
    compatibleLanguages: ['python'],
  },
  {
    id: 'gin',
    label: 'Gin',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    nodeType: 'backend',
    priority: 1,
    compatibleLanguages: ['go'],
  },
  {
    id: 'actix-web',
    label: 'Actix Web',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    nodeType: 'backend',
    priority: 1,
    compatibleLanguages: ['rust'],
  },
  {
    id: 'hono',
    label: 'Hono',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    nodeType: 'backend',
    priority: 3,
    compatibleLanguages: ['typescript', 'javascript'],
  },

  // ===================
  // FRAMEWORKS - Desktop
  // ===================
  {
    id: 'electron',
    label: 'Electron',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.desktop],
    nodeType: 'frontend',
    priority: 1,
    compatibleLanguages: ['typescript', 'javascript'],
  },
  {
    id: 'tauri',
    label: 'Tauri',
    category: STACK_CATEGORIES.framework,
    platforms: [PLATFORMS.desktop],
    nodeType: 'frontend',
    priority: 2,
    compatibleLanguages: ['typescript', 'javascript', 'rust'],
  },

  // ===================
  // DATABASES
  // ===================
  {
    id: 'postgresql',
    label: 'PostgreSQL',
    category: STACK_CATEGORIES.database,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.desktop],
    suggestedForPatterns: [PATTERNS.crud, PATTERNS.searchRag],
    nodeType: 'storage',
    priority: 1,
  },
  {
    id: 'mysql',
    label: 'MySQL',
    category: STACK_CATEGORIES.database,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.desktop],
    nodeType: 'storage',
    priority: 1,
  },
  {
    id: 'supabase',
    label: 'Supabase',
    category: STACK_CATEGORIES.database,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    nodeType: 'storage',
    priority: 2,
  },
  {
    id: 'sqlite',
    label: 'SQLite',
    category: STACK_CATEGORIES.database,
    platforms: [PLATFORMS.cli, PLATFORMS.desktop],
    nodeType: 'storage',
    priority: 1,
  },
  {
    id: 'mongodb',
    label: 'MongoDB',
    category: STACK_CATEGORIES.database,
    platforms: [PLATFORMS.web, PLATFORMS.api],
    nodeType: 'storage',
    priority: 2,
  },
  // ===================
  // AI PROVIDERS
  // ===================
  {
    id: 'openai',
    label: 'OpenAI',
    category: STACK_CATEGORIES.aiProvider,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    suggestedForPatterns: [PATTERNS.aiChat, PATTERNS.searchRag],
    nodeType: 'external',
    priority: 1,
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    category: STACK_CATEGORIES.aiProvider,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    suggestedForPatterns: [PATTERNS.aiChat, PATTERNS.docProcessing],
    nodeType: 'external',
    priority: 1,
  },
  {
    id: 'google-ai',
    label: 'Google AI (Gemini)',
    category: STACK_CATEGORIES.aiProvider,
    platforms: [PLATFORMS.web, PLATFORMS.api, PLATFORMS.cli, PLATFORMS.desktop],
    suggestedForPatterns: [PATTERNS.aiChat, PATTERNS.docProcessing],
    nodeType: 'external',
    priority: 2,
  },
  {
    id: 'ollama',
    label: 'Ollama (Local)',
    category: STACK_CATEGORIES.aiProvider,
    platforms: [PLATFORMS.cli, PLATFORMS.desktop],
    nodeType: 'external',
    priority: 3,
  },
] satisfies StackOption[]

// ============================================================================
// CAPABILITY CONFIGURATIONS
// ============================================================================

export const CAPABILITY_CONFIGS: CapabilityConfig[] = [
  {
    id: CAPABILITIES.auth,
    label: 'Authentication',
    description: 'User login, signup, and session management',
    nodeType: 'auth',
    defaultTech: 'Supabase Auth',
    techAlternatives: ['Clerk', 'Auth0', 'NextAuth'],
    enabledByPatterns: [PATTERNS.crud, PATTERNS.aiChat],
    maxTechChoices: 1,
  },
  {
    id: CAPABILITIES.fileUpload,
    label: 'File Upload',
    description: 'Accept and store user-uploaded files',
    nodeType: 'storage',
    defaultTech: 'Supabase Storage',
    techAlternatives: ['AWS S3', 'Cloudflare R2'],
    enabledByPatterns: [PATTERNS.docProcessing],
    suggestedByPatterns: [PATTERNS.crud],
    maxTechChoices: 1,
  },
  {
    id: CAPABILITIES.vectorStore,
    label: 'Vector Store',
    description: 'Semantic search and embeddings storage',
    nodeType: 'storage',
    defaultTech: 'pgvector',
    techAlternatives: ['Pinecone', 'Weaviate', 'Qdrant'],
    enabledByPatterns: [PATTERNS.searchRag],
    suggestedByPatterns: [PATTERNS.aiChat],
    maxTechChoices: 1,
  },
  {
    id: CAPABILITIES.backgroundJobs,
    label: 'Background Jobs',
    description: 'Scheduled tasks and async processing',
    nodeType: 'background',
    defaultTech: 'Inngest',
    techAlternatives: ['BullMQ', 'Trigger.dev'],
    enabledByPatterns: [PATTERNS.docProcessing, PATTERNS.automation],
    maxTechChoices: 1,
  },
  {
    id: CAPABILITIES.externalApis,
    label: 'External APIs',
    description: 'Integrate with third-party services',
    nodeType: 'external',
    defaultTech: 'REST APIs',
    techAlternatives: ['GraphQL', 'Webhooks'],
    enabledByPatterns: [PATTERNS.automation],
    suggestedByPatterns: [PATTERNS.crud],
    maxTechChoices: 2,
  },
] satisfies CapabilityConfig[]

// ============================================================================
// OUT OF SCOPE CONFIGURATIONS
// ============================================================================

export const OUT_OF_SCOPE_CONFIGS: OutOfScopeConfig[] = [
  {
    id: OUT_OF_SCOPE_ITEMS.caching,
    label: 'Caching Layer',
    description: 'Redis, Memcached, or CDN caching',
    rationale:
      'Caching is a premature optimization. Start with a simple database and add caching only when performance metrics justify it.',
    inclusionWarning: 'Add caching after measuring performance, not before.',
    defaultExcluded: true,
  },
  {
    id: OUT_OF_SCOPE_ITEMS.messageQueues,
    label: 'Message Queues',
    description: 'RabbitMQ, Kafka, or SQS',
    rationale:
      'Background jobs cover most async needs. Message queues add complexity and are only needed for high-throughput event streaming.',
    inclusionWarning: 'Use background jobs first. Add queues only for event-driven architecture.',
    defaultExcluded: true,
  },
  {
    id: OUT_OF_SCOPE_ITEMS.multiTenancy,
    label: 'Multi-tenancy',
    description: 'Separate data per organization/workspace',
    rationale:
      'Multi-tenancy adds significant architectural complexity. Build for single users first, then migrate when you have paying customers.',
    inclusionWarning: 'Retrofitting multi-tenancy is hard. Plan data isolation carefully.',
    defaultExcluded: true,
  },
  {
    id: OUT_OF_SCOPE_ITEMS.horizontalScaling,
    label: 'Horizontal Scaling',
    description: 'Load balancers, auto-scaling, multi-region',
    rationale:
      'A single well-configured server can handle thousands of users. Focus on shipping features, not infrastructure scalability.',
    inclusionWarning: 'Vertical scaling (bigger server) is simpler than horizontal scaling.',
    defaultExcluded: true,
  },
  {
    id: OUT_OF_SCOPE_ITEMS.realtime,
    label: 'Real-time / WebSockets',
    description: 'Live updates, chat, collaborative editing',
    rationale:
      'Real-time features add complexity in state management, reconnection logic, and scaling. Polling is simpler and sufficient for most use cases.',
    inclusionWarning: 'Consider polling or server-sent events before WebSockets.',
    defaultExcluded: true,
  },
] satisfies OutOfScopeConfig[]
