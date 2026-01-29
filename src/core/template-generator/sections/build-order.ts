import type { DiagramNode, NodeType } from '../../types'
import { BUILD_ORDER } from '../constants'

/**
 * Generate Build Order section
 */
export function generateBuildOrderSection(nodes: DiagramNode[]): string {
  const nodesByType = new Map<NodeType, DiagramNode[]>()
  for (const node of nodes) {
    const existing = nodesByType.get(node.data.type) ?? []
    nodesByType.set(node.data.type, [...existing, node])
  }

  const phases: { name: string; components: string[] }[] = []

  let phaseNum = 1

  // Foundation phase
  phases.push({
    name: `Phase ${String(phaseNum++)}: Foundation`,
    components: ['Project setup, tooling, and dependencies'],
  })

  // Type-based phases with dynamic numbering
  const buildPhaseLabels: Record<NodeType, { label: string; rationale: string }> = {
    storage: {
      label: 'Storage',
      rationale: 'Schema and data models first (everything depends on data)',
    },
    auth: {
      label: 'Authentication',
      rationale: 'Auth before protected features',
    },
    backend: {
      label: 'Backend',
      rationale: 'Business logic and API endpoints',
    },
    frontend: {
      label: 'Frontend',
      rationale: 'UI consuming the backend API',
    },
    external: {
      label: 'Integration',
      rationale: 'Third-party service connections',
    },
    background: {
      label: 'Background Jobs',
      rationale: 'Asynchronous processing',
    },
  }

  for (const type of BUILD_ORDER) {
    const typeNodes = nodesByType.get(type)
    if (typeNodes && typeNodes.length > 0) {
      const phase = buildPhaseLabels[type]
      const componentItems = typeNodes.map((node) => `- [ ] [${node.id}] ${node.data.label} — ${phase.rationale}`)
      phases.push({
        name: `Phase ${String(phaseNum++)}: ${phase.label}`,
        components: componentItems,
      })
    }
  }

  // Polish phase
  phases.push({
    name: `Phase ${String(phaseNum)}: Polish`,
    components: [
      '- [ ] Error handling standardization',
      '- [ ] Performance optimization',
      '- [ ] Monitoring and logging',
      '- [ ] # AI: Add project-specific polish tasks',
    ],
  })

  const phaseSections = phases.map((phase) => `### ${phase.name}\n${phase.components.join('\n')}`).join('\n\n')

  return `## Build Order

Implementation sequence based on dependency graph:

${phaseSections}`
}
