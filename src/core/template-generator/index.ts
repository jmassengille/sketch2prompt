// Barrel export for template-generator module
// Maintains backward compatibility with existing imports

export { generateProjectRulesTemplate } from './generators/project-rules'
export { generateAgentProtocolTemplate } from './generators/agent-protocol'
export { generateStartMd } from './generators/start-md'
export { generateReadme } from './generators/readme'

// New Markdown-based component spec generator (preferred)
export { generateComponentSpecMarkdown } from './generators/component-markdown'

// Legacy YAML generator (deprecated - kept for backward compatibility)
export { generateComponentYamlTemplate } from './generators/component-yaml'

// Re-export types and constants for consumers
export { ENHANCED_ANTI_RESPONSIBILITIES } from './constants'
export type { AntiResponsibility } from './constants'

// Re-export integration utilities
export { inferCommunicationPattern, deriveIntegrationPairs } from './sections/integration-rules'
