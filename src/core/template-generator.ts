import { dump } from 'js-yaml'
import type { DiagramNode, DiagramEdge, NodeType } from './types'

// Type-based build order (matches export-prompt.ts)
const BUILD_ORDER: NodeType[] = [
  'storage',    // Data models first
  'auth',       // Auth before features
  'backend',    // API before UI
  'frontend',   // UI after API
  'external',   // Integrations
  'background', // Background jobs
]

const TYPE_LABELS: Record<NodeType, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  storage: 'Storage',
  auth: 'Auth',
  external: 'External',
  background: 'Background',
}

const TYPE_DESCRIPTIONS: Record<NodeType, string> = {
  frontend: 'UI components, pages, and client-side logic',
  backend: 'API endpoints, server logic, and business rules',
  storage: 'Databases, file storage, and caching layers',
  auth: 'Authentication, authorization, and user management',
  external: 'Third-party APIs and external service integrations',
  background: 'Background jobs, cron tasks, and queue workers',
}

// Type-specific default responsibilities
const DEFAULT_RESPONSIBILITIES: Record<NodeType, string[]> = {
  frontend: [
    'Render user interface components and pages',
    'Handle user interactions and form submissions',
    'Manage client-side state and routing',
    'Communicate with backend APIs for data',
  ],
  backend: [
    'Validate all incoming request payloads',
    'Enforce authentication and authorization rules',
    'Execute business logic and data transformations',
    'Return consistent, well-structured API responses',
  ],
  storage: [
    'Persist all business data with referential integrity',
    'Provide transactional guarantees for operations',
    'Support efficient queries via proper indexing',
    'Maintain data consistency and backup recovery',
  ],
  auth: [
    'Authenticate users via secure credential verification',
    'Generate and validate session tokens or JWTs',
    'Enforce access control and permission checks',
    'Handle password reset and account recovery flows',
  ],
  external: [
    'Integrate with third-party service APIs',
    'Handle rate limits and retry logic',
    'Transform external data formats to internal schemas',
    'Manage API credentials securely via environment variables',
  ],
  background: [
    'Execute scheduled or event-driven background tasks',
    'Process items from job queues reliably',
    'Implement retry logic with exponential backoff',
    'Monitor job failures and send alerts',
  ],
}

// Type-specific anti-responsibilities (NEVER statements with reasons)
const DEFAULT_ANTI_RESPONSIBILITIES: Record<NodeType, string[]> = {
  frontend: [
    'NEVER store sensitive data in localStorage or client state — easily accessible by malicious scripts',
    'NEVER trust client-side validation alone — always re-validate server-side',
    'NEVER make direct database connections — all data through backend APIs',
    'NEVER implement business logic in UI — keep components presentational',
  ],
  backend: [
    'NEVER render HTML or serve static files — API-only, frontend handles UI',
    'NEVER trust client-provided IDs for authorization — always verify ownership',
    'NEVER expose internal error details to clients — log internally, return safe messages',
    'NEVER store secrets in code or version control — use environment variables',
  ],
  storage: [
    'NEVER expose direct connections to frontend — backend is the gateway',
    'NEVER store computed values that can be derived — calculate at query time or cache separately',
    'NEVER use database triggers for business logic — keep in application layer for testability',
    'NEVER store large files/blobs directly — use object storage and store URLs',
  ],
  auth: [
    'NEVER store plain-text passwords — use bcrypt, argon2, or similar',
    'NEVER implement custom encryption — use battle-tested libraries',
    'NEVER trust authentication tokens without verification — validate signatures and expiry',
    'NEVER skip rate limiting on auth endpoints — prevents brute force attacks',
  ],
  external: [
    'NEVER store API keys in code — use environment variables and secret management',
    'NEVER assume external service is always available — implement fallback behavior',
    'NEVER trust external data without validation — sanitize and verify all inputs',
    'NEVER ignore rate limits — respect API quotas to prevent service suspension',
  ],
  background: [
    'NEVER assume jobs run exactly once — design for idempotency',
    'NEVER block critical paths with long-running jobs — queue and process asynchronously',
    'NEVER ignore failed jobs — implement monitoring and alerting',
    'NEVER store job state only in memory — use persistent queue for reliability',
  ],
}

