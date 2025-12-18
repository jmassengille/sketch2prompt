import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '../../core/types'
import { NodeActions } from './NodeActions'

export function FrontendNode({ id, data, selected }: NodeProps<DiagramNode>) {
  return (
    <>
      <NodeActions nodeId={id} selected={selected} />
      <div
        role="article"
        aria-label={`Frontend component: ${data.label}`}
        className={`min-w-32 rounded-lg border-2 bg-blue-50 px-4 py-3 dark:bg-blue-950 ${
          selected
            ? 'border-blue-500 ring-2 ring-blue-500/50'
            : 'border-blue-300 dark:border-blue-700'
        }`}
      >
        <Handle type="target" position={Position.Top} className="!bg-blue-500" />
        <div className="text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Frontend
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.label}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
      </div>
    </>
  )
}
