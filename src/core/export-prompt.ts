import type { DiagramNode, NodeType } from './types'

// Type-based build order (NOT topology-based)
const BUILD_ORDER: NodeType[] = [
  'storage',    // Data models first
  'auth',       // Auth before features
  'backend',    // API before UI
  'frontend',   // UI after API
  'external',   // Integrations
  'background', // Background jobs
]

const TYPE_LABELS: Record<NodeType, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  storage: 'Storage',
  auth: 'Auth',
  external: 'External',
  background: 'Background',
}

const TYPE_DESCRIPTIONS: Record<NodeType, string> = {
  frontend: 'UI components, pages, and client-side logic',
  backend: 'API endpoints, server logic, and business rules',
  storage: 'Databases, file storage, and caching layers',
  auth: 'Authentication, authorization, and user management',
  external: 'Third-party APIs and external service integrations',
  background: 'Background jobs, cron tasks, and queue workers',
}

const COMPONENT_GUIDANCE: Record<NodeType, string[]> = {
  auth: [
    'Never store plain-text passwords (use bcrypt/argon2)',
    'Implement session management or JWT properly',
    'Consider OAuth for social login',
    'Add rate limiting to prevent brute force',
  ],
  storage: [
    'Design schema before writing code',
    'Use migrations from day one',
    'Set up proper indexes for queries',
    'Plan backup strategy early',
  ],
  backend: [
    'Validate all inputs at API boundaries',
    'Implement proper error handling and logging',
    'Use consistent API conventions (REST/GraphQL)',
    'Document endpoints as you build',
  ],
  frontend: [
    'Choose routing solution early',
    'Plan state management strategy',
    'Ensure accessibility (semantic HTML)',
    'Optimize bundle size',
  ],
  external: [
    'Store API keys in environment variables',
    'Handle rate limits and timeouts',
    'Implement retry logic for failures',
    'Have fallback behavior when service is down',
  ],
  background: [
    'Use a job queue for reliability',
    'Implement retry with exponential backoff',
    'Make jobs idempotent',
    'Add monitoring for failed jobs',
  ],
}

const BUILD_PHASE_NAMES: Record<NodeType, string> = {
  storage: 'Storage Phase',
  auth: 'Auth Phase',
  backend: 'Backend Phase',
  frontend: 'Frontend Phase',
  external: 'Integration Phase',
  background: 'Background Phase',
}

const BUILD_PHASE_DESCRIPTIONS: Record<NodeType, string> = {
  storage: 'Design database schema and data models',
  auth: 'Implement authentication and user management',
  backend: 'Build API endpoints and business logic',
  frontend: 'Create UI components and pages',
  external: 'Connect third-party services',
  background: 'Set up background jobs and workers',
}

function groupNodesByType(nodes: DiagramNode[]): Map<NodeType, DiagramNode[]> {
  const grouped = new Map<NodeType, DiagramNode[]>()
  for (const node of nodes) {
    const type = node.data.type
    const existing = grouped.get(type) ?? []
    grouped.set(type, [...existing, node])
  }
  return grouped
}

function generateOverview(nodes: DiagramNode[]): string {
  if (nodes.length === 0) {
    return `## Architecture Overview

You're building an application with no components defined yet.

Add some components to your diagram to see the architecture overview.`
  }

  const grouped = groupNodesByType(nodes)
  const lines: string[] = ['## Architecture Overview', '', "You're building an application with:"]

  for (const type of BUILD_ORDER) {
    const typeNodes = grouped.get(type)
    if (typeNodes && typeNodes.length > 0) {
      const labels = typeNodes.map((n) => n.data.label).join(', ')
      lines.push(`- **${String(typeNodes.length)} ${TYPE_LABELS[type]}**: ${labels}`)
    }
  }

  return lines.join('\n')
}

function generateBuildOrder(nodes: DiagramNode[]): string {
  if (nodes.length === 0) {
    return `## Recommended Build Order

Add components to your diagram to see the recommended build order.`
  }

  const grouped = groupNodesByType(nodes)
  const lines: string[] = [
    '## Recommended Build Order',
    '',
    '1. **Foundation Phase**: Set up project structure, tooling, and dependencies',
  ]

  let phaseNumber = 2
  for (const type of BUILD_ORDER) {
    const typeNodes = grouped.get(type)
    if (typeNodes && typeNodes.length > 0) {
      const labels = typeNodes.map((n) => `   - ${n.data.label}`).join('\n')
      lines.push(`${String(phaseNumber)}. **${BUILD_PHASE_NAMES[type]}**: ${BUILD_PHASE_DESCRIPTIONS[type]}`)
      lines.push(labels)
      phaseNumber++
    }
  }

  return lines.join('\n')
}

function generateGuidance(nodes: DiagramNode[]): string {
  if (nodes.length === 0) {
    return `## Component Guidance

Add components to your diagram to see component-specific guidance.`
  }

  const lines: string[] = ['## Component Guidance']

  for (const type of BUILD_ORDER) {
    const typeNodes = nodes.filter((n) => n.data.type === type)
    for (const node of typeNodes) {
      lines.push('')
      lines.push(`### ${TYPE_LABELS[type]}: ${node.data.label}`)

      if (node.data.meta.description) {
        lines.push(`> ${node.data.meta.description}`)
        lines.push('')
      }

      lines.push('')
      lines.push('**Watch for:**')
      const tips = COMPONENT_GUIDANCE[type]
      for (const tip of tips) {
        lines.push(`- ${tip}`)
      }
    }
  }

  return lines.join('\n')
}

function generateStarterPrompt(nodes: DiagramNode[]): string {
  const grouped = groupNodesByType(nodes)
  const componentTypes: string[] = []

  for (const type of BUILD_ORDER) {
    if (grouped.has(type)) {
      componentTypes.push(TYPE_DESCRIPTIONS[type].toLowerCase())
    }
  }

  const description =
    componentTypes.length > 0
      ? `an application with ${componentTypes.join(', ')}`
      : 'a new application'

  return `## Getting Started Prompt

Use this to initialize your coding assistant:

---

I'm building ${description}.

Based on the architecture outlined above, help me:
1. Set up the project structure and tooling
2. Identify the key files and folders I'll need
3. Start with the first phase of implementation

Please follow best practices for each component type and let me know if you have questions about my requirements.

---`
}

export function exportPrompt(nodes: DiagramNode[], title?: string): string {
  const projectTitle = title ?? 'Untitled Project'

  const sections = [
    `# Project: ${projectTitle}`,
    generateOverview(nodes),
    generateBuildOrder(nodes),
    generateGuidance(nodes),
    generateStarterPrompt(nodes),
  ]

  return sections.join('\n\n---\n\n')
}
