import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AIProvider = 'anthropic' | 'openai'

// Default model IDs per provider
const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-sonnet-4-5',
  openai: 'gpt-4o',
}

export interface SettingsStore {
  // State
  apiProvider: AIProvider
  apiKey: string
  modelId: string
  projectName: string

  // Actions
  setApiProvider: (provider: AIProvider) => void
  setApiKey: (key: string) => void
  setModelId: (id: string) => void
  setProjectName: (name: string) => void
  clearApiKey: () => void
  hasApiKey: () => boolean
}

const initialState = {
  apiProvider: 'anthropic' as AIProvider,
  apiKey: '',
  modelId: DEFAULT_MODELS.anthropic,
  projectName: '',
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
      }),
    }
  )
)