// Type-specific default tech stack suggestions
const DEFAULT_TECH_STACK: Record<NodeType, string> = {
  frontend: 'React, Vue, or similar modern framework',
  backend: 'Node.js + Express, FastAPI, or similar',
  storage: 'PostgreSQL, MySQL, MongoDB, or similar',
  auth: 'JWT, OAuth2, or session-based authentication',
  external: 'Official SDK for target service',
  background: 'Redis/Bull, Celery, or similar job queue',
}

// Type-specific default constraints
const DEFAULT_CONSTRAINTS: Record<NodeType, { security: string[]; performance: string[]; architecture: string[] }> = {
  frontend: {
    security: [
      'Sanitize all user inputs to prevent XSS attacks',
      'Use HTTPS only for API communications',
      'Implement Content Security Policy headers',
    ],
    performance: [
      'Lazy load routes and heavy components',
      'Optimize bundle size with code splitting',
      'Debounce expensive operations like API calls',
    ],
    architecture: [
      'Keep components small and single-responsibility',
      'Use composition over inheritance for reusability',
      'Separate presentational and container components',
    ],
  },
  backend: {
    security: [
      'Validate ALL inputs with schema validation library',
      'Use parameterized queries to prevent SQL injection',
      'Implement rate limiting on all endpoints',
      'Set secure HTTP headers (helmet.js or equivalent)',
    ],
    performance: [
      'Use connection pooling for database access',
      'Implement pagination for list endpoints',
      'Add caching for expensive queries',
      'Set reasonable request timeout limits',
    ],
    architecture: [
      'Separate controllers (routing) from services (business logic)',
      'Use dependency injection for testability',
      'Keep request handlers thin, services thick',
      'Structure code by feature/resource, not layer',
    ],
  },
  storage: {
    security: [
      'Encrypt sensitive columns at rest',
      'Use minimal privilege database users',
      'Audit log for sensitive data access',
      'Implement row-level security if supported',
    ],
    performance: [
      'Create indexes for frequently filtered columns',
      'Use connection pooling',
      'Monitor slow queries and optimize',
      'Implement read replicas if read-heavy',
    ],
    architecture: [
      'Normalize to 3NF, denormalize only with measured need',
      'Use UUIDs for primary keys if distributed',
      'All tables have created_at and updated_at timestamps',
      'Soft delete via deleted_at column when needed',
    ],
  },
  auth: {
    security: [
      'Use bcrypt or argon2 for password hashing',
      'Implement multi-factor authentication for sensitive operations',
      'Set short expiry times for session tokens',
      'Revoke tokens on logout or password change',
      'Rate limit authentication attempts',
    ],
    performance: [
      'Cache valid tokens to reduce verification overhead',
      'Use token-based auth to avoid database lookups',
      'Set reasonable token expiry to balance security and UX',
    ],
    architecture: [
      'Separate authentication (who are you) from authorization (what can you do)',
      'Use middleware for token validation',
      'Store minimal data in tokens (user ID, role only)',
      'Centralize permission checks in authorization service',
    ],
  },
  external: {
    security: [
      'Store API keys in environment variables, never in code',
      'Validate webhook signatures to prevent spoofing',
      'Use OAuth with minimal required scopes',
      'Rotate API keys periodically',
    ],
    performance: [
      'Implement circuit breaker pattern for failing services',
      'Cache external API responses when appropriate',
      'Set aggressive timeouts to prevent hanging',
      'Use retry with exponential backoff',
    ],
    architecture: [
      'Wrap external APIs in adapter/facade pattern',
      'Transform external data at integration boundary',
      'Design for eventual consistency if service fails',
      'Version external integration interfaces',
    ],
  },
  background: {
    security: [
      'Validate job payloads before processing',
      'Run jobs with minimal required permissions',
      'Audit log for sensitive background operations',
    ],
    performance: [
      'Process jobs in parallel when possible',
      'Set job priorities based on business criticality',
      'Monitor queue depth and scale workers',
      'Implement job timeout to prevent hanging',
    ],
    architecture: [
      'Design jobs to be idempotent (safe to retry)',
      'Use persistent queue (Redis, RabbitMQ, etc.)',
      'Store job results for debugging',
      'Separate job definition from job execution',
    ],
  },
}

