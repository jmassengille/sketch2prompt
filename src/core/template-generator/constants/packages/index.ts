/**
 * Known Package Registry - Combined Index
 *
 * Combines all registry-specific packages and provides lookup functions.
 * Split by registry to enable programmatic version updates via official APIs.
 */

// Re-export types
export type { PackageRegistry, KnownPackage, PackageCollection } from './types'

// Import registry-specific packages
import { NPM_PACKAGES } from './npm'
import { PYPI_PACKAGES } from './pypi'
import { CARGO_PACKAGES } from './cargo'
import { GO_PACKAGES } from './go'
import { MAVEN_PACKAGES } from './maven'
import { NUGET_PACKAGES } from './nuget'
import type { KnownPackage } from './types'

// ============================================================================
// COMBINED PACKAGE REGISTRY
// ============================================================================

/**
 * All known packages combined from all registries.
 * Keys MUST match the exact `label` values from onboarding-defaults.ts
 */
export const KNOWN_PACKAGES: Record<string, KnownPackage[]> = {
  ...NPM_PACKAGES,
  ...PYPI_PACKAGES,
  ...CARGO_PACKAGES,
  ...GO_PACKAGES,
  ...MAVEN_PACKAGES,
  ...NUGET_PACKAGES,
}

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

const PYTHON_INDICATORS = ['Python', 'FastAPI', 'Django', 'Flask', 'Starlette']

const PYTHON_DATABASES = ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Supabase']
const PYTHON_AI_PROVIDERS = ['OpenAI', 'Anthropic', 'Google AI (Gemini)', 'Ollama (Local)']

/**
 * Detect primary language from tech stack for registry selection
 */
export function detectLanguage(
  techStack: string[]
): 'python' | 'typescript' | 'javascript' | 'java' | 'csharp' | 'go' | 'rust' | undefined {
  if (techStack.length === 0) return undefined

  // Check for explicit language selection
  if (techStack.includes('Python')) return 'python'
  if (techStack.includes('TypeScript')) return 'typescript'
  if (techStack.includes('JavaScript')) return 'javascript'
  if (techStack.includes('Java')) return 'java'
  if (techStack.includes('C# / .NET')) return 'csharp'
  if (techStack.includes('Go')) return 'go'
  if (techStack.includes('Rust')) return 'rust'

  // Infer from framework
  if (techStack.some((t) => PYTHON_INDICATORS.includes(t))) return 'python'

  // Default to undefined if can't detect
  return undefined
}

// ============================================================================
// PACKAGE LOOKUP
// ============================================================================

/**
 * Alias map for short tech labels → KNOWN_PACKAGES keys.
 * Handles cases where default-tech-stacks.ts uses short names
 * but KNOWN_PACKAGES uses qualified names (e.g., "React" → "React (Vite)").
 */
const TECH_ALIASES: Record<string, string> = {
  React: 'React (Vite)',
}

/**
 * Get packages for a tech stack item
 * @param techLabel - Tech LABEL from onboarding (e.g., "FastAPI", "PostgreSQL")
 * @param language - Optional language hint for registry selection
 */
export function getPackagesForTech(
  techLabel: string,
  language?: 'python' | 'typescript' | 'javascript' | 'java' | 'csharp' | 'go' | 'rust'
): KnownPackage[] {
  // Try language-specific variant FIRST for databases and AI providers
  if (language === 'python') {
    if (PYTHON_DATABASES.includes(techLabel) || PYTHON_AI_PROVIDERS.includes(techLabel)) {
      const pythonVariant = KNOWN_PACKAGES[`${techLabel}-python`]
      if (pythonVariant) {
        return pythonVariant
      }
    }
  }

  // Direct lookup by label
  const direct = KNOWN_PACKAGES[techLabel]
  if (direct) {
    return direct
  }

  // Try alias (short label → qualified key)
  const aliased = TECH_ALIASES[techLabel]
  if (aliased) {
    return KNOWN_PACKAGES[aliased] ?? []
  }

  // No match
  return []
}

// ============================================================================
// REGISTRY URL GENERATION
// ============================================================================

/**
 * Get registry verification URL for a package
 */
export function getRegistryUrl(pkg: KnownPackage): string {
  switch (pkg.registry) {
    case 'npm':
      return `https://www.npmjs.com/package/${pkg.name}`
    case 'pypi':
      return `https://pypi.org/project/${pkg.name}/`
    case 'nuget':
      return `https://www.nuget.org/packages/${pkg.name}`
    case 'maven':
      return `https://search.maven.org/artifact/${pkg.name.replace(':', '/')}`
    case 'go':
      return `https://pkg.go.dev/${pkg.name}`
    case 'cargo':
      return `https://crates.io/crates/${pkg.name}`
    default:
      return pkg.docs
  }
}
