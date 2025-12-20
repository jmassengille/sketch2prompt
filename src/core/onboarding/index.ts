// ============================================================================
// ONBOARDING MODULE - BARREL EXPORTS
// ============================================================================

// Types
export * from './onboarding-types'

// Config Arrays
export {
  PLATFORM_CONFIGS,
  PATTERN_CONFIGS,
  STACK_OPTIONS,
  CAPABILITY_CONFIGS,
  OUT_OF_SCOPE_CONFIGS,
} from './onboarding-defaults'

// Helper Functions
export {
  getPlatformConfig,
  getPatternConfig,
  getCapabilityConfig,
  getOutOfScopeConfig,
  getPatternsForPlatform,
  getStackOptionsForCategory,
  getStackOptionsForPlatform,
  getAllLanguages,
  getFrameworksForLanguage,
  requiresAiProvider,
  getDefaultCapabilitiesForPattern,
  buildDefaultCapabilities,
  buildDefaultOutOfScope,
  buildInitialWizardData,
} from './onboarding-helpers'
