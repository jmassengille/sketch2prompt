import type { DiagramNode } from '../../types'

/**
 * Detect tech stacks from nodes for stack-specific standards
 */
function detectStacks(nodes: DiagramNode[]): Set<string> {
  const stacks = new Set<string>()
  nodes.forEach((node) => {
    const techStack = node.data.meta.techStack ?? []
    techStack.forEach((tech) => {
      const lower = tech.toLowerCase()
      if (lower.includes('python') || lower.includes('fastapi') || lower.includes('django')) {
        stacks.add('python')
      }
      if (lower.includes('typescript') || lower.includes('node') || lower.includes('react') || lower.includes('next') || lower.includes('vue') || lower.includes('svelte')) {
        stacks.add('typescript')
      }
      if (lower.includes('go') || lower.includes('golang')) {
        stacks.add('go')
      }
    })
  })
  return stacks
}

/**
 * Generate Code Standards section with explicit, enforceable rules
 */
export function generateCodeStandards(nodes: DiagramNode[]): string {
  const nodeTypes = new Set(nodes.map((n) => n.data.type))
  const stacks = detectStacks(nodes)

  const hasFrontend = nodeTypes.has('frontend')
  const hasBackend = nodeTypes.has('backend')
  const hasPython = stacks.has('python')
  const hasTypeScript = stacks.has('typescript') || nodeTypes.has('frontend') || nodeTypes.has('backend')
  const hasGo = stacks.has('go')

  // Stack-specific naming conventions
  let namingConventions = `### Naming Conventions (ENFORCED)\n`

  if (hasTypeScript) {
    namingConventions += `
**TypeScript/JavaScript:**
- Files: \`kebab-case.ts\` for utilities, \`PascalCase.tsx\` for components
- Functions: \`camelCase\` with verb prefix (\`getUserById\`, \`validateEmail\`)
- Constants: \`SCREAMING_SNAKE_CASE\` for true constants
- Types/Interfaces: \`PascalCase\` (\`UserProfile\`, \`CreateOrderInput\`)
- No abbreviations except: \`id\`, \`url\`, \`api\`, \`db\`
`
  }

  if (hasPython) {
    namingConventions += `
**Python (PEP 8 STRICT):**
- Files: \`snake_case.py\`
- Functions/Variables: \`snake_case\`
- Classes: \`PascalCase\`
- Constants: \`SCREAMING_SNAKE_CASE\`
- Private: single underscore prefix \`_internal_method\`
`
  }

  if (hasGo) {
    namingConventions += `
**Go:**
- Files: \`snake_case.go\`
- Exported: \`PascalCase\` (public)
- Unexported: \`camelCase\` (private)
- Acronyms: all caps (\`HTTPClient\`, \`URLParser\`)
`
  }

  // Modularity rules - these are hard limits
  const modularityRules = `### Modularity Rules (HARD LIMITS)

| Metric | Limit | Action When Exceeded |
|--------|-------|---------------------|
| Function length | **50 lines max** | Extract helper functions |
| File length | **300 lines** (hard: 500) | Split into modules |
| Nesting depth | **3 levels max** | Use early returns, extract functions |
| Parameters | **4 max** | Use options object |
| Cyclomatic complexity | **10 max** | Simplify logic, extract branches |`

  // File organization
  let fileOrganization = `### File Organization\n`

  if (hasFrontend && hasBackend) {
    fileOrganization += `
\`\`\`
/src
  /app          - Application shell, routing, providers
  /components   - Reusable UI components (no business logic)
  /features     - Feature modules (co-located components + hooks + utils)
  /services     - API clients, external service integrations
  /stores       - State management (Zustand/Redux slices)
  /types        - Shared TypeScript types
  /utils        - Pure utility functions
  /server       - Backend code (if monorepo)
\`\`\`
`
  } else if (hasFrontend) {
    fileOrganization += `
\`\`\`
/src
  /app          - Application shell, routing
  /components   - Reusable UI components
  /features     - Feature modules
  /hooks        - Custom React hooks
  /stores       - State management
  /types        - TypeScript types
  /utils        - Utility functions
\`\`\`
`
  } else if (hasBackend) {
    fileOrganization += `
\`\`\`
/src
  /controllers  - Route handlers (thin, delegate to services)
  /services     - Business logic
  /repositories - Data access layer
  /models       - Data models/entities
  /middleware   - Request/response middleware
  /types        - TypeScript types
  /utils        - Utility functions
\`\`\`
`
  }

  // Stack-specific patterns
  let patterns = `### Required Patterns\n`

  if (hasFrontend) {
    patterns += `
**Frontend:**
- Components: Functional only, no class components
- State: Lift state up or use stores, no prop drilling >2 levels
- Effects: Cleanup subscriptions, cancel pending requests
- Error handling: Error boundaries at route level minimum
`
  }

  if (hasBackend) {
    patterns += `
**Backend:**
- Controllers: Routing only, no business logic
- Services: All business logic, injectable dependencies
- Validation: At API boundary using schema validation (Zod, Pydantic)
- Errors: Structured error responses with codes and messages
`
  }

  if (hasPython) {
    patterns += `
**Python Specific:**
- Type hints: Required on all function signatures
- Docstrings: Required on public functions (Google style)
- Imports: stdlib → third-party → local (isort)
- Linting: ruff or flake8+black, zero warnings policy
`
  }

  if (hasTypeScript) {
    patterns += `
**TypeScript Specific:**
- Strict mode: Enabled, no exceptions
- No \`any\`: Use \`unknown\` and narrow, or define proper types
- No enums: Use \`as const\` objects instead
- Explicit returns: All functions must declare return type
`
  }

  // Dependencies policy
  const dependenciesPolicy = `### Dependencies Policy

**Before adding ANY dependency:**
1. Check if functionality exists in stdlib or current deps
2. Verify package is actively maintained (commits in last 6 months)
3. Check bundle size impact (use bundlephobia.com)
4. Verify TypeScript types exist (@types/* or built-in)
5. Review security advisories (npm audit, snyk)

**NEVER:**
- Install from GitHub main branch
- Use packages with known vulnerabilities
- Add deps for trivial functionality (<20 lines of code)`

  return `## Code Standards

${namingConventions}

${modularityRules}

${fileOrganization}

${patterns}

${dependenciesPolicy}`
}
