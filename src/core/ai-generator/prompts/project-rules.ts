import type { DiagramNode, DiagramEdge } from '../../types'
import { slugify } from '../../utils/slugify'
import { NODE_TYPE_BUILD_ORDER } from '../types'
import { getBuildOrderRationale, getIntegrationPattern } from './helpers'
import {
  getPackagesForTech,
  detectLanguage,
} from '../../template-generator/constants/known-packages'

/**
 * Build component list section
 */
function buildComponentList(nodes: DiagramNode[]): string {
  return nodes
    .map((node) => {
      const tech = node.data.meta.techStack?.length
        ? ` [${node.data.meta.techStack.join(', ')}]`
        : ''
      const desc = node.data.meta.description
        ? `: ${node.data.meta.description}`
        : ''
      return `- ${node.data.label} (${node.data.type})${tech}${desc}`
    })
    .join('\n')
}

/**
 * Build connections list section
 */
function buildConnectionsList(
  nodes: DiagramNode[],
  edges: DiagramEdge[]
): string {
  const connections = edges
    .map((edge) => {
      const source = nodes.find((n) => n.id === edge.source)
      const target = nodes.find((n) => n.id === edge.target)
      if (!source || !target) return null
      const label = edge.data?.label ? ` (${edge.data.label})` : ''
      return `- ${source.data.label} → ${target.data.label}${label}`
    })
    .filter(Boolean)
    .join('\n')

  return connections || '(No connections defined)'
}

/**
 * Build component registry table
 */
function buildComponentRegistry(nodes: DiagramNode[]): string {
  return nodes
    .map(
      (node) =>
        `| ${node.id} | ${node.data.label} | ${node.data.type} | \`specs/${slugify(node.data.label)}.yaml\` | active |`
    )
    .join('\n')
}

/**
 * Build build order section with phases
 */
export function buildBuildOrderSection(nodes: DiagramNode[]): string {
  const sorted = [...nodes].sort(
    (a, b) =>
      NODE_TYPE_BUILD_ORDER[a.data.type] - NODE_TYPE_BUILD_ORDER[b.data.type]
  )

  const phases: Record<string, DiagramNode[]> = {
    'Phase 1: Foundation': [],
    'Phase 2: Core Features': [],
    'Phase 3: Integration': [],
    'Phase 4: Polish': [],
  }

  sorted.forEach((node) => {
    const order = NODE_TYPE_BUILD_ORDER[node.data.type]
    if (order <= 2) {
      phases['Phase 1: Foundation']?.push(node)
    } else if (order <= 4) {
      phases['Phase 2: Core Features']?.push(node)
    } else {
      phases['Phase 3: Integration']?.push(node)
    }
  })

  const lines = ['Implementation sequence based on dependency graph:\n']

  Object.entries(phases).forEach(([phaseName, phaseNodes]) => {
    if (phaseNodes.length > 0) {
      lines.push(`### ${phaseName}`)
      phaseNodes.forEach((node) => {
        const rationale = getBuildOrderRationale(node.data.type)
        lines.push(`- [ ] [${node.id}] ${node.data.label} — ${rationale}`)
      })
      lines.push('')
    }
  })

  return lines.join('\n')
}

/**
 * Build verified packages section
 * Aggregates all techStack items across nodes and returns formatted package list
 */
function buildProjectVerifiedPackages(nodes: DiagramNode[]): string {
  // Aggregate all techStack items across ALL nodes
  const allTechStacks = nodes
    .flatMap((n) => n.data.meta.techStack ?? [])
    .filter((v, i, a) => a.indexOf(v) === i) // Dedupe

  if (allTechStacks.length === 0) {
    return '(No verified packages — suggest appropriate packages for the stack)'
  }

  // Detect primary language
  const language = detectLanguage(allTechStacks)

  // Get packages for each tech
  const packages: string[] = []
  const seenPackages = new Set<string>()

  for (const tech of allTechStacks) {
    const pkgs = getPackagesForTech(tech, language)
    for (const pkg of pkgs) {
      if (seenPackages.has(pkg.name)) continue
      seenPackages.add(pkg.name)
      packages.push(`  - ${pkg.name}@${pkg.version}: ${pkg.purpose}`)
    }
  }

  if (packages.length === 0) {
    return '(No verified packages — suggest appropriate packages for the stack)'
  }

  return `VERIFIED PACKAGES (use these EXACT versions — do not invent):\n${packages.join('\n')}`
}

/**
 * Build integration rules section
 */
export function buildIntegrationRulesSection(
  nodes: DiagramNode[],
  edges: DiagramEdge[]
): string {
  if (edges.length === 0) {
    return `### Communication Patterns

(No integrations defined)

### Shared Contracts

Define shared types and API contracts as the system evolves.

### Forbidden Integrations

Document any forbidden direct integrations as architecture constraints emerge.`
  }

  const rows = ['| From | To | Pattern | Notes |', '|------|----|---------| ------|']

  edges.forEach((edge) => {
    const source = nodes.find((n) => n.id === edge.source)
    const target = nodes.find((n) => n.id === edge.target)
    if (!source || !target) return

    const pattern = getIntegrationPattern(source.data.type, target.data.type)
    const notes = edge.data?.label || 'See component specs'

    rows.push(
      `| ${source.data.label} | ${target.data.label} | ${pattern} | ${notes} |`
    )
  })

  return `### Communication Patterns

${rows.join('\n')}

### Shared Contracts

API response types and shared data structures should be defined in a central types location. Both frontend and backend should reference these types.

### Forbidden Integrations

- Frontend components MUST NOT directly access storage — all data through backend APIs
- External services MUST NOT be called directly from frontend — proxy through backend for security`
}

