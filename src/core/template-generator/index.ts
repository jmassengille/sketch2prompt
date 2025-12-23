// Barrel export for template-generator module
// Maintains backward compatibility with existing imports

export { generateProjectRulesTemplate } from './generators/project-rules'
export { generateComponentYamlTemplate } from './generators/component-yaml'
export { generateAgentProtocolTemplate } from './generators/agent-protocol'
export { generateStartMd } from './generators/start-md'

// Re-export types and constants for consumers
export { ENHANCED_ANTI_RESPONSIBILITIES } from './constants'
export type { AntiResponsibility } from './constants'
