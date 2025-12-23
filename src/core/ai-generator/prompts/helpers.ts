import type { NodeType } from '../../types'

/**
 * Get type-specific field guidance for component spec prompts (Markdown format)
 */
export function getTypeSpecificFieldsPrompt(nodeType: NodeType): string {
  switch (nodeType) {
    case 'frontend':
      return `## Frontend Notes
- Routing: (approach)
- State: (management approach)
- A11y: WCAG 2.1 AA`

    case 'backend':
      return `## API Notes
- Style: REST (or specify)
- Auth: (middleware approach)
- Errors: \`{ error, code }\``

    case 'storage':
      return `## Storage Notes
- Schema: (key entities)
- Indexes: (based on queries)`

    case 'auth':
      return `## Auth Notes
- Strategy: JWT/Session/OAuth2
- Expiry: (token TTL)`

    case 'external':
      return `## Service Notes
- Provider: (name)
- Rate Limits: (limits)`

    case 'background':
      return `## Job Notes
- Queue: (technology)
- Retry: (policy)`

    default:
      return ''
  }
}

/**
 * Get build order rationale for node type
 */
export function getBuildOrderRationale(nodeType: NodeType): string {
  switch (nodeType) {
    case 'storage':
      return 'Schema and data layer first (everything depends on data)'
    case 'auth':
      return 'Authentication before protected features'
    case 'backend':
      return 'Business logic and data access'
    case 'frontend':
      return 'UI consuming the backend services'
    case 'external':
      return 'External integrations (can be added incrementally)'
    case 'background':
      return 'Background jobs (non-blocking, lower priority)'
    default:
      return 'Implementation priority based on dependencies'
  }
}

/**
 * Get integration pattern based on node types
 */
export function getIntegrationPattern(
  sourceType: NodeType,
  targetType: NodeType
): string {
  if (sourceType === 'frontend' && targetType === 'backend')
    return 'HTTP/REST API'
  if (sourceType === 'backend' && targetType === 'storage')
    return 'ORM/Query Builder'
  if (sourceType === 'backend' && targetType === 'external')
    return 'API Client/SDK'
  if (sourceType === 'backend' && targetType === 'auth') return 'JWT Validation'
  if (sourceType === 'auth' && targetType === 'storage')
    return 'Credential Lookup'
  if (sourceType === 'background' && targetType === 'storage')
    return 'Direct Database Access'

  return 'Component Integration'
}
