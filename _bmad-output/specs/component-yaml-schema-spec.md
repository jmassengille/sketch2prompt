# Component YAML Schema Specification

> Spec Version: 1.0-draft
> Last Updated: 2025-12-17

## Purpose

Per-component YAML spec sheets provide **token-optimized, selectively-loadable** context for AI coding assistants. Each file describes one system component with:

1. **Identity** - What this component is
2. **Boundaries** - What it does and doesn't do
3. **Relationships** - How it connects to other components
4. **Technical context** - Stack, patterns, constraints
5. **Component-specific standards** - Conventions that override/extend project-wide rules

### Design Principles

1. **Selective loading** - Only load specs when working on that component
2. **Token-efficient** - YAML is more compact than prose
3. **Boundary-focused** - `anti_responsibilities` prevent scope creep
4. **Reference-oriented** - URLs to authoritative sources, not pinned versions
5. **Type-aware** - Different node types have different relevant fields

---

## Base Schema (All Node Types)

Every component spec includes these fields:

```yaml
# === REQUIRED FIELDS ===

spec_version: "1.0"              # Schema version for compatibility
component_id: "node-{n}"         # Matches canvas node ID
name: "{ComponentName}"          # Human-readable name
type: "{node_type}"              # frontend|backend|storage|auth|external|background

description: |
  Brief description of what this component does.
  Keep to 2-3 sentences max.

responsibilities:
  - "First core responsibility"
  - "Second core responsibility"
  - "Third core responsibility"

anti_responsibilities:            # CRITICAL: What this component MUST NOT do
  - "NEVER {forbidden action} — {reason}"
  - "NEVER {forbidden action} — {reason}"

# === RECOMMENDED FIELDS ===

integration_points:              # How this component connects to others
  - component: "{OtherComponentName}"
    relationship: "{brief description}"

tech_stack:
  primary: "{Main tech}"
  dependencies:                  # Key packages/tools (not exhaustive)
    - "{package}@{version_constraint}"
  references:                    # URLs to authoritative sources
    - url: "{url}"
      type: "package_index|official_docs|tutorial"

# === OPTIONAL FIELDS ===

constraints:                     # Component-specific rules (extend project-wide)
  security: []
  performance: []
  architecture: []

testing_notes: |
  Testing strategy for this component.

recommended_by_tier:             # Alternative tech recommendations
  free: []
  paid: []
  enterprise: []
```

---

## Type-Specific Fields

Each node type has additional relevant fields. These are **optional but recommended** for that type.

### Frontend (`type: frontend`)

```yaml
routing_strategy: "{description}"

state_management: "{approach}"

accessibility:
  - "{accessibility requirement}"

ui_patterns:
  - name: "{pattern name}"
    usage: "{when to use}"
```

### Backend (`type: backend`)

```yaml
api_style: "REST|GraphQL|gRPC|tRPC"

endpoint_patterns:
  - pattern: "{URL pattern}"
    methods: ["GET", "POST"]
    auth: "required|optional|none"

error_handling: |
  Standard error response format and handling approach.
```

### Storage (`type: storage`)

```yaml
schema_notes: |
  Key entities and relationships.

backup_strategy: "{description}"

indexing_strategy: |
  Guidelines for creating indexes.
```

### Auth (`type: auth`)

```yaml
auth_strategy: "JWT|Session|OAuth2|API_Key"

security_notes: |
  Authentication and authorization approach.

providers:                       # If using OAuth
  - name: "{provider}"
    scopes: ["email", "profile"]
```

### External (`type: external`)

```yaml
service_details:
  provider: "{service name}"
  api_version: "{version}"
  environment: "{dev/staging/prod notes}"

error_handling:
  - "{how to handle failures}"

rate_limits:
  - "{limit description}"
```

### Background (`type: background`)

```yaml
job_queue: "{queue technology}"

jobs:
  - name: "{job_name}"
    trigger: "Event-driven|Cron"
    frequency: "{schedule or event}"
    retry_policy: "{retry approach}"
```

---

## Code Standards Integration

Component specs can override or extend project-wide code standards defined in `PROJECT_RULES.md`.

### Inheritance Model

```
PROJECT_RULES.md (project-wide defaults)
    └── component.yaml (component-specific overrides)
```

### Override Syntax

```yaml
# In component YAML
code_standards:
  # Extend project-wide naming conventions for this component
  naming:
    extend: true                 # Keep project defaults
    overrides:
      - context: "API handlers"
        pattern: "handle{Resource}{Action}"  # e.g., handleUserCreate
      - context: "Database queries"
        pattern: "{action}{Resource}"        # e.g., findUserById

  # Component-specific patterns not in project-wide rules
  patterns:
    - name: "Repository pattern"
      description: "All DB access through repository classes"
      example: |
        class UserRepository {
          async findById(id: string): Promise<User | null>
          async create(data: CreateUserDTO): Promise<User>
        }
```

### When to Use Component-Level Standards

