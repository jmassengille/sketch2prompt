# Sketch2Prompt v1: Brainstorming & Proposal

**Document Status**: Brainstorming Complete - Awaiting User Decision
**Created**: 2025-12-17
**Purpose**: Complete brainstorming session with concrete v1 proposal for multi-file YAML export

---

## 1. Executive Summary

### What v1 Should Include

**Core Value Proposition**: Transform builder's system diagram into token-optimized, per-component YAML spec sheets that CONSTRAIN AI behavior and reduce follow-up prompt length.

**Target Users**: IDE-integrated assistants (Cursor, Windsurf, Copilot) - NOT terminal agentic users.

**Key v1 Features**:
1. Per-component YAML spec sheets (not monolithic prompt)
2. Token-optimized structure for AI consumption
3. Model-agnostic constraint language (Claude, GPT, Gemini)
4. URL templates to authoritative sources (web search assumed)
5. Curated tech recommendations by price tier
6. Free tier with abuse prevention (node limits)

**What v1 Explicitly Excludes**:
- No edge topology parsing (edges remain visualization-only)
- No hardcoded version pinning (URL templates instead)
- No complex LLM review at export (save for post-v1)
- No user-configurable tech lists (app-curated only in v1)

---

## 2. Question Storm Results

### Category A: Multi-File Export Architecture

**Q1**: Should each component export to its own YAML file or grouped by type?
**Analysis**: Per-component = better modularity, selective loading. Type grouping = fewer files but loses granularity.

**Q2**: What directory structure emerges from export?
**Options**:
- Flat: `project-spec/component-name.yaml`
- Typed: `project-spec/frontend/landing-page.yaml`
- Phased: `project-spec/phase-1-storage/postgres-db.yaml`

**Q3**: Do we need a manifest/index file at the root?
**Analysis**: YES - manifest provides system overview, component registry, build order without parsing all files.

**Q4**: How does manifest reference individual specs?
**Options**: Relative paths, component IDs, or both?

**Q5**: Can specs be partially loaded (e.g., just auth components)?
**Analysis**: YES if per-file structure + manifest exists. Critical for token optimization.

**Q6**: How do we handle name collisions in export?
**Solution**: Sanitize labels to filenames, append node ID if collision detected.

**Q7**: Should export be a ZIP download or folder structure?
**v1 Recommendation**: ZIP with predictable structure inside. Browser-friendly, no backend needed.

**Q8**: Does export include a README for human reviewers?
**Analysis**: YES - auto-generated README.md explaining structure and usage.

---

### Category B: URL Template Strategy

**Q9**: Which authoritative sources per ecosystem?
**Mapping**:
- Python packages → `https://pypi.org/project/{package}/`
- npm packages → `https://www.npmjs.com/package/{package}`
- Ruby gems → `https://rubygems.org/gems/{package}`
- Databases → Official docs (postgres.org, mongodb.com/docs)
- Cloud services → Provider docs (aws.amazon.com, cloud.google.com)

**Q10**: Should URLs point to package index or official docs?
**Analysis**: Package index for discovery, official docs for implementation. Provide both.

**Q11**: How to handle packages with non-obvious docs URLs?
**Solution**: Curated mapping for common services (e.g., Stripe → `https://docs.stripe.com/api`)

**Q12**: Do we provide "latest stable" search URLs vs direct links?
**Analysis**: Direct package index links are better - AI can check versions via web search.

**Q13**: Should we include ecosystem-specific tooling links?
**Examples**: `npx create-react-app`, `poetry new`, `rails new`
**v1 Recommendation**: YES - include common bootstrap commands per node type.

**Q14**: How to handle proprietary/paid services without public docs?
**Solution**: Include placeholder comment: `# Docs: Contact vendor or check internal wiki`

---

### Category C: Model-Agnostic Constraint Language

**Q15**: What prompt patterns work across Claude, GPT, and Gemini?
**Research**: Imperative constraints ("MUST", "NEVER"), bulleted lists, and explicit anti-patterns.

**Q16**: Should we use structured XML-style tags or natural language?
**Analysis**: Natural language in YAML is more universally parseable. Avoid XML tags.

**Q17**: How explicit should field names be for model parsing?
**Solution**: Use semantic keys: `responsibilities`, `anti_responsibilities`, `integration_points`.

**Q18**: Do we need a schema version in each file for future evolution?
**v1 Recommendation**: YES - `spec_version: "1.0"` in every YAML file.

**Q19**: Should constraints be freeform text or structured enums?
**Analysis**: Hybrid - use enums for known patterns (node_type), freeform for descriptions.

**Q20**: How to encode "this component does NOT do X"?
**Solution**: Explicit `anti_responsibilities` field to freeze boundaries.

**Q21**: Can we include example prompts per component?
**v1 Recommendation**: NO - increases token bloat. Save for v2 or separate guide.

---

### Category D: Free Tier Guardrails

**Q22**: What are reasonable node limits for free tier?
**Recommendation**: 8 nodes max (each node is high-level, represents significant work; prevents abuse).

**Q23**: Should export frequency be rate-limited?
**Analysis**: YES if server-side; NO for v1 (client-only). Save for hosted version.

**Q24**: Do we watermark free tier exports?
**v1 Recommendation**: NO - but include `generated_by: "Sketch2Prompt v1.0"` in manifest.

**Q25**: Should free tier exports be public/searchable?
**Analysis**: NO - no backend in v1, purely local exports.

**Q26**: Can we enforce node limits without backend validation?
**Solution**: UI disables "Add Node" button at limit, export grays out if over limit.

**Q27**: How to communicate limits without feeling restrictive?
**UX**: "12 components recommended for optimal AI performance" (not "limit reached").

---

### Category E: Schema Design Per Node Type

