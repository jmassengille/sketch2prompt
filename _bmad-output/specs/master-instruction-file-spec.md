# Master Instruction File Specification

> Spec Version: 1.0-draft
> Last Updated: 2025-12-17

## Purpose

The **Master Instruction File** (tentatively `PROJECT_RULES.md`) is an all-encompassing document that AI coding assistants load **FIRST** before any other context. It establishes:

1. **System context** - What the project is and isn't
2. **Component registry** - Index of all spec files
3. **High-level guardrails** - MUST/NEVER constraints
4. **Code standards** - Project-wide conventions
5. **Integration guidance** - How specs relate to each other

### Design Principles

1. **Load-first architecture** - This file is always loaded; component specs are selectively loaded
2. **Token-conscious** - Compact but complete; no verbose explanations
3. **Model-agnostic** - Works across Claude, GPT, Gemini, etc.
4. **Constraint-focused** - Tells AI what NOT to do, not just what to do
5. **Self-contained** - No external dependencies to understand the rules

---

## File Structure

```markdown
# {PROJECT_NAME} - System Rules

## System Overview
{1-3 sentence project description}

## Component Registry
{Table of all components with paths to spec files}

## Architecture Constraints
{High-level MUST/NEVER rules}

## Code Standards
{Project-wide conventions}

## Build Order
{Recommended implementation sequence}

## Integration Rules
{How components should interact}
```

---

## Section Specifications

### 1. System Overview

**Purpose**: Establish project identity and scope in minimal tokens.

**Format**:
```markdown
## System Overview

**Project**: {name}
**Type**: {web app | mobile app | API | CLI | library | etc.}
**Stack**: {primary tech stack summary}

{1-3 sentence description of what the system does}

### Boundaries

This system IS:
- {explicit inclusion}
- {explicit inclusion}

This system IS NOT:
- {explicit exclusion}
- {explicit exclusion}
```

**Example**:
```markdown
## System Overview

**Project**: SalesTracker Pro
**Type**: Full-stack web application
**Stack**: React 19 + Node.js + PostgreSQL

A sales pipeline management tool for small teams with reporting and forecasting capabilities.

### Boundaries

This system IS:
- A CRUD application for sales pipeline data
- A reporting dashboard for sales metrics
- A team collaboration tool with shared views

This system IS NOT:
- A CRM (no marketing automation, email campaigns)
- An accounting system (no invoicing, payments)
- A mobile app (web-responsive only)
```

**Token Budget**: ~100-150 tokens

---

### 2. Component Registry

**Purpose**: Index all component spec files for selective loading.

**Format**:
```markdown
## Component Registry

| ID | Component | Type | Spec File | Status |
|----|-----------|------|-----------|--------|
| {node-id} | {name} | {type} | `specs/{filename}.yaml` | {active|planned|deprecated} |

### Loading Instructions

Load component specs **only when working on that component**. Do not preload all specs.

Cross-reference format: `[component-id]` (e.g., [node-2] references the API component)
```

**Example**:
```markdown
## Component Registry

| ID | Component | Type | Spec File | Status |
|----|-----------|------|-----------|--------|
| node-1 | React Dashboard | frontend | `specs/react-dashboard.yaml` | active |
| node-2 | REST API | backend | `specs/rest-api.yaml` | active |
| node-3 | PostgreSQL | storage | `specs/postgresql.yaml` | active |
| node-4 | Auth Service | auth | `specs/auth-service.yaml` | active |
| node-5 | Stripe Integration | external | `specs/stripe-integration.yaml` | planned |

### Loading Instructions

Load component specs **only when working on that component**. Do not preload all specs.

Cross-reference format: `[component-id]` (e.g., [node-2] references the API component)
```

**Token Budget**: ~20 tokens per component + 50 fixed

---

### 3. Architecture Constraints

**Purpose**: High-level rules that apply across ALL components. These are non-negotiable.

**Format**:
```markdown
## Architecture Constraints

### ALWAYS (Required)

- {constraint with rationale}
- {constraint with rationale}

### NEVER (Forbidden)

- {constraint with rationale}
- {constraint with rationale}

### PREFER (Encouraged)

- {pattern} over {anti-pattern} — {rationale}
```

