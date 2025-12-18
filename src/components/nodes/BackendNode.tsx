import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '../../core/types'
import { NodeActions } from './NodeActions'

export function BackendNode({ id, data, selected }: NodeProps<DiagramNode>) {
  return (
    <>
      <NodeActions nodeId={id} selected={selected} />
      <div
        role="article"
        aria-label={`Backend component: ${data.label}`}
        className={`min-w-32 border-2 bg-green-50 px-4 py-3 dark:bg-green-950 ${
          selected
            ? 'border-green-500 ring-2 ring-green-500/50'
            : 'border-green-300 dark:border-green-700'
        }`}
        style={{
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        }}
      >
        <Handle type="target" position={Position.Top} className="!bg-green-500" />
        <div className="text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
            Backend
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.label}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
      </div>
    </>
  )
}
