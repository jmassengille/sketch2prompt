import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '../../core/types'
import { NodeActions } from './NodeActions'

export function AuthNode({ id, data, selected }: NodeProps<DiagramNode>) {
  return (
    <>
      <NodeActions nodeId={id} selected={selected} />
      <div
        role="article"
        aria-label={`Auth component: ${data.label}`}
        className="relative"
      >
        <Handle type="target" position={Position.Top} className="!bg-purple-500" />
        <svg
          width="120"
          height="96"
          viewBox="0 0 120 96"
          className={selected ? 'drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]' : ''}
        >
          {/* Shield shape */}
          <path
            d="M 60 4 L 116 20 L 116 52 Q 116 84, 60 92 Q 4 84, 4 52 L 4 20 Z"
            className={
              selected
                ? 'fill-purple-100 stroke-purple-500 dark:fill-purple-950'
                : 'fill-purple-50 stroke-purple-300 dark:fill-purple-950 dark:stroke-purple-700'
            }
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-medium uppercase tracking-wide text-purple-600 dark:text-purple-400">
            Auth
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.label}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
      </div>
    </>
  )
}