/**
 * Detect project type from nodes
 */
function detectProjectType(nodes: DiagramNode[]): string {
  const types = new Set(nodes.map((n) => n.data.type))

  if (types.has('frontend') && types.has('backend')) {
    return 'Full-stack web application'
  }
  if (types.has('frontend')) {
    return 'Frontend web application'
  }
  if (types.has('backend') && types.has('storage')) {
    return 'Backend API service'
  }
  if (types.has('backend')) {
    return 'Backend service'
  }
  if (types.has('background')) {
    return 'Background processing service'
  }

  return 'Application'
}

/**
 * Generate PROJECT_RULES.md template
 */
export function generateProjectRulesTemplate(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
): string {
  const projectType = detectProjectType(nodes)
  const nodesByType = new Map<NodeType, DiagramNode[]>()

  // Group nodes by type
  for (const node of nodes) {
    const existing = nodesByType.get(node.data.type) ?? []
    nodesByType.set(node.data.type, [...existing, node])
  }

  // Build stack detection
  const stackParts: string[] = []
  if (nodesByType.has('frontend')) {
    stackParts.push('React/Vue/similar frontend')
  }
  if (nodesByType.has('backend')) {
    stackParts.push('Node.js/Python/similar backend')
  }
  if (nodesByType.has('storage')) {
    const storageNodes = nodesByType.get('storage') ?? []
    const storageNames = storageNodes.map((n) => n.data.label).join(', ')
    stackParts.push(storageNames)
  }

  const stackSummary = stackParts.length > 0 ? stackParts.join(' + ') : '# AI: Detect from component types'

  // System Overview section
  const boundaries = generateBoundaries(nodes)
  const systemOverview = `## System Overview

**Project**: ${projectName}
**Type**: ${projectType}
**Stack**: ${stackSummary}

# AI: Add 2-3 sentence description based on components and their relationships.

### Boundaries

This system IS:
${boundaries.is.map((b) => `- ${b}`).join('\n')}
- # AI: Add more explicit inclusions based on component analysis

This system IS NOT:
${boundaries.isNot.map((b) => `- ${b}`).join('\n')}
- # AI: Add more explicit exclusions to prevent scope creep`

  // Component Registry section
  const componentRegistry = generateComponentRegistrySection(nodes)

  // Architecture Constraints section
  const architectureConstraints = generateArchitectureConstraints(nodes)

  // Code Standards section
  const codeStandards = generateCodeStandards(nodes)

  // Build Order section
  const buildOrder = generateBuildOrderSection(nodes)

  // Integration Rules section
  const integrationRules = generateIntegrationRules(nodes, edges)

  // Assemble complete document
  return `# ${projectName} - System Rules

${systemOverview}

---

${componentRegistry}

---

${architectureConstraints}

---

${codeStandards}

---

${buildOrder}

---

${integrationRules}
`
}

/**
 * Generate boundaries (IS/IS NOT) from nodes
 */
function generateBoundaries(nodes: DiagramNode[]): { is: string[]; isNot: string[] } {
  const nodesByType = new Map<NodeType, DiagramNode[]>()
  for (const node of nodes) {
    const existing = nodesByType.get(node.data.type) ?? []
    nodesByType.set(node.data.type, [...existing, node])
  }

  const is: string[] = []
  const isNot: string[] = []

  // Generate IS statements based on what exists
  if (nodesByType.has('frontend')) {
    is.push('A user-facing web application with interactive UI')
  }
  if (nodesByType.has('backend')) {
    is.push('An API service handling business logic and data access')
  }
  if (nodesByType.has('storage')) {
    is.push('A system with persistent data storage')
  }
  if (nodesByType.has('auth')) {
    is.push('A system with user authentication and authorization')
  }
  if (nodesByType.has('external')) {
    is.push('A system integrating with external third-party services')
  }
  if (nodesByType.has('background')) {
    is.push('A system with asynchronous background processing')
  }

  // Generate IS NOT statements based on what's missing
  if (!nodesByType.has('frontend')) {
    isNot.push('A user-facing UI (backend/API only)')
  }
  if (!nodesByType.has('background')) {
    isNot.push('A background job processing system (synchronous only)')
  }
  if (!nodesByType.has('external')) {
    isNot.push('A system with extensive third-party integrations')
  }

  return { is, isNot }
}

