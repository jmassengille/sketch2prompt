import { create, useStore as useZustandStore } from 'zustand'
import { temporal, type TemporalState } from 'zundo'
import type { XYPosition } from '@xyflow/react'
import type {
  DiagramNode,
  DiagramEdge,
  DiagramNodeData,
  DiagramEdgeData,
  NodeType,
} from './types'
import { createNodeId, createEdgeId } from './id'

// State that gets tracked in history (partialized)
type TrackedState = {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

interface DiagramStore {
  nodes: DiagramNode[]
  edges: DiagramEdge[]

  // Node actions
  addNode: (type: NodeType, position: XYPosition) => void
  updateNode: (id: string, data: Partial<DiagramNodeData>) => void
  updateNodePosition: (id: string, position: XYPosition) => void
  removeNode: (id: string) => void

  // Edge actions
  addEdge: (source: string, target: string, data?: DiagramEdgeData) => void
  updateEdge: (id: string, data: Partial<DiagramEdgeData>) => void
  removeEdge: (id: string) => void

  // Bulk actions
  setNodes: (nodes: DiagramNode[]) => void
  setEdges: (edges: DiagramEdge[]) => void
  clear: () => void
}

const initialState = {
  nodes: [] as DiagramNode[],
  edges: [] as DiagramEdge[],
}

export const useStore = create<DiagramStore>()(
  temporal(
    (set) => ({
      ...initialState,

      addNode: (type, position) => {
        set((state) => ({
          nodes: [
            ...state.nodes,
            {
              id: createNodeId(),
              type,
              position,
              data: {
                label: getDefaultLabel(type),
                type,
                meta: {},
              },
            },
          ],
        }))
      },

      updateNode: (id, data) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    ...data,
                    meta: {
                      ...node.data.meta,
                      ...(data.meta ?? {}),
                    },
                  },
                }
              : node
          ),
        }))
      },

      updateNodePosition: (id, position) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, position } : node
          ),
        }))
      },

      removeNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          // Also remove connected edges
          edges: state.edges.filter(
            (edge) => edge.source !== id && edge.target !== id
          ),
        }))
      },

      addEdge: (source, target, data) => {
        set((state) => ({
          edges: [
            ...state.edges,
            {
              id: createEdgeId(),
              source,
              target,
              data: data ?? {},
            },
          ],
        }))
      },

      updateEdge: (id, data) => {
        set((state) => ({
          edges: state.edges.map((edge) =>
            edge.id === id
              ? { ...edge, data: { ...edge.data, ...data } }
              : edge
          ),
        }))
      },

      removeEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== id),
        }))
      },

      setNodes: (nodes) => {
        set({ nodes })
      },

      setEdges: (edges) => {
        set({ edges })
      },

      clear: () => {
        set(initialState)
      },
    }),
    {
      limit: 50, // Keep history lean
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
)

// Helper to get default label for node type
function getDefaultLabel(type: NodeType): string {
  const labels: Record<NodeType, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    storage: 'Database',
    auth: 'Auth',
    external: 'External API',
    background: 'Background Job',
  }
  return labels[type]
}

// Re-export temporal store for undo/redo access with proper typing
// useStore.temporal is a vanilla store, wrap with useZustandStore for React reactivity
export const useTemporalStore = <T>(
  selector: (state: TemporalState<TrackedState>) => T
): T => useZustandStore(useStore.temporal, selector)
