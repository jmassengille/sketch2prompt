import { dump } from 'js-yaml'
import type { DiagramNode, DiagramEdge } from '../../types'
import {
  DEFAULT_RESPONSIBILITIES,
  DEFAULT_TECH_STACK,
  ENHANCED_ANTI_RESPONSIBILITIES,
  TYPE_LABELS,
  TYPE_DESCRIPTIONS,
  getPackagesForTech,
  getRegistryUrl,
} from '../constants'
import { generateTypeSpecificFields } from '../sections'
import { detectLanguage } from '../constants/known-packages'

/**
 * Generate baseline_deps from known packages for the tech stack
 */
function generateBaselineDeps(
  techStack: string[] | undefined
): Array<{ name: string; version: string; purpose: string }> {
  if (!techStack || techStack.length === 0) {
    return [
      {
        name: '# AI: Package name',
        version: '# AI: Semver constraint',
        purpose: '# AI: Why needed',
      },
    ]
  }

  const language = detectLanguage(techStack)
  const deps: Array<{ name: string; version: string; purpose: string }> = []
  const seenPackages = new Set<string>()

  for (const tech of techStack) {
    const packages = getPackagesForTech(tech, language)
    for (const pkg of packages) {
      // Avoid duplicates
      if (seenPackages.has(pkg.name)) continue
      seenPackages.add(pkg.name)

      deps.push({
        name: pkg.name,
        version: pkg.version,
        purpose: pkg.purpose,
      })
    }
  }

  // If no packages found, provide placeholder for AI
  if (deps.length === 0) {
    return [
      {
        name: '# AI: Package name based on tech stack',
        version: '# AI: Verify latest stable at registry',
        purpose: '# AI: Why needed',
      },
    ]
  }

  // Add placeholder for additional deps
  deps.push({
    name: '# AI: Add project-specific dependencies',
    version: '# AI: Latest stable',
    purpose: '# AI: Why needed',
  })

  return deps
}

/**
 * Generate references (docs URLs) from known packages
 */
function generateReferences(techStack: string[] | undefined): string[] {
  if (!techStack || techStack.length === 0) {
    return ['# AI: Official docs URL']
  }

  const language = detectLanguage(techStack)
  const refs: string[] = []
  const seenUrls = new Set<string>()

  for (const tech of techStack) {
    const packages = getPackagesForTech(tech, language)
    for (const pkg of packages) {
      // Add docs URL
      if (pkg.docs && !seenUrls.has(pkg.docs)) {
        seenUrls.add(pkg.docs)
        refs.push(pkg.docs)
      }

      // Add registry URL for version verification
      const registryUrl = getRegistryUrl(pkg)
      if (!seenUrls.has(registryUrl)) {
        seenUrls.add(registryUrl)
        refs.push(`${registryUrl} (version verification)`)
      }
    }
  }

  if (refs.length === 0) {
    return ['# AI: Official docs URL']
  }

  return refs
}

/**
 * Generate component YAML template with enhanced anti-responsibilities
 */
export function generateComponentYamlTemplate(
  node: DiagramNode,
  edges: DiagramEdge[],
  allNodes: DiagramNode[],
): string {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]))

  // Find connected nodes
  const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id)

  const integrationPoints = connectedEdges
    .map((edge) => {
      const isSource = edge.source === node.id
      const connectedId = isSource ? edge.target : edge.source
      const connectedNode = nodeMap.get(connectedId)

      if (!connectedNode) {
        return null
      }

      const direction = isSource ? 'outbound' : 'inbound'

      return {
        component: connectedNode.data.label,
        direction,
        purpose: edge.data?.label || '# AI: Why this integration exists',
        contract: {
          request: '# AI: Request shape',
          response: '# AI: Response shape',
        },
      }
    })
    .filter(
      (ip): ip is { component: string; direction: string; purpose: string; contract: { request: string; response: string } } =>
        ip !== null,
    )

  // Build anti-responsibilities as string array with pattern and reason
  const antiResponsibilities = ENHANCED_ANTI_RESPONSIBILITIES[node.data.type]
    .map((ar) => `${ar.pattern} — ${ar.reason}`)
    .concat(['# AI: Add component-specific boundaries'])

  // Build YAML object with enhanced structure
  const yamlData = {
    spec_version: '1.0',
    component_id: node.id,
    name: node.data.label,
    type: node.data.type,
    description:
      node.data.meta.description ||
      '# AI: Add 2-3 sentence description based on component name and type.\n' +
        `This is a ${TYPE_LABELS[node.data.type]} component responsible for ${TYPE_DESCRIPTIONS[node.data.type].toLowerCase()}.`,
    responsibilities: DEFAULT_RESPONSIBILITIES[node.data.type].concat([
      '# AI: Elaborate based on project context and integrations',
    ]),
    anti_responsibilities: antiResponsibilities,
    integration_points:
      integrationPoints.length > 0
        ? integrationPoints
        : [
            {
              component: '# AI: Add connected components',
              direction: 'outbound',
              purpose: '# AI: Why this integration exists',
              contract: {
                request: '# AI: Request shape',
                response: '# AI: Response shape',
              },
            },
          ],
    tech_stack: {
      primary:
        node.data.meta.techStack && node.data.meta.techStack.length > 0
          ? node.data.meta.techStack.join(', ')
          : `# AI: Specify primary technologies (e.g., ${DEFAULT_TECH_STACK[node.data.type]})`,
      baseline_deps: generateBaselineDeps(node.data.meta.techStack),
      references: generateReferences(node.data.meta.techStack),
    },
    validation: {
      exit_criteria: ['# AI: Define based on tech_stack and responsibilities', 'Status file updated with component completion'],
      smoke_tests: ['# AI: Define minimal verification steps'],
      integration_checks:
        integrationPoints.length > 0
          ? integrationPoints.map((ip) => `# AI: Verify contract with ${ip.component}`)
          : ['# AI: Define based on integration_points'],
    },
  }

  // Add type-specific fields
  const typeSpecificFields = generateTypeSpecificFields(node.data.type)
  const mergedData = { ...yamlData, ...typeSpecificFields }

  // Generate YAML with custom formatting
  const yaml = dump(mergedData, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  })

  return yaml
}
