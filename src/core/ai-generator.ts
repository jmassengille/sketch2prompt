import OpenAI from 'openai'
import type { DiagramNode, DiagramEdge, NodeType } from './types'

export type AIProvider = 'anthropic' | 'openai'

export interface GenerationResult {
  projectRules: string
  agentProtocol: string
  componentSpecs: Map<string, string> // nodeId -> YAML content
}

const PROVIDER_CONFIG: Record<AIProvider, { baseURL: string | undefined }> = {
  anthropic: { baseURL: 'https://api.anthropic.com/v1/' },
  openai: { baseURL: undefined }, // Uses OpenAI default
}

const NODE_TYPE_BUILD_ORDER: Record<NodeType, number> = {
  storage: 1,
  auth: 2,
  backend: 3,
  frontend: 4,
  external: 5,
  background: 6,
}

/**
 * Generate AI-powered project documentation from diagram
 */
export async function generateWithAI(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  apiKey: string,
  provider: AIProvider,
  modelId: string
): Promise<GenerationResult> {
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: PROVIDER_CONFIG[provider].baseURL,
      dangerouslyAllowBrowser: true, // Required for client-side
    })

    // Generate PROJECT_RULES.md
    const projectRulesPrompt = buildProjectRulesPrompt(nodes, edges, projectName)
    const projectRules = await callAI(
      client,
      projectRulesPrompt,
      modelId,
      4000,
      'PROJECT_RULES.md'
    )

    // Generate AGENT_PROTOCOL.md
    const agentProtocolPrompt = buildAgentProtocolPrompt(nodes, projectName)
    const agentProtocol = await callAI(
      client,
      agentProtocolPrompt,
      modelId,
      2500,
      'AGENT_PROTOCOL.md'
    )

    // Generate component specs in parallel
    const componentPromises = nodes.map(async (node) => {
      const prompt = buildComponentSpecPrompt(node, nodes, edges)
      const yaml = await callAI(
        client,
        prompt,
        modelId,
        2000,
        `component spec for ${node.data.label}`
      )
      return { nodeId: node.id, yaml }
    })

    const componentResults = await Promise.all(componentPromises)
    const componentSpecs = new Map(
      componentResults.map((r) => [r.nodeId, r.yaml])
    )

    return {
      projectRules,
      agentProtocol,
      componentSpecs,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `AI generation failed: ${error.message}. Please check your API key and try again.`
      )
    }
    throw new Error(
      'AI generation failed due to an unexpected error. Please try again.'
    )
  }
}

/**
 * Call AI API using OpenAI Responses API
 * @see https://platform.openai.com/docs/api-reference/responses
 */
