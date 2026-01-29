/**
 * Assembler Functions for AI-Enhanced Export
 *
 * Combines deterministic sections (from template-generator) with AI snippets.
 * 100% deterministic assembly logic - AI only provides prose content.
 */
import type { DiagramNode, DiagramEdge, NodeType } from '../types'
import type { OutOfScopeId } from '../onboarding'
import type { AISnippets } from './types'
import {
  generateSystemOverview,
  generateComponentRegistrySection,
  generateArchitectureConstraints,
  generateCodeStandards,
  generateBuildOrderSection,
  generateIntegrationRules,
  inferCommunicationPattern,
} from '../template-generator/sections'
import { generateAgentProtocolTemplate } from '../template-generator/generators/agent-protocol'
import {
  DEFAULT_RESPONSIBILITIES,
  ENHANCED_ANTI_RESPONSIBILITIES,
  TYPE_LABELS,
  getPackagesForTech,
} from '../template-generator/constants'
import { detectLanguage } from '../template-generator/constants/packages'

// =============================================================================
// Types
// =============================================================================

export interface AssembleProjectRulesOptions {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  projectName: string
  snippets: AISnippets
}

export interface AssembleAgentProtocolOptions {
  nodes: DiagramNode[]
  projectName: string
  outOfScope?: OutOfScopeId[]
}

export interface AssembleComponentSpecOptions {
  node: DiagramNode
  allNodes: DiagramNode[]
  snippets: AISnippets
}

// =============================================================================
// Helper Functions
// =============================================================================

