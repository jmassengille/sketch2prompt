import type { NodeType } from './types'

// ============================================================================
// TYPES
// ============================================================================

export type Platform = 'web' | 'mobile' | 'desktop' | 'cli'

export type Archetype =
  | 'saas'
  | 'marketplace'
  | 'content'
  | 'devtool'
  | 'custom'

export type ComponentDefinition = {
  id: string
  type: NodeType
  label: string
  defaultTech: string
  techAlternatives: string[] // max 3
  /** Maximum number of tech choices. 1 = single primary tech only. undefined = unlimited */
  maxTechChoices?: number
}

export type ArchetypeConfig = {
  id: Archetype
  label: string
  description: string
  platform: Platform
  badge?: string
  components: ComponentDefinition[]
}

// ============================================================================
// COMPONENT LIBRARY
// ============================================================================

const COMPONENTS = {
  // Frontend - single framework choice
  frontend: {
    id: 'frontend',
    type: 'frontend' as NodeType,
    label: 'Web App',
    defaultTech: 'Next.js',
    techAlternatives: ['React', 'Vue', 'SvelteKit'],
    maxTechChoices: 1,
  },

  // Backend - single runtime choice
  api: {
    id: 'api',
    type: 'backend' as NodeType,
    label: 'API Server',
    defaultTech: 'Node.js',
    techAlternatives: ['FastAPI', 'Go', 'Rails'],
    maxTechChoices: 1,
  },
  webhooks: {
    id: 'webhooks',
    type: 'backend' as NodeType,
    label: 'Webhook Handler',
    defaultTech: 'Node.js',
    techAlternatives: ['FastAPI', 'Go'],
    maxTechChoices: 1,
  },

  // Auth - single provider choice
  auth: {
    id: 'auth',
    type: 'auth' as NodeType,
    label: 'Auth Service',
    defaultTech: 'Supabase Auth',
    techAlternatives: ['Clerk', 'Auth0', 'NextAuth'],
    maxTechChoices: 1,
  },

  // Storage - database is single choice, file storage can vary
  database: {
    id: 'database',
    type: 'storage' as NodeType,
    label: 'Database',
    defaultTech: 'Supabase',
    techAlternatives: ['PostgreSQL', 'PlanetScale', 'MongoDB'],
    maxTechChoices: 1,
  },
  fileStorage: {
    id: 'file-storage',
    type: 'storage' as NodeType,
    label: 'File Storage',
    defaultTech: 'Supabase Storage',
    techAlternatives: ['AWS S3', 'Cloudflare R2'],
    maxTechChoices: 2, // backup + user uploads is valid
  },
  cache: {
    id: 'cache',
    type: 'storage' as NodeType,
    label: 'Cache',
    defaultTech: 'Redis',
    techAlternatives: ['Upstash', 'Memcached'],
    maxTechChoices: 1,
  },

  // External - payments usually single, email can have multiple use cases
  payments: {
    id: 'payments',
    type: 'external' as NodeType,
    label: 'Payment Gateway',
    defaultTech: 'Stripe',
    techAlternatives: ['Paddle', 'LemonSqueezy'],
    maxTechChoices: 1,
  },
  search: {
    id: 'search',
    type: 'external' as NodeType,
    label: 'Search Service',
    defaultTech: 'Meilisearch',
    techAlternatives: ['Algolia', 'Typesense'],
    maxTechChoices: 1,
  },
  email: {
    id: 'email',
    type: 'external' as NodeType,
    label: 'Email Service',
    defaultTech: 'Resend',
    techAlternatives: ['SendGrid', 'Postmark'],
    maxTechChoices: 2, // transactional + marketing can differ
  },
  pushNotifications: {
    id: 'push-notifications',
    type: 'external' as NodeType,
    label: 'Push Service',
    defaultTech: 'Firebase FCM',
    techAlternatives: ['OneSignal', 'Expo Push'],
    maxTechChoices: 1,
  },
  analytics: {
    id: 'analytics',
    type: 'external' as NodeType,
    label: 'Analytics',
    defaultTech: 'PostHog',
    techAlternatives: ['Mixpanel', 'Amplitude'],
    maxTechChoices: 2, // product + marketing analytics can differ
  },

  // Background - single queue system
  backgroundJobs: {
    id: 'background-jobs',
    type: 'background' as NodeType,
    label: 'Job Queue',
    defaultTech: 'Inngest',
    techAlternatives: ['BullMQ', 'Trigger.dev'],
    maxTechChoices: 1,
  },
} satisfies Record<string, ComponentDefinition>

// ============================================================================
// ARCHETYPE CONFIGURATIONS
// ============================================================================

