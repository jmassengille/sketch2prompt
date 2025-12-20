import { ShieldCheck, FileUp, Database, Cog, Plug } from 'lucide-react'
import { useWizard } from '../context/WizardContext'
import ToggleGroup, { type ToggleItem } from '../components/ToggleGroup'
import { CAPABILITY_CONFIGS, type CapabilityId } from '@/core/onboarding'

const CAPABILITY_ICONS: Record<CapabilityId, React.ReactNode> = {
  auth: <ShieldCheck className="size-4" />,
  'file-upload': <FileUp className="size-4" />,
  'vector-store': <Database className="size-4" />,
  'background-jobs': <Cog className="size-4" />,
  'external-apis': <Plug className="size-4" />,
}

export function CapabilitiesStep() {
  const { data, toggleCapability, updateCapabilityTech } = useWizard()

  // Transform wizard state to ToggleItem format
  const items: ToggleItem[] = data.capabilities.map((cap) => {
    const config = CAPABILITY_CONFIGS.find((c) => c.id === cap.id)
    const item: ToggleItem = {
      id: cap.id,
      label: config?.label ?? cap.id,
      icon: CAPABILITY_ICONS[cap.id],
      enabled: cap.enabled,
    }
    // Only add optional properties if they have values
    if (config?.description) item.description = config.description
    const firstTech = cap.selectedTech[0]
    if (firstTech) item.techStack = firstTech
    if (config && config.techAlternatives.length > 0) item.techAlternatives = config.techAlternatives
    return item
  })

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2
          className="text-2xl md:text-3xl font-semibold text-[var(--color-workshop-text)] tracking-tight"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          What capabilities do you need?
        </h2>
        <p className="mt-3 text-base text-[var(--color-workshop-text-muted)] leading-relaxed">
          Toggle features based on your requirements
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <ToggleGroup
          items={items}
          onToggle={(id) => { toggleCapability(id as CapabilityId); }}
          onTechChange={(id, tech) =>
            { updateCapabilityTech(id as CapabilityId, tech); }
          }
          categoryLabel="Capabilities"
        />
      </div>
    </div>
  )
}
