import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { DiagramNode } from '../../core/types'
import { NodeActions } from './NodeActions'

export function StorageNode({ id, data, selected }: NodeProps<DiagramNode>) {
  return (
    <>
      <NodeActions nodeId={id} selected={selected} />
      <div
        role="article"
        aria-label={`Storage component: ${data.label}`}
        className="relative"
      >
        <Handle type="target" position={Position.Top} className="!bg-orange-500" />
        <svg
          width="128"
          height="80"
          viewBox="0 0 128 80"
          className={selected ? 'drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]' : ''}
        >
          {/* Cylinder body */}
          <rect
            x="4"
            y="12"
            width="120"
            height="56"
            rx="2"
            className={
              selected
                ? 'fill-orange-100 stroke-orange-500 dark:fill-orange-950'
                : 'fill-orange-50 stroke-orange-300 dark:fill-orange-950 dark:stroke-orange-700'
            }
            strokeWidth="2"
          />
          {/* Top ellipse */}
          <ellipse
            cx="64"
            cy="16"
            rx="60"
            ry="12"
            className={
              selected
                ? 'fill-orange-100 stroke-orange-500 dark:fill-orange-900'
                : 'fill-orange-50 stroke-orange-300 dark:fill-orange-900 dark:stroke-orange-700'
            }
            strokeWidth="2"
          />
          {/* Bottom ellipse (visible arc) */}
          <path
            d="M 4 64 Q 4 76, 64 76 Q 124 76, 124 64"
            className={
              selected
                ? 'fill-none stroke-orange-500'
                : 'fill-none stroke-orange-300 dark:stroke-orange-700'
            }
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-400">
            Storage
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.label}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
      </div>
    </>
  )
}