**Q28**: Do all 6 node types share a common base schema?
**Analysis**: YES - common fields (id, name, type, responsibilities), type-specific extensions.

**Q29**: What fields are REQUIRED vs OPTIONAL?
**Required**: `id`, `name`, `type`, `responsibilities`
**Optional**: `description`, `tech_stack`, `integration_points`, `anti_responsibilities`

**Q30**: Should tech stack be structured or freeform?
**v1 Recommendation**: Structured with freeform fallback:
```yaml
tech_stack:
  primary: "React 19"
  dependencies: ["tailwindcss", "zustand"]
  notes: "Optional freeform text"
```

**Q31**: How to represent integration points without edges?
**Solution**: `integration_points` field lists WHAT it connects to (by name), not HOW.

**Q32**: Should each node reference the system-level intent?
**Analysis**: YES - manifest includes system intent, each component references it contextually.

**Q33**: Do we need different schemas for frontend vs backend vs storage?
**v1 Recommendation**: Unified schema with type-specific recommended fields.

---

### Category F: Code Standards & Conventions

**Q34**: Should code standards be per-component or project-wide?
**Analysis**: Project-wide in manifest, component-specific overrides in individual specs.

**Q35**: How to encode naming conventions?
**Solution**: Manifest includes `code_standards.naming_conventions` field.

**Q36**: Should linting/formatting preferences be included?
**v1 Recommendation**: NO - out of scope. Focus on architectural constraints.

**Q37**: Do we include test requirements per component?
**Analysis**: Optional `testing_notes` field for critical components (auth, storage).

**Q38**: How to specify API contracts between components?
**Solution**: Backend nodes include `api_contract` field with endpoint patterns.

---

### Category G: Opinionated Recommendations

**Q39**: How opinionated should tech recommendations be?
**v1 Stance**: Prescriptive for security-critical (auth), suggestive for others.

**Q40**: Should we recommend against certain technologies?
**Analysis**: YES - `anti_patterns` field can list deprecated or insecure approaches.

**Q41**: How to categorize recommendations by price tier?
**Structure**:
```yaml
recommendations:
  free: ["PostgreSQL", "Supabase Auth"]
  paid: ["Auth0", "AWS RDS"]
  enterprise: ["Okta", "Oracle"]
```

**Q42**: Can users override recommendations?
**v1 Recommendation**: YES - recommendations are suggestions, not locked choices.

**Q43**: Should recommendations include pros/cons?
**Analysis**: NO for v1 - token bloat. Just list options by tier.

**Q44**: Do we recommend specific versions or "latest stable"?
**Solution**: Link to package index, let AI/user check latest.

---

### Category H: Export Flow & User Experience

**Q45**: What triggers an export (button click, auto-export on change)?
**v1 Recommendation**: Manual "Export" button with preview drawer.

**Q46**: Should users see a preview before download?
**Analysis**: YES - preview drawer shows file tree and sample YAML.

**Q47**: Can users customize export format (YAML vs JSON vs TOML)?
**v1 Recommendation**: YAML only. JSON/TOML for v2 if demand exists.

**Q48**: Should export include the original diagram JSON?
**Analysis**: YES - include `diagram.json` in ZIP for re-import.

**Q49**: How to handle export of incomplete diagrams (e.g., nodes with no description)?
**Solution**: Validation warnings in UI, export includes `# TODO: Add description`.

**Q50**: Should there be "quick export" vs "smart export" modes?
**v1 Recommendation**: Single export mode, defer LLM-enhanced export to v2.

---

## 3. First Principles Analysis

### Core Question: What is the MINIMUM information to freeze a component's boundaries?

**Answer**: A component's boundary is frozen when an AI knows:
1. **WHAT it is** (name, type)
2. **WHY it exists** (responsibilities)
3. **WHAT it is NOT** (anti-responsibilities)
4. **WHO it talks to** (integration points)
5. **HOW to build it** (tech stack, constraints)

**First Principle 1: Constraints > Descriptions**
A spec that says "NEVER store plaintext passwords" is more valuable than "handles user authentication."

**First Principle 2: Token Efficiency = Semantic Density**
Every field must answer a question the AI would otherwise ask.
If a field doesn't reduce follow-up prompts, cut it.

**First Principle 3: Boundaries > Implementation**
The spec defines WHAT and WHY, not HOW.
"Use bcrypt for passwords" is a constraint, not an implementation.

**First Principle 4: Anti-Patterns Prevent Invention**
Explicitly stating what NOT to do prevents AI from "being helpful" in harmful ways.

**First Principle 5: Universal Parsing Requires Semantic Keys**
Field names must be self-documenting: `responsibilities` not `resp`, `tech_stack` not `stack`.

---

### What Makes a Spec Universally Parseable Across Models?

**Universal Parsing Requirements**:
1. **Structured YAML** - All models parse YAML natively
2. **Semantic field names** - `integration_points` not `connects_to`
3. **Flat hierarchy** - Avoid deep nesting (max 2 levels)
4. **Consistent terminology** - Use same terms across all specs
5. **Explicit not implicit** - State constraints directly, don't rely on inference

**Model-Specific Quirks to Avoid**:
- Claude handles nested reasoning better - but don't rely on it
- GPT prefers explicit lists - use bullets for responsibilities
- Gemini excels at pattern matching - provide example patterns where helpful

**v1 Strategy**: Design for the LOWEST common denominator (explicit bullets, flat structure), not the most advanced model.

---

### If an AI Only Had This YAML, What Could It NOT Invent?

**Scenario**: Frontend component spec for "Landing Page"

**With Good Spec, AI Cannot Invent**:
- Whether to use React, Vue, or vanilla JS (tech_stack specifies it)
- Whether to include authentication UI (integration_points lists dependencies)
- Whether to fetch data directly or via API (anti_responsibilities says "NEVER direct DB access")
- Which styling approach to use (constraints specify "Tailwind CSS only")
- Which routing library (tech_stack includes "React Router")