/**
 * Build prompt for PROJECT_RULES.md generation
 */
export function buildProjectRulesPrompt(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string
): string {
  const componentList = buildComponentList(nodes)
  const connectionsList = buildConnectionsList(nodes, edges)
  const componentRegistry = buildComponentRegistry(nodes)
  const buildOrder = buildBuildOrderSection(nodes)
  const integrationRules = buildIntegrationRulesSection(nodes, edges)
  const verifiedPackages = buildProjectVerifiedPackages(nodes)

  // Aggregate tech stack
  const allTechStacks = nodes
    .flatMap((n) => n.data.meta.techStack ?? [])
    .filter((v, i, a) => a.indexOf(v) === i)

  const stackSummary = allTechStacks.length > 0
    ? allTechStacks.join(', ')
    : 'Not specified'

  // Detect stack type
  const hasFrontend = nodes.some((n) => n.data.type === 'frontend')
  const hasBackend = nodes.some((n) => n.data.type === 'backend')
  let stackType = 'System'
  if (hasFrontend && hasBackend) stackType = 'Full-stack application'
  else if (hasFrontend) stackType = 'Frontend application'
  else if (hasBackend) stackType = 'Backend service'

  return `You are generating a PROJECT_RULES.md file for an AI coding assistant. This file will be loaded FIRST before any component specs.

PROJECT DETAILS:
- Project Name: ${projectName}
- Type: ${stackType}
- Tech Stack: ${stackSummary}
${verifiedPackages}
- Components (${String(nodes.length)} total):
${componentList}

CONNECTIONS:
${connectionsList}

YOUR TASK:
Generate a complete PROJECT_RULES.md file following this EXACT 6-section structure. Output ONLY the markdown content with NO code fences, NO explanations, NO preamble.

REQUIRED SECTIONS (in order):

1. **System Overview** - Include:
   - Project name, type, and stack summary
   - 1-3 sentence description of what the system does
   - "Boundaries" subsection with "This system IS:" and "This system IS NOT:" lists

2. **Component Registry** - Include:
   - Table with columns: ID | Component | Type | Spec File | Status
   - Use this EXACT table content:
${componentRegistry}
   - Add "Loading Instructions" subsection: "Load component specs **only when working on that component**. Do not preload all specs."

3. **Architecture Constraints** - Include:
   - "ALWAYS (Required)" subsection with 4-6 must-follow rules including:
     * Validate all inputs at system boundaries
     * Use environment variables for configuration (never hardcode secrets)
     * Log structured errors (timestamp, level, message, context)
   - "NEVER (Forbidden)" subsection with 4-6 forbidden patterns including:
     * Store secrets in code or version control
     * Trust client-side validation alone
     * Add enterprise patterns without explicit request (message queues, microservices, CQRS)
     * Install dependencies without checking stdlib/existing deps first
   - "PREFER (Encouraged)" subsection with 3-5 patterns (format: "X over Y — rationale") including:
     * Simplicity over abstraction — delay complexity until scaling demands it

4. **Code Standards** - Include:
   - "Naming Conventions (ENFORCED)" subsection with stack-specific rules:
     * TypeScript: kebab-case.ts for utils, PascalCase.tsx for components, camelCase functions, SCREAMING_SNAKE_CASE constants
     * Python: snake_case.py files, snake_case functions/vars, PascalCase classes
   - "Modularity Rules (HARD LIMITS)" table: functions max 50 lines, files max 300 lines (hard limit 500), nesting max 3 levels, parameters max 4
   - "File Organization" subsection with specific folder structure
   - "Required Patterns" subsection with stack-specific requirements:
     * TypeScript: strict mode, no \`any\`, no enums, explicit return types
     * Python: type hints required, docstrings on public functions, zero warnings policy
   - "Dependencies Policy" subsection (search before adding, verify maintenance, check bundle size, NEVER install from GitHub main)

5. **Build Order** - Include:
   - Implementation sequence grouped by phases
   - Use this content:
${buildOrder}

6. **Integration Rules** - Include:
   - "Communication Patterns" table with columns: From | To | Pattern | Notes
   - Use this content:
${integrationRules}

ARCHITECTURE PHILOSOPHY (CRITICAL):
- Build MINIMALLY — only add what's needed NOW, scale when actually necessary
- NO enterprise patterns (message queues, microservices, CQRS) unless user explicitly requested them
- Start with the simplest working solution (SQLite before PostgreSQL clusters, monolith before microservices)
- Avoid premature abstraction — three similar lines is better than one premature helper
- If the user didn't specify a technology choice, prefer lightweight defaults over enterprise options

IMPORTANT INSTRUCTIONS:
- Be specific to THIS project's components and architecture
- Generate realistic, professional content based on the component types
- Use standard best practices for the detected stack
- CRITICAL: Use the VERIFIED PACKAGES above — do NOT invent package versions
- Keep token count reasonable (aim for 800-1200 tokens total)
- Output markdown ONLY - no code fences, no "Here is...", just the content
- Start directly with: # ${projectName} - System Rules`
}
