import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '../../core/types'
import { NodeActions } from './NodeActions'

export function ExternalNode({ id, data, selected }: NodeProps<DiagramNode>) {
  return (
    <>
      <NodeActions nodeId={id} selected={selected} />
      <div
        role="article"
        aria-label={`External component: ${data.label}`}
        className="relative"
      >
        <Handle type="target" position={Position.Top} className="!bg-gray-500" />
        <svg
          width="140"
          height="80"
          viewBox="0 0 140 80"
          className={selected ? 'drop-shadow-[0_0_4px_rgba(107,114,128,0.5)]' : ''}
        >
          {/* Cloud shape */}
          <path
            d="M 30 60
               Q 10 60, 10 45
               Q 10 30, 30 30
               Q 35 15, 55 15
               Q 75 15, 80 30
               Q 85 20, 100 20
               Q 120 20, 120 40
               Q 130 40, 130 52
               Q 130 65, 110 65
               L 30 65
               Q 10 65, 10 50
               Z"
            className={
              selected
                ? 'fill-gray-100 stroke-gray-500 dark:fill-gray-800'
                : 'fill-gray-50 stroke-gray-300 dark:fill-gray-800 dark:stroke-gray-600'
            }
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
            External
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.label}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
      </div>
    </>
  )
}