export const ARCHETYPE_CONFIGS: ArchetypeConfig[] = [
  {
    id: 'saas',
    label: 'SaaS',
    description: 'Users pay monthly or yearly for a service',
    platform: 'web',
    badge: 'Most popular',
    components: [
      COMPONENTS.frontend,
      COMPONENTS.api,
      COMPONENTS.auth,
      COMPONENTS.database,
      COMPONENTS.payments,
      COMPONENTS.email,
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    description: 'Buyers and sellers trade through your platform',
    platform: 'web',
    components: [
      COMPONENTS.frontend,
      COMPONENTS.api,
      COMPONENTS.auth,
      COMPONENTS.database,
      COMPONENTS.payments,
      COMPONENTS.search,
      COMPONENTS.email,
    ],
  },
  {
    id: 'content',
    label: 'Content Platform',
    description: 'You publish, readers discover',
    platform: 'web',
    components: [
      COMPONENTS.frontend,
      COMPONENTS.api,
      COMPONENTS.database,
      COMPONENTS.fileStorage,
      COMPONENTS.search,
    ],
  },
  {
    id: 'devtool',
    label: 'Developer Tool',
    description: 'Developers integrate your service into their apps',
    platform: 'web',
    components: [
      COMPONENTS.api,
      COMPONENTS.auth,
      COMPONENTS.database,
      COMPONENTS.webhooks,
    ],
  },
  {
    id: 'custom',
    label: 'Something Else',
    description: 'Start with a blank canvas',
    platform: 'web',
    components: [],
  },
]

// ============================================================================
// FULL COMPONENT LIBRARY (for Step 2 additions)
// ============================================================================

export const ALL_COMPONENTS: ComponentDefinition[] = Object.values(COMPONENTS)

// ============================================================================
// CATEGORY DEFINITIONS (for Step 2 grouping)
// ============================================================================

export type CategoryConfig = {
  id: string
  label: string
  tooltip: string
  componentIds: string[]
}

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'infra',
    label: 'Core Infrastructure',
    tooltip: 'Your app\'s main parts — the website and the server',
    componentIds: ['frontend', 'api'],
  },
  {
    id: 'data',
    label: 'Data & Storage',
    tooltip: 'Where your app saves information — user data, files, etc.',
    componentIds: ['database', 'file-storage', 'cache'],
  },
  {
    id: 'auth',
    label: 'User Accounts',
    tooltip: 'How people sign up, log in, and what they\'re allowed to do',
    componentIds: ['auth'],
  },
  {
    id: 'integration',
    label: 'External Services',
    tooltip: 'Connecting to other services like payments, email, or notifications',
    componentIds: ['payments', 'email', 'search', 'push-notifications', 'analytics'],
  },
  {
    id: 'background',
    label: 'Background Processing',
    tooltip: 'For tasks that run outside of user requests — queues, scheduled jobs',
    componentIds: ['webhooks', 'background-jobs'],
  },
]

// ============================================================================
// HELPERS
// ============================================================================

export function getArchetypeConfig(archetype: Archetype): ArchetypeConfig | undefined {
  return ARCHETYPE_CONFIGS.find((c) => c.id === archetype)
}

export function getComponentById(id: string): ComponentDefinition | undefined {
  return ALL_COMPONENTS.find((c) => c.id === id)
}

export function getDefaultComponentsForArchetype(archetype: Archetype): ComponentDefinition[] {
  return getArchetypeConfig(archetype)?.components ?? []
}

export function getPlatformForArchetype(archetype: Archetype): Platform {
  return getArchetypeConfig(archetype)?.platform ?? 'web'
}

/**
 * Check if a component has reached its tech limit
 */
export function isAtTechLimit(componentId: string, currentTechCount: number): boolean {
  const component = getComponentById(componentId)
  if (!component?.maxTechChoices) return false
  return currentTechCount >= component.maxTechChoices
}

/**
 * Get the tech limit for a component (undefined = unlimited)
 */
export function getTechLimit(componentId: string): number | undefined {
  return getComponentById(componentId)?.maxTechChoices
}

/**
 * Find component by its label (case-insensitive)
 */
export function getComponentByLabel(label: string): ComponentDefinition | undefined {
  const normalizedLabel = label.toLowerCase().trim()
  return ALL_COMPONENTS.find((c) => c.label.toLowerCase() === normalizedLabel)
}

/**
 * Get tech limit by component label (undefined = unlimited)
 */
export function getTechLimitByLabel(label: string): number | undefined {
  return getComponentByLabel(label)?.maxTechChoices
}
