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

  return `You are generating a component specification YAML file for an AI coding assistant.

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
Generate a complete component spec in YAML format following the schema for type "${node.data.type}".

REQUIRED FIELDS (all specs):
- spec_version: "1.0"
- component_id: "${node.id}"
- name: "${node.data.label}"
- type: "${node.data.type}"
- description: |
    (2-3 sentence description based on the component name and type)
- responsibilities: (3-5 core responsibilities as bullet points)
- anti_responsibilities: (3-5 strings using format: "NEVER [action] — [reason]")

INTEGRATION_POINTS (for each connected component):
- component: (name of connected component)
- direction: "inbound" | "outbound" | "bidirectional"
- purpose: (why this integration exists)
- contract:
    request: (request shape, e.g., "{ userId: string }")
    response: (response shape, e.g., "{ user: User }")

TECH_STACK:
- primary: "${techStack}"
- baseline_deps: (USE THE VERIFIED PACKAGES ABOVE - do NOT invent versions)
- references: (USE THE VERIFIED REFERENCES ABOVE - do NOT invent URLs)

VALIDATION SECTION (required):
- exit_criteria: (list of completion criteria, must include "Status file updated with component completion")
- smoke_tests: (minimal verification steps)
- integration_checks: (based on integration_points)

TYPE-SPECIFIC FIELDS for "${node.data.type}":
${getTypeSpecificFieldsPrompt(node.data.type)}

IMPORTANT INSTRUCTIONS:
- Output ONLY valid YAML with NO markdown code fences, NO explanations
- Be specific and realistic based on the component name "${node.data.label}"
- Anti-responsibilities MUST use format: "NEVER [action] — [reason]"
- CRITICAL: Use the VERIFIED PACKAGES with exact versions provided above. Do NOT make up versions!
- CRITICAL: Use the VERIFIED REFERENCES with exact URLs provided above. Do NOT make up URLs!
- References are simple strings, NOT objects
- Validation section is required with exit_criteria, smoke_tests, and integration_checks
- Keep token count reasonable (~400-700 tokens)
- Use proper YAML syntax with correct indentation (2 spaces)
- Start directly with: spec_version: "1.0"`
}