/**
 * Generate Component Registry section
 */
function generateComponentRegistrySection(nodes: DiagramNode[]): string {
  if (nodes.length === 0) {
    return `## Component Registry

No components defined yet.`
  }

  const tableHeader = `| ID | Component | Type | Spec File | Status |
|----|-----------|------|-----------|--------|`

  const tableRows = nodes.map((node) => {
    const filename = node.data.label.toLowerCase().replace(/\s+/g, '-')
    return `| ${node.id} | ${node.data.label} | ${node.data.type} | \`specs/${filename}.yaml\` | active |`
  })

  return `## Component Registry

${tableHeader}
${tableRows.join('\n')}

### Loading Instructions

Load component specs **only when working on that component**. Do not preload all specs.

Cross-reference format: \`[component-id]\` (e.g., [${nodes[0]?.id ?? 'node-1'}] references ${nodes[0]?.data.label ?? 'Component'})`
}

/**
 * Generate Architecture Constraints section
 */
function generateArchitectureConstraints(nodes: DiagramNode[]): string {
  const nodeTypes = new Set(nodes.map((n) => n.data.type))

  // Collect type-specific constraints
  const securityConstraints = new Set<string>()

  for (const type of nodeTypes) {
    const constraints = DEFAULT_CONSTRAINTS[type]
    for (const sec of constraints.security.slice(0, 2)) {
      securityConstraints.add(sec)
    }
  }

  // Add universal constraints
  const always = [
    'Validate all inputs at system boundaries (API endpoints, form submissions)',
    'Use environment variables for all configuration (never hardcode secrets)',
    'Log structured data for all errors (timestamp, level, message, context)',
    ...Array.from(securityConstraints),
  ]

  const never = [
    'Store secrets in code or version control',
    'Trust client-side validation alone (always re-validate server-side)',
    'Expose internal error details to clients (log internally, return safe messages)',
  ]

  // Add type-specific never statements
  if (nodeTypes.has('backend')) {
    never.push("Use 'any' type in TypeScript (use 'unknown' + type guards)")
  }
  if (nodeTypes.has('storage')) {
    never.push('Make direct database connections from frontend')
  }

  const prefer = [
    'Composition over inheritance — easier to test and modify',
    'Named exports over default exports — better refactoring support',
    'Early returns over nested conditionals — clearer control flow',
    'Explicit dependencies over global imports — aids testing',
  ]

  return `## Architecture Constraints

### ALWAYS (Required)

${always.map((c) => `- ${c}`).join('\n')}
- # AI: Add project-specific constraints based on domain requirements

### NEVER (Forbidden)

${never.map((c) => `- ${c}`).join('\n')}
- # AI: Add project-specific anti-patterns to avoid

### PREFER (Encouraged)

${prefer.map((p) => `- ${p}`).join('\n')}
- # AI: Add project-specific best practices`
}

/**
 * Generate Code Standards section
 */