**Example**:
```markdown
## Architecture Constraints

### ALWAYS (Required)

- Validate all inputs at system boundaries (API endpoints, form submissions)
- Use environment variables for all configuration (never hardcode)
- Log structured JSON for all errors (timestamp, level, message, context)
- Return consistent error shapes from API: `{ error: string, code: string, details?: object }`

### NEVER (Forbidden)

- Store secrets in code or version control
- Use `any` type in TypeScript (use `unknown` + type guards)
- Make synchronous database calls in request handlers
- Expose internal IDs in URLs (use UUIDs or slugs)
- Trust client-side validation alone (always re-validate server-side)

### PREFER (Encouraged)

- Composition over inheritance — easier to test and modify
- Named exports over default exports — better refactoring support
- Early returns over nested conditionals — clearer control flow
- Explicit dependencies over global imports — aids testing
```

**Token Budget**: ~150-250 tokens

---

### 4. Code Standards

**Purpose**: Project-wide conventions that ensure consistency.

**Format**:
```markdown
## Code Standards

### Naming Conventions

- Files: {convention}
- Components: {convention}
- Functions: {convention}
- Constants: {convention}
- Types: {convention}

### File Organization

{Brief description of folder structure expectations}

### Patterns

#### {Pattern Name}
{Brief description + code example if needed}

### Dependencies Policy

- Prefer: {packages/approaches}
- Avoid: {packages/approaches}
- Before adding: {checklist}
```

**Example**:
```markdown
## Code Standards

### Naming Conventions

- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Components: `PascalCase` (e.g., `SalesDashboard`)
- Functions: `camelCase` with verb prefix (e.g., `getSalesData`, `validateInput`)
- Constants: `SCREAMING_SNAKE_CASE` for true constants
- Types: `PascalCase` with descriptive suffix (e.g., `SalesRecordDTO`, `UserCreateInput`)

### File Organization

```
/src
  /components    - React components (one per file, colocate styles)
  /hooks         - Custom React hooks (use-prefixed)
  /services      - API clients and business logic
  /types         - Shared TypeScript types
  /utils         - Pure utility functions
  /constants     - App-wide constants
```

### Patterns

#### Data Fetching
Use React Query for server state. Shape:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['sales', filters],
  queryFn: () => salesService.getFiltered(filters)
});
```

#### Error Boundaries
Wrap route-level components in error boundaries. Use `react-error-boundary` package.

### Dependencies Policy

- Prefer: Established packages with >10k weekly downloads, active maintenance
- Avoid: Packages with no updates in 12+ months, security vulnerabilities
- Before adding: Check bundle size impact, verify React 19 compatibility
```

**Token Budget**: ~200-300 tokens

---

### 5. Build Order

**Purpose**: Recommended implementation sequence based on dependencies.

**Format**:
```markdown
## Build Order

Implementation sequence based on dependency graph:

### Phase 1: Foundation
- [ ] {component} — {brief rationale}

### Phase 2: Core Features
- [ ] {component} — {brief rationale}

### Phase 3: Integration
- [ ] {component} — {brief rationale}

### Phase 4: Polish
- [ ] {component} — {brief rationale}
```

**Example**:
```markdown
## Build Order

Implementation sequence based on dependency graph:

### Phase 1: Foundation
- [ ] [node-3] PostgreSQL — Schema and migrations first (everything depends on data)
- [ ] [node-4] Auth Service — Authentication before protected features

### Phase 2: Core Features
- [ ] [node-2] REST API — Business logic and data access
- [ ] [node-1] React Dashboard — UI consuming the API

### Phase 3: Integration
- [ ] [node-5] Stripe Integration — Payment processing last (optional for MVP)

### Phase 4: Polish
- [ ] Error handling standardization
- [ ] Performance optimization
- [ ] Monitoring and logging
```

**Token Budget**: ~100-150 tokens

---

### 6. Integration Rules

**Purpose**: Define how components should communicate.

**Format**:
```markdown
## Integration Rules

### Communication Patterns

| From | To | Pattern | Notes |
|------|----|---------|-------|
| {component} | {component} | {pattern} | {constraint} |

### Shared Contracts

{Description of shared types, API contracts, or data shapes}

### Forbidden Integrations

- {component} MUST NOT directly access {component} — {reason}
```

**Example**:
```markdown
## Integration Rules

### Communication Patterns

| From | To | Pattern | Notes |
|------|----|---------|-------|
| React Dashboard | REST API | HTTP via fetch | Use typed API client |
| REST API | PostgreSQL | Prisma ORM | No raw SQL in handlers |
| REST API | Stripe | Official SDK | Webhook verification required |
| Auth Service | REST API | JWT validation | Middleware, not per-route |

