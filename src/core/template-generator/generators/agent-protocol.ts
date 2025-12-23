import type { DiagramNode } from '../../types'
import type { OutOfScopeId } from '../../onboarding'
import { OUT_OF_SCOPE_CONFIGS } from '../../onboarding'

/**
 * Detect unique primary tech stacks from all nodes
 */
function detectPrimaryStacks(nodes: DiagramNode[]): string[] {
  const stacks = new Set<string>()

  nodes.forEach((node) => {
    const techStack = node.data.meta.techStack
    if (techStack && techStack.length > 0) {
      // Add all tech stack items from this node
      techStack.forEach((stack) => {
        if (stack) {
          stacks.add(stack.trim())
        }
      })
    }
  })

  return Array.from(stacks).sort()
}

/**
 * Tech stack to standards mapping - explicit, enforceable rules
 */
const STACK_STANDARDS: Record<string, string> = {
  Python: 'PEP 8 strict: snake_case functions/vars, PascalCase classes, 4-space indent, max 88 chars/line, type hints required',
  FastAPI: 'PEP 8 strict: snake_case functions/vars, PascalCase classes, 4-space indent, max 88 chars/line, type hints required',
  Django: 'PEP 8 strict: snake_case functions/vars, PascalCase classes, 4-space indent, max 88 chars/line, type hints required',
  TypeScript: 'ESLint strict: no `any`, no enums (use const objects), explicit return types, 2-space indent, max 100 chars/line',
  'Node.js': 'ESLint strict: no `any`, no enums (use const objects), explicit return types, 2-space indent, max 100 chars/line',
  Express: 'ESLint strict: no `any`, no enums (use const objects), explicit return types, 2-space indent, max 100 chars/line',
  React: 'ESLint strict: no `any`, functional components only, explicit prop types, 2-space indent, max 100 chars/line',
  'Next.js': 'ESLint strict: no `any`, functional components only, explicit prop types, 2-space indent, max 100 chars/line',
  Vue: 'ESLint strict: no `any`, Composition API preferred, explicit prop types, 2-space indent, max 100 chars/line',
  SvelteKit: 'ESLint strict: no `any`, explicit types, 2-space indent, max 100 chars/line',
  Go: 'gofmt mandatory, golint, effective go patterns, explicit error handling, no naked returns',
  Golang: 'gofmt mandatory, golint, effective go patterns, explicit error handling, no naked returns',
  Rust: 'rustfmt mandatory, clippy warnings as errors, no unsafe without justification',
  Java: 'Google Java Style: 2-space indent, 100 char line limit, explicit access modifiers',
  Spring: 'Google Java Style: 2-space indent, 100 char line limit, explicit access modifiers',
  PostgreSQL: 'snake_case tables/columns, explicit constraints, indexed foreign keys',
  MySQL: 'snake_case tables/columns, explicit constraints, indexed foreign keys',
  MongoDB: 'camelCase fields, schema validation, indexed queries',
  Redis: 'namespaced keys (prefix:type:id), TTL on all cache entries',
  Clerk: 'Server-side validation, never trust client claims',
  Auth0: 'Server-side validation, never trust client claims',
  Stripe: 'Webhook signature verification, idempotency keys for mutations',
}

/**
 * Generate code standards section based on detected stacks
 */
function generateCodeStandardsSection(stacks: string[]): string {
  // Modularity rules and general principles apply regardless of stack
  const modularityAndPrinciples = `### Modularity Rules (ENFORCED)

- Functions: **max 50 lines** — split larger functions into helpers
- Files: **max 300 lines** (hard limit 500) — extract modules when exceeded
- Classes: single responsibility — one reason to change
- Nesting: **max 3 levels** — extract early returns or helper functions

### General Principles

- **Explicit over implicit** — no magic, no hidden behavior
- **Composition over inheritance** — prefer interfaces and composition
- **Fail fast** — validate inputs early, throw meaningful errors
- **Pure functions** — minimize side effects, maximize testability
- **No premature abstraction** — three similar lines beats one clever helper`

  if (stacks.length === 0) {
    return `## Code Standards

${modularityAndPrinciples}`
  }

  let tableRows = ''
  const seenRows = new Set<string>()

  stacks.forEach((stack) => {
    const standard = STACK_STANDARDS[stack] || 'General best practices'
    const row = `| ${stack} | ${standard} |`
    // Only add if we haven't seen this exact row before
    if (!seenRows.has(row)) {
      seenRows.add(row)
      tableRows += `${row}\n`
    }
  })

  return `## Code Standards

Apply dynamically based on \`tech_stack.primary\`:

| Stack | Standards |
|-------|-----------|
${tableRows}
${modularityAndPrinciples}`
}