function generateCodeStandards(nodes: DiagramNode[]): string {
  const nodeTypes = new Set(nodes.map((n) => n.data.type))

  const hasTypescript = nodeTypes.has('frontend') || nodeTypes.has('backend')
  const hasFrontend = nodeTypes.has('frontend')
  const hasBackend = nodeTypes.has('backend')

  let namingConventions = `### Naming Conventions

- Files: \`kebab-case.ts\` for utilities`

  if (hasFrontend) {
    namingConventions += `, \`PascalCase.tsx\` for components`
  }

  namingConventions += `
- Functions: \`camelCase\` with verb prefix (e.g., \`getUserData\`, \`validateInput\`)`

  if (hasTypescript) {
    namingConventions += `
- Constants: \`SCREAMING_SNAKE_CASE\` for true constants
- Types: \`PascalCase\` with descriptive suffix (e.g., \`UserDTO\`, \`CreateOrderInput\`)`
  }

  namingConventions += `
- # AI: Add domain-specific naming patterns`

  const fileOrganization = `### File Organization

# AI: Generate folder structure based on stack and components. Example:

\`\`\`
/src
  /components  - # AI: Describe purpose
  /services    - # AI: Describe purpose
  /types       - # AI: Describe purpose
  /utils       - # AI: Describe purpose
\`\`\`
`

  let patterns = `### Patterns

# AI: Add stack-specific patterns. Examples:`

  if (hasFrontend) {
    patterns += `

#### Data Fetching
Use React Query, SWR, or similar. Shape:
\`\`\`typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', filters],
  queryFn: () => fetchResource(filters)
});
\`\`\`

#### Error Boundaries
Wrap route-level components in error boundaries.`
  }

  if (hasBackend) {
    patterns += `

#### Service Layer
Keep controllers thin, move business logic to services.
\`\`\`typescript
// Controller (routing only)
router.get('/resource/:id', async (req, res) => {
  const item = await resourceService.getById(req.params.id);
  res.json(item);
});

// Service (business logic)
class ResourceService {
  async getById(id: string): Promise<Resource> {
    // validation, authorization, business logic
  }
}
\`\`\``
  }

  const dependenciesPolicy = `### Dependencies Policy

- Prefer: Established packages with active maintenance and good documentation
- Avoid: Packages with no updates in 12+ months or security vulnerabilities
- Before adding: Check bundle size impact${hasTypescript ? ', verify TypeScript support' : ''}
- # AI: Add project-specific dependency guidelines`

  return `## Code Standards

${namingConventions}

${fileOrganization}

${patterns}

${dependenciesPolicy}`
}

/**
 * Generate Build Order section
 */
function generateBuildOrderSection(nodes: DiagramNode[]): string {
  const nodesByType = new Map<NodeType, DiagramNode[]>()
  for (const node of nodes) {
    const existing = nodesByType.get(node.data.type) ?? []
    nodesByType.set(node.data.type, [...existing, node])
  }

  const phases: { name: string; components: string[] }[] = []

  // Foundation phase
  phases.push({
    name: 'Phase 1: Foundation',
    components: ['Project setup, tooling, and dependencies'],
  })

  // Type-based phases with pre-assigned phase numbers
  const buildPhaseMap: Record<NodeType, { name: string; rationale: string }> = {
    storage: {
      name: 'Phase 2: Storage',
      rationale: 'Schema and data models first (everything depends on data)',
    },
    auth: {
      name: 'Phase 3: Authentication',
      rationale: 'Auth before protected features',
    },
    backend: {
      name: 'Phase 4: Backend',
      rationale: 'Business logic and API endpoints',
    },
    frontend: {
      name: 'Phase 5: Frontend',
      rationale: 'UI consuming the backend API',
    },
    external: {
      name: 'Phase 6: Integration',
      rationale: 'Third-party service connections',
    },
    background: {
      name: 'Phase 7: Background Jobs',
      rationale: 'Asynchronous processing',
    },
  }

  for (const type of BUILD_ORDER) {
    const typeNodes = nodesByType.get(type)
    if (typeNodes && typeNodes.length > 0) {
      const phase = buildPhaseMap[type]
      const componentItems = typeNodes.map((node) => `- [ ] [${node.id}] ${node.data.label} — ${phase.rationale}`)
      phases.push({
        name: phase.name,
        components: componentItems,
      })
    }
  }

  // Polish phase - number is based on how many phases we've added
  const polishPhaseNum = phases.length + 1
  phases.push({
    name: `Phase ${String(polishPhaseNum)}: Polish`,
    components: [
      '- [ ] Error handling standardization',
      '- [ ] Performance optimization',
      '- [ ] Monitoring and logging',
      '- [ ] # AI: Add project-specific polish tasks',
    ],
  })

  const phaseSections = phases.map((phase) => `### ${phase.name}\n${phase.components.join('\n')}`).join('\n\n')

  return `## Build Order

Implementation sequence based on dependency graph:

${phaseSections}`
}

