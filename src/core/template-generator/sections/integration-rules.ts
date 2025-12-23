import type { DiagramNode, DiagramEdge, NodeType } from '../../types'

/**
 * Infer communication pattern from node types.
 * Returns a known pattern or empty string if no pattern applies.
 */
export function inferCommunicationPattern(sourceType: NodeType, targetType: NodeType): string {
  if (sourceType === 'frontend' && targetType === 'backend') {
    return 'HTTP REST/GraphQL'
  }
  if (sourceType === 'backend' && targetType === 'storage') {
    return 'ORM/Query builder'
  }
  if (sourceType === 'backend' && targetType === 'auth') {
    return 'Middleware/SDK'
  }
  if (sourceType === 'backend' && targetType === 'external') {
    return 'HTTP/SDK'
  }
  if (sourceType === 'backend' && targetType === 'background') {
    return 'Job queue'
  }
  if (sourceType === 'background' && targetType === 'storage') {
    return 'Direct DB access'
  }

  return ''
}

/**
 * Derive integration pairs from node types (no edges required).
 * Returns array of [source, target, pattern] tuples.
 */
export function deriveIntegrationPairs(
  nodes: DiagramNode[]
): Array<{ source: DiagramNode; target: DiagramNode; pattern: string }> {
  const pairs: Array<{ source: DiagramNode; target: DiagramNode; pattern: string }> = []

  for (const source of nodes) {
    for (const target of nodes) {
      if (source.id === target.id) continue

      const pattern = inferCommunicationPattern(source.data.type, target.data.type)
      if (pattern) {
        pairs.push({ source, target, pattern })
      }
    }
  }

  return pairs
}

/**
 * Generate Integration Rules section.
 * Uses edges if provided, otherwise derives from node types.
 */
export function generateIntegrationRules(nodes: DiagramNode[], edges: DiagramEdge[] = []): string {
  const tableHeader = `| From | To | Pattern | Notes |
|------|----|---------|-------|`

  let tableRows: string[]

  if (edges.length > 0) {
    // Edge-based: use actual connections from canvas
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    tableRows = edges
      .map((edge) => {
        const source = nodeMap.get(edge.source)
        const target = nodeMap.get(edge.target)
        if (!source || !target) return ''
        const pattern = inferCommunicationPattern(source.data.type, target.data.type)
        const notes = edge.data?.label || 'See component specs'
        return `| ${source.data.label} | ${target.data.label} | ${pattern || 'TBD'} | ${notes} |`
      })
      .filter((row) => row !== '')
  } else {
    // Type-based: derive from node type combinations
    const pairs = deriveIntegrationPairs(nodes)
    if (pairs.length === 0) {
      return `## Integration Rules

No integrations detected based on component types.

Add edges in the canvas to define explicit integrations, or integrations will be inferred from component types.`
    }
    tableRows = pairs.map(
      ({ source, target, pattern }) =>
        `| ${source.data.label} | ${target.data.label} | ${pattern} | Inferred from types |`
    )
  }

  if (tableRows.length === 0) {
    return `## Integration Rules

No integrations defined.`
  }

  const communicationPatterns = `### Communication Patterns

${tableHeader}
${tableRows.join('\n')}`

  const sharedContracts = `### Shared Contracts

Define shared types and API contracts in a central location (e.g., \`/src/types/\`).`

  const forbiddenIntegrations = `### Forbidden Integrations

- Frontend MUST NOT directly access storage
- External services MUST be proxied through backend`

  return `## Integration Rules

${communicationPatterns}

${sharedContracts}

${forbiddenIntegrations}`
}