/**
 * Generate exclusions section based on out-of-scope items
 */
function generateExclusionsSection(outOfScope: OutOfScopeId[]): string {
  if (outOfScope.length === 0) {
    return ''
  }

  const items = outOfScope
    .map((id) => {
      const config = OUT_OF_SCOPE_CONFIGS.find((c) => c.id === id)
      if (!config) return null
      return `- **${config.label}**: ${config.rationale}`
    })
    .filter(Boolean)
    .join('\n')

  return `## Explicitly Out of Scope

The following are **intentionally excluded** from this project's scope. Do not implement, suggest, or plan for these features unless explicitly requested by the user.

${items}

---

`
}

/**
 * Generate [OUTPUT] AGENT_PROTOCOL.md
 * Workflow guidance for downstream AI agents implementing the system
 */
export function generateAgentProtocolTemplate(
  nodes: DiagramNode[],
  _projectName: string,
  outOfScope: OutOfScopeId[] = [],
): string {
  const stacks = detectPrimaryStacks(nodes)
  const codeStandards = generateCodeStandardsSection(stacks)
  const exclusions = generateExclusionsSection(outOfScope)

  return `# Agent Protocol

## Core Principle

The system you are building already has rules. Execute within those rules — do not invent new architecture.

Before ANY implementation:
1. Read \`PROJECT_RULES.md\` to understand system boundaries
2. Load ONLY the component spec you are currently implementing
3. Do not load other specs unless resolving an integration contract

---

${exclusions}## Status Tracking (MANDATORY)

\`STATUS.md\` tracks current phase, milestone, and progress.

**Update after every feature or milestone.** No exceptions.

\`\`\`
# Project Status

## Current Phase
[Phase 1: Foundation | Phase 2: Core Features | Phase 3: Integration]

## Active Component
[component_id] [component_name]

## Current Milestone
[What you're working on]

## Progress
- [x] Completed items
- [ ] Remaining items

## Blockers
[Any blockers or decisions needed]

## Last Updated
[timestamp]
\`\`\`

**Rules:**
- Create \`STATUS.md\` on first task if it doesn't exist
- Update after completing any feature or milestone
- Update when switching components
- Update when blocked
- Read on session start to restore context

---

## Workflow Guidance

Recommended phases for non-trivial tasks:

1. **Index** — Map files and dependencies in scope. Indexing only — no suggestions or fixes.
2. **Plan** — Produce implementation plan. Research latest stable versions for new deps. Flag decisions needing input.
3. **Implement** — Follow the plan. Work in logical increments.
4. **Verify** — Check exit criteria. Update STATUS.md.

---

## Scope Discipline

### ALWAYS
- Implement what the spec defines
- Flag gaps or ambiguities before filling them
- Use baseline deps from spec as version anchors
- Follow code standards from \`PROJECT_RULES.md\`
- Verify exit criteria before marking component complete
- **Update \`STATUS.md\` after every feature/milestone**

### NEVER
- Add features not in the spec
- Refactor adjacent components unprompted
- Upgrade deps beyond stable versions in spec
- Create abstractions for hypothetical future requirements
- Proceed to next component before current passes verification

### PREFER
- Established libraries over custom implementations
- Explicit over implicit
- Composition over inheritance
- Failing fast over silent degradation
- Asking over assuming when spec is ambiguous

---

## Library Policy

**Search before building.** Check in order:
1. Current codebase utilities
2. Project dependencies
3. Well-maintained packages (PyPI, npm, etc.)

Use established libraries for: parsing, validation, date/time, HTTP clients, file formats.

Custom code only when no suitable library exists or you've flagged it and user approved.

---

## Minimalism Mandate (NON-NEGOTIABLE)

**Start simple. Scale when necessary. Not before.**

### ALWAYS
- Begin with the simplest architecture that could work
- Prefer stdlib over library, library over framework
- Use lightweight solutions (SQLite before PostgreSQL clusters, monolith before microservices)
- Write three similar lines before extracting a helper
- Question every dependency: "Do I actually need this?"

### NEVER add without explicit user request
- Message queues (Redis queues, RabbitMQ, SQS)
- Microservices or service mesh
- CQRS or event sourcing
- Kubernetes or container orchestration
- GraphQL when REST suffices
- State management libraries when React state works
- ORMs when raw queries are simpler

### WHY THIS MATTERS
Premature complexity is the #1 cause of project failure. Every abstraction has a cost. Every dependency is a liability. Every service boundary is a failure point.

**If the user didn't ask for it, don't add it.**

---

${codeStandards}
`
}
