import { LayoutDashboard, MessageSquare, FileText, Search, Workflow, Puzzle } from 'lucide-react'
import { useWizard } from '../context/WizardContext'
import SelectionCard from '../components/SelectionCard'
import { getPatternsForPlatform, type PrimaryPattern } from '@/core/onboarding'

const PATTERN_ICONS: Record<PrimaryPattern, React.ReactNode> = {
  crud: <LayoutDashboard className="size-5" />,
  'ai-chat': <MessageSquare className="size-5" />,
  'doc-processing': <FileText className="size-5" />,
  'search-rag': <Search className="size-5" />,
  automation: <Workflow className="size-5" />,
  custom: <Puzzle className="size-5" />,
}

export function PatternStep() {
  const { data, setPattern } = useWizard()

  // Filter patterns based on selected platform
  const availablePatterns = data.platform ? getPatternsForPlatform(data.platform) : []

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2
          className="text-2xl md:text-3xl font-semibold text-[var(--color-workshop-text)] tracking-tight"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          What's the primary pattern?
        </h2>
        <p className="mt-3 text-base text-[var(--color-workshop-text-muted)] leading-relaxed">
          This shapes the default capabilities and structure
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availablePatterns.map((pattern, index) => (
          <SelectionCard
            key={pattern.id}
            selected={data.pattern === pattern.id}
            onClick={() => { setPattern(pattern.id); }}
            icon={PATTERN_ICONS[pattern.id]}
            label={pattern.label}
            description={pattern.description}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
