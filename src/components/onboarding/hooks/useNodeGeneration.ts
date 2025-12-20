import { useMemo } from 'react'
import type { DiagramNode, NodeType } from '@/core/types'
import { createNodeId } from '@/core/id'
import type { WizardData, CapabilityId } from '@/core/onboarding/onboarding-types'

// ============================================================================
// TYPES
// ============================================================================

type NodeTemplate = {
  label: string
  type: NodeType
  techStack: string[]
}

// ============================================================================
// CAPABILITY TO NODE MAPPING
// ============================================================================

const CAPABILITY_NODE_MAP: Record<CapabilityId, { label: string; type: NodeType }> = {
  auth: { label: 'Auth Service', type: 'auth' },
  'file-upload': { label: 'File Storage', type: 'storage' },
  'vector-store': { label: 'Vector Store', type: 'storage' },
  'background-jobs': { label: 'Job Queue', type: 'background' },
  'external-apis': { label: 'External APIs', type: 'external' },
}

// ============================================================================
// NODE GENERATION HOOK
// ============================================================================

export function useNodeGeneration(data: WizardData) {
  const nodes = useMemo(() => {
    const templates: NodeTemplate[] = []

    // Base nodes from platform/pattern/stack
    if (data.platform === 'web' || data.platform === 'desktop') {
      // Frontend: show only framework (it implies the language)
      // This avoids triggering complexity warnings for simple stacks like "TypeScript + Next.js"
      templates.push({
        label: data.platform === 'web' ? 'Web App' : 'Desktop App',
        type: 'frontend',
        techStack: data.stack.frontendFramework ? [data.stack.frontendFramework] : [],
      })
    }

    if (data.platform !== 'cli' || data.pattern !== 'custom') {
      // Backend: show language + framework (language matters for backend identity)
      // e.g., "Python + FastAPI" vs "TypeScript + Express"
      const backendTech: string[] = []
      // Add primary backend language (first one selected)
      const primaryLang = data.stack.backendLanguages[0]
      if (primaryLang) {
        backendTech.push(primaryLang)
      }
      if (data.stack.backendFramework) {
        backendTech.push(data.stack.backendFramework)
      }
      templates.push({
        label: data.platform === 'api' ? 'API Server' : 'Backend',
        type: 'backend',
        techStack: backendTech,
      })
    }

    if (data.stack.database) {
      templates.push({
        label: 'Database',
        type: 'storage',
        techStack: [data.stack.database],
      })
    }

    if (data.stack.aiProvider) {
      templates.push({
        label: 'AI Provider',
        type: 'external',
        techStack: [data.stack.aiProvider],
      })
    }

    // Add enabled capabilities
    data.capabilities
      .filter((cap) => cap.enabled)
      .forEach((cap) => {
        const nodeInfo = CAPABILITY_NODE_MAP[cap.id]
        templates.push({
          label: nodeInfo.label,
          type: nodeInfo.type,
          techStack: cap.selectedTech,
        })
      })

    // Position nodes on canvas (same row layout as old wizard)
    return positionNodes(templates)
  }, [data])

  return { nodes, generateNodes: () => nodes }
}

// ============================================================================
// NODE POSITIONING
// ============================================================================

function positionNodes(templates: NodeTemplate[]): DiagramNode[] {
  const groups: Record<NodeType, NodeTemplate[]> = {
    frontend: [],
    backend: [],
    storage: [],
    auth: [],
    external: [],
    background: [],
  }

  templates.forEach((t) => groups[t.type].push(t))

  const rowConfig = [
    { types: ['frontend'] as NodeType[], y: 100 },
    { types: ['backend', 'auth'] as NodeType[], y: 300 },
    { types: ['storage', 'external'] as NodeType[], y: 500 },
    { types: ['background'] as NodeType[], y: 700 },
  ]

  const startX = 150
  const spacing = 280
  const nodes: DiagramNode[] = []

  rowConfig.forEach((row) => {
    let xOffset = 0
    row.types.forEach((nodeType) => {
      const typeTemplates = groups[nodeType]
      typeTemplates.forEach((template, idx) => {
        nodes.push({
          id: createNodeId(),
          type: template.type,
          position: { x: startX + xOffset + idx * spacing, y: row.y },
          data: {
            label: template.label,
            type: template.type,
            meta: { techStack: template.techStack },
          },
        })
      })
      xOffset += typeTemplates.length * spacing + (typeTemplates.length > 0 ? 100 : 0)
    })
  })

  return nodes
}
