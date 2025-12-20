import { Globe, Server, Terminal, Monitor } from 'lucide-react'
import { useWizard } from '../context/WizardContext'
import SelectionCard from '../components/SelectionCard'
import { PLATFORM_CONFIGS, type Platform } from '@/core/onboarding'

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  web: <Globe className="size-5" />,
  api: <Server className="size-5" />,
  cli: <Terminal className="size-5" />,
  desktop: <Monitor className="size-5" />,
}

export function PlatformStep() {
  const { data, setPlatform } = useWizard()

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2
          className="text-2xl md:text-3xl font-semibold text-[var(--color-workshop-text)] tracking-tight"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          What are you building?
        </h2>
        <p className="mt-3 text-base text-[var(--color-workshop-text-muted)] leading-relaxed">
          Choose your target platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORM_CONFIGS.map((platform, index) => (
          <SelectionCard
            key={platform.id}
            selected={data.platform === platform.id}
            onClick={() => { setPlatform(platform.id); }}
            icon={PLATFORM_ICONS[platform.id]}
            label={platform.label}
            description={platform.description}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
