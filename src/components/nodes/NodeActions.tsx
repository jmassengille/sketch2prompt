import { NodeToolbar, Position } from '@xyflow/react'
import { Copy, Trash2 } from 'lucide-react'
import { useStore } from '../../core/store'

interface NodeActionsProps {
  nodeId: string
  selected?: boolean
}

export function NodeActions({ nodeId, selected }: NodeActionsProps) {
  const removeNode = useStore((state) => state.removeNode)
  const nodes = useStore((state) => state.nodes)
  const addNode = useStore((state) => state.addNode)

  const handleDuplicate = () => {
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      addNode(node.data.type, {
        x: node.position.x + 50,
        y: node.position.y + 50,
      })
    }
  }

  const handleDelete = () => {
    removeNode(nodeId)
  }

  return (
    <NodeToolbar
      isVisible={selected ?? false}
      position={Position.Top}
      offset={8}
      className="flex gap-1 rounded-lg border border-border bg-bg p-1 shadow-lg"
    >
      <button
        onClick={handleDuplicate}
        title="Duplicate node"
        className="rounded p-1.5 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        title="Delete node"
        className="rounded p-1.5 text-text-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </NodeToolbar>
  )
}
