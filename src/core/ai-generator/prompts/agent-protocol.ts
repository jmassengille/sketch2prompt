import type { DiagramNode } from '../../types'
import {
  KNOWN_PACKAGES,
  detectLanguage,
  getPackagesForTech,
} from '../../template-generator/constants/known-packages'

/**
 * Detect primary stacks from nodes using KNOWN_PACKAGES
 */
function detectStacks(nodes: DiagramNode[]): string {
  const stacks = new Set<string>()

  nodes.forEach((node) => {
    const techStack = node.data.meta.techStack ?? []
    const language = detectLanguage(techStack)

    if (language) {
      // Map detected language to stack name
      switch (language) {
        case 'python':
          stacks.add('Python')
          break
        case 'typescript':
          stacks.add('TypeScript/Node')
          break
        case 'javascript':
          stacks.add('JavaScript/Node')
          break
        case 'java':
          stacks.add('Java')
          break
        case 'csharp':
          stacks.add('C# / .NET')
          break
        case 'go':
          stacks.add('Go')
          break
        case 'rust':
          stacks.add('Rust')
          break
      }
    }

    // Also check if tech stack items are known packages
    techStack.forEach((tech) => {
      if (KNOWN_PACKAGES[tech]) {
        // Add frameworks/major tech as additional context
        if (tech.includes('React') || tech.includes('Next') || tech.includes('Vue') ||
            tech.includes('Angular') || tech.includes('Svelte')) {
          stacks.add('TypeScript/Node')
        }
      }
    })
  })

  return stacks.size > 0 ? Array.from(stacks).join(', ') : 'General'
}

/**
 * Build stack package context from nodes
 * Returns verified packages summary for detected stacks
 */
function buildStackPackageContext(nodes: DiagramNode[]): string {
  const allTech: string[] = []
  const seenPackages = new Set<string>()

  // Aggregate all tech stack items
  nodes.forEach((node) => {
    const techStack = node.data.meta.techStack ?? []
    allTech.push(...techStack)
  })

  if (allTech.length === 0) {
    return '(No verified packages for detected stacks)'
  }

  const language = detectLanguage(allTech)
  const packagesByLang = new Map<string, string[]>()

  // Collect packages per language
  for (const tech of allTech) {
    const packages = getPackagesForTech(tech, language)
    for (const pkg of packages) {
      const key = `${pkg.name}@${pkg.version}`
      if (seenPackages.has(key)) continue
      seenPackages.add(key)

      // Map registry to language label
      const registryToLang: Record<string, string> = {
        pypi: 'Python',
        npm: 'TypeScript',
        maven: 'Java',
        nuget: 'C# / .NET',
        go: 'Go',
        cargo: 'Rust',
      }
      const langLabel = registryToLang[pkg.registry] ?? 'Other'

      const existing = packagesByLang.get(langLabel) ?? []
      existing.push(`${pkg.name}@${pkg.version}`)
      packagesByLang.set(langLabel, existing)
    }
  }

  if (packagesByLang.size === 0) {
    return '(No verified packages for detected stacks)'
  }

  const lines: string[] = ['VERIFIED BASELINE PACKAGES:']
  for (const [lang, pkgs] of packagesByLang.entries()) {
    lines.push(`- ${lang}: ${pkgs.join(', ')}`)
  }

  return lines.join('\n')
}

/**
 * Build prompt for AGENT_PROTOCOL.md generation
 */
export function buildAgentProtocolPrompt(
  nodes: DiagramNode[],
  projectName: string
): string {
  const detectedStacks = detectStacks(nodes)
  const packageContext = buildStackPackageContext(nodes)

  return `You are generating an AGENT_PROTOCOL.md file for an AI coding assistant. This provides workflow guidance for implementing the project.

PROJECT: ${projectName}
DETECTED STACKS: ${detectedStacks}
${packageContext}
COMPONENTS: ${String(nodes.length)} total

YOUR TASK:
Generate a complete AGENT_PROTOCOL.md following this EXACT 6-section structure. Output ONLY the markdown content with NO code fences, NO explanations.

REQUIRED SECTIONS (in order):

1. **Core Principle** - Include:
   - Statement that the system has rules and agent should execute within them
   - Instructions to read PROJECT_RULES.md first
   - Instructions to load only the active component spec

2. **Status Tracking (MANDATORY)** - Include:
   - Statement that tracking is mandatory
   - Generic status file reference (e.g., STATUS.md)
   - Recommended structure: Current Phase, Active Component, Current Milestone, Progress, Blockers, Last Updated
   - Rules: create on first task, update after features/milestones, update on component switch, update when blocked, read on session start

3. **Workflow Guidance** - Include:
   - Four phases: Index, Plan, Implement, Verify
   - Brief description of each phase
   - Emphasis on updating status after each phase

4. **Scope Discipline** - Include:
   - ALWAYS subsection (5-6 mandatory rules including status updates and security):
     * Validate inputs at system boundaries
     * Use environment variables for secrets
     * Update STATUS.md after every milestone
   - NEVER subsection (5-6 forbidden patterns including security and complexity):
     * Store secrets in code or version control
     * Trust client-side validation alone
     * Add enterprise patterns without explicit request
   - PREFER subsection (4-5 preferences with "X over Y" format)

5. **Library Policy** - Include:
   - "Search before building" principle
   - Order: current codebase utilities → project dependencies → external packages
   - List of use cases for established libraries
   - When custom code is acceptable
   - "MINIMALISM MANDATE (NON-NEGOTIABLE)" subsection with:
     * Start with the simplest architecture that could work
     * Add complexity ONLY when scaling actually demands it
     * No enterprise patterns without explicit user request
     * Prefer stdlib over library, library over framework, simple over clever
     * Three similar lines of code beats one premature abstraction
     * If in doubt, leave it out

6. **Code Standards** - Include:
   - Dynamic table based on detected stacks with EXPLICIT rules:
     * Python: "PEP 8 strict: snake_case functions/vars, PascalCase classes, 4-space indent, max 88 chars/line, type hints required"
     * TypeScript: "ESLint strict: no \`any\`, no enums (use const objects), explicit return types, 2-space indent"
     * Go: "gofmt mandatory, golint, explicit error handling, no naked returns"
   - Modularity Rules (HARD LIMITS): functions max 50 lines, files max 300 lines (hard limit 500), nesting max 3 levels
   - General principles: explicit over implicit, composition over inheritance, fail fast, pure functions, no premature abstraction

IMPORTANT INSTRUCTIONS:
- Be professional and actionable
- Keep guidance generic enough to work across IDEs
- Emphasize status tracking throughout
- Emphasize minimalist architecture throughout — no premature enterprise patterns
- Include SPECIFIC, ENFORCEABLE rules - not just "PEP 8" but the actual rules
- Output markdown ONLY - no code fences, just the content
- Start directly with: # Agent Protocol`
}
