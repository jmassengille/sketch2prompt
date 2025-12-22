import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OutOfScopeId } from './onboarding'

export type AIProvider = 'anthropic' | 'openai'

// Default model IDs per provider
const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-opus-4-5-20251101',
  openai: 'gpt-5',
}

export interface SettingsStore {
  // State
  apiProvider: AIProvider
  apiKey: string
  modelId: string
  projectName: string
  outOfScope: OutOfScopeId[]

  // Actions
  setApiProvider: (provider: AIProvider) => void
  setApiKey: (key: string) => void
  setModelId: (id: string) => void
  setProjectName: (name: string) => void
  setOutOfScope: (items: OutOfScopeId[]) => void
  clearApiKey: () => void
  hasApiKey: () => boolean
}

const initialState = {
  apiProvider: 'anthropic' as AIProvider,
  apiKey: '',
  modelId: DEFAULT_MODELS.anthropic,
  projectName: '',
  outOfScope: [] as OutOfScopeId[],
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setApiProvider: (provider) => {
        set({
          apiProvider: provider,
          modelId: DEFAULT_MODELS[provider],
        })
      },

      setApiKey: (key) => {
        set({ apiKey: key })
      },

      setModelId: (id) => {
        set({ modelId: id })
      },

      setProjectName: (name) => {
        set({ projectName: name })
      },

      setOutOfScope: (items) => {
        set({ outOfScope: items })
      },

      clearApiKey: () => {
        set({ apiKey: '' })
      },

      hasApiKey: () => {
        return get().apiKey.length > 0
      },
    }),
    {
      name: 'sketch2prompt-settings',
      partialize: (state) => ({
        apiProvider: state.apiProvider,
        apiKey: state.apiKey,
        modelId: state.modelId,
        projectName: state.projectName,
        outOfScope: state.outOfScope,
      }),
    }
  )
)
