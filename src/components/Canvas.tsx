import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type ColorMode,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '../core/store'
import { nodeTypes } from './nodes'
import type { DiagramNode, DiagramEdge, NodeType } from '../core/types'

const NODE_TYPES_CYCLE: NodeType[] = [
  'frontend',
  'backend',
  'storage',
  'auth',
  'external',
  'background',
]

interface CanvasInnerProps {
  colorMode: ColorMode
}

function CanvasInner({ colorMode }: CanvasInnerProps) {
  const nodes = useStore((state) => state.nodes)
  const storeEdges = useStore((state) => state.edges)

  // Memoize edge transformation to prevent unnecessary callback recreation
  const edges = useMemo(
    () =>
      storeEdges.map((edge) => ({
        ...edge,
        label: edge.data?.label,
      })),
    [storeEdges]
  )
  const setNodes = useStore((state) => state.setNodes)
  const setEdges = useStore((state) => state.setEdges)
  const addEdgeToStore = useStore((state) => state.addEdge)
  const addNode = useStore((state) => state.addNode)
  const { screenToFlowPosition } = useReactFlow()

  const onNodesChange: OnNodesChange<DiagramNode> = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, nodes))
    },
    [nodes, setNodes]
  )

  const onEdgesChange: OnEdgesChange<DiagramEdge> = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges))
    },
    [edges, setEdges]
  )

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        addEdgeToStore(connection.source, connection.target)
      }
    },
    [addEdgeToStore]
  )

  // Temporary: double-click to add node for testing
  const onDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const index = nodes.length % NODE_TYPES_CYCLE.length
      const nodeType = NODE_TYPES_CYCLE[index] ?? 'frontend'
      addNode(nodeType, position)
    },
    [screenToFlowPosition, addNode, nodes.length]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDoubleClick={onDoubleClick}
      colorMode={colorMode}
      snapToGrid
      snapGrid={[16, 16]}
      fitView
      deleteKeyCode={['Backspace', 'Delete']}
      defaultEdgeOptions={{
        type: 'smoothstep',
        labelStyle: { fill: 'var(--text-muted)', fontSize: 12 },
        labelBgStyle: { fill: 'var(--bg)', fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      }}
    >
      <Background gap={16} size={1} />
      <Controls />
      <MiniMap
        pannable
        zoomable
        nodeStrokeWidth={3}
        className="!bg-bg-secondary !border-border"
      />
    </ReactFlow>
  )
}

interface CanvasProps {
  colorMode?: ColorMode
}

export function Canvas({ colorMode = 'light' }: CanvasProps) {
  return (
    <div className="h-full w-full">
      <CanvasInner colorMode={colorMode} />
    </div>
  )
}
