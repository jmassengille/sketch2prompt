import type { DiagramNode } from '../../types'
import { DEFAULT_CONSTRAINTS } from '../constants'

/**
 * Generate Architecture Constraints section
 */
export function generateArchitectureConstraints(nodes: DiagramNode[]): string {
  const nodeTypes = new Set(nodes.map((n) => n.data.type))

  // Collect type-specific constraints
  const securityConstraints = new Set<string>()

  for (const type of nodeTypes) {
    const constraints = DEFAULT_CONSTRAINTS[type]
    for (const sec of constraints.security.slice(0, 2)) {
      securityConstraints.add(sec)
    }
  }

  // Add universal constraints
  const always = [
    'Validate all inputs at system boundaries (API endpoints, form submissions)',
    'Use environment variables for all configuration (never hardcode secrets)',
    'Log structured data for all errors (timestamp, level, message, context)',
    ...Array.from(securityConstraints),
  ]

  const never = [
    'Store secrets in code or version control',
    'Trust client-side validation alone (always re-validate server-side)',
    'Expose internal error details to clients (log internally, return safe messages)',
    'Add enterprise patterns without explicit user request (message queues, microservices, CQRS)',
    'Install dependencies without checking if stdlib or existing deps solve the problem',
  ]

  // Add type-specific never statements
  if (nodeTypes.has('backend')) {
    never.push("Use 'any' type in TypeScript (use 'unknown' + type guards)")
  }
  if (nodeTypes.has('storage')) {
    never.push('Make direct database connections from frontend')
  }

  const prefer = [
    'Simplicity over abstraction — delay complexity until scaling demands it',
    'Composition over inheritance — easier to test and modify',
    'Named exports over default exports — better refactoring support',
    'Early returns over nested conditionals — clearer control flow',
    'Explicit dependencies over global imports — aids testing',
    'Three similar lines over one premature helper — wait for patterns to emerge',
  ]

  return `## Architecture Constraints

### ALWAYS (Required)

${always.map((c) => `- ${c}`).join('\n')}
- # AI: Add project-specific constraints based on domain requirements

### NEVER (Forbidden)

${never.map((c) => `- ${c}`).join('\n')}
- # AI: Add project-specific anti-patterns to avoid

### PREFER (Encouraged)

${prefer.map((p) => `- ${p}`).join('\n')}
- # AI: Add project-specific best practices`
}
