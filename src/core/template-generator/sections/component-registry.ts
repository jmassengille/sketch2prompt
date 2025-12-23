import type { DiagramNode } from '../../types'

/**
 * Generate Component Registry section
 */
export function generateComponentRegistrySection(nodes: DiagramNode[]): string {
  if (nodes.length === 0) {
    return `## Component Registry

No components defined yet.`
  }

  const tableHeader = `| ID | Component | Type | Spec File | Status |
|----|-----------|------|-----------|--------|`

  const tableRows = nodes.map((node) => {
    const filename = node.data.label.toLowerCase().replace(/\s+/g, '-')
    return `| ${node.id} | ${node.data.label} | ${node.data.type} | \`specs/${filename}.md\` | active |`
  })

  return `## Component Registry

${tableHeader}
${tableRows.join('\n')}

### Loading Instructions

Load component specs **only when working on that component**. Do not preload all specs.

Cross-reference format: \`[component-id]\` (e.g., [${nodes[0]?.id ?? 'node-1'}] references ${nodes[0]?.data.label ?? 'Component'})`
}