### Shared Contracts

API response types defined in `/src/types/api.ts`. Frontend and backend share these types.

### Forbidden Integrations

- React Dashboard MUST NOT directly access PostgreSQL — all data through API
- Background jobs MUST NOT import React components — separate concerns
```

**Token Budget**: ~100-150 tokens

---

## Complete Example

```markdown
# SalesTracker Pro - System Rules

## System Overview

**Project**: SalesTracker Pro
**Type**: Full-stack web application
**Stack**: React 19 + Node.js + PostgreSQL

A sales pipeline management tool for small teams with reporting and forecasting.

### Boundaries

This system IS:
- A CRUD application for sales pipeline data
- A reporting dashboard for sales metrics

This system IS NOT:
- A CRM (no marketing automation)
- An accounting system (no invoicing)

---

## Component Registry

| ID | Component | Type | Spec File | Status |
|----|-----------|------|-----------|--------|
| node-1 | React Dashboard | frontend | `specs/react-dashboard.yaml` | active |
| node-2 | REST API | backend | `specs/rest-api.yaml` | active |
| node-3 | PostgreSQL | storage | `specs/postgresql.yaml` | active |
| node-4 | Auth Service | auth | `specs/auth-service.yaml` | active |

Load component specs only when working on that component.

---

## Architecture Constraints

### ALWAYS
- Validate inputs at API boundaries
- Use environment variables for config
- Return consistent error shapes: `{ error, code, details? }`

### NEVER
- Store secrets in code
- Use `any` type (use `unknown` + guards)
- Trust client-side validation alone

### PREFER
- Composition over inheritance
- Named exports over default
- Early returns over nesting

---

## Code Standards

### Naming
- Files: `kebab-case.ts`, `PascalCase.tsx`
- Functions: `camelCase` with verb prefix
- Types: `PascalCase` with suffix

### Patterns
- Data fetching: React Query
- Error handling: Error boundaries at route level
- State: Zustand for client state, React Query for server state

### Dependencies
Check bundle size and React 19 compatibility before adding.

---

## Build Order

1. [node-3] PostgreSQL — Schema first
2. [node-4] Auth Service — Auth before features
3. [node-2] REST API — Business logic
4. [node-1] React Dashboard — UI last

---

## Integration Rules

| From | To | Pattern |
|------|----|---------|
| Dashboard | API | HTTP fetch with typed client |
| API | PostgreSQL | Prisma ORM |
| API | Auth | JWT middleware |

### Forbidden
- Dashboard MUST NOT access PostgreSQL directly
```

---

## Token Analysis

| Section | Est. Tokens | Notes |
|---------|-------------|-------|
| System Overview | 100-150 | Fixed per project |
| Component Registry | 20/component + 50 | Scales with nodes |
| Architecture Constraints | 150-250 | Can be expanded |
| Code Standards | 200-300 | Varies by project |
| Build Order | 100-150 | Scales with nodes |
| Integration Rules | 100-150 | Scales with connections |
| **Total (8 nodes)** | **~800-1200** | Well under context limits |

---

## Generation Rules

When Sketch2Prompt generates this file:

1. **System Overview**: Derive from user's project description + node summaries
2. **Component Registry**: Auto-generate from canvas nodes
3. **Architecture Constraints**:
   - Default set based on stack detection (React, Node, etc.)
   - User can customize via inspector (v1.1)
4. **Code Standards**:
   - Default set based on detected stack
   - User can customize via inspector (v1.1)
5. **Build Order**: Compute from node types (storage → auth → backend → frontend → external)
6. **Integration Rules**: Derive from `integration_points` in component specs

---

## File Naming Options

Considered names:
- `PROJECT_RULES.md` - Clear but generic
- `SYSTEM_SPEC.md` - Technical, spec-focused
- `AI_INSTRUCTIONS.md` - Explicit purpose
- `CLAUDE.md` - Following Claude convention (could cause confusion)
- `BLUEPRINT.md` - Matches "blueprint" metaphor

**Recommendation**: `PROJECT_RULES.md` — Clear, authoritative, no ambiguity.

---

## Open Questions

1. Should guardrails have severity levels (MUST vs SHOULD)?
2. Should we support multiple code standards presets (strict, relaxed)?
3. Include version/date header for cache busting?
4. Support for custom user sections?

---

*This spec will be implemented in Sketch2Prompt v1 export generation.*
