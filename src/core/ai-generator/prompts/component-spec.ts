import type { DiagramNode, DiagramEdge } from '../../types'
import { getTypeSpecificFieldsPrompt } from './helpers'
import {
  getPackagesForTech,
  detectLanguage,
  getRegistryUrl,
} from '../../template-generator/constants/known-packages'

/**
 * Build connections list for component
 */
function buildConnectionsList(
  node: DiagramNode,
  allNodes: DiagramNode[],
  edges: DiagramEdge[]
): string {
  const connections = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((edge) => {
      const isSource = edge.source === node.id
      const otherId = isSource ? edge.target : edge.source
      const otherNode = allNodes.find((n) => n.id === otherId)
      if (!otherNode) return null

      const direction = isSource ? 'sends to' : 'receives from'
      const label = edge.data?.label ? `: ${edge.data.label}` : ''
      return `- ${otherNode.data.label} (${direction})${label}`
    })
    .filter(Boolean)
    .join('\n')

  return connections || '(No connections)'
}

/**
 * Build verified package information from KNOWN_PACKAGES
 * Returns formatted string with exact versions for AI to use
 */
function buildVerifiedPackageInfo(techStack: string[] | undefined): string {
  if (!techStack || techStack.length === 0) {
    return '(No tech stack specified - suggest appropriate packages)'
  }

  const language = detectLanguage(techStack)
  const packages: string[] = []
  const seenPackages = new Set<string>()

  for (const tech of techStack) {
    const pkgs = getPackagesForTech(tech, language)
    for (const pkg of pkgs) {
      if (seenPackages.has(pkg.name)) continue
      seenPackages.add(pkg.name)
      packages.push(`  - name: "${pkg.name}", version: "${pkg.version}", purpose: "${pkg.purpose}"`)
    }
  }

  if (packages.length === 0) {
    return '(No known packages for this tech stack - suggest appropriate packages)'
  }

  return `VERIFIED PACKAGES (use these EXACT versions):\n${packages.join('\n')}`
}

/**
 * Build verified reference URLs from KNOWN_PACKAGES
 */
function buildVerifiedReferences(techStack: string[] | undefined): string {
  if (!techStack || techStack.length === 0) {
    return '(Suggest appropriate documentation URLs)'
  }

  const language = detectLanguage(techStack)
  const refs: string[] = []
  const seenUrls = new Set<string>()

  for (const tech of techStack) {
    const pkgs = getPackagesForTech(tech, language)
    for (const pkg of pkgs) {
      if (pkg.docs && !seenUrls.has(pkg.docs)) {
        seenUrls.add(pkg.docs)
        refs.push(`  - "${pkg.docs}"`)
      }
      const registryUrl = getRegistryUrl(pkg)
      if (!seenUrls.has(registryUrl)) {
        seenUrls.add(registryUrl)
        refs.push(`  - "${registryUrl}" (version verification)`)
      }
    }
  }

  if (refs.length === 0) {
    return '(Suggest appropriate documentation URLs)'
  }

  return `VERIFIED REFERENCES (use these URLs):\n${refs.join('\n')}`
}

/**
 * Build prompt for component YAML spec generation
 */
export function buildComponentSpecPrompt(
  node: DiagramNode,
  allNodes: DiagramNode[],
  edges: DiagramEdge[]
): string {
  const connectionsList = buildConnectionsList(node, allNodes, edges)
  const techStack = node.data.meta.techStack?.length
    ? node.data.meta.techStack.join(', ')
    : '(not specified - suggest appropriate tech for this component type)'

  // Get verified package info from KNOWN_PACKAGES
  const verifiedPackages = buildVerifiedPackageInfo(node.data.meta.techStack)
  const verifiedReferences = buildVerifiedReferences(node.data.meta.techStack)

  return `You are generating a component specification in Markdown + XML format for an AI coding assistant.

COMPONENT DETAILS:
- Name: ${node.data.label}
- Type: ${node.data.type}
- Description: ${node.data.meta.description || 'No description provided'}
- Tech Stack: ${techStack}
- Component ID: ${node.id}

${verifiedPackages}

${verifiedReferences}

CONNECTIONS:
${connectionsList}

YOUR TASK:
Generate a component spec in Markdown format with XML tags for semantic parsing.

OUTPUT FORMAT (follow exactly):
<spec component="${node.data.label}" type="${node.data.type}" id="${node.id}">

## Tech Stack
${techStack}

## Description
(2-3 sentences based on component name and type)

## Responsibilities
- (3-5 core responsibilities as bullet points)

## Anti-Responsibilities
- NEVER [action] — [reason]
- (3-5 total, use this exact format)

## Integrates With
- [Component Name] (direction) via [Pattern]
(Based on connections above)

## Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
(USE VERIFIED PACKAGES ABOVE - do NOT invent versions)

${getTypeSpecificFieldsPrompt(node.data.type)}

## Validation
- [ ] (completion criteria based on component type)
- [ ] STATUS.md updated

</spec>

CRITICAL INSTRUCTIONS:
- Output ONLY the Markdown content, NO code fences, NO explanations
- Start directly with: <spec component=
- Use VERIFIED PACKAGES with exact versions - do NOT invent versions
- Anti-responsibilities MUST use format: "NEVER [action] — [reason]"
- Keep token count under 400 tokens
- Close with </spec>`
}
