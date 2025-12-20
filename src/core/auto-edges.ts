/**
 * Auto-generate edges between nodes based on component types.
 *
 * Rules applied after onboarding to connect components logically:
 * - Frontend → Backend: "API calls"
 * - Frontend → Auth: "authenticates"
 * - Backend → Database/Storage: "queries"
 * - Backend → Vector Store: "embeddings"
 * - Backend → AI Provider: "inference"
 * - Backend → Auth: "validates"
 * - Backend → External API: "integrates"
 * - Background → Backend: "triggers"
 * - Background → Storage: "processes"
 */

import type { DiagramNode, DiagramEdge } from './types'
import { createEdgeId } from './id'

type EdgeRule = {
  fromType: string
  toType: string
  /** Match by node label containing this string (case-insensitive) */
  toLabelContains?: string
  label: string
}

// Rules are processed in order - specific label matches should come BEFORE generic ones
const EDGE_RULES: EdgeRule[] = [
  // Frontend connections
  { fromType: 'frontend', toType: 'backend', label: 'API calls' },
  { fromType: 'frontend', toType: 'auth', label: 'authenticates' },

  // Backend -> Storage (specific first, then generic)
  { fromType: 'backend', toType: 'storage', toLabelContains: 'vector', label: 'embeddings' },
  { fromType: 'backend', toType: 'storage', toLabelContains: 'pgvector', label: 'embeddings' },
  { fromType: 'backend', toType: 'storage', toLabelContains: 'pinecone', label: 'embeddings' },
  { fromType: 'backend', toType: 'storage', toLabelContains: 'weaviate', label: 'embeddings' },
  { fromType: 'backend', toType: 'storage', toLabelContains: 'qdrant', label: 'embeddings' },
  { fromType: 'backend', toType: 'storage', label: 'queries' },

  // Backend -> External (AI providers first, then generic)
  { fromType: 'backend', toType: 'external', toLabelContains: 'ai', label: 'inference' },
  { fromType: 'backend', toType: 'external', toLabelContains: 'openai', label: 'inference' },
  { fromType: 'backend', toType: 'external', toLabelContains: 'anthropic', label: 'inference' },
  { fromType: 'backend', toType: 'external', toLabelContains: 'gemini', label: 'inference' },
  { fromType: 'backend', toType: 'external', toLabelContains: 'ollama', label: 'inference' },
  { fromType: 'backend', toType: 'external', label: 'integrates' },

  // Backend -> Auth
  { fromType: 'backend', toType: 'auth', label: 'validates' },

  // Background job connections
  { fromType: 'background', toType: 'backend', label: 'triggers' },
  { fromType: 'background', toType: 'storage', label: 'processes' },
]

/**
 * Generate edges for a set of nodes based on their types.
 * Returns edges that don't already exist.
 */
export function autoGenerateEdges(
  nodes: DiagramNode[],
  existingEdges: DiagramEdge[] = []
): DiagramEdge[] {
  const generatedEdges: DiagramEdge[] = []
  const existingPairs = new Set(
    existingEdges.map((e) => `${e.source}->${e.target}`)
  )

  // Index nodes by type for quick lookup
  const nodesByType = new Map<string, DiagramNode[]>()
  for (const node of nodes) {
    const type = node.data.type
    if (!nodesByType.has(type)) {
      nodesByType.set(type, [])
    }
    nodesByType.get(type)!.push(node)
  }

  // Apply each rule
  for (const rule of EDGE_RULES) {
    const fromNodes = nodesByType.get(rule.fromType) ?? []
    const toNodes = nodesByType.get(rule.toType) ?? []

    for (const fromNode of fromNodes) {
      for (const toNode of toNodes) {
        // Skip if edge already exists
        const pairKey = `${fromNode.id}->${toNode.id}`
        if (existingPairs.has(pairKey)) continue

        // Check label filter if specified
        if (rule.toLabelContains) {
          const labelLower = toNode.data.label.toLowerCase()
          if (!labelLower.includes(rule.toLabelContains.toLowerCase())) {
            continue
          }
        }

        // Check if we already generated an edge for this pair (avoid duplicates from multiple rules)
        if (generatedEdges.some((e) => e.source === fromNode.id && e.target === toNode.id)) {
          continue
        }

        generatedEdges.push({
          id: createEdgeId(),
          source: fromNode.id,
          target: toNode.id,
          data: { label: rule.label },
        })

        existingPairs.add(pairKey)
      }
    }
  }

  return generatedEdges
}