/** Inject AI description and boundary additions into system overview */
function injectSystemOverviewSnippets(
  baseSection: string,
  snippets: AISnippets
): string {
  let result = baseSection

  // Replace description placeholder with AI-generated description
  result = result.replace(
    /^# AI: Add 2-3 sentence description.*$/m,
    snippets.projectDescription
  )

  // Replace IS placeholder with AI-generated items
  if (snippets.boundaryAdditions.isItems.length > 0) {
    const isItems = snippets.boundaryAdditions.isItems.map((i) => `- ${i}`).join('\n')
    result = result.replace(/^- # AI: Add more explicit inclusions.*$/m, isItems)
  } else {
    result = result.replace(/^- # AI: Add more explicit inclusions.*\n?/m, '')
  }

  // Replace IS NOT placeholder with AI-generated items
  if (snippets.boundaryAdditions.isNotItems.length > 0) {
    const isNotItems = snippets.boundaryAdditions.isNotItems.map((i) => `- ${i}`).join('\n')
    result = result.replace(/^- # AI: Add more explicit exclusions.*$/m, isNotItems)
  } else {
    result = result.replace(/^- # AI: Add more explicit exclusions.*\n?/m, '')
  }

  return result
}

/** Get component snippet with fallback to empty values */
function getComponentSnippet(
  snippets: AISnippets,
  nodeId: string
): { description: string; responsibilities: string[]; antiResponsibilities: string[] } {
  const snippet = snippets.componentSnippets.get(nodeId)
  return snippet ?? { description: '', responsibilities: [], antiResponsibilities: [] }
}

/** Format tech stack section */
function formatTechStack(node: DiagramNode): string {
  const techStack = node.data.meta.techStack
  if (techStack && techStack.length > 0) {
    return `## Tech Stack\n${techStack.join(', ')}\n`
  }
  const typeLabel = TYPE_LABELS[node.data.type]
  return `## Tech Stack\nTBD - specify technologies for this ${typeLabel}\n`
}

/** Format responsibilities with AI additions */
function formatResponsibilities(type: NodeType, aiAdditions: string[]): string {
  const defaults = DEFAULT_RESPONSIBILITIES[type]
  const lines = ['## Responsibilities']
  for (const r of defaults) {
    lines.push(`- ${r}`)
  }
  for (const r of aiAdditions) {
    lines.push(`- ${r}`)
  }
  return lines.join('\n') + '\n'
}

/** Format anti-responsibilities with AI additions */
function formatAntiResponsibilities(type: NodeType, aiAdditions: string[]): string {
  const defaults = ENHANCED_ANTI_RESPONSIBILITIES[type]
  const lines = ['## Anti-Responsibilities']
  for (const ar of defaults) {
    lines.push(`- ${ar.pattern} — ${ar.reason}`)
  }
  for (const ar of aiAdditions) {
    lines.push(`- ${ar}`)
  }
  return lines.join('\n') + '\n'
}

/** Format integrations based on node types */
function formatIntegrations(node: DiagramNode, allNodes: DiagramNode[]): string {
  const integrations: string[] = []
  const nodeType = node.data.type

  for (const other of allNodes) {
    if (other.id === node.id) continue
    const otherType = other.data.type
    const outboundPattern = inferCommunicationPattern(nodeType, otherType)
    const inboundPattern = inferCommunicationPattern(otherType, nodeType)

    if (outboundPattern) {
      integrations.push(`- ${other.data.label} (outbound) via ${outboundPattern}`)
    }
    if (inboundPattern) {
      integrations.push(`- ${other.data.label} (inbound) via ${inboundPattern}`)
    }
  }

  if (integrations.length === 0) {
    return `## Integrates With\nNo type-based integrations detected.\n`
  }
  return `## Integrates With\n${integrations.join('\n')}\n`
}

/** Format dependencies table */
function formatDependencies(techStack: string[] | undefined): string {
  if (!techStack || techStack.length === 0) {
    return `## Dependencies\nTBD - add dependencies based on tech stack\n`
  }

  const language = detectLanguage(techStack)
  const rows: string[] = []
  const seenPackages = new Set<string>()

  for (const tech of techStack) {
    const packages = getPackagesForTech(tech, language)
    for (const pkg of packages) {
      if (seenPackages.has(pkg.name)) continue
      seenPackages.add(pkg.name)
      rows.push(`| ${pkg.name} | ${pkg.version} | ${pkg.purpose} |`)
    }
  }

  if (rows.length === 0) {
    return `## Dependencies\nTBD - add dependencies for ${techStack.join(', ')}\n`
  }

  return `## Dependencies\n| Package | Version | Purpose |\n|---------|---------|---------|
${rows.join('\n')}\n`
}

// =============================================================================
// Template Helpers
// =============================================================================

/** Assemble PROJECT_RULES.md from sections */
interface ProjectRulesSections {
  systemOverview: string
  componentRegistry: string
  architectureConstraints: string
  codeStandards: string
  buildOrder: string
  integrationRules: string
}

function buildProjectRulesDocument(projectName: string, s: ProjectRulesSections): string {
  return `# ${projectName} - System Rules

> **Load this file FIRST** before any component specs.
> Component specs in \`specs/*.md\` extend these rules.

${s.systemOverview}

---

${s.componentRegistry}

---

${s.architectureConstraints}

---

${s.codeStandards}

---

${s.buildOrder}

---

${s.integrationRules}

---

## Status Tracking

Track implementation progress in a status file (e.g., \`STATUS.md\`).

See \`AGENT_PROTOCOL.md\` for:
- Required status tracking format
- Workflow guidance (Index -> Plan -> Implement -> Verify)
- Scope discipline rules
- Library policy
`
}

// =============================================================================
// Assembler Functions
// =============================================================================

/**
 * Assemble PROJECT_RULES.md with AI snippets injected.
 */
export function assembleProjectRules(options: AssembleProjectRulesOptions): string {
  const { nodes, edges, projectName, snippets } = options

  const systemOverviewBase = generateSystemOverview(nodes, projectName)

  return buildProjectRulesDocument(projectName, {
    systemOverview: injectSystemOverviewSnippets(systemOverviewBase, snippets),
    componentRegistry: generateComponentRegistrySection(nodes),
    architectureConstraints: generateArchitectureConstraints(nodes),
    codeStandards: generateCodeStandards(nodes),
    buildOrder: generateBuildOrderSection(nodes),
    integrationRules: generateIntegrationRules(nodes, edges),
  })
}

/**
 * Assemble AGENT_PROTOCOL.md (fully deterministic, no AI snippets).
 */
export function assembleAgentProtocol(options: AssembleAgentProtocolOptions): string {
  const { nodes, projectName, outOfScope = [] } = options
  return generateAgentProtocolTemplate(nodes, projectName, outOfScope)
}

/**
 * Assemble component spec in Markdown + XML format with AI snippets.
 */
export function assembleComponentSpec(options: AssembleComponentSpecOptions): string {
  const { node, allNodes, snippets } = options
  const componentSnippet = getComponentSnippet(snippets, node.id)
  const sections: string[] = []

  // Opening XML tag with metadata
  sections.push(
    `<spec component="${node.data.label}" type="${node.data.type}" id="${node.id}">`
  )
  sections.push('')

  // Tech Stack
  sections.push(formatTechStack(node))

  // Description - prefer AI snippet, then user meta, then generate default
  const description =
    componentSnippet.description ||
    node.data.meta.description ||
    `${TYPE_LABELS[node.data.type]} component.`
  sections.push(`## Description`)
  sections.push(description)
  sections.push('')

  // Responsibilities (defaults + AI additions)
  sections.push(formatResponsibilities(node.data.type, componentSnippet.responsibilities))

  // Anti-Responsibilities (defaults + AI additions)
  sections.push(formatAntiResponsibilities(node.data.type, componentSnippet.antiResponsibilities))

  // Integrations (type-based)
  sections.push(formatIntegrations(node, allNodes))

  // Dependencies
  sections.push(formatDependencies(node.data.meta.techStack))

  // Closing XML tag
  sections.push('</spec>')

  return sections.join('\n')
}