| Use Component Standards For | Keep in PROJECT_RULES.md |
|-----------------------------|--------------------------|
| Component-specific patterns | Global naming conventions |
| Tech-specific idioms | Forbidden patterns |
| Domain-specific naming | File organization |
| Override for good reason | Dependency policy |

---

## Complete Examples

### Example 1: REST API (Backend)

```yaml
spec_version: "1.0"
component_id: "node-2"
name: "REST API"
type: "backend"

description: |
  Node.js API server handling all business logic, data validation,
  and database operations. Single source of truth for data mutations.

responsibilities:
  - "Validate all incoming request payloads"
  - "Enforce authentication and authorization on protected endpoints"
  - "Execute business logic for sales pipeline operations"
  - "Transform data between frontend shapes and database schemas"
  - "Return consistent error responses with actionable messages"

anti_responsibilities:
  - "NEVER render HTML or serve static files — API-only, frontend handles UI"
  - "NEVER store session state on server — stateless JWT auth only"
  - "NEVER trust client-provided IDs for authorization — always verify ownership"
  - "NEVER expose internal errors to clients — log internally, return safe messages"
  - "NEVER make decisions about UI/UX — return data, frontend decides display"

integration_points:
  - component: "PostgreSQL Database"
    relationship: "Reads/writes all business data via Prisma ORM"
  - component: "User Authentication"
    relationship: "Validates JWT tokens, extracts user context"
  - component: "React Dashboard"
    relationship: "Receives HTTP requests, returns JSON responses"
  - component: "Stripe Integration"
    relationship: "Initiates payment flows, processes webhooks"

tech_stack:
  primary: "Node.js 20 + Express.js"
  dependencies:
    - "express@4.x"
    - "prisma@5.x"
    - "zod@3.x (validation)"
    - "jsonwebtoken@9.x"
    - "helmet@7.x (security headers)"
  references:
    - url: "https://www.npmjs.com/package/express"
      type: "package_index"
    - url: "https://expressjs.com/en/guide/routing.html"
      type: "official_docs"
    - url: "https://www.prisma.io/docs"
      type: "official_docs"

api_style: "REST"

endpoint_patterns:
  - pattern: "/api/v1/{resource}"
    methods: ["GET", "POST"]
    auth: "required"
  - pattern: "/api/v1/{resource}/{id}"
    methods: ["GET", "PATCH", "DELETE"]
    auth: "required"
  - pattern: "/api/v1/auth/{action}"
    methods: ["POST"]
    auth: "none"

error_handling: |
  All errors return shape: { error: string, code: string, details?: object }

  HTTP codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (server)

  Never expose stack traces in production.

constraints:
  security:
    - "Validate ALL inputs with Zod schemas before processing"
    - "Use parameterized queries only (Prisma handles this)"
    - "Rate limit auth endpoints: 10 req/min per IP"
    - "CORS whitelist frontend domain only"

  performance:
    - "Database queries must complete in <100ms (add indexes as needed)"
    - "Paginate all list endpoints (max 100 per page)"
    - "Use connection pooling (Prisma default)"

  architecture:
    - "Controllers thin, services thick — business logic in /services"
    - "One file per resource: users.controller.ts, users.service.ts"
    - "Shared validation schemas in /schemas"

code_standards:
  naming:
    extend: true
    overrides:
      - context: "Controllers"
        pattern: "{resource}.controller.ts"
      - context: "Services"
        pattern: "{resource}.service.ts"
      - context: "Route handlers"
        pattern: "{verb}{Resource} (e.g., getUser, createDeal)"

  patterns:
    - name: "Service layer"
      description: "All business logic in service classes, controllers only route"
      example: |
        // Controller (thin)
        router.get('/deals/:id', async (req, res) => {
          const deal = await dealService.getById(req.params.id);
          res.json(deal);
        });

        // Service (thick)
        class DealService {
          async getById(id: string): Promise<Deal> {
            // validation, authorization, business logic here
          }
        }

testing_notes: |
  - Unit test all service methods (mock Prisma)
  - Integration test key endpoints with test database
  - Contract tests for API response shapes

recommended_by_tier:
  free:
    - "Express.js — simple, well-documented, huge ecosystem"
    - "Fastify — faster, modern API, good TypeScript support"
  paid:
    - "NestJS — enterprise patterns, dependency injection, decorators"
  enterprise:
    - "NestJS + GraphQL — type-safe API with code-first schemas"
```

### Example 2: PostgreSQL Database (Storage)

