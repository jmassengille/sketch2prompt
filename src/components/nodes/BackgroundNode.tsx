import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '../../core/types'
import { NodeActions } from './NodeActions'

export function BackgroundNode({ id, data, selected }: NodeProps<DiagramNode>) {
  return (
    <>
      <NodeActions nodeId={id} selected={selected} />
      <div
        role="article"
        aria-label={`Background job component: ${data.label}`}
        className="relative"
      >
        <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          className={selected ? 'drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]' : ''}
        >
          {/* Gear shape */}
          <path
            d="M 50 10
               L 56 10 L 58 20 L 66 22 L 72 14 L 78 18 L 74 28 L 80 34 L 90 32 L 92 40 L 82 44 L 82 56 L 92 60 L 90 68 L 80 66 L 74 72 L 78 82 L 72 86 L 66 78 L 58 80 L 56 90 L 44 90 L 42 80 L 34 78 L 28 86 L 22 82 L 26 72 L 20 66 L 10 68 L 8 60 L 18 56 L 18 44 L 8 40 L 10 32 L 20 34 L 26 28 L 22 18 L 28 14 L 34 22 L 42 20 L 44 10 Z"
            className={
              selected
                ? 'fill-yellow-100 stroke-yellow-500 dark:fill-yellow-950'
                : 'fill-yellow-50 stroke-yellow-300 dark:fill-yellow-950 dark:stroke-yellow-700'
            }
            strokeWidth="2"
          />
          {/* Center circle */}
          <circle
            cx="50"
            cy="50"
            r="16"
            className={
              selected
                ? 'fill-yellow-200 stroke-yellow-500 dark:fill-yellow-900'
                : 'fill-yellow-100 stroke-yellow-300 dark:fill-yellow-900 dark:stroke-yellow-700'
            }
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs font-medium uppercase tracking-wide text-yellow-600 dark:text-yellow-400">
            Background
          </div>
          <div className="mt-0.5 max-w-16 truncate text-center text-xs font-semibold text-gray-900 dark:text-gray-100">
            {data.label}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
      </div>
    </>
  )
}