**Without These Fields, AI Will Invent**:
- Framework choice (defaults to what it "knows")
- Data fetching strategy (guesses based on common patterns)
- Styling approach (uses what's popular in training data)
- Responsibilities beyond the vague "landing page"

**Conclusion**: The spec must explicitly freeze ALL architectural decisions, even seemingly obvious ones.

---

## 4. Solution Matrix Tables

### Matrix 1: Node Types × Spec Fields

| Field | Frontend | Backend | Storage | Auth | External | Background |
|-------|----------|---------|---------|------|----------|------------|
| `id` | Required | Required | Required | Required | Required | Required |
| `name` | Required | Required | Required | Required | Required | Required |
| `type` | Required | Required | Required | Required | Required | Required |
| `description` | Optional | Optional | Optional | Optional | Optional | Optional |
| `responsibilities` | Required | Required | Required | Required | Required | Required |
| `anti_responsibilities` | Recommended | Recommended | Required | Required | Required | Recommended |
| `tech_stack` | Required | Required | Required | Required | Required | Required |
| `integration_points` | Recommended | Required | Required | Required | Required | Recommended |
| `constraints` | Recommended | Required | Required | Required | Required | Recommended |
| `api_contract` | N/A | Required | N/A | Recommended | N/A | N/A |
| `schema_notes` | N/A | N/A | Required | N/A | N/A | N/A |
| `security_notes` | Recommended | Required | Required | Required | Required | N/A |
| `testing_notes` | Optional | Optional | Recommended | Required | Optional | Optional |

**Legend**:
- **Required**: Export validation enforces presence
- **Recommended**: Pre-filled template, user should complete
- **Optional**: Available but not pushed
- **N/A**: Not applicable for this node type

---

### Matrix 2: Ecosystem × Authoritative Source

| Ecosystem | Package Index | Official Docs | Bootstrap Command |
|-----------|---------------|---------------|-------------------|
| **JavaScript/npm** | `https://www.npmjs.com/package/{pkg}` | Package README | `npm create vite@latest` |
| **Python/pip** | `https://pypi.org/project/{pkg}/` | Package docs link | `poetry new {project}` |
| **Ruby/gems** | `https://rubygems.org/gems/{pkg}` | RubyDoc | `rails new {project}` |
| **Go/modules** | `https://pkg.go.dev/{module}` | pkg.go.dev | `go mod init {module}` |
| **Databases** | N/A | Official site | Installation guide |
| **PostgreSQL** | N/A | `https://www.postgresql.org/docs/` | `initdb` |
| **MongoDB** | N/A | `https://www.mongodb.com/docs/` | `mongod` |
| **Redis** | N/A | `https://redis.io/docs/` | `redis-server` |
| **Cloud/AWS** | N/A | `https://docs.aws.amazon.com/` | `aws configure` |
| **Cloud/GCP** | N/A | `https://cloud.google.com/docs` | `gcloud init` |
| **SaaS** | N/A | Vendor docs | API key setup |
| **Stripe** | N/A | `https://docs.stripe.com/api` | Dashboard setup |
| **Twilio** | N/A | `https://www.twilio.com/docs` | Console setup |

---

### Matrix 3: User Action × Export Output

| User Action | Export Output | Files Generated |
|-------------|---------------|-----------------|
| Click "Export" | ZIP download | See file tree below |
| 0 nodes | Error modal | N/A (export disabled) |
| 1-8 nodes | Success | Full export |
| >8 nodes (free tier) | Warning modal | Blocked (upgrade prompt) |
| Missing descriptions | Warning banner | Export with `# TODO` comments |
| Incomplete tech stack | Info toast | Export with template placeholders |

**Export File Tree** (example with 3 components):
```
sketch2prompt-export.zip
├── README.md                    # Human-readable guide
├── manifest.yaml                # System overview & registry
├── diagram.json                 # Original diagram for re-import
└── components/
    ├── landing-page.yaml        # Frontend component
    ├── api-server.yaml          # Backend component
    └── postgres-db.yaml         # Storage component
```

---

### Matrix 4: Recommendations by Price Tier

| Component Type | Free Tier | Paid Tier | Enterprise |
|----------------|-----------|-----------|------------|
| **Auth** | Supabase Auth, Auth.js | Auth0, Clerk | Okta, Azure AD |
| **Storage (SQL)** | PostgreSQL, SQLite | PlanetScale, Neon | Aurora, Oracle |
| **Storage (NoSQL)** | MongoDB Community | MongoDB Atlas | DynamoDB, CosmosDB |
| **Frontend Hosting** | Vercel (hobby), Netlify | Vercel (pro), Cloudflare | AWS CloudFront, Fastly |
| **Backend Hosting** | Railway, Render | Heroku, Fly.io | AWS ECS, GCP Cloud Run |
| **Email** | Resend (free tier) | SendGrid, Postmark | AWS SES (enterprise support) |
| **Payments** | Stripe (no monthly fee) | Stripe (volume discounts) | Stripe (enterprise) |
| **Search** | PostgreSQL FTS | Algolia, Typesense | Elasticsearch (managed) |
| **File Storage** | Supabase Storage | Cloudinary, Uploadcare | AWS S3 (with CDN) |

---

## 5. Proposed v1 Spec Schema

### Manifest Schema (`manifest.yaml`)

```yaml
# Sketch2Prompt Export Manifest
spec_version: "1.0"
generated_by: "Sketch2Prompt v1.0"
generated_at: "2025-12-17T14:32:00Z"

project:
  name: "My SaaS App"
  description: "B2B analytics platform with real-time dashboards"

system_intent: |
  This application helps sales teams visualize pipeline health through
  real-time dashboards. Core thesis: actionable insights without data
  analyst dependencies.

components:
  # Registry of all components (ordered by build phase)
  - id: "node-1"
    name: "PostgreSQL Database"
    type: "storage"
    file: "components/postgres-db.yaml"
    build_phase: 1

  - id: "node-2"
    name: "User Authentication"
    type: "auth"
    file: "components/user-auth.yaml"
    build_phase: 2

  - id: "node-3"
    name: "REST API"
    type: "backend"
    file: "components/rest-api.yaml"
    build_phase: 3

  - id: "node-4"
    name: "Dashboard UI"
    type: "frontend"
    file: "components/dashboard-ui.yaml"
    build_phase: 4

build_order:
  # Recommended implementation sequence
  - phase: 1
    name: "Data Layer"
    components: ["PostgreSQL Database"]

  - phase: 2
    name: "Auth Layer"
    components: ["User Authentication"]

  - phase: 3
    name: "API Layer"
    components: ["REST API"]

  - phase: 4
    name: "UI Layer"
    components: ["Dashboard UI"]

code_standards:
  naming_conventions:
    files: "kebab-case"
    functions: "camelCase"
    classes: "PascalCase"
    constants: "SCREAMING_SNAKE_CASE"

  testing_strategy: "Unit tests for business logic, integration tests for API"

  error_handling: "Explicit error types, never swallow exceptions"

tech_philosophy:
  principles:
    - "Prefer boring technology over bleeding edge"
    - "Optimize for maintainability, not cleverness"
    - "Security first, performance second, aesthetics third"

  constraints:
    - "NEVER store secrets in code"
    - "NEVER trust client-side validation alone"
    - "NEVER expose internal IDs in public APIs"
```

---

### Component Schema (All Types)

#### Base Schema (All Components Inherit)

```yaml
# Component Specification
spec_version: "1.0"
component_id: "node-3"
name: "REST API"
type: "backend"

description: |
  Core API server handling all business logic and data operations.
  Serves the frontend dashboard and mobile apps (future).

responsibilities:
  # What this component MUST do
  - "Validate all incoming requests"
  - "Enforce authentication on protected endpoints"
  - "Transform database queries into REST responses"
  - "Log all errors and performance metrics"
  - "Rate limit API calls per user tier"

anti_responsibilities:
  # What this component MUST NOT do
  - "NEVER render HTML (API-only, no server-side rendering)"
  - "NEVER store session state (use stateless JWT)"
  - "NEVER directly expose database errors to clients"
  - "NEVER implement business logic in SQL (keep in application layer)"

integration_points:
  # What this component connects to
  - component: "PostgreSQL Database"
    relationship: "Reads and writes sales data"

  - component: "User Authentication"
    relationship: "Validates JWT tokens on protected routes"

  - component: "Dashboard UI"
    relationship: "Serves JSON data via REST endpoints"

tech_stack:
  primary: "Node.js 20 + Express.js"
  dependencies:
    - "express@5.x"
    - "zod@3.x (input validation)"
    - "pino@9.x (structured logging)"
    - "jsonwebtoken@9.x (JWT handling)"

  references:
    - url: "https://www.npmjs.com/package/express"
      type: "package_index"
    - url: "https://expressjs.com/en/guide/routing.html"
      type: "official_docs"

constraints:
  security:
    - "All inputs validated with Zod schemas"
    - "Helmet.js for HTTP header security"
    - "CORS restricted to known frontend origins"
    - "Rate limiting: 100 req/min per user, 1000 req/min global"

  performance:
    - "Response time <200ms for p95"
    - "Database connection pooling (max 20 connections)"
    - "Cache frequently-read data in Redis (future)"

  architecture:
    - "RESTful conventions (no RPC-style endpoints)"
    - "Consistent error format: {error: string, code: string, details?: object}"
    - "Pagination for all list endpoints (limit 100 items/page)"

api_contract:
  # Backend-specific: Define endpoint patterns
  base_url: "/api/v1"

  endpoints:
    - path: "/auth/login"
      method: "POST"
      auth_required: false

    - path: "/dashboard/metrics"
      method: "GET"
      auth_required: true

    - path: "/pipeline/deals"
      method: "GET"
      auth_required: true
      pagination: true

  response_format: "JSON with snake_case keys"

  error_codes:
    - "AUTH_REQUIRED (401)"
    - "FORBIDDEN (403)"
    - "NOT_FOUND (404)"
    - "RATE_LIMITED (429)"

testing_notes: |
  - Unit test all validation schemas
  - Integration test all endpoints with mock database
  - Load test rate limiting logic
  - Security audit input validation

recommended_by_tier:
  free:
    - "Express.js"
    - "Fastify (faster alternative)"
  paid:
    - "NestJS (enterprise structure)"
  enterprise:
    - "GraphQL with Apollo Server"
```

---

#### Storage-Specific Fields

```yaml
# Additional fields for type: storage

schema_notes: |
  Design schema BEFORE writing code. Use migrations from day one.

  Tables:
  - users (id, email, password_hash, created_at)
  - deals (id, user_id, amount, stage, created_at)
  - metrics (id, deal_id, metric_type, value, timestamp)

backup_strategy: "Daily automated backups, 30-day retention"

constraints:
  - "Use UUIDs for primary keys (not auto-increment integers)"
  - "Index all foreign keys"
  - "Normalize to 3NF unless performance requires denormalization"
```

---

#### Auth-Specific Fields

```yaml
# Additional fields for type: auth

security_notes: |
  - Password hashing: bcrypt with cost factor 12
  - Session management: Stateless JWT (15min access, 7d refresh)
  - OAuth providers: Google, GitHub
  - MFA: TOTP via Authenticator apps

constraints:
  - "NEVER log passwords or tokens"
  - "NEVER store plaintext secrets"
  - "ALWAYS use HTTPS in production"
  - "Rate limit login attempts: 5 failures = 15min lockout"
```

---

#### Frontend-Specific Fields

```yaml
# Additional fields for type: frontend

routing_strategy: "React Router v7 with file-based routes"

state_management: "Zustand for global state, React Query for server state"

accessibility:
  - "Semantic HTML throughout"
  - "ARIA labels for interactive elements"
  - "Keyboard navigation support"
  - "WCAG 2.1 AA compliance"

constraints:
  - "Bundle size <200KB gzipped (excluding images)"
  - "First Contentful Paint <1.5s"
  - "Lazy load all routes except landing page"
```

---

#### External-Specific Fields

```yaml
# Additional fields for type: external

service_details:
  provider: "Stripe"
  api_version: "2024-11-20"
  environment: "Use test mode keys in dev/staging"

error_handling:
  - "Retry failed requests with exponential backoff (max 3 retries)"
  - "Log all API errors to monitoring service"
  - "Fallback behavior: Show user-friendly error, don't crash app"

rate_limits:
  - "Stripe: 100 req/sec (https://docs.stripe.com/rate-limits)"
  - "Implement request queuing if hitting limits"
```

---

#### Background-Specific Fields

```yaml
# Additional fields for type: background

job_queue: "BullMQ with Redis backend"

jobs:
  - name: "send_welcome_email"
    trigger: "User signup"
    frequency: "Event-driven"
    retry_policy: "3 attempts, exponential backoff"

  - name: "daily_metrics_rollup"
    trigger: "Cron schedule"
    frequency: "0 2 * * * (2am daily)"
    retry_policy: "Fail silently, log error"

constraints:
  - "All jobs MUST be idempotent (safe to run multiple times)"
  - "Implement dead letter queue for failed jobs"
  - "Monitor queue depth, alert if >1000 pending jobs"
```

---

### Example: Complete Frontend Component

```yaml
# Component Specification: Dashboard UI
spec_version: "1.0"
component_id: "node-4"
name: "Dashboard UI"
type: "frontend"

description: |
  Real-time sales dashboard with pipeline visualization, deal tracking,
  and performance metrics. Primary interface for sales team users.

responsibilities:
  - "Display real-time pipeline health metrics"
  - "Render interactive deal cards with drag-to-update stage"
  - "Authenticate users via login form"
  - "Handle client-side routing between dashboard views"
  - "Cache API responses for offline-first experience (future)"

anti_responsibilities:
  - "NEVER access database directly (all data via REST API)"
  - "NEVER store sensitive data in localStorage (use httpOnly cookies)"
  - "NEVER implement business logic (API handles all calculations)"
  - "NEVER trust client-side validation alone (server validates too)"

integration_points:
  - component: "REST API"
    relationship: "Fetches dashboard data, submits deal updates"

  - component: "User Authentication"
    relationship: "Receives JWT after login, sends with API requests"

tech_stack:
  primary: "React 19 + TypeScript"
  dependencies:
    - "react@19.x"
    - "react-router@7.x"
    - "zustand@5.x (state management)"
    - "@tanstack/react-query@5.x (data fetching)"
    - "tailwindcss@4.x (styling)"
    - "recharts@2.x (charts)"

  references:
    - url: "https://www.npmjs.com/package/react"
      type: "package_index"
    - url: "https://react.dev/reference/react"
      type: "official_docs"

routing_strategy: "React Router v7 with file-based routes in src/pages/"

state_management: "Zustand for auth state, React Query for server data"

accessibility:
  - "Semantic HTML: <nav>, <main>, <article>"
  - "ARIA labels on all buttons and links"
  - "Keyboard navigation: Tab order follows visual hierarchy"
  - "Focus indicators visible on all interactive elements"
  - "Color contrast meets WCAG 2.1 AA (4.5:1 minimum)"

constraints:
  security:
    - "Store JWT in httpOnly cookie (not localStorage)"
    - "Sanitize all user inputs before rendering (XSS prevention)"
    - "Implement CSP headers via Vite config"

  performance:
    - "Bundle size <200KB gzipped (excluding chunks)"
    - "First Contentful Paint <1.5s"
    - "Lazy load all routes except /dashboard"
    - "Use React.memo for expensive chart renders"

  architecture:
    - "Colocate components with tests: Button.tsx + Button.test.tsx"
    - "No prop drilling >2 levels (use context or Zustand)"
    - "Consistent file naming: PascalCase for components, kebab-case for utils"

testing_notes: |
  - Unit test all utility functions
  - Component tests for critical UI (login form, deal cards)
  - E2E test happy path: login → view dashboard → update deal
  - Visual regression tests for charts (Percy or Chromatic)

recommended_by_tier:
  free:
    - "Vite (bundler)"
    - "Vitest (testing)"
    - "React Hook Form (forms)"
  paid:
    - "Vercel Analytics"
    - "Sentry (error tracking)"
  enterprise:
    - "Chromatic (visual testing)"
    - "LaunchDarkly (feature flags)"
```

---

## 6. Export Architecture

### Directory Structure

```
sketch2prompt-export-{timestamp}.zip
│
├── README.md                    # Auto-generated human guide
├── manifest.yaml                # System overview & component registry
├── diagram.json                 # Original diagram (for re-import)
│
└── components/
    ├── {component-name-1}.yaml  # Per-component specs
    ├── {component-name-2}.yaml
    └── ...
```

### README.md Template

```markdown
# Sketch2Prompt Export

**Project**: {Project Name}
**Generated**: {ISO Timestamp}
**Components**: {Count}

## What This Is

This export contains a complete system specification for your application,
optimized for AI coding assistants (Cursor, Windsurf, GitHub Copilot, etc.).

## How to Use It

1. **Review the Manifest**: Open `manifest.yaml` to see system-level intent and build order
2. **Read Component Specs**: Each file in `components/` defines one part of your system
3. **Feed to AI Assistant**: Copy relevant specs into your IDE assistant's context
4. **Build Incrementally**: Follow the build order in the manifest

## File Guide

- `manifest.yaml` - System overview, component registry, code standards
- `diagram.json` - Original diagram (import back into Sketch2Prompt)
- `components/*.yaml` - Per-component specifications

## Tips for AI Assistants

- Load the manifest first to understand system intent
- Load only relevant component specs (avoid token bloat)
- Treat `anti_responsibilities` as hard constraints
- Use `tech_stack.references` to find latest docs

## Re-importing

To re-import this diagram into Sketch2Prompt:
1. Open Sketch2Prompt
2. Click "Import" in the toolbar
3. Upload `diagram.json`

---

Generated by Sketch2Prompt v1.0
https://sketch2prompt.com
```

---

### Manifest Generation Logic

**Inputs**:
- Diagram nodes (from React Flow state)
- User-provided project name & description
- System-level intent (optional textarea in export drawer)

**Processing**:
1. Sanitize node labels to valid filenames
2. Detect name collisions, append `-{id}` if needed
3. Sort components by BUILD_ORDER (storage → auth → backend → frontend → external → background)
4. Assign build phases based on type
5. Generate manifest YAML with component registry
6. Generate README with project-specific values

**Outputs**:
- `manifest.yaml` (system spec)
- `README.md` (usage guide)
- `components/*.yaml` (per-component specs)
- `diagram.json` (re-import data)

---

### Component Spec Generation Logic

**Per Node Type, Generate**:

1. **Common Fields** (all types):
   - `spec_version`, `component_id`, `name`, `type`
   - `description` (from node.data.meta.description or placeholder)
   - `responsibilities` (from TYPE_GUIDANCE or user input)
   - `anti_responsibilities` (type-specific templates)
   - `integration_points` (inferred from visual proximity? or manual in Inspector)
   - `tech_stack` (user-selected in Inspector, with URL templates)
   - `constraints` (type-specific templates)

2. **Type-Specific Fields**:
   - Backend → `api_contract`
   - Storage → `schema_notes`, `backup_strategy`
   - Auth → `security_notes`
   - Frontend → `routing_strategy`, `state_management`, `accessibility`
   - External → `service_details`, `error_handling`, `rate_limits`
   - Background → `job_queue`, `jobs`

3. **Recommendations**:
   - Pull from curated `TECH_RECOMMENDATIONS[nodeType][tier]` mapping
   - Format as `recommended_by_tier: {free: [], paid: [], enterprise: []}`

---

### File Naming Strategy

**Rules**:
1. Sanitize label: lowercase, replace spaces with hyphens, remove special chars
2. Check for collisions in current export
3. If collision, append `-{node.id.slice(-4)}`
4. Example: "REST API" → `rest-api.yaml`
5. Example collision: "API" + "API" → `api.yaml`, `api-5f3a.yaml`

---

### ZIP Generation (Client-Side)

**Library**: JSZip (already used in modern browsers)

**Process**:
1. Generate all file contents in memory (strings)
2. Create JSZip instance
3. Add files: `zip.file('manifest.yaml', manifestContent)`
4. Add folder: `zip.folder('components')`
5. Add component files: `zip.file('components/rest-api.yaml', componentContent)`
6. Generate blob: `zip.generateAsync({type: 'blob'})`
7. Trigger download: `URL.createObjectURL(blob)` + anchor click

**Edge Case Handling**:
- Empty diagram → Block export, show modal
- Missing descriptions → Include `# TODO: Add description` comments
- Incomplete tech stack → Include template placeholders

---

## 7. Recommendations Priority Matrix

### Must-Have for v1

| Feature | Rationale | Effort |
|---------|-----------|--------|
| Per-component YAML export | Core value prop | High |
| Manifest with component registry | Enables selective loading | Medium |
| Type-specific schema templates | Reduces user effort | Medium |
| URL templates to authoritative sources | Web search assumed, avoid staleness | Low |
| Anti-responsibilities field | Critical for freezing boundaries | Low |
| ZIP download with README | No backend needed, user-friendly | Low |
| Free tier node limit (8 max) | Prevent abuse without backend | Low |
| Export preview drawer | User confidence before download | Medium |
| Re-import from diagram.json | Avoid lock-in, enable iteration | Medium |

**Total MVP Scope**: ~3-4 weeks for solo dev

---

### Nice-to-Have for v1 (If Time Permits)

| Feature | Rationale | Effort |
|---------|-----------|--------|
| Inspector panel for tech stack selection | Better than freeform text | High |
| Curated tech recommendations UI | Reduces decision fatigue | Medium |
| Export validation warnings | Catch incomplete specs | Low |
| Auto-generate integration_points from proximity | Reduces manual work | Medium |
| Dark mode for export preview | Polish | Low |

**Defer If Needed**: Inspector panel, curated recommendations UI

---

### Save for v2

| Feature | Rationale | Deferral Reason |
|---------|-----------|-----------------|
| LLM-enhanced export ("smart export") | High value but adds cost/latency | Requires API backend, not v1 scope |
| User-configurable tech lists | Power user feature | Adds complexity, diminishing returns |
| Multiple export formats (JSON, TOML) | YAML sufficient for AI parsing | Low demand signal |
| Edge topology parsing | Conflicts with "edges are visual" stance | Architectural decision, revisit post-v1 |
| Collaboration features (share exports) | Requires backend | Not in v1 scope |
| Export templates marketplace | Community feature | Premature for v1 |
| Version diffing (compare exports) | Advanced workflow | Low priority |

---

### Absolutely Out of Scope

| Feature | Rationale |
|---------|-----------|
| Code generation from specs | Sketch2Prompt defines intent, not implementation |
| Real-time collaboration | No backend in v1 |
| Diagram auto-layout | User controls structure |
| Integration with IDEs (VSCode extension) | Post-v1 if product-market fit proven |
| Hosted spec repository | Requires infrastructure |

---

## 8. Open Questions for User Decision

### Critical Path (Need Answers to Proceed)

**Q1: Inspector Panel Scope for v1**
Options:
- A) Ship v1 with freeform text fields only (faster to ship)
- B) Build Inspector panel with tech stack dropdowns (better UX, slower)
- C) Hybrid: Freeform for v1, Inspector for v1.1

**Recommendation**: Option A for speed, plan Inspector for v1.1.

---

**Q2: Tech Recommendations Source of Truth**
Options:
- A) Hardcoded in `src/core/recommendations.ts` (fast, opinionated)
- B) JSON config file user can theoretically edit (flexible)
- C) Fetch from external API (requires backend)

**Recommendation**: Option A for v1 (hardcoded), revisit for v2.

---

**Q3: Integration Points Detection**
Options:
- A) Purely manual (user types in Inspector)
- B) Auto-suggest based on visual proximity (AI-assisted)
- C) Parse edges despite "edges are visual" stance

**Recommendation**: Option A for v1 (manual), explore B for v1.1.

---

**Q4: Free Tier Enforcement**
Confirm: 12 node limit acceptable? Alternative suggestions:
- 8 nodes (tighter for free tier)
- 15 nodes (more generous)
- No limit for v1 (defer monetization)

**Recommendation**: 8 nodes (each node is high-level, prevents abuse).

---

**Q5: System Intent Capture**
Where should users define system-level intent?
- A) Textarea in Export Drawer (just-in-time)
- B) Dedicated "Project Settings" modal (upfront)
- C) Inferred from node descriptions (no explicit field)

**Recommendation**: Option A (just-in-time in drawer) for v1 simplicity.

---

### Medium Priority (Can Decide During Implementation)

**Q6: YAML Comment Style**
Should generated YAML include:
- A) No comments (clean, minimal)
- B) Inline hints (e.g., `# TODO: Add description`)
- C) Header comments explaining each section

**Recommendation**: Option B (inline hints for incomplete fields).

---

**Q7: Export Filename Convention**
Format:
- A) `sketch2prompt-export.zip` (generic)
- B) `{project-name}-spec.zip` (project-specific)
- C) `{project-name}-{timestamp}.zip` (versioned)

**Recommendation**: Option C (enables multiple exports without overwriting).

---

**Q8: Error Handling for Invalid Exports**
If user tries to export with 0 nodes:
- A) Gray out Export button
- B) Show modal: "Add at least one component"
- C) Export with placeholder text

**Recommendation**: Option B (explicit feedback).

---

**Q9: Re-Import Validation**
When importing `diagram.json`:
- A) Accept any valid JSON matching schema
- B) Validate version compatibility
- C) Warn if import from newer version

**Recommendation**: Option B + C (validate and warn).

---

### Low Priority (Punt to Post-v1 Feedback)

**Q10: Should Manifest Include Build Time Estimates?**
Example: "Storage Phase: ~2-3 days"

**Defer**: Requires too many assumptions, low value for v1.

---

**Q11: Should Components Reference Each Other by ID or Name?**
In `integration_points`, use:
- A) `component: "node-3"` (ID, stable)
- B) `component: "REST API"` (name, readable)

**Recommendation**: Option B (readable), document that renames break references.

---

**Q12: Dark Mode for Export Preview?**
**Defer**: Polish feature, not critical path.

---

## 9. Implementation Roadmap (Suggested)

### Week 1: Schema & Export Logic
- [ ] Define YAML schemas (manifest + component types)
- [ ] Write export generation functions (pure, testable)
- [ ] Unit tests for export logic
- [ ] Handle edge cases (empty diagram, name collisions)

### Week 2: UI - Export Drawer
- [ ] Build ExportDrawer component (already exists, enhance)
- [ ] Add project name/description inputs
- [ ] Add system intent textarea
- [ ] File tree preview (read-only)
- [ ] Sample YAML preview (first component)

### Week 3: ZIP Generation & Download
- [ ] Integrate JSZip library
- [ ] Wire export button to ZIP generation
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Handle large diagrams (>50 components)

### Week 4: Re-Import & Polish
- [ ] Implement JSON import from ZIP
- [ ] Validation warnings for incomplete specs
- [ ] Free tier node limit enforcement
- [ ] README template generation
- [ ] End-to-end testing (export → re-import)

---

## 10. Success Metrics (How to Know v1 Works)

### Quantitative
- Export completion rate >80% (users who start export finish it)
- Re-import success rate >95% (exported diagrams re-import without errors)
- Avg export file size <500KB for 12-component diagram
- Time to export <3 seconds for 12 components

### Qualitative
- User feedback: "This saved me 30 minutes of writing context"
- AI assistant feedback: "Specs reduced follow-up questions by 50%"
- No major bugs reported in export/import flow within first month

---

## 11. Post-v1 Iteration Triggers

**When to Build v2 Features**:
- If >30% of users hit 12-node limit → Introduce paid tier
- If >50% of exports missing descriptions → Build Inspector panel
- If users request specific tech in recommendations → Add config UI
- If AI assistants struggle with YAML → Experiment with JSON/TOML
- If export feels slow (>5s) → Optimize generation or add progress bar

**When to Revisit Architecture**:
- If edge parsing becomes heavily requested → Reconsider "edges are visual" stance
- If LLM review becomes table stakes → Design API integration
- If collaboration features dominate feedback → Plan backend infrastructure

---

## 12. Final Recommendations

### Ship This for v1
1. Per-component YAML export with type-specific schemas
2. Manifest with system intent and component registry
3. ZIP download with auto-generated README
4. Re-import from diagram.json
5. 8-node free tier limit (UI-enforced)
6. Export preview drawer (file tree + sample YAML)
7. URL templates to package indexes (npm, PyPI, etc.)
8. Anti-responsibilities field (critical for boundary-setting)

### Defer to v1.1+
1. Inspector panel with tech stack dropdowns
2. LLM-enhanced "smart export" mode
3. Auto-suggest integration points from proximity
4. User-configurable tech recommendation lists
5. Multiple export formats (JSON, TOML)

### Never Build (Out of Philosophy)
1. Code generation from specs
2. Edge topology parsing (conflicts with visual-only stance)
3. Real-time collaboration without backend commitment

---

## Appendix A: Example Export (Full)

**Scenario**: Simple SaaS app with 4 components

### File Tree
```
my-saas-app-2025-12-17-143200.zip
├── README.md
├── manifest.yaml
├── diagram.json
└── components/
    ├── postgres-db.yaml
    ├── user-auth.yaml
    ├── rest-api.yaml
    └── dashboard-ui.yaml
```

### manifest.yaml (Abbreviated)
```yaml
spec_version: "1.0"
generated_by: "Sketch2Prompt v1.0"
generated_at: "2025-12-17T14:32:00Z"

project:
  name: "My SaaS App"
  description: "B2B analytics platform"

system_intent: |
  Help sales teams visualize pipeline health without data analysts.

components:
  - id: "node-1"
    name: "PostgreSQL Database"
    type: "storage"
    file: "components/postgres-db.yaml"
    build_phase: 1

build_order:
  - phase: 1
    name: "Data Layer"
    components: ["PostgreSQL Database"]

code_standards:
  naming_conventions:
    files: "kebab-case"
    functions: "camelCase"
```

### postgres-db.yaml (Abbreviated)
```yaml
spec_version: "1.0"
component_id: "node-1"
name: "PostgreSQL Database"
type: "storage"

responsibilities:
  - "Store user accounts and sales data"
  - "Enforce referential integrity via foreign keys"

anti_responsibilities:
  - "NEVER expose raw SQL errors to application layer"

schema_notes: |
  Tables: users, deals, metrics
  Use UUIDs for primary keys.

recommended_by_tier:
  free: ["PostgreSQL", "SQLite"]
  paid: ["PlanetScale", "Neon"]
```

---

## Appendix B: Token Optimization Analysis

### Current Prompt Export (from export-prompt.ts)
**Estimated Tokens for 4-component diagram**: ~800 tokens

**Issues**:
- Duplicates type descriptions across all components
- Includes generic guidance not specific to user's project
- Monolithic (must load entire prompt, can't cherry-pick)

### Proposed YAML Export
**Estimated Tokens for Same 4-component Diagram**:
- Manifest: ~200 tokens
- Per-component: ~150 tokens × 4 = 600 tokens
- **Total: ~800 tokens IF loading all**

**Advantages**:
- Can load ONLY relevant components (e.g., just backend = manifest + 1 component = ~350 tokens)
- No duplicate type descriptions (defined once in component)
- Anti-responsibilities explicitly freeze boundaries (reduces follow-up Q&A)

**Token Savings in Real Usage**:
- Scenario 1 (working on single component): 800 → 350 tokens (56% reduction)
- Scenario 2 (working on 2 related components): 800 → 500 tokens (38% reduction)
- Scenario 3 (full system context needed): 800 → 800 tokens (no change, but better structure)

**Conclusion**: Token savings come from selective loading, not raw size reduction.

---

## Appendix C: Competitive Landscape

### Similar Tools
| Tool | Approach | Difference from Sketch2Prompt |
|------|----------|-------------------------------|
| **C4 Model** | Structured diagramming (Context, Container, Component, Code) | No AI-optimized export, human documentation focus |
| **Mermaid Diagrams** | Text-to-diagram (code-first) | Visual-first vs code-first, no AI constraint focus |
| **Eraser.io** | Diagramming + docs generation | Broader scope (not AI-assistant focused) |
| **Excalidraw** | Freeform sketching | No structured export, purely visual |
| **tldraw** | Whiteboarding + plugins | Extensible but not purpose-built for AI specs |

**Unique Value Prop**: Only tool purpose-built for AI coding assistant constraint specs, not human documentation.

---

## Appendix D: User Personas & Use Cases

### Persona 1: Solo Indie Hacker
**Profile**: Building SaaS MVP alone, uses Cursor for 80% of coding
**Pain**: Cursor keeps reinventing architecture, inconsistent patterns
**Use Case**: Sketch system once, export specs, paste into Cursor composer for every new feature
**Success**: "I stopped rewriting the same auth flow 3 times"

### Persona 2: Small Team Lead
**Profile**: 3-person startup, onboarding new contractors
**Pain**: Contractors don't understand system intent, build features that don't fit
**Use Case**: Export specs as onboarding docs, contractors paste into GitHub Copilot
**Success**: "New dev shipped feature in 2 days vs 2 weeks before"

### Persona 3: Technical Founder Pre-Development
**Profile**: Non-technical founder with clear product vision, hiring agency
**Pain**: Agency proposals vary wildly, unclear what's being quoted
**Use Case**: Sketch system, export specs, send to agencies for aligned quotes
**Success**: "Got 3 agencies bidding on the SAME system for the first time"

---

**END OF DOCUMENT**

---

**Next Steps for User**:
1. Review Critical Path questions (Section 8)
2. Approve/modify recommended v1 scope (Section 7)
3. Decide on Inspector panel timing (Q1 in Section 8)
4. Green-light schema design (Section 5) or request changes
5. Confirm implementation roadmap (Section 9) or adjust priorities

**Estimated Read Time**: 45 minutes
**Estimated Review + Decision Time**: 30 minutes
**Total**: ~75 minutes to move from brainstorming → actionable plan
