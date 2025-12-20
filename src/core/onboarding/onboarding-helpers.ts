import type {
  Platform,
  PrimaryPattern,
  StackCategory,
  CapabilityId,
  OutOfScopeId,
  PlatformConfig,
  PatternConfig,
  StackOption,
  CapabilityConfig,
  OutOfScopeConfig,
  WizardCapabilityState,
  WizardData,
} from './onboarding-types'
import { INITIAL_WIZARD_DATA } from './onboarding-types'
import {
  PLATFORM_CONFIGS,
  PATTERN_CONFIGS,
  STACK_OPTIONS,
  CAPABILITY_CONFIGS,
  OUT_OF_SCOPE_CONFIGS,
} from './onboarding-defaults'

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

export function getPlatformConfig(id: Platform): PlatformConfig | undefined {
  return PLATFORM_CONFIGS.find((c) => c.id === id)
}

export function getPatternConfig(id: PrimaryPattern): PatternConfig | undefined {
  return PATTERN_CONFIGS.find((c) => c.id === id)
}

export function getCapabilityConfig(id: CapabilityId): CapabilityConfig | undefined {
  return CAPABILITY_CONFIGS.find((c) => c.id === id)
}

export function getOutOfScopeConfig(id: OutOfScopeId): OutOfScopeConfig | undefined {
  return OUT_OF_SCOPE_CONFIGS.find((c) => c.id === id)
}

// ============================================================================
// FILTERED ACCESSORS
// ============================================================================

export function getPatternsForPlatform(platform: Platform): PatternConfig[] {
  const platformConfig = getPlatformConfig(platform)
  if (!platformConfig) return []

  return PATTERN_CONFIGS.filter((pattern) =>
    platformConfig.availablePatterns.includes(pattern.id)
  )
}

export function getStackOptionsForCategory(category: StackCategory): StackOption[] {
  return STACK_OPTIONS.filter((option) => option.category === category)
}

export function getStackOptionsForPlatform(
  platform: Platform,
  category: StackCategory
): StackOption[] {
  return STACK_OPTIONS.filter(
    (option) => option.category === category && option.platforms.includes(platform)
  )
}

/**
 * Get ALL language options regardless of platform.
 * For full-stack apps, users may need frontend (TypeScript) + backend (Python/Go/Java) languages.
 */
export function getAllLanguages(): StackOption[] {
  return STACK_OPTIONS.filter((option) => option.category === 'language')
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
}

/**
 * Get frameworks filtered by platform AND compatible with ANY of the selected languages.
 * @param platform - The selected platform
 * @param languageIds - Array of selected language IDs (e.g., ['typescript', 'python'])
 * @returns Frameworks that work with the platform and at least one selected language
 */
export function getFrameworksForLanguage(
  platform: Platform,
  languageIds: string[]
): StackOption[] {
  const frameworks = getStackOptionsForPlatform(platform, 'framework')

  // If no languages selected, show all frameworks for the platform
  if (languageIds.length === 0) {
    return frameworks
  }

  // Filter frameworks by compatible languages (framework must match at least one selected language)
  return frameworks.filter((fw) => {
    // If framework has no compatibleLanguages, show it (backwards compatibility)
    if (!fw.compatibleLanguages || fw.compatibleLanguages.length === 0) {
      return true
    }
    // Show if framework is compatible with ANY of the selected languages
    return fw.compatibleLanguages.some((lang) => languageIds.includes(lang))
  })
}

// ============================================================================
// PATTERN-BASED HELPERS
// ============================================================================

export function requiresAiProvider(pattern: PrimaryPattern): boolean {
  return pattern === 'ai-chat' || pattern === 'search-rag'
}

export function getDefaultCapabilitiesForPattern(pattern: PrimaryPattern): CapabilityId[] {
  const patternConfig = getPatternConfig(pattern)
  return patternConfig?.defaultCapabilities ?? []
}

// ============================================================================
// SMART DEFAULTS BUILDERS
// ============================================================================

export function buildDefaultCapabilities(pattern: PrimaryPattern): WizardCapabilityState[] {
  const patternConfig = getPatternConfig(pattern)
  if (!patternConfig) return []

  return CAPABILITY_CONFIGS.map((capConfig) => {
    const isEnabled = patternConfig.defaultCapabilities.includes(capConfig.id)

    return {
      id: capConfig.id,
      enabled: isEnabled,
      selectedTech: isEnabled ? [capConfig.defaultTech] : [],
    }
  })
}

export function buildDefaultOutOfScope(): OutOfScopeId[] {
  return OUT_OF_SCOPE_CONFIGS.filter((config) => config.defaultExcluded).map(
    (config) => config.id
  )
}

export function buildInitialWizardData(): WizardData {
  return {
    ...INITIAL_WIZARD_DATA,
    outOfScope: buildDefaultOutOfScope(),
  }
}
