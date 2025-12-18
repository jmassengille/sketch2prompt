# Template Generator

Template-based export for users without API keys. Generates comprehensive specification files with AI elaboration markers.

## Overview

The template generator creates two types of files:

1. **PROJECT_RULES.md** - Master instruction file for AI coding assistants
2. **Component YAML files** - Per-component specifications with type-specific defaults

Both file types include `# AI:` markers indicating sections that should be elaborated by the consuming AI.

## Functions

### `generateProjectRulesTemplate()`

Generates the master instruction file (PROJECT_RULES.md).

**Signature:**
```typescript
function generateProjectRulesTemplate(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string
): string
```

**Sections Generated:**
1. **System Overview** - Project type, stack detection, boundaries
2. **Component Registry** - Table of all components with spec file paths
3. **Architecture Constraints** - ALWAYS/NEVER/PREFER rules (type-based defaults)
4. **Code Standards** - Naming conventions, patterns, dependencies policy
5. **Build Order** - Type-based implementation sequence
6. **Integration Rules** - Communication patterns derived from edges

**Features:**
- Auto-detects project type from node composition
- Generates boundaries (IS/IS NOT) based on components
- Includes type-specific constraints and patterns
- Creates proper build order following storage → auth → backend → frontend → external → background
- Infers communication patterns from edge types

### `generateComponentYamlTemplate()`

Generates per-component YAML specification.

**Signature:**
```typescript
function generateComponentYamlTemplate(
  node: DiagramNode,
  edges: DiagramEdge[],
  allNodes: DiagramNode[]
): string
```

**Base Fields (All Types):**
- `spec_version` - Schema version (1.0)
- `component_id` - Node ID
- `name` - Component label
- `type` - Node type
- `description` - From node.data.meta.description or AI marker
- `responsibilities` - Type-specific defaults + AI markers
- `anti_responsibilities` - Type-specific NEVER statements + AI markers
- `integration_points` - Derived from edges
- `tech_stack` - Primary tech + dependencies + references
- `constraints` - Security, performance, architecture

**Type-Specific Fields:**

| Type | Additional Fields |
|------|-------------------|
| `frontend` | `routing_strategy`, `state_management`, `accessibility`, `ui_patterns` |
| `backend` | `api_style`, `endpoint_patterns`, `error_handling` |
| `storage` | `schema_notes`, `backup_strategy`, `indexing_strategy` |
| `auth` | `auth_strategy`, `security_notes`, `providers` |
| `external` | `service_details`, `error_handling`, `rate_limits` |
| `background` | `job_queue`, `jobs` |

## Type-Specific Defaults

Each node type has comprehensive defaults:

### Responsibilities (3-4 per type)
Examples:
- **Frontend**: Render UI, handle interactions, manage state, communicate with APIs
- **Backend**: Validate inputs, enforce auth, execute business logic, return responses
- **Storage**: Persist data, provide transactions, support queries, maintain backups
- **Auth**: Authenticate users, generate tokens, enforce access control, handle recovery
- **External**: Integrate APIs, handle rate limits, transform data, manage credentials
- **Background**: Execute tasks, process queues, implement retry, monitor failures

### Anti-Responsibilities (3-4 NEVER statements per type)
Examples:
- **Frontend**: NEVER store sensitive data in localStorage, NEVER trust client validation alone
- **Backend**: NEVER render HTML, NEVER trust client IDs, NEVER expose internal errors
- **Storage**: NEVER expose direct connections, NEVER store computed values, NEVER use triggers
- **Auth**: NEVER store plain-text passwords, NEVER implement custom encryption
- **External**: NEVER store API keys in code, NEVER assume service is available
- **Background**: NEVER assume jobs run exactly once, NEVER block critical paths

### Constraints (3-5 per category per type)
Three categories: `security`, `performance`, `architecture`

Examples:
- **Backend Security**: Validate ALL inputs, use parameterized queries, implement rate limiting
- **Frontend Performance**: Lazy load routes, optimize bundle size, debounce operations
- **Storage Architecture**: Normalize to 3NF, use UUIDs for PKs, add timestamps to all tables

### Tech Stack Suggestions
- **Frontend**: React, Vue, or similar modern framework
- **Backend**: Node.js + Express, FastAPI, or similar
- **Storage**: PostgreSQL, MySQL, MongoDB, or similar
- **Auth**: JWT, OAuth2, or session-based authentication
- **External**: Official SDK for target service
- **Background**: Redis/Bull, Celery, or similar job queue

## AI Elaboration Markers

Files include `# AI:` comments indicating sections to be filled in:

**In PROJECT_RULES.md:**
- `# AI: Add 2-3 sentence description based on components and their relationships.`
- `# AI: Add project-specific constraints based on domain requirements`
- `# AI: Generate folder structure based on stack and components`

**In Component YAML:**
- `# AI: Add 2-3 sentence description based on component name and type.`
- `# AI: Elaborate based on project context and integrations`
- `# AI: Add boundaries based on integration points`
- `# AI: Add specific packages and version constraints`
- `# AI: Describe routing approach (e.g., React Router, file-based)` (frontend)
- `# AI: REST|GraphQL|gRPC|tRPC` (backend)
- `# AI: Document key entities and relationships` (storage)

## Usage Example

See `examples/template-generator-example.ts` for complete working example.

```typescript
import { generateProjectRulesTemplate, generateComponentYamlTemplate } from './template-generator'

// Generate master instruction file
const projectRules = generateProjectRulesTemplate(nodes, edges, 'My Project')
// Save to PROJECT_RULES.md

// Generate component specs
for (const node of nodes) {
  const yaml = generateComponentYamlTemplate(node, edges, nodes)
  // Save to specs/{node-label}.yaml
}
```

## Integration with Export System

This generator is intended for users without API keys who want structured templates they can manually fill in or pass to AI assistants for elaboration.

**Workflow:**
1. User creates diagram in sketch2prompt
2. User exports with "Template" option (no API key required)
3. System generates PROJECT_RULES.md + component YAMLs
4. User loads files into AI assistant (Claude, GPT-4, etc.)
5. AI fills in `# AI:` markers and generates implementation code

## Testing

Comprehensive test suite in `template-generator.test.ts`:
- 17 tests covering both functions
- Tests all 6 node types
- Verifies build order
- Validates YAML structure
- Checks type-specific fields
- Ensures AI markers are present

Run tests:
```bash
npm test template-generator.test.ts
```

## Token Efficiency

Estimated token counts:

**PROJECT_RULES.md:**
- System Overview: ~100-150 tokens
- Component Registry: ~20 tokens/component + 50 fixed
- Architecture Constraints: ~150-250 tokens
- Code Standards: ~200-300 tokens
- Build Order: ~100-150 tokens
- Integration Rules: ~100-150 tokens
- **Total (8 nodes): ~800-1,200 tokens**

**Component YAML:**
- Required fields: ~100-150 tokens
- Responsibilities: ~50-80 tokens
- Anti-responsibilities: ~80-120 tokens
- Integration points: ~30 tokens/connection
- Tech stack: ~50-100 tokens
- Constraints: ~100-150 tokens
- Type-specific fields: ~50-100 tokens
- **Total per component: ~400-700 tokens**

For an 8-node project:
- 1 PROJECT_RULES.md: ~1,000 tokens
- 8 component YAMLs: ~4,000 tokens
- **Grand total: ~5,000 tokens** (well under typical context limits)

Selective loading reduces this further since only 1-2 component specs are loaded at once during development.

## Dependencies

- `js-yaml` (v4.1.1) - YAML generation
- `@types/js-yaml` (v4.0.9) - TypeScript types
