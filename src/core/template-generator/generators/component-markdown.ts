import type { DiagramNode, NodeType } from '../../types'
import {
  DEFAULT_RESPONSIBILITIES,
  ENHANCED_ANTI_RESPONSIBILITIES,
  TYPE_LABELS,
  getPackagesForTech,
} from '../constants'
import { detectLanguage } from '../constants/known-packages'
import { inferCommunicationPattern } from '../sections/integration-rules'

/**
 * Generate component spec in Markdown + XML format
 *
 * Key differences from YAML:
 * - No edges parameter (integrations are type-based)
 * - Simpler structure (no contract shapes)
 * - XML tags for semantic parsing
 * - Reduced token count (~200-400 tokens per spec)
 */
export function generateComponentSpecMarkdown(
  node: DiagramNode,
  allNodes: DiagramNode[]
): string {
  const sections: string[] = []

  // Opening XML tag with metadata
  sections.push(
    `<spec component="${node.data.label}" type="${node.data.type}" id="${node.id}">`
  )
  sections.push('')

  // Tech Stack
  sections.push(formatTechStack(node))

  // Description (if provided)
  if (node.data.meta.description) {
    sections.push(`## Description`)
    sections.push(node.data.meta.description)
    sections.push('')
  }

  // Responsibilities
  sections.push(formatResponsibilities(node.data.type))

  // Anti-Responsibilities
  sections.push(formatAntiResponsibilities(node.data.type))

  // Integrations (type-based)
  sections.push(formatIntegrations(node, allNodes))

  // Dependencies
  sections.push(formatDependencies(node.data.meta.techStack))

  // Type-specific fields
  const typeSpecific = formatTypeSpecificFields(node.data.type)
  if (typeSpecific) {
    sections.push(typeSpecific)
  }

  // Validation
  sections.push(formatValidation(node.data.type))

  // Closing XML tag
  sections.push('</spec>')

  return sections.join('\n')
}

/**
 * Format tech stack section
 */
function formatTechStack(node: DiagramNode): string {
  const techStack = node.data.meta.techStack
  if (techStack && techStack.length > 0) {
    return `## Tech Stack\n${techStack.join(', ')}\n`
  }
  const typeLabel = TYPE_LABELS[node.data.type]
  return `## Tech Stack\nTBD - specify technologies for this ${typeLabel}\n`
}

/**
 * Format responsibilities as bullet list
 */
function formatResponsibilities(type: NodeType): string {
  const responsibilities = DEFAULT_RESPONSIBILITIES[type]
  const lines = ['## Responsibilities']
  for (const r of responsibilities) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n') + '\n'
}

/**
 * Format anti-responsibilities as bullet list
 */
function formatAntiResponsibilities(type: NodeType): string {
  const antiResp = ENHANCED_ANTI_RESPONSIBILITIES[type]
  const lines = ['## Anti-Responsibilities']
  for (const ar of antiResp) {
    lines.push(`- ${ar.pattern} — ${ar.reason}`)
  }
  return lines.join('\n') + '\n'
}

/**
 * Derive integrations from node types (no edges)
 */
function formatIntegrations(node: DiagramNode, allNodes: DiagramNode[]): string {
  const integrations: string[] = []
  const nodeType = node.data.type

  for (const other of allNodes) {
    if (other.id === node.id) continue

    const otherType = other.data.type

    // Check if this node could integrate with the other
    const outboundPattern = inferCommunicationPattern(nodeType, otherType)
    const inboundPattern = inferCommunicationPattern(otherType, nodeType)

    if (outboundPattern) {
      integrations.push(`- ${other.data.label} (outbound) via ${outboundPattern}`)
    }
    if (inboundPattern) {
      integrations.push(`- ${other.data.label} (inbound) via ${inboundPattern}`)
    }
  }

  if (integrations.length === 0) {
    return `## Integrates With\nNo type-based integrations detected.\n`
  }

  return `## Integrates With\n${integrations.join('\n')}\n`
}

/**
 * Format dependencies table from known packages
 */
function formatDependencies(techStack: string[] | undefined): string {
  if (!techStack || techStack.length === 0) {
    return `## Dependencies\nTBD - add dependencies based on tech stack\n`
  }

  const language = detectLanguage(techStack)
  const rows: string[] = []
  const seenPackages = new Set<string>()

  for (const tech of techStack) {
    const packages = getPackagesForTech(tech, language)
    for (const pkg of packages) {
      if (seenPackages.has(pkg.name)) continue
      seenPackages.add(pkg.name)
      rows.push(`| ${pkg.name} | ${pkg.version} | ${pkg.purpose} |`)
    }
  }

  if (rows.length === 0) {
    return `## Dependencies\nTBD - add dependencies for ${techStack.join(', ')}\n`
  }

  return `## Dependencies\n| Package | Version | Purpose |\n|---------|---------|---------|
${rows.join('\n')}\n`
}

/**
 * Format type-specific fields (simplified)
 */
function formatTypeSpecificFields(type: NodeType): string {
  switch (type) {
    case 'frontend':
      return `## Frontend Notes
- Routing: TBD
- State Management: TBD
- Accessibility: WCAG 2.1 AA compliance
`
    case 'backend':
      return `## API Notes
- Style: REST (or TBD)
- Auth: TBD (middleware)
- Error Format: \`{ error: string, code: number }\`
`
    case 'storage':
      return `## Storage Notes
- Schema: TBD
- Backup: TBD
- Indexes: Define based on query patterns
`
    case 'auth':
      return `## Auth Notes
- Strategy: TBD (JWT/Session/OAuth2)
- Token Expiry: TBD
- Providers: TBD
`
    case 'external':
      return `## External Service Notes
- Provider: TBD
- API Version: TBD
- Rate Limits: TBD
`
    case 'background':
      return `## Job Notes
- Queue: TBD
- Retry Policy: TBD
- Monitoring: TBD
`
    default:
      return ''
  }
}

/**
 * Format validation checklist
 */
function formatValidation(type: NodeType): string {
  const items: string[] = ['## Validation']

  switch (type) {
    case 'frontend':
      items.push('- [ ] Renders without console errors')
      items.push('- [ ] Responsive at 320px, 768px, 1024px')
      items.push('- [ ] All user flows tested')
      break
    case 'backend':
      items.push('- [ ] All endpoints return correct status codes')
      items.push('- [ ] Auth middleware functional')
      items.push('- [ ] Error responses match format')
      break
    case 'storage':
      items.push('- [ ] Migrations run successfully')
      items.push('- [ ] Seed data loads')
      items.push('- [ ] Indexes created')
      break
    case 'auth':
      items.push('- [ ] Login/logout flows work')
      items.push('- [ ] Token validation functional')
      items.push('- [ ] Protected routes secured')
      break
    case 'external':
      items.push('- [ ] API connection verified')
      items.push('- [ ] Error handling for failures')
      items.push('- [ ] Rate limiting respected')
      break
    case 'background':
      items.push('- [ ] Jobs enqueue correctly')
      items.push('- [ ] Retry logic works')
      items.push('- [ ] Failures logged')
      break
    default:
      items.push('- [ ] Component functional')
      items.push('- [ ] Tests pass')
  }

  items.push('- [ ] STATUS.md updated')

  return items.join('\n') + '\n'
}
