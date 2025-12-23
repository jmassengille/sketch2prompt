import type { NodeType } from '../../types'

/**
 * Get type-specific field guidance for component spec prompts
 */
export function getTypeSpecificFieldsPrompt(nodeType: NodeType): string {
  switch (nodeType) {
    case 'frontend':
      return `- routing_strategy: (description of routing approach)
- state_management: (state management approach)
- accessibility: (list of accessibility requirements)
- ui_patterns: (list of UI patterns with name and usage)`

    case 'backend':
      return `- api_style: "REST|GraphQL|gRPC|tRPC"
- endpoint_patterns: (list of URL patterns with methods and auth)
- error_handling: (standard error response format)`

    case 'storage':
      return `- schema_notes: (key entities and relationships)
- backup_strategy: (backup approach)
- indexing_strategy: (guidelines for indexes)`

    case 'auth':
      return `- auth_strategy: "JWT|Session|OAuth2|API_Key"
- security_notes: (authentication/authorization approach)
- providers: (if using OAuth, list providers with scopes)`

    case 'external':
      return `- service_details:
    provider: (service name)
    api_version: (version)
    environment: (dev/staging/prod notes)
- error_handling: (how to handle failures)
- rate_limits: (limit descriptions)`

    case 'background':
      return `- job_queue: (queue technology)
- jobs: (list of jobs with name, trigger, frequency, retry_policy)`

    default:
      return '(No type-specific fields for this type)'
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
