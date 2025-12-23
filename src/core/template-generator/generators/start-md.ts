import type { DiagramNode } from '../../types'

/**
 * Aggregate unique tech stacks from all nodes
 */
function aggregateTechStacks(nodes: DiagramNode[]): string[] {
  const stacks = new Set<string>()
  nodes.forEach((node) => {
    const techStack = node.data.meta.techStack ?? []
    techStack.forEach((tech) => {
      if (tech) stacks.add(tech.trim())
    })
  })
  return Array.from(stacks).sort()
}

/**
 * Get component type summary
 */
function getTypeSummary(nodes: DiagramNode[]): string {
  const typeCounts: Record<string, number> = {}
  nodes.forEach((node) => {
    const type = node.data.type
    typeCounts[type] = (typeCounts[type] ?? 0) + 1
  })
  return Object.entries(typeCounts)
    .map(([type, count]) => `${String(count)} ${type}`)
    .join(', ')
}

/**
 * Get component list with types
 */
function getComponentList(nodes: DiagramNode[]): string {
  return nodes
    .map((node) => `- ${node.data.label} (${node.data.type})`)
    .join('\n')
}

/**
 * Generate START.md - LLM initialization prompt
 * This is a system prompt for downstream AI, NOT a human readme
 */
export function generateStartMd(
  nodes: DiagramNode[],
  projectName: string
): string {
  const techStacks = aggregateTechStacks(nodes)
  const techStackSummary = techStacks.length > 0
    ? techStacks.join(', ')
    : 'Not specified'
  const typeSummary = getTypeSummary(nodes)
  const componentList = getComponentList(nodes)

  return `# ${projectName} — Initialization Protocol

<system>
You are initializing a new project from a Sketch2Prompt blueprint. This file defines your initialization sequence. Follow it exactly.

CRITICAL: Do NOT skip steps. Do NOT proceed without explicit user confirmation at each gate.
</system>

---

## Phase 0: Context Loading

READ THESE FILES NOW (in order):
1. \`PROJECT_RULES.md\` — System constitution, architecture constraints, build order
2. \`AGENT_PROTOCOL.md\` — Workflow rules, code standards, library policy

Do NOT load \`specs/*.yaml\` yet. Component specs are loaded only when actively implementing that component.

---

## Phase 1: Confirmation Gate

<project_summary>
Project: ${projectName}
Components: ${String(nodes.length)} (${typeSummary})
Tech Stack: ${techStackSummary}

${componentList}
</project_summary>

<constraints_summary>
- Minimalism First: No enterprise patterns (queues, microservices, CQRS) without explicit request
- Security Baseline: Validate inputs at boundaries, no hardcoded secrets, structured logging
- Modularity: Functions max 50 lines, files max 300 lines, max 3 nesting levels
</constraints_summary>

### REQUIRED: Ask the user to confirm

Present the summary above, then ask:

> "I've loaded the ${projectName} blueprint. Before proceeding:
> 1. Does this component structure match your intent?
> 2. Are the tech stack choices correct?
> 3. Any constraints you want to adjust?
>
> Reply **confirmed** to proceed, or describe what needs adjustment."

**HALT until user responds.** Do not proceed without explicit confirmation.

---

## Phase 2: IDE Configuration Gate

After user confirms, ask:

> "Which IDE or AI assistant will you use for this project?"
>
> | Option | Generated File |
> |--------|----------------|
> | Claude Code | \`CLAUDE.md\` |
> | Cursor | \`.cursorrules\` |
> | Windsurf | \`.windsurfrules\` |
> | GitHub Copilot | \`.github/copilot-instructions.md\` |
> | Other | \`AI_INSTRUCTIONS.md\` |

**HALT until user responds.**

---

## Phase 3: Generate IDE Instructions

Once user selects IDE, generate the appropriate instruction file using this structure:

\`\`\`
# ${projectName}

## System Overview
[Extract from PROJECT_RULES.md Section 1 - project type, stack, boundaries]

## Architecture Constraints
[Extract from PROJECT_RULES.md Section 3 - ALWAYS/NEVER/PREFER rules]

## Code Standards
[Extract from PROJECT_RULES.md Section 4 - naming, modularity, patterns]

## Component Registry
[Extract from PROJECT_RULES.md Section 2 - component table]

## Build Order
[Extract from PROJECT_RULES.md Section 5 - phased implementation sequence]

## Workflow Protocol
[Extract from AGENT_PROTOCOL.md - Index → Plan → Implement → Verify]

## Library Policy
[Extract from AGENT_PROTOCOL.md - search before building, minimalism mandate]
\`\`\`

Adapt formatting to match IDE conventions (e.g., Cursor uses YAML-like rules).

---

## Phase 4: Create Status Tracker

Create \`STATUS.md\` with initial state:

\`\`\`markdown
# ${projectName} — Status

## Current Phase
Phase 1: Foundation

## Active Component
None (starting)

## Progress
- [ ] Project setup complete
- [ ] IDE instructions generated
- [ ] Ready to begin Phase 1 components

## Last Updated
[timestamp]
\`\`\`

---

## Phase 5: Ready to Build

Announce readiness:

> "Setup complete. I've generated your IDE instructions and created STATUS.md.
>
> Ready to begin implementation following the build order in PROJECT_RULES.md.
>
> Which component should we start with, or should I begin with Phase 1: Foundation?"

---

<rules>
- NEVER skip confirmation gates
- NEVER load all specs at once — load only the active component
- NEVER add features not in specs
- ALWAYS update STATUS.md after completing a component
- ALWAYS follow build order from PROJECT_RULES.md
</rules>

*Blueprint generated by [Sketch2Prompt](https://github.com/jmassengille/sketch2prompt)*
`
}
