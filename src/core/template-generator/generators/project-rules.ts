import type { DiagramNode, DiagramEdge } from '../../types'
import {
  generateSystemOverview,
  generateComponentRegistrySection,
  generateArchitectureConstraints,
  generateCodeStandards,
  generateBuildOrderSection,
  generateIntegrationRules,
} from '../sections'

/**
 * Generate PROJECT_RULES.md template
 */
export function generateProjectRulesTemplate(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
): string {
  // System Overview section
  const systemOverview = generateSystemOverview(nodes, projectName)

  // Component Registry section
  const componentRegistry = generateComponentRegistrySection(nodes)

  // Architecture Constraints section
  const architectureConstraints = generateArchitectureConstraints(nodes)

  // Code Standards section
  const codeStandards = generateCodeStandards(nodes)

  // Build Order section
  const buildOrder = generateBuildOrderSection(nodes)

  // Integration Rules section
  const integrationRules = generateIntegrationRules(nodes, edges)

  // Assemble complete document
  return `# ${projectName} - System Rules

> **Load this file FIRST** before any component specs.
> Component specs in \`specs/*.md\` extend these rules.

${systemOverview}

---

${componentRegistry}

---

${architectureConstraints}

---

${codeStandards}

---

${buildOrder}

---

${integrationRules}

---

## Status Tracking

Track implementation progress in a status file (e.g., \`STATUS.md\`).

See \`AGENT_PROTOCOL.md\` for:
- Required status tracking format
- Workflow guidance (Index → Plan → Implement → Verify)
- Scope discipline rules
- Library policy
`
}