```yaml
spec_version: "1.0"
component_id: "node-3"
name: "PostgreSQL Database"
type: "storage"

description: |
  Primary data store for all business entities. Accessed exclusively
  through the REST API via Prisma ORM.

responsibilities:
  - "Persist all business data (users, deals, metrics)"
  - "Enforce referential integrity via foreign keys"
  - "Provide transactional guarantees for multi-step operations"
  - "Support efficient queries via proper indexing"

anti_responsibilities:
  - "NEVER expose direct connections to frontend — API is the gateway"
  - "NEVER store computed values that can be derived — calculate at query time"
  - "NEVER use database triggers for business logic — keep in application layer"
  - "NEVER store files/blobs — use object storage (S3) and store URLs"

integration_points:
  - component: "REST API"
    relationship: "Exclusive access via Prisma ORM"

tech_stack:
  primary: "PostgreSQL 16"
  dependencies:
    - "prisma@5.x (ORM)"
  references:
    - url: "https://www.postgresql.org/docs/16/"
      type: "official_docs"
    - url: "https://www.prisma.io/docs/orm"
      type: "official_docs"

schema_notes: |
  Core entities:
  - users: id (UUID), email, password_hash, created_at, updated_at
  - deals: id (UUID), user_id (FK), title, amount, stage, created_at
  - activities: id (UUID), deal_id (FK), type, notes, timestamp

  Naming conventions:
  - Tables: plural snake_case (users, deals)
  - Columns: singular snake_case (user_id, created_at)
  - Indexes: idx_{table}_{columns}
  - Foreign keys: fk_{table}_{referenced_table}

backup_strategy: |
  - Automated daily backups via hosting provider
  - 30-day retention for point-in-time recovery
  - Test restore procedure monthly

indexing_strategy: |
  Required indexes:
  - All foreign keys (auto-created by some ORMs, verify)
  - Frequently filtered columns (stage, user_id + created_at)
  - Unique constraints (email in users)

  Add indexes reactively: analyze slow queries before adding.

constraints:
  architecture:
    - "Use UUIDs for all primary keys (not auto-increment)"
    - "All tables have created_at and updated_at timestamps"
    - "Soft delete via deleted_at column (nullable timestamp)"
    - "Normalize to 3NF, denormalize only with measured need"

  security:
    - "Application user has minimal privileges (no DROP, TRUNCATE)"
    - "Encrypt sensitive columns at rest (Prisma encryption extension)"
    - "Audit log for sensitive data access"

testing_notes: |
  - Use separate test database with same schema
  - Reset between test suites (truncate, not drop/recreate)
  - Seed data for integration tests

recommended_by_tier:
  free:
    - "PostgreSQL — feature-rich, JSON support, free everywhere"
    - "SQLite — zero-config for prototypes, file-based"
  paid:
    - "PlanetScale (MySQL) — serverless, branching workflows"
    - "Neon (Postgres) — serverless, auto-scaling"
  enterprise:
    - "Amazon Aurora — managed, multi-region, auto-scaling"
```

---

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `spec_version` | string | Schema version (e.g., "1.0") |
| `component_id` | string | Matches canvas node ID (e.g., "node-2") |
| `name` | string | Human-readable component name |
| `type` | enum | One of: frontend, backend, storage, auth, external, background |
| `description` | string | 2-3 sentence description |
| `responsibilities` | string[] | What this component does (3-5 items) |
| `anti_responsibilities` | string[] | What this component MUST NOT do (3-5 items) |

### Recommended Fields

| Field | Type | Description |
|-------|------|-------------|
| `integration_points` | array | Connections to other components |
| `tech_stack` | object | Primary tech, dependencies, reference URLs |
| `constraints` | object | Security, performance, architecture rules |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `code_standards` | object | Component-specific naming/patterns |
| `testing_notes` | string | Testing strategy |
| `recommended_by_tier` | object | Alternative tech by price tier |

---

## Token Analysis

| Section | Est. Tokens | Notes |
|---------|-------------|-------|
| Required fields | ~100-150 | Fixed per component |
| Responsibilities | ~50-80 | 3-5 items typical |
| Anti-responsibilities | ~80-120 | Critical, be thorough |
| Integration points | ~30/connection | Scales with connections |
| Tech stack | ~50-100 | Including references |
| Constraints | ~100-150 | Optional but valuable |
| Type-specific fields | ~50-100 | Varies by type |
| **Total per component** | **~400-700** | Well-optimized for selective loading |

For an 8-node project: **~3,200-5,600 tokens** if all specs loaded (but selective loading means typically only 1-2 loaded at once).

---

## Validation Rules

When Sketch2Prompt exports, validate:

1. **Required fields present** - All required fields must exist
2. **Type matches allowed values** - One of 6 node types
3. **Anti-responsibilities non-empty** - At least 2 items (the key differentiator)
4. **References are valid URLs** - Basic URL format validation
5. **Component IDs unique** - No duplicate IDs across specs

---

## Generation Rules

When Sketch2Prompt generates component specs:

1. **From canvas node**: Extract `component_id`, `name`, `type`
2. **From description field**: Populate `description`
3. **From node type**: Add type-specific field templates
4. **From inspector (v1.1)**: Populate additional fields
5. **Default anti_responsibilities**: Generate based on node type
6. **Default tech_stack**: Suggest based on node type + project stack
7. **Default constraints**: Include type-appropriate security/performance defaults

---

*This schema will be implemented in Sketch2Prompt v1 export generation.*