/**
 * Generate Integration Rules section
 */
function generateIntegrationRules(nodes: DiagramNode[], edges: DiagramEdge[]): string {
  if (edges.length === 0) {
    return `## Integration Rules

No component integrations defined yet.

# AI: Define how components should communicate once edges are added.`
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // Build communication patterns table
  const tableHeader = `| From | To | Pattern | Notes |
|------|----|---------|-------|`

  const tableRows = edges.map((edge) => {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)

    if (!source || !target) {
      return ''
    }

    const pattern = inferCommunicationPattern(source.data.type, target.data.type)
    const notes = edge.data?.label || '# AI: Describe integration details'

    return `| ${source.data.label} | ${target.data.label} | ${pattern} | ${notes} |`
  })

  const filteredRows = tableRows.filter((row) => row !== '')

  const communicationPatterns = `### Communication Patterns

${tableHeader}
${filteredRows.join('\n')}

# AI: Review and refine integration patterns based on actual requirements.`

  const sharedContracts = `### Shared Contracts

# AI: Document shared types, API contracts, or data shapes that multiple components use.

Example:
- API response types defined in \`/src/types/api.ts\`
- Frontend and backend share TypeScript types
- Use Zod schemas for runtime validation`

  const forbiddenIntegrations = `### Forbidden Integrations

# AI: Add explicit rules about what components MUST NOT directly access.

Examples:
- Frontend MUST NOT directly access database — all data through backend API
- Background jobs MUST NOT import UI components — separate concerns`

  return `## Integration Rules

${communicationPatterns}

${sharedContracts}

${forbiddenIntegrations}`
}

/**
 * Infer communication pattern from node types
 */
function inferCommunicationPattern(sourceType: NodeType, targetType: NodeType): string {
  if (sourceType === 'frontend' && targetType === 'backend') {
    return 'HTTP REST/GraphQL'
  }
  if (sourceType === 'backend' && targetType === 'storage') {
    return 'ORM/Query builder'
  }
  if (sourceType === 'backend' && targetType === 'auth') {
    return 'Middleware/SDK'
  }
  if (sourceType === 'backend' && targetType === 'external') {
    return 'HTTP/SDK'
  }
  if (sourceType === 'backend' && targetType === 'background') {
    return 'Job queue'
  }
  if (sourceType === 'background' && targetType === 'storage') {
    return 'Direct DB access'
  }

  return '# AI: Define pattern'
}

/**
 * Generate component YAML template
 */
export function generateComponentYamlTemplate(
  node: DiagramNode,
  edges: DiagramEdge[],
  allNodes: DiagramNode[],
): string {
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]))

  // Find connected nodes
  const connectedEdges = edges.filter((e) => e.source === node.id || e.target === node.id)

  const integrationPoints = connectedEdges.map((edge) => {
    const isSource = edge.source === node.id
    const connectedId = isSource ? edge.target : edge.source
    const connectedNode = nodeMap.get(connectedId)

    if (!connectedNode) {
      return null
    }

    const relationship = edge.data?.label || '# AI: Describe the relationship'

    return {
      component: connectedNode.data.label,
      relationship,
    }
  }).filter((ip): ip is { component: string; relationship: string } => ip !== null)

  // Build YAML object
  const yamlData = {
    spec_version: '1.0',
    component_id: node.id,
    name: node.data.label,
    type: node.data.type,
    description:
      node.data.meta.description ||
      '# AI: Add 2-3 sentence description based on component name and type.\n' +
        `This is a ${TYPE_LABELS[node.data.type]} component responsible for ${TYPE_DESCRIPTIONS[node.data.type].toLowerCase()}.`,
    responsibilities: DEFAULT_RESPONSIBILITIES[node.data.type].concat([
      '# AI: Elaborate based on project context and integrations',
    ]),
    anti_responsibilities: DEFAULT_ANTI_RESPONSIBILITIES[node.data.type].concat([
      '# AI: Add boundaries based on integration points',
    ]),
    integration_points:
      integrationPoints.length > 0
        ? integrationPoints
        : [{ component: '# AI: Add connected components', relationship: '# AI: Describe the relationship' }],
    tech_stack: {
      primary: DEFAULT_TECH_STACK[node.data.type],
      dependencies: ['# AI: Add specific packages and version constraints'],
      references: [
        {
          url: '# AI: Add URL to official docs or package index',
          type: 'official_docs|package_index',
        },
      ],
    },
    constraints: {
      security: DEFAULT_CONSTRAINTS[node.data.type].security.concat(['# AI: Add component-specific security rules']),
      performance: DEFAULT_CONSTRAINTS[node.data.type].performance.concat([
        '# AI: Add component-specific performance targets',
      ]),
      architecture: DEFAULT_CONSTRAINTS[node.data.type].architecture.concat([
        '# AI: Add component-specific architectural decisions',
      ]),
    },
  }

  // Add type-specific fields
  const typeSpecificFields = generateTypeSpecificFields(node.data.type)
  const mergedData = { ...yamlData, ...typeSpecificFields }

  // Generate YAML with custom formatting
  const yaml = dump(mergedData, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  })

  return yaml
}

