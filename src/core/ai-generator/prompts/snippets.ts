/**
 * Snippet Prompt Builders
 *
 * Isolated prompt builders for AI-generated prose snippets.
 * Each snippet is small (~50-100 tokens output) and focused on prose only.
 * Structural content (tables, lists, headers) is generated deterministically by the assembler.
 */

import type { NodeType } from '../../types'
import type { SnippetPrompt } from '../types'

// =============================================================================
// Type Context Helpers
// =============================================================================

/** Get context string describing what a component type typically handles */
function getTypeContext(nodeType: NodeType): string {
  const contexts: Record<NodeType, string> = {
    frontend: 'UI rendering, user interactions, client-side state',
    backend: 'API endpoints, business logic, data processing',
    storage: 'Data persistence, queries, schema management',
    auth: 'Authentication, authorization, session management',
    external: 'Third-party API integration, external service calls',
    background: 'Async jobs, scheduled tasks, queue processing',
  }
  return contexts[nodeType]
}

/** Get boundary context for component types */
function getBoundaryContext(nodeType: NodeType): { is: string; isNot: string } {
  const contexts: Record<NodeType, { is: string; isNot: string }> = {
    frontend: {
      is: 'user-facing interface, browser-rendered',
      isNot: 'backend logic, database access',
    },
    backend: {
      is: 'server-side processing, API layer',
      isNot: 'UI rendering, direct database queries in routes',
    },
    storage: {
      is: 'data persistence layer, schema-driven',
      isNot: 'business logic, user authentication',
    },
    auth: {
      is: 'identity verification, access control',
      isNot: 'business rules, data storage',
    },
    external: {
      is: 'third-party service integration',
      isNot: 'core business logic, data persistence',
    },
    background: {
      is: 'async processing, scheduled execution',
      isNot: 'real-time user responses, synchronous operations',
    },
  }
  return contexts[nodeType]
}

// =============================================================================
// Project-Level Snippet Builders
// =============================================================================

/**
 * Build prompt for project description snippet.
 * Input: List of components with types
 * Output: 2-3 sentence project description (~50 tokens)
 */
export function buildProjectDescriptionPrompt(
  components: Array<{ label: string; type: NodeType }>,
  projectName: string
): SnippetPrompt {
  const componentSummary = components.map((c) => `${c.label} (${c.type})`).join(', ')

  const typeBreakdown = Object.entries(
    components.reduce<Record<string, number>>((acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1
      return acc
    }, {})
  )
    .map(([type, count]) => `${String(count)} ${type}`)
    .join(', ')

  const prompt = `Write a 2-3 sentence project description for "${projectName}".

CONTEXT:
- Components: ${componentSummary}
- Breakdown: ${typeBreakdown}

OUTPUT FORMAT (JSON only):
{"description": "Your 2-3 sentence description here"}

CONSTRAINTS:
- Focus on WHAT the system does, not HOW it's built
- Be specific to these components
- Max 50 words
- Output valid JSON only, no markdown or explanation`

  return {
    type: 'project-description',
    prompt,
    maxTokens: 80,
  }
}

/**
 * Build prompt for boundary additions snippet.
 * Input: Component types present in the project
 * Output: IS/IS NOT items to add to system boundaries (~40 tokens)
 */
export function buildBoundaryAdditionsPrompt(
  componentTypes: NodeType[],
  projectName: string
): SnippetPrompt {
  const uniqueTypes = [...new Set(componentTypes)]
  const typeContexts = uniqueTypes.map((type) => {
    const ctx = getBoundaryContext(type)
    return `- ${type}: IS ${ctx.is}, IS NOT ${ctx.isNot}`
  })

  const prompt = `Generate 2-3 IS and 2-3 IS NOT statements for "${projectName}" system boundaries.

CONTEXT (component types and their typical scope):
${typeContexts.join('\n')}

OUTPUT FORMAT (JSON only):
{"isItems": ["This system IS...", "..."], "isNotItems": ["This system IS NOT...", "..."]}

CONSTRAINTS:
- 2-3 items per category
- Each item max 15 words
- Be specific to this system's scope
- Output valid JSON only, no markdown or explanation`

  return {
    type: 'boundary-additions',
    prompt,
    maxTokens: 80,
  }
}

// =============================================================================
// Component-Level Snippet Builders
// =============================================================================

/**
 * Build prompt for component description snippet.
 * Input: Single component details
 * Output: 2-3 sentence description (~40 tokens)
 */
export function buildComponentDescriptionPrompt(
  component: { label: string; type: NodeType; description?: string; techStack?: string[] },
  componentId: string
): SnippetPrompt {
  const techContext = component.techStack?.length
    ? `\nTech stack: ${component.techStack.join(', ')}`
    : ''
  const userHint = component.description ? `\nUser notes: "${component.description}"` : ''

  const prompt = `Write a 2-3 sentence description for the "${component.label}" component.

CONTEXT:
- Component type: ${component.type}
- Type handles: ${getTypeContext(component.type)}${techContext}${userHint}

OUTPUT FORMAT (JSON only):
{"description": "Your 2-3 sentence description here"}

CONSTRAINTS:
- Focus on what this specific component does
- Be concrete, not generic
- Max 40 words
- Output valid JSON only, no markdown or explanation`

  return {
    type: 'component-description',
    prompt,
    componentId,
    maxTokens: 80,
  }
}

/**
 * Build prompt for component responsibilities snippet.
 * Input: Component with type context
 * Output: 3-5 responsibility bullets (~60 tokens)
 */
export function buildComponentResponsibilitiesPrompt(
  component: { label: string; type: NodeType; description?: string },
  componentId: string
): SnippetPrompt {
  const userHint = component.description ? `\nUser notes: "${component.description}"` : ''

  const prompt = `List 3-5 core responsibilities for the "${component.label}" component.

CONTEXT:
- Component type: ${component.type}
- Type typically handles: ${getTypeContext(component.type)}${userHint}

OUTPUT FORMAT (JSON only):
{"responsibilities": ["Responsibility 1", "Responsibility 2", "Responsibility 3"]}

CONSTRAINTS:
- Start each with an action verb (Handle, Manage, Validate, Store, etc.)
- Be specific to this component type
- 3-5 items only
- Max 12 words per responsibility
- Output valid JSON only, no markdown or explanation`

  return {
    type: 'component-responsibilities',
    prompt,
    componentId,
    maxTokens: 100,
  }
}

/**
 * Build prompt for anti-responsibilities snippet.
 * Input: Component type
 * Output: 3-5 NEVER statements (~60 tokens)
 */
export function buildAntiResponsibilitiesPrompt(
  component: { label: string; type: NodeType },
  componentId: string
): SnippetPrompt {
  const boundaryCtx = getBoundaryContext(component.type)

  const prompt = `List 3-5 anti-responsibilities for the "${component.label}" component (things it should NEVER do).

CONTEXT:
- Component type: ${component.type}
- Type handles: ${getTypeContext(component.type)}
- Should NOT handle: ${boundaryCtx.isNot}

OUTPUT FORMAT (JSON only):
{"antiResponsibilities": ["NEVER do X - reason", "NEVER do Y - reason", "..."]}

CONSTRAINTS:
- Start each with "NEVER"
- Include brief reason after dash
- 3-5 items only
- Max 15 words per item
- Output valid JSON only, no markdown or explanation`

  return {
    type: 'anti-responsibilities',
    prompt,
    componentId,
    maxTokens: 100,
  }
}
