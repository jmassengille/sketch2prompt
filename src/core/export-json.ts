import type { DiagramNode, DiagramEdge, SerializedDiagram, SerializedEdge } from './types'

export function exportJson(nodes: DiagramNode[], edges: DiagramEdge[]): string {
  const diagram: SerializedDiagram = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.data.type,
      position: node.position,
      data: node.data,
    })),
    edges: edges.map((edge) => {
      const serialized: SerializedEdge = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
      }
      // Only include data if edge has data
      if (edge.data) {
        serialized.data = edge.data
      }
      return serialized
    }),
  }

  return JSON.stringify(diagram, null, 2)
}