/**
 * Generate type-specific fields for component YAML
 */
function generateTypeSpecificFields(type: NodeType): Record<string, unknown> {
  switch (type) {
    case 'frontend':
      return {
        routing_strategy: '# AI: Describe routing approach (e.g., React Router, file-based)',
        state_management: '# AI: Describe state approach (e.g., Context, Zustand, Redux)',
        accessibility: [
          'Use semantic HTML elements',
          'Ensure keyboard navigation support',
          '# AI: Add project-specific a11y requirements',
        ],
        ui_patterns: [
          {
            name: '# AI: Add common UI pattern',
            usage: '# AI: Describe when to use this pattern',
          },
        ],
      }
    case 'backend':
      return {
        api_style: '# AI: REST|GraphQL|gRPC|tRPC',
        endpoint_patterns: [
          {
            pattern: '# AI: Add URL pattern (e.g., /api/v1/{resource})',
            methods: ['GET', 'POST'],
            auth: 'required|optional|none',
          },
        ],
        error_handling:
          '# AI: Document standard error response format.\n' +
          'Example: { error: string, code: string, details?: object }',
      }
    case 'storage':
      return {
        schema_notes: '# AI: Document key entities and relationships.\nExample: users, orders, order_items',
        backup_strategy:
          '# AI: Describe backup approach.\nExample: Daily automated backups with 30-day retention',
        indexing_strategy:
          '# AI: Document indexing guidelines.\nExample: Index all foreign keys and frequently filtered columns',
      }
    case 'auth':
      return {
        auth_strategy: '# AI: JWT|Session|OAuth2|API_Key',
        security_notes:
          '# AI: Document authentication and authorization approach.\n' +
          'Include password policy, session management, token expiry.',
        providers: [
          {
            name: '# AI: Add OAuth provider if applicable (Google, GitHub, etc.)',
            scopes: ['# AI: Required scopes'],
          },
        ],
      }
    case 'external':
      return {
        service_details: {
          provider: '# AI: Service name (e.g., Stripe, SendGrid)',
          api_version: '# AI: API version being used',
          environment: '# AI: Dev/staging/prod configuration notes',
        },
        error_handling: [
          'Implement circuit breaker for repeated failures',
          'Log all external API errors with correlation IDs',
          '# AI: Add service-specific error handling',
        ],
        rate_limits: ['# AI: Document known rate limits and how to handle them'],
      }
    case 'background':
      return {
        job_queue: '# AI: Queue technology (e.g., Redis + Bull, RabbitMQ, AWS SQS)',
        jobs: [
          {
            name: '# AI: Job name',
            trigger: 'Event-driven|Cron',
            frequency: '# AI: Schedule (e.g., "0 2 * * *") or event description',
            retry_policy: '# AI: Retry approach (e.g., "3 retries with exponential backoff")',
          },
        ],
      }
    default:
      return {}
  }
}
