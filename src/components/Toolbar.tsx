import { useRef } from 'react'
import {
  Square,
  Hexagon,
  Database,
  Shield,
  Cloud,
  Cog,
  type LucideIcon,
} from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { useStore } from '../core/store'
import type { NodeType } from '../core/types'

const TOOLBAR_ITEMS: readonly {
  type: NodeType
  icon: LucideIcon
  label: string
  color: string
}[] = [
  { type: 'frontend', icon: Square, label: 'Frontend', color: 'text-blue-500' },
  { type: 'backend', icon: Hexagon, label: 'Backend', color: 'text-green-500' },
  { type: 'storage', icon: Database, label: 'Storage', color: 'text-orange-500' },
  { type: 'auth', icon: Shield, label: 'Auth', color: 'text-purple-500' },
  { type: 'external', icon: Cloud, label: 'External', color: 'text-gray-500' },
  { type: 'background', icon: Cog, label: 'Background', color: 'text-yellow-500' },
] as const

export function Toolbar() {
  const addNode = useStore((state) => state.addNode)
  const { screenToFlowPosition } = useReactFlow()
  const nodeAddCountRef = useRef(0)

  const handleAddNode = (type: NodeType) => {
    // Get viewport center in screen coordinates
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    // Convert to flow position
    const flowPosition = screenToFlowPosition({ x: centerX, y: centerY })

    // Apply offset to avoid stacking
    const offset = (nodeAddCountRef.current % 10) * 30
    nodeAddCountRef.current++

    addNode(type, {
      x: flowPosition.x + offset,
      y: flowPosition.y + offset,
    })
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {TOOLBAR_ITEMS.map(({ type, icon: Icon, label, color }) => (
        <button
          key={type}
          onClick={() => {
            handleAddNode(type)
          }}
          title={`Add ${label}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-bg/50 active:scale-95"
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </button>
      ))}
    </div>
  )
}
