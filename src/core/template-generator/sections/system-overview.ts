import type { DiagramNode, NodeType } from '../../types'

/**
 * Detect project type from nodes
 */
export function detectProjectType(nodes: DiagramNode[]): string {
  const types = new Set(nodes.map((n) => n.data.type))

  if (types.has('frontend') && types.has('backend')) {
    return 'Full-stack web application'
  }
  if (types.has('frontend')) {
    return 'Frontend web application'
  }
  if (types.has('backend') && types.has('storage')) {
    return 'Backend API service'
  }
  if (types.has('backend')) {
    return 'Backend service'
  }
  if (types.has('background')) {
    return 'Background processing service'
  }

  return 'Application'
}

/**
 * Generate boundaries (IS/IS NOT) from nodes
 */
export function generateBoundaries(nodes: DiagramNode[]): { is: string[]; isNot: string[] } {
  const nodesByType = new Map<NodeType, DiagramNode[]>()
  for (const node of nodes) {
    const existing = nodesByType.get(node.data.type) ?? []
    nodesByType.set(node.data.type, [...existing, node])
  }

  const is: string[] = []
  const isNot: string[] = []

  // Generate IS statements based on what exists
  if (nodesByType.has('frontend')) {
    is.push('A user-facing web application with interactive UI')
  }
  if (nodesByType.has('backend')) {
    is.push('An API service handling business logic and data access')
  }
  if (nodesByType.has('storage')) {
    is.push('A system with persistent data storage')
  }
  if (nodesByType.has('auth')) {
    is.push('A system with user authentication and authorization')
  }
  if (nodesByType.has('external')) {
    is.push('A system integrating with external third-party services')
  }
  if (nodesByType.has('background')) {
    is.push('A system with asynchronous background processing')
  }

  // Generate IS NOT statements based on what's missing
  if (!nodesByType.has('frontend')) {
    isNot.push('A user-facing UI (backend/API only)')
  }
  if (!nodesByType.has('background')) {
    isNot.push('A background job processing system (synchronous only)')
  }
  if (!nodesByType.has('external')) {
    isNot.push('A system with extensive third-party integrations')
  }

  return { is, isNot }
}

/**
 * Generate System Overview section
 */
export function generateSystemOverview(
  nodes: DiagramNode[],
  projectName: string
): string {
  const nodesByType = new Map<NodeType, DiagramNode[]>()

  // Group nodes by type
  for (const node of nodes) {
    const existing = nodesByType.get(node.data.type) ?? []
    nodesByType.set(node.data.type, [...existing, node])
  }

  // Build stack detection from actual node tech stacks
  const stackParts: string[] = []
  if (nodesByType.has('frontend')) {
    const techLabels = (nodesByType.get('frontend') ?? []).flatMap((n) => n.data.meta.techStack ?? [])
    const unique = [...new Set(techLabels)]
    stackParts.push(unique.length > 0 ? `${unique.join(', ')} frontend` : 'Frontend')
  }
  if (nodesByType.has('backend')) {
    const techLabels = (nodesByType.get('backend') ?? []).flatMap((n) => n.data.meta.techStack ?? [])
    const unique = [...new Set(techLabels)]
    stackParts.push(unique.length > 0 ? `${unique.join(', ')} backend` : 'Backend')
  }
  if (nodesByType.has('storage')) {
    const storageNodes = nodesByType.get('storage') ?? []
    const storageNames = storageNodes.map((n) => n.data.label).join(', ')
    stackParts.push(storageNames)
  }

  const stackSummary = stackParts.length > 0 ? stackParts.join(' + ') : '# AI: Detect from component types'

  const projectType = detectProjectType(nodes)
  const boundaries = generateBoundaries(nodes)

  return `## System Overview

**Project**: ${projectName}
**Type**: ${projectType}
**Stack**: ${stackSummary}

# AI: Add 2-3 sentence description based on components and their relationships.

### Boundaries

This system IS:
${boundaries.is.map((b) => `- ${b}`).join('\n')}
- # AI: Add more explicit inclusions based on component analysis

This system IS NOT:
${boundaries.isNot.map((b) => `- ${b}`).join('\n')}
- # AI: Add more explicit exclusions to prevent scope creep`
}
