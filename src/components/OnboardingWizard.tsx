import { useState, useCallback } from 'react'
import {
  Monitor,
  Server,
  Database,
  ShieldCheck,
  Cloud,
  Cog,
  Users,
  CreditCard,
  Bell,
  FileUp,
  Zap,
  Search,
  BarChart3,
  MessageSquare,
  Globe,
  Smartphone,
  Store,
  Newspaper,
  Wrench,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
} from 'lucide-react'
import type { NodeType, DiagramNode } from '../core/types'
import { createNodeId } from '../core/id'

// ============================================================================
// TYPES
// ============================================================================

type AppType =
  | 'saas'
  | 'marketplace'
  | 'content'
  | 'devtool'
  | 'mobile'
  | 'other'

type Feature = {
  id: string
  label: string
  nodeType: NodeType
  nodeLabel: string
  description: string
  category: 'data' | 'auth' | 'integration' | 'infra'
}

type WizardData = {
  appType: AppType | null
  appTypeOther: string
  features: string[]
  purpose: string
}

interface OnboardingWizardProps {
  onComplete: (nodes: DiagramNode[]) => void
  onSkip: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const APP_TYPES: {
  id: AppType
  label: string
  description: string
  icon: React.ReactNode
  defaultFeatures: string[]
}[] = [
  {
    id: 'saas',
    label: 'SaaS Platform',
    description: 'Subscription-based web application',
    icon: <Globe className="h-6 w-6" />,
    defaultFeatures: ['auth', 'database', 'api', 'payments'],
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    description: 'Multi-sided platform connecting buyers & sellers',
    icon: <Store className="h-6 w-6" />,
    defaultFeatures: ['auth', 'database', 'api', 'payments', 'search'],
  },
  {
    id: 'content',
    label: 'Content Platform',
    description: 'Blog, CMS, or media-focused site',
    icon: <Newspaper className="h-6 w-6" />,
    defaultFeatures: ['database', 'api', 'file-storage', 'search'],
  },
  {
    id: 'devtool',
    label: 'Developer Tool',
    description: 'CLI, SDK, or developer-focused product',
    icon: <Wrench className="h-6 w-6" />,
    defaultFeatures: ['auth', 'api', 'webhooks'],
  },
  {
    id: 'mobile',
    label: 'Mobile App',
    description: 'iOS/Android with backend services',
    icon: <Smartphone className="h-6 w-6" />,
    defaultFeatures: ['auth', 'database', 'api', 'push-notifications'],
  },
  {
    id: 'other',
    label: 'Something Else',
    description: 'Custom application type',
    icon: <MoreHorizontal className="h-6 w-6" />,
    defaultFeatures: [],
  },
]

const FEATURES: Feature[] = [
  // Data & Storage
  {
    id: 'database',
    label: 'Database',
    nodeType: 'storage',
    nodeLabel: 'Database',
    description: 'Persistent data storage',
    category: 'data',
  },
  {
    id: 'file-storage',
    label: 'File Storage',
    nodeType: 'storage',
    nodeLabel: 'File Storage',
    description: 'Images, documents, media',
    category: 'data',
  },
  {
    id: 'cache',
    label: 'Cache Layer',
    nodeType: 'storage',
    nodeLabel: 'Cache',
    description: 'Redis, in-memory caching',
    category: 'data',
  },
  {
    id: 'search',
    label: 'Search',
    nodeType: 'external',
    nodeLabel: 'Search Service',
    description: 'Full-text search capability',
    category: 'data',
  },
  // Auth & Users
  {
    id: 'auth',
    label: 'Authentication',
    nodeType: 'auth',
    nodeLabel: 'Auth Service',
    description: 'User login & identity',
    category: 'auth',
  },
  {
    id: 'permissions',
    label: 'Permissions',
    nodeType: 'auth',
    nodeLabel: 'Authorization',
    description: 'Role-based access control',
    category: 'auth',
  },
  {
    id: 'oauth',
    label: 'OAuth/Social',
    nodeType: 'auth',
    nodeLabel: 'OAuth Provider',
    description: 'Google, GitHub login',
    category: 'auth',
  },
  {
    id: 'mfa',
    label: 'MFA/2FA',
    nodeType: 'auth',
    nodeLabel: 'MFA Service',
    description: 'Two-factor authentication',
    category: 'auth',
  },
  // Integrations
  {
    id: 'payments',
    label: 'Payments',
    nodeType: 'external',
    nodeLabel: 'Payment Gateway',
    description: 'Stripe, billing, subscriptions',
    category: 'integration',
  },
  {
    id: 'email',
    label: 'Email',
    nodeType: 'external',
    nodeLabel: 'Email Service',
    description: 'Transactional & marketing',
    category: 'integration',
  },
  {
    id: 'push-notifications',
    label: 'Push Notifications',
    nodeType: 'external',
    nodeLabel: 'Push Service',
    description: 'Mobile & web notifications',
    category: 'integration',
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    nodeType: 'backend',
    nodeLabel: 'Webhook Handler',
    description: 'Event callbacks',
    category: 'integration',
  },
  // Infrastructure
  {
    id: 'api',
    label: 'REST/GraphQL API',
    nodeType: 'backend',
    nodeLabel: 'API Server',
    description: 'Backend API layer',
    category: 'infra',
  },
  {
    id: 'frontend',
    label: 'Web Frontend',
    nodeType: 'frontend',
    nodeLabel: 'Web App',
    description: 'React, Vue, or similar',
    category: 'infra',
  },
  {
    id: 'background-jobs',
    label: 'Background Jobs',
    nodeType: 'background',
    nodeLabel: 'Job Queue',
    description: 'Async task processing',
    category: 'infra',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    nodeType: 'external',
    nodeLabel: 'Analytics Service',
    description: 'Usage tracking & metrics',
    category: 'infra',
  },
]

const CATEGORY_LABELS: Record<Feature['category'], { label: string; icon: React.ReactNode }> = {
  data: { label: 'Data & Storage', icon: <Database className="h-4 w-4" /> },
  auth: { label: 'Auth & Users', icon: <ShieldCheck className="h-4 w-4" /> },
  integration: { label: 'Integrations', icon: <Cloud className="h-4 w-4" /> },
  infra: { label: 'Infrastructure', icon: <Server className="h-4 w-4" /> },
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  database: <Database className="h-5 w-5" />,
  'file-storage': <FileUp className="h-5 w-5" />,
  cache: <Zap className="h-5 w-5" />,
  search: <Search className="h-5 w-5" />,
  auth: <ShieldCheck className="h-5 w-5" />,
  permissions: <Users className="h-5 w-5" />,
  oauth: <Globe className="h-5 w-5" />,
  mfa: <ShieldCheck className="h-5 w-5" />,
  payments: <CreditCard className="h-5 w-5" />,
  email: <MessageSquare className="h-5 w-5" />,
  'push-notifications': <Bell className="h-5 w-5" />,
  webhooks: <Zap className="h-5 w-5" />,
  api: <Server className="h-5 w-5" />,
  frontend: <Monitor className="h-5 w-5" />,
  'background-jobs': <Cog className="h-5 w-5" />,
  analytics: <BarChart3 className="h-5 w-5" />,
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>({
    appType: null,
    appTypeOther: '',
    features: [],
    purpose: '',
  })

  // Handle app type selection with smart defaults
  const handleAppTypeSelect = useCallback((type: AppType) => {
    const appTypeConfig = APP_TYPES.find((t) => t.id === type)
    setData((prev) => ({
      ...prev,
      appType: type,
      features: type === 'other' ? prev.features : appTypeConfig?.defaultFeatures ?? [],
    }))
  }, [])

  // Toggle feature selection
  const toggleFeature = useCallback((featureId: string) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter((f) => f !== featureId)
        : [...prev.features, featureId],
    }))
  }, [])

  // Generate nodes from wizard data
  const generateNodes = useCallback((): DiagramNode[] => {
    const selectedFeatures = FEATURES.filter((f) => data.features.includes(f.id))
    const nodes: DiagramNode[] = []

    // Group by node type for positioning
    const groups: Record<NodeType, Feature[]> = {
      frontend: [],
      backend: [],
      storage: [],
      auth: [],
      external: [],
      background: [],
    }

    selectedFeatures.forEach((f) => {
      groups[f.nodeType].push(f)
    })

    // Position nodes in a grid layout
    // Row 1: Frontend
    // Row 2: Backend, Auth
    // Row 3: Storage, External
    // Row 4: Background

    const rowConfig: { types: NodeType[]; y: number }[] = [
      { types: ['frontend'], y: 100 },
      { types: ['backend', 'auth'], y: 300 },
      { types: ['storage', 'external'], y: 500 },
      { types: ['background'], y: 700 },
    ]

    const startX = 150
    const spacing = 280

    rowConfig.forEach((row) => {
      let xOffset = 0
      row.types.forEach((nodeType) => {
        groups[nodeType].forEach((feature, idx) => {
          nodes.push({
            id: createNodeId(),
            type: feature.nodeType,
            position: { x: startX + xOffset + idx * spacing, y: row.y },
            data: {
              label: feature.nodeLabel,
              type: feature.nodeType,
              meta: {
                description: feature.description,
              },
            },
          })
        })
        xOffset += groups[nodeType].length * spacing + (groups[nodeType].length > 0 ? 100 : 0)
      })
    })

    return nodes
  }, [data.features])

  // Complete wizard
  const handleComplete = useCallback(() => {
    const nodes = generateNodes()
    onComplete(nodes)
  }, [generateNodes, onComplete])

  // Navigation
  const canProceed =
    step === 1
      ? data.appType !== null && (data.appType !== 'other' || data.appTypeOther.trim().length > 0)
      : step === 2
        ? data.features.length > 0
        : true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0a0f1a]/95 backdrop-blur-sm" />

      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00d4ff 1px, transparent 1px),
            linear-gradient(to bottom, #00d4ff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main container */}
      <div className="relative z-10 mx-4 w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium tracking-widest text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SYSTEM DEFINITION</span>
          </div>
          <h1 className="font-mono text-3xl font-light tracking-tight text-white">
            sketch<span className="text-cyan-400">2</span>prompt
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Define your system architecture in under 60 seconds
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (s < step) setStep(s)
                }}
                disabled={s > step}
                className={`
                  flex h-10 w-10 items-center justify-center rounded font-mono text-sm transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                  ${
                    s === step
                      ? 'cursor-default border border-cyan-400 bg-cyan-400/20 text-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                      : s < step
                        ? 'cursor-pointer border border-cyan-400/30 bg-transparent text-cyan-400/60 hover:border-cyan-400/50'
                        : 'cursor-not-allowed border border-slate-600 bg-transparent text-slate-500'
                  }
                `}
              >
                {s}
              </button>
              {s < 3 && (
                <div
                  className={`h-px w-12 transition-colors duration-150 ${s < step ? 'bg-cyan-400/40' : 'bg-slate-700'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content card */}
        <div className="relative overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/80 shadow-2xl backdrop-blur">
          {/* Corner brackets */}
          <div className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-cyan-400/40" />
          <div className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-cyan-400/40" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-cyan-400/40" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-cyan-400/40" />

          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute right-4 top-4 flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs text-slate-500 transition-colors duration-150 hover:bg-slate-800 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <X className="h-3.5 w-3.5" />
            Skip
          </button>

          <div className="p-8">
            {/* Step 1: App Type */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <div className="mb-1 font-mono text-xs tracking-wider text-cyan-400/70">
                    STEP 01 / 03
                  </div>
                  <h2 className="text-xl font-medium text-white">What are you building?</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Select the type that best describes your application
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {APP_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { handleAppTypeSelect(type.id) }}
                      className={`
                        group relative cursor-pointer overflow-hidden rounded-lg border p-5 text-left transition-all duration-200 active:scale-[0.98]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                        ${
                          data.appType === type.id
                            ? 'border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                            : 'border-slate-700 bg-slate-800/50 hover:scale-[1.02] hover:border-slate-600 hover:bg-slate-800'
                        }
                      `}
                    >
                      {/* Selection indicator */}
                      <div
                        className={`
                          absolute right-3 top-3 h-2.5 w-2.5 rounded-full transition-all duration-200
                          ${data.appType === type.id ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.6)]' : 'bg-slate-600'}
                        `}
                      />

                      <div
                        className={`
                          mb-3 inline-flex rounded-lg p-2.5 transition-colors duration-150
                          ${data.appType === type.id ? 'bg-cyan-400/20 text-cyan-400' : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'}
                        `}
                      >
                        {type.icon}
                      </div>
                      <div
                        className={`font-medium transition-colors duration-150 ${data.appType === type.id ? 'text-white' : 'text-slate-200'}`}
                      >
                        {type.label}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{type.description}</div>
                    </button>
                  ))}
                </div>

                {/* Other input */}
                {data.appType === 'other' && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      type="text"
                      value={data.appTypeOther}
                      onChange={(e) => { setData((prev) => ({ ...prev, appTypeOther: e.target.value })) }}
                      placeholder="Describe your application type..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Features */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <div className="mb-1 font-mono text-xs tracking-wider text-cyan-400/70">
                    STEP 02 / 03
                  </div>
                  <h2 className="text-xl font-medium text-white">Select your capabilities</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Choose the features your system needs
                    <span className="ml-2 text-cyan-400/70">
                      ({data.features.length} selected)
                    </span>
                  </p>
                </div>

                <div className="space-y-6">
                  {(['data', 'auth', 'integration', 'infra'] as const).map((category) => {
                    const categoryFeatures = FEATURES.filter((f) => f.category === category)
                    const { label, icon } = CATEGORY_LABELS[category]

                    return (
                      <div key={category}>
                        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">
                          {icon}
                          <span className="tracking-wider">{label.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {categoryFeatures.map((feature) => {
                            const isSelected = data.features.includes(feature.id)
                            return (
                              <button
                                key={feature.id}
                                onClick={() => { toggleFeature(feature.id) }}
                                className={`
                                  group relative flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200
                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                                  ${
                                    isSelected
                                      ? 'border-cyan-400/40 bg-cyan-400/10'
                                      : 'border-slate-700/50 bg-slate-800/30 hover:scale-[1.01] hover:border-slate-600 hover:bg-slate-800/50'
                                  }
                                `}
                              >
                                {/* Checkbox */}
                                <div
                                  className={`
                                    flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all duration-150
                                    ${
                                      isSelected
                                        ? 'border-cyan-400 bg-cyan-400 text-slate-900'
                                        : 'border-slate-600 bg-transparent'
                                    }
                                  `}
                                >
                                  {isSelected && (
                                    <svg
                                      className="h-2.5 w-2.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>

                                <div
                                  className={`transition-colors duration-150 ${isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`}
                                >
                                  {FEATURE_ICONS[feature.id]}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`text-sm font-medium transition-colors duration-150 ${isSelected ? 'text-white' : 'text-slate-300'}`}
                                  >
                                    {feature.label}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Purpose */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <div className="mb-1 font-mono text-xs tracking-wider text-cyan-400/70">
                    STEP 03 / 03
                  </div>
                  <h2 className="text-xl font-medium text-white">Describe your purpose</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    In 1-3 sentences, what problem does your application solve?
                  </p>
                </div>

                {/* Mad-libs style template hint */}
                <div className="mb-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="mb-2 text-xs font-medium text-slate-500">TEMPLATE (OPTIONAL)</div>
                  <p className="font-mono text-sm text-slate-400">
                    My application helps{' '}
                    <span className="text-cyan-400/70">[who]</span> to{' '}
                    <span className="text-cyan-400/70">[do what]</span> by{' '}
                    <span className="text-cyan-400/70">[how]</span>.
                  </p>
                </div>

                <textarea
                  value={data.purpose}
                  onChange={(e) => { setData((prev) => ({ ...prev, purpose: e.target.value })) }}
                  placeholder="e.g., My application helps sales teams visualize pipeline health through real-time dashboards, reducing dependency on data analysts."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                />

                {/* Summary */}
                <div className="mt-6 rounded-lg border border-dashed border-slate-700/50 bg-slate-800/20 p-4">
                  <div className="mb-3 text-xs font-medium text-slate-500">
                    CANVAS PREVIEW
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.features.map((featureId) => {
                      const feature = FEATURES.find((f) => f.id === featureId)
                      if (!feature) return null
                      return (
                        <span
                          key={featureId}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {FEATURE_ICONS[featureId]}
                          {feature.nodeLabel}
                        </span>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {data.features.length} component{data.features.length !== 1 ? 's' : ''} will be
                    added to your canvas
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-700/50 bg-slate-900/50 px-8 py-4">
            <button
              onClick={() => { setStep((s) => s - 1) }}
              disabled={step === 1}
              className={`
                flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                ${
                  step === 1
                    ? 'cursor-not-allowed text-slate-600'
                    : 'cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-white active:scale-[0.98]'
                }
              `}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={() => {
                if (step < 3) {
                  setStep((s) => s + 1)
                } else {
                  handleComplete()
                }
              }}
              disabled={!canProceed}
              className={`
                flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                ${
                  canProceed
                    ? 'cursor-pointer bg-cyan-500 text-slate-900 shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:bg-cyan-400 active:scale-[0.98]'
                    : 'cursor-not-allowed bg-slate-700 text-slate-500'
                }
              `}
            >
              {step === 3 ? 'Generate Canvas' : 'Continue'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Press <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-slate-400">Esc</kbd> to skip and start with a blank canvas
        </p>
      </div>
    </div>
  )
}
