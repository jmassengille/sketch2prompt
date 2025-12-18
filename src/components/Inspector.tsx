import { useStore } from '../core/store'
import type { DiagramNode, DiagramEdge, NodeType } from '../core/types'

const TYPE_STYLES: Record<NodeType, { bg: string; text: string; label: string }> = {
  frontend: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', label: 'Frontend' },
  backend: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Backend' },
  storage: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300', label: 'Storage' },
  auth: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300', label: 'Auth' },
  external: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'External' },
  background: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', label: 'Background' },
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <p className="text-center text-sm text-text-muted">
        Select a node or edge to edit its properties
      </p>
    </div>
  )
}

function TypeBadge({ type }: { type: NodeType }) {
  const style = TYPE_STYLES[type]
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}

interface NodeInspectorProps {
  node: DiagramNode
}

function NodeInspector({ node }: NodeInspectorProps) {
  const updateNode = useStore((state) => state.updateNode)

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(node.id, { label: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(node.id, { meta: { description: e.target.value } })
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <TypeBadge type={node.data.type} />
      </div>

      <div>
        <label htmlFor="node-label" className="mb-1 block text-xs font-medium text-text-muted">
          Label
        </label>
        <input
          id="node-label"
          type="text"
          value={node.data.label}
          onChange={handleLabelChange}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="node-description" className="mb-1 block text-xs font-medium text-text-muted">
          Description
        </label>
        <textarea
          id="node-description"
          value={node.data.meta.description ?? ''}
          onChange={handleDescriptionChange}
          placeholder="Optional notes about this component..."
          rows={4}
          className="w-full resize-none rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

interface EdgeInspectorProps {
  edge: DiagramEdge
}

function EdgeInspector({ edge }: EdgeInspectorProps) {
  const updateEdge = useStore((state) => state.updateEdge)

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdge(edge.id, { label: e.target.value })
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          Edge
        </span>
      </div>

      <div>
        <label htmlFor="edge-label" className="mb-1 block text-xs font-medium text-text-muted">
          Label (optional)
        </label>
        <input
          id="edge-label"
          type="text"
          value={edge.data?.label ?? ''}
          onChange={handleLabelChange}
          placeholder="e.g., API calls, data flow..."
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

export function Inspector() {
  // Compute selection once at the top level - no redundant iterations
  const selectedNode = useStore((state) => state.nodes.find((n) => n.selected))
  const selectedEdge = useStore((state) => state.edges.find((e) => e.selected))

  if (selectedNode) {
    return <NodeInspector node={selectedNode} />
  }

  if (selectedEdge) {
    return <EdgeInspector edge={selectedEdge} />
  }

  return <EmptyState />
}
