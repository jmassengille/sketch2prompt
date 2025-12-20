import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  Monitor,
  Server,
  Database,
  ShieldCheck,
  Cloud,
  Cog,
} from 'lucide-react'
import type { DiagramNode, NodeType } from '../../core/types'
import { NODE_COLORS, TYPE_LABELS } from './node-styles'
import { InlineTechInput } from './InlineTechInput'
import { RecommendationChip } from './RecommendationChip'
import { NodeActions } from './NodeActions'
import { useStore } from '../../core/store'
import { getRecommendations } from '../../core/tech-recommendations'
import { getTechLimitByLabel } from '../../core/archetype-defaults'

const TYPE_ICONS: Record<NodeType, React.ComponentType<{ className?: string }>> = {
  frontend: Monitor,
  backend: Server,
  storage: Database,
  auth: ShieldCheck,
  external: Cloud,
  background: Cog,
}

export function ComponentCard({ id, data, selected }: NodeProps<DiagramNode>) {
  const colors = NODE_COLORS[data.type]
  const Icon = TYPE_ICONS[data.type]
  const typeLabel = TYPE_LABELS[data.type]
  const techStack = data.meta.techStack ?? []
  const recommendations = getRecommendations(data.type)
  const techLimit = getTechLimitByLabel(data.label)

  const updateNode = useStore((state) => state.updateNode)

  const handleAddTech = (tech: string) => {
    updateNode(id, {
      meta: {
        ...data.meta,
        techStack: [...techStack, tech],
      },
    })
  }

  const handleRemoveTech = (techToRemove: string) => {
    updateNode(id, {
      meta: {
        ...data.meta,
        techStack: techStack.filter((t) => t !== techToRemove),
      },
    })
  }

  return (
    <>
      <NodeActions nodeId={id} selected={selected} />

      {/* Target handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        className={`
          !w-3 !h-3 !rounded-full !border-2
          !border-[var(--color-workshop-border-accent)]
          ${colors.handleBg}
          transition-all duration-200
          hover:!scale-150 hover:!border-[var(--color-wizard-accent)] hover:!shadow-[0_0_8px_var(--color-wizard-accent)]
          cursor-crosshair
        `}
      />

      <div
        role="article"
        aria-label={`${typeLabel} component: ${data.label}`}
        className={`
          relative min-w-56 max-w-80 rounded-xl overflow-hidden
          transition-all duration-300 ease-out
          cursor-pointer
          ${selected ? 'corner-brackets active' : ''}
          bg-[var(--color-workshop-elevated)] dark:bg-[var(--color-workshop-elevated)]
          border border-[var(--color-workshop-border)]
          ${selected
            ? `ring-2 ${colors.ring} shadow-[0_0_0_1px_var(--color-wizard-accent),0_8px_32px_rgba(20,184,166,0.2),0_4px_12px_rgba(0,0,0,0.3)]`
            : `shadow-[var(--shadow-card)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.35),0_4px_8px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:border-[var(--color-workshop-border-accent)]`
          }
        `}
      >
        {/* Type indicator bar - prominent accent strip */}
        <div
          className={`h-1 w-full bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} ${selected ? 'h-1.5' : ''} transition-all duration-200`}
          style={{
            boxShadow: selected ? `0 2px 8px ${colors.glowColor || 'rgba(20, 184, 166, 0.3)'}` : 'none'
          }}
          aria-hidden="true"
        />

        {/* Card content */}
        <div className="px-4 py-3.5">
          {/* Header: Icon + Type Label */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className={`p-1.5 rounded-md bg-gradient-to-br ${colors.gradientFrom}/20 ${colors.gradientTo}/20`}>
              <Icon className={`h-4 w-4 ${colors.textType}`} />
            </div>
            <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${colors.textType}`}>
              {typeLabel}
            </span>
          </div>

          {/* Label - prominent, clean */}
          <div
            className="text-[15px] font-semibold text-[var(--color-workshop-text)] leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            {data.label}
          </div>

          {/* Description (truncated) */}
          {data.meta.description && (
            <div className="mt-2.5 text-[13px] text-[var(--color-workshop-text-muted)] line-clamp-2 leading-relaxed">
              {data.meta.description}
            </div>
          )}

          {/* Recommendations section */}
          {recommendations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[var(--color-workshop-border)]">
              <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--color-workshop-text-subtle)] mb-2.5">
                Recommendations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recommendations.map((rec) => (
                  <RecommendationChip
                    key={rec.name}
                    recommendation={rec}
                    isAdded={techStack.includes(rec.name)}
                    onAdd={() => { handleAddTech(rec.name); }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inline Tech Stack Input */}
          <div className="mt-4 pt-3 border-t border-[var(--color-workshop-border)]">
            <InlineTechInput
              nodeType={data.type}
              techStack={techStack}
              onAdd={handleAddTech}
              onRemove={handleRemoveTech}
              maxVisible={4}
              techLimit={techLimit}
            />
          </div>
        </div>
      </div>

      {/* Source handle at bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`
          !w-3 !h-3 !rounded-full !border-2
          !border-[var(--color-workshop-border-accent)]
          ${colors.handleBg}
          transition-all duration-200
          hover:!scale-150 hover:!border-[var(--color-wizard-accent)] hover:!shadow-[0_0_8px_var(--color-wizard-accent)]
          cursor-crosshair
        `}
      />
    </>
  )
}