async function callAI(
  client: OpenAI,
  prompt: string,
  modelId: string,
  _maxTokens: number,
  taskDescription: string
): Promise<string> {
  try {
    const response = await client.responses.create({
      model: modelId,
      input: prompt,
    })

    const content = response.output_text
    if (!content) {
      throw new Error(`No content returned for ${taskDescription}`)
    }

    return content.trim()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate ${taskDescription}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Build prompt for PROJECT_RULES.md generation
 */
function buildProjectRulesPrompt(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string
): string {
  const componentList = nodes
    .map(
      (node) =>
        `- ${node.data.label} (${node.data.type})${node.data.meta.description ? `: ${node.data.meta.description}` : ''}`
    )
    .join('\n')

  const connectionsList = edges
    .map((edge) => {
      const source = nodes.find((n) => n.id === edge.source)
      const target = nodes.find((n) => n.id === edge.target)
      if (!source || !target) return null
      return `- ${source.data.label} → ${target.data.label}${edge.data?.label ? ` (${edge.data.label})` : ''}`
    })
    .filter(Boolean)
    .join('\n')

  // Detect primary stack from node types
  const hasFrontend = nodes.some((n) => n.data.type === 'frontend')
  const hasBackend = nodes.some((n) => n.data.type === 'backend')
  let stackType = 'System'
  if (hasFrontend && hasBackend) stackType = 'Full-stack application'
  else if (hasFrontend) stackType = 'Frontend application'
  else if (hasBackend) stackType = 'Backend service'

  // Build component registry table
  const componentRegistry = nodes
    .map(
      (node) =>
        `| ${node.id} | ${node.data.label} | ${node.data.type} | \`specs/${sanitizeFilename(node.data.label)}.yaml\` | active |`
    )
    .join('\n')

  // Build build order
  const buildOrder = buildBuildOrderSection(nodes)

  // Build integration rules
  const integrationRules = buildIntegrationRulesSection(nodes, edges)

  return `You are generating a PROJECT_RULES.md file for an AI coding assistant. This file will be loaded FIRST before any component specs.

PROJECT DETAILS:
- Project Name: ${projectName}
- Type: ${stackType}
- Components (${String(nodes.length)} total):
${componentList}

CONNECTIONS:
${connectionsList || '(No connections defined)'}

YOUR TASK:
Generate a complete PROJECT_RULES.md file following this EXACT 6-section structure. Output ONLY the markdown content with NO code fences, NO explanations, NO preamble.

REQUIRED SECTIONS (in order):

1. **System Overview** - Include:
   - Project name, type, and stack summary
   - 1-3 sentence description of what the system does
   - "Boundaries" subsection with "This system IS:" and "This system IS NOT:" lists

2. **Component Registry** - Include:
   - Table with columns: ID | Component | Type | Spec File | Status
   - Use this EXACT table content:
${componentRegistry}
   - Add "Loading Instructions" subsection: "Load component specs **only when working on that component**. Do not preload all specs."

3. **Architecture Constraints** - Include:
   - "ALWAYS (Required)" subsection with 3-5 must-follow rules
   - "NEVER (Forbidden)" subsection with 3-5 forbidden patterns
   - "PREFER (Encouraged)" subsection with 2-4 preferred patterns (format: "X over Y — rationale")

4. **Code Standards** - Include:
   - "Naming Conventions" subsection (files, components, functions, constants, types)
   - "File Organization" subsection (brief folder structure)
   - "Patterns" subsection with 1-2 key patterns with code examples
   - "Dependencies Policy" subsection (prefer, avoid, before-adding checklist)

5. **Build Order** - Include:
   - Implementation sequence grouped by phases
   - Use this content:
${buildOrder}

6. **Integration Rules** - Include:
   - "Communication Patterns" table with columns: From | To | Pattern | Notes
   - Use this content:
${integrationRules}

IMPORTANT INSTRUCTIONS:
- Be specific to THIS project's components and architecture
- Generate realistic, professional content based on the component types
- Use standard best practices for the detected stack
- Keep token count reasonable (aim for 800-1200 tokens total)
- Output markdown ONLY - no code fences, no "Here is...", just the content
- Start directly with: # ${projectName} - System Rules`
}

/**
 * Build prompt for component YAML spec generation
 */
function buildComponentSpecPrompt(
  node: DiagramNode,
  allNodes: DiagramNode[],
  edges: DiagramEdge[]
): string {
  const connections = edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .map((edge) => {
      const isSource = edge.source === node.id
      const otherId = isSource ? edge.target : edge.source
      const otherNode = allNodes.find((n) => n.id === otherId)
      if (!otherNode) return null
      return {
        component: otherNode.data.label,
        direction: isSource ? 'to' : 'from',
        label: edge.data?.label,
      }
    })
    .filter(Boolean)

  const validConnections = connections.filter(
    (c): c is NonNullable<typeof c> => c !== null
  )
  const connectionsList = validConnections
    .map(
      (c) =>
        `- ${c.component} (${c.direction === 'to' ? 'sends to' : 'receives from'})${c.label ? `: ${c.label}` : ''}`
    )
    .join('\n')

  return `You are generating a component specification YAML file for an AI coding assistant.

COMPONENT DETAILS:
- Name: ${node.data.label}
- Type: ${node.data.type}
- Description: ${node.data.meta.description || 'No description provided'}
- Component ID: ${node.id}

CONNECTIONS:
${connectionsList || '(No connections)'}

YOUR TASK:
Generate a complete component spec in YAML format following the schema for type "${node.data.type}".

REQUIRED FIELDS (all specs):
- spec_version: "1.0"
- component_id: "${node.id}"
- name: "${node.data.label}"
- type: "${node.data.type}"
- description: |
    (2-3 sentence description based on the component name and type)
- responsibilities: (3-5 core responsibilities as bullet points)
- anti_responsibilities: (3-5 strings using format: "NEVER [action] — [reason]")

INTEGRATION_POINTS (for each connected component):
- component: (name of connected component)
- direction: "inbound" | "outbound" | "bidirectional"
- purpose: (why this integration exists)
- contract:
    request: (request shape, e.g., "{ userId: string }")
    response: (response shape, e.g., "{ user: User }")

TECH_STACK:
- primary: (main technology)
- baseline_deps: (list with name, version, purpose for each)
- references: (list of official docs URLs as simple strings)

VALIDATION SECTION (required):
- exit_criteria: (list of completion criteria, must include "Status file updated with component completion")
- smoke_tests: (minimal verification steps)
- integration_checks: (based on integration_points)

TYPE-SPECIFIC FIELDS for "${node.data.type}":
${getTypeSpecificFieldsPrompt(node.data.type)}

IMPORTANT INSTRUCTIONS:
- Output ONLY valid YAML with NO markdown code fences, NO explanations
- Be specific and realistic based on the component name "${node.data.label}"
- Anti-responsibilities MUST use format: "NEVER [action] — [reason]"
- References are simple strings, NOT objects
- Validation section is required with exit_criteria, smoke_tests, and integration_checks
- Keep token count reasonable (~400-700 tokens)
- Use proper YAML syntax with correct indentation (2 spaces)
- Start directly with: spec_version: "1.0"`
}

/**
 * Build prompt for AGENT_PROTOCOL.md generation
 */
function buildAgentProtocolPrompt(
  nodes: DiagramNode[],
  projectName: string
): string {
  // Detect primary stacks from nodes
  const stacks = new Set<string>()
  nodes.forEach((node) => {
    const techStack = node.data.meta.techStack ?? []
    techStack.forEach((tech) => {
      const lower = tech.toLowerCase()
      if (lower.includes('python') || lower.includes('fastapi') || lower.includes('django')) {
        stacks.add('Python')
      }
      if (lower.includes('typescript') || lower.includes('node') || lower.includes('express') || lower.includes('react') || lower.includes('next')) {
        stacks.add('TypeScript/Node')
      }
      if (lower.includes('go') || lower.includes('golang')) {
        stacks.add('Go')
      }
      if (lower.includes('rust')) {
        stacks.add('Rust')
      }
    })
  })
  const detectedStacks = stacks.size > 0 ? Array.from(stacks).join(', ') : 'General'

  return `You are generating an AGENT_PROTOCOL.md file for an AI coding assistant. This provides workflow guidance for implementing the project.

PROJECT: ${projectName}
DETECTED STACKS: ${detectedStacks}
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
   - ALWAYS subsection (5-6 mandatory rules including status updates)
   - NEVER subsection (5-6 forbidden patterns)
   - PREFER subsection (4-5 preferences with "X over Y" format)

5. **Library Policy** - Include:
   - "Search before building" principle
   - Order: current codebase utilities → project dependencies → external packages
   - List of use cases for established libraries
   - When custom code is acceptable

6. **Code Standards** - Include:
   - Dynamic table based on detected stacks
   - For each stack: standards reference (e.g., PEP 8, ESLint)
   - General principles: modular, extensible, debuggable, testable

IMPORTANT INSTRUCTIONS:
- Be professional and actionable
- Keep guidance generic enough to work across IDEs
- Emphasize status tracking throughout
- Output markdown ONLY - no code fences, just the content
- Start directly with: # Agent Protocol`
}

/**
 * Get type-specific field guidance for prompts
 */
function getTypeSpecificFieldsPrompt(nodeType: NodeType): string {
  switch (nodeType) {
    case 'frontend':
      return `- routing_strategy: (description of routing approach)
- state_management: (state management approach)
- accessibility: (list of accessibility requirements)
- ui_patterns: (list of UI patterns with name and usage)`

    case 'backend':
      return `- api_style: "REST|GraphQL|gRPC|tRPC"
- endpoint_patterns: (list of URL patterns with methods and auth)
- error_handling: (standard error response format)`

    case 'storage':
      return `- schema_notes: (key entities and relationships)
- backup_strategy: (backup approach)
- indexing_strategy: (guidelines for indexes)`

    case 'auth':
      return `- auth_strategy: "JWT|Session|OAuth2|API_Key"
- security_notes: (authentication/authorization approach)
- providers: (if using OAuth, list providers with scopes)`

    case 'external':
      return `- service_details:
    provider: (service name)
    api_version: (version)
    environment: (dev/staging/prod notes)
- error_handling: (how to handle failures)
- rate_limits: (limit descriptions)`

    case 'background':
      return `- job_queue: (queue technology)
- jobs: (list of jobs with name, trigger, frequency, retry_policy)`

    default:
      return '(No type-specific fields for this type)'
  }
}

/**
 * Build the Build Order section
 */
function buildBuildOrderSection(nodes: DiagramNode[]): string {
  const sorted = [...nodes].sort(
    (a, b) =>
      NODE_TYPE_BUILD_ORDER[a.data.type] - NODE_TYPE_BUILD_ORDER[b.data.type]
  )

  const phases: Record<string, DiagramNode[]> = {
    'Phase 1: Foundation': [],
    'Phase 2: Core Features': [],
    'Phase 3: Integration': [],
    'Phase 4: Polish': [],
  }

  sorted.forEach((node) => {
    const order = NODE_TYPE_BUILD_ORDER[node.data.type]
    const foundationPhase = phases['Phase 1: Foundation']
    const corePhase = phases['Phase 2: Core Features']
    const integrationPhase = phases['Phase 3: Integration']
    if (order <= 2 && foundationPhase) foundationPhase.push(node)
    else if (order <= 4 && corePhase) corePhase.push(node)
    else if (integrationPhase) integrationPhase.push(node)
  })

  let output = 'Implementation sequence based on dependency graph:\n\n'

  Object.entries(phases).forEach(([phaseName, phaseNodes]) => {
    if (phaseNodes.length > 0) {
      output += `### ${phaseName}\n`
      phaseNodes.forEach((node) => {
        const rationale = getBuildOrderRationale(node.data.type)
        output += `- [ ] [${node.id}] ${node.data.label} — ${rationale}\n`
      })
      output += '\n'
    }
  })

  return output
}

/**
 * Get build order rationale for node type
 */
function getBuildOrderRationale(nodeType: NodeType): string {
  switch (nodeType) {
    case 'storage':
      return 'Schema and data layer first (everything depends on data)'
    case 'auth':
      return 'Authentication before protected features'
    case 'backend':
      return 'Business logic and data access'
    case 'frontend':
      return 'UI consuming the backend services'
    case 'external':
      return 'External integrations (can be added incrementally)'
    case 'background':
      return 'Background jobs (non-blocking, lower priority)'
    default:
      return 'Implementation priority based on dependencies'
  }
}

/**
 * Build Integration Rules section
 */
function buildIntegrationRulesSection(
  nodes: DiagramNode[],
  edges: DiagramEdge[]
): string {
  if (edges.length === 0) {
    return `### Communication Patterns

(No integrations defined)

### Shared Contracts

Define shared types and API contracts as the system evolves.

### Forbidden Integrations

Document any forbidden direct integrations as architecture constraints emerge.`
  }

  let tableRows = '| From | To | Pattern | Notes |\n|------|----|---------| ------|'

  edges.forEach((edge) => {
    const source = nodes.find((n) => n.id === edge.source)
    const target = nodes.find((n) => n.id === edge.target)
    if (!source || !target) return

    const pattern = getIntegrationPattern(source.data.type, target.data.type)
    const notes = edge.data?.label || 'See component specs'

    tableRows += `\n| ${source.data.label} | ${target.data.label} | ${pattern} | ${notes} |`
  })

  return `### Communication Patterns

${tableRows}

### Shared Contracts

API response types and shared data structures should be defined in a central types location. Both frontend and backend should reference these types.

### Forbidden Integrations

- Frontend components MUST NOT directly access storage — all data through backend APIs
- External services MUST NOT be called directly from frontend — proxy through backend for security`
}

/**
 * Get integration pattern based on node types
 */
function getIntegrationPattern(
  sourceType: NodeType,
  targetType: NodeType
): string {
  if (sourceType === 'frontend' && targetType === 'backend')
    return 'HTTP/REST API'
  if (sourceType === 'backend' && targetType === 'storage')
    return 'ORM/Query Builder'
  if (sourceType === 'backend' && targetType === 'external')
    return 'API Client/SDK'
  if (sourceType === 'backend' && targetType === 'auth') return 'JWT Validation'
  if (sourceType === 'auth' && targetType === 'storage')
    return 'Credential Lookup'
  if (sourceType === 'background' && targetType === 'storage')
    return 'Direct Database Access'

  return 'Component Integration'
}

/**
 * Sanitize filename for component spec files
 */
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
