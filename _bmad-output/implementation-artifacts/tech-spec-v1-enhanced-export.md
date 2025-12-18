# Tech-Spec: v1 Enhanced Export (Blueprint Export)

**Created:** 2025-12-17
**Status:** Ready for Development
**Author:** Tech-Spec Workflow

---

## Overview

### Problem Statement

The current export produces a simple markdown prompt that provides generic guidance. This doesn't deliver on Sketch2Prompt's core promise: **producing structured specifications that constrain AI coding assistant behavior**.

Users need exports that:
1. Are token-optimized for selective loading
2. Contain component-specific boundaries (responsibilities + anti-responsibilities)
3. Work across AI assistants (Cursor, Windsurf, Claude, Copilot)
4. Can be re-imported for iteration

### Solution

Export a **ZIP bundle** (`{project-name}-blueprint.zip`) containing:

```
{project-name}-blueprint.zip
├── PROJECT_RULES.md          # Master instruction file (load FIRST)
├── specs/
│   ├── {component-1}.yaml    # Per-component specs
│   ├── {component-2}.yaml
│   └── ...
└── diagram.json              # Re-import capability
```

**Two generation modes:**
| Mode | Trigger | Quality | Cost |
|------|---------|---------|------|
| **Template** | No API key | Good (smart defaults + `# AI:` markers) | Free |
| **AI-Enhanced** | BYOK (Claude/OpenAI) | Excellent (contextual generation) | User's API cost |

### Scope

**In Scope (v1):**
- ZIP export with PROJECT_RULES.md + specs/*.yaml + diagram.json
- Template-based generation (smart defaults per node type)
- BYOK AI generation (OpenAI SDK for both Claude and OpenAI)
- API key management (localStorage, settings UI)
- 8-node free tier limit validation
- Direct download (no preview)
- Project name input field

**Out of Scope (v1.1+):**
- Inspector panel for editing spec fields
- Export preview before download
- Multiple export format options
- Backend/hosted tier
- Usage analytics

---

## Context for Development

### Codebase Patterns

**Pure export functions:**
```typescript
// Pattern: Pure transformation, no side effects
export function exportPrompt(nodes: DiagramNode[], title?: string): string
export function exportJson(nodes: DiagramNode[], edges: DiagramEdge[]): string

// New functions should follow same pattern
export function generateProjectRules(nodes: DiagramNode[], edges: DiagramEdge[], projectName: string): string
export function generateComponentYaml(node: DiagramNode, edges: DiagramEdge[], allNodes: DiagramNode[]): string
```

**Type-based organization:**
```typescript
const BUILD_ORDER: NodeType[] = ['storage', 'auth', 'backend', 'frontend', 'external', 'background']
```

**Zod for validation:**
```typescript
export const serializedDiagramSchema = z.object({ ... })
```

**Zustand store pattern:**
```typescript
export const useStore = create<DiagramStore>()(
  temporal((set) => ({ ... }), { limit: 50, partialize: ... })
)
```

**React 19 patterns:**
- `useTransition` for non-blocking updates
- `useMemo` for expensive computations
- Functional components only

### Files to Reference

| File | Relevance |
|------|-----------|
| `src/core/export-prompt.ts` | Pattern for generation functions, BUILD_ORDER, TYPE constants |
| `src/core/export-json.ts` | JSON serialization pattern |
| `src/core/types.ts` | DiagramNode, DiagramEdge, NodeType definitions |
| `src/core/schema.ts` | Zod validation patterns |
| `src/core/store.ts` | Zustand store pattern |
| `src/components/ExportDrawer.tsx` | Current UI, will be modified |
| `_bmad-output/specs/master-instruction-file-spec.md` | PROJECT_RULES.md format spec |
| `_bmad-output/specs/component-yaml-schema-spec.md` | Component YAML schema spec |

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ZIP library | `jszip` | 10M+ weekly downloads, browser-native, well-maintained |
| YAML library | `js-yaml` | 30M+ weekly downloads, full YAML 1.2 support |
| AI SDK | `openai` only | Anthropic's OpenAI compatibility = one SDK for both providers |
| API key storage | localStorage | No backend, user accepts browser storage risk for BYOK |
| Generation approach | Client-side | Maintains "no backend" architecture |
| Model selection | User choice | Claude Sonnet 4 or GPT-4o recommended defaults |

---

## Implementation Plan

### Task 1: Add Dependencies

**Description:** Install required npm packages for ZIP, YAML, and AI generation.

**Files:** `package.json`

**Changes:**
```bash
pnpm add jszip js-yaml openai
pnpm add -D @types/js-yaml
```

**Acceptance Criteria:**
- [ ] `jszip`, `js-yaml`, `openai` in dependencies
- [ ] `@types/js-yaml` in devDependencies
- [ ] `pnpm install` succeeds
- [ ] No peer dependency warnings

---

### Task 2: Create Settings Store

**Description:** Add settings management for API keys and preferences using Zustand.

**Files:**
- `src/core/settings.ts` (new)
- `src/core/index.ts` (update exports)

**Implementation:**
```typescript
// src/core/settings.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AIProvider = 'anthropic' | 'openai'

interface SettingsStore {
  // API Configuration
  apiProvider: AIProvider
  apiKey: string
  modelId: string

  // Export Preferences
  projectName: string

  // Actions
  setApiProvider: (provider: AIProvider) => void
  setApiKey: (key: string) => void
  setModelId: (id: string) => void
  setProjectName: (name: string) => void
  clearApiKey: () => void
  hasApiKey: () => boolean
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-sonnet-4-5',
  openai: 'gpt-4o',
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set, get) => ({
      apiProvider: 'anthropic',
      apiKey: '',
      modelId: DEFAULT_MODELS.anthropic,
      projectName: 'Untitled Project',

      setApiProvider: (provider) => set({
        apiProvider: provider,
        modelId: DEFAULT_MODELS[provider]
      }),
      setApiKey: (key) => set({ apiKey: key }),
      setModelId: (id) => set({ modelId: id }),
      setProjectName: (name) => set({ projectName: name }),
      clearApiKey: () => set({ apiKey: '' }),
      hasApiKey: () => get().apiKey.length > 0,
    }),
    {
      name: 'sketch2prompt-settings',
      partialize: (state) => ({
        apiProvider: state.apiProvider,
        apiKey: state.apiKey,
        modelId: state.modelId,
        projectName: state.projectName,
      }),
    }
  )
)
```

**Acceptance Criteria:**
- [ ] Settings persist to localStorage
- [ ] API key retrievable after page refresh
- [ ] Default provider is Anthropic
- [ ] `hasApiKey()` returns correct boolean

---

### Task 3: Create AI Generation Service

**Description:** Implement client-side AI generation using OpenAI SDK (works for both providers).

**Files:**
- `src/core/ai-generator.ts` (new)

**Implementation:**
```typescript
// src/core/ai-generator.ts
import OpenAI from 'openai'
import type { DiagramNode, DiagramEdge } from './types'

type AIProvider = 'anthropic' | 'openai'

const PROVIDER_CONFIG: Record<AIProvider, { baseURL?: string }> = {
  anthropic: { baseURL: 'https://api.anthropic.com/v1/' },
  openai: { baseURL: undefined }, // Uses default
}

export interface GenerationResult {
  projectRules: string
  componentSpecs: Map<string, string> // nodeId -> YAML content
}

export async function generateWithAI(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  apiKey: string,
  provider: AIProvider,
  modelId: string
): Promise<GenerationResult> {
  const client = new OpenAI({
    apiKey,
    baseURL: PROVIDER_CONFIG[provider].baseURL,
    dangerouslyAllowBrowser: true,
  })

  // Generate PROJECT_RULES.md
  const projectRulesPrompt = buildProjectRulesPrompt(nodes, edges, projectName)
  const projectRulesResponse = await client.chat.completions.create({
    model: modelId,
    messages: [{ role: 'user', content: projectRulesPrompt }],
    max_tokens: 4000,
  })
  const projectRules = projectRulesResponse.choices[0]?.message?.content ?? ''

  // Generate component specs in parallel
  const componentSpecs = new Map<string, string>()
  const specPromises = nodes.map(async (node) => {
    const prompt = buildComponentSpecPrompt(node, edges, nodes, projectName)
    const response = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    })
    const yaml = response.choices[0]?.message?.content ?? ''
    return { nodeId: node.id, yaml }
  })

  const results = await Promise.all(specPromises)
  for (const { nodeId, yaml } of results) {
    componentSpecs.set(nodeId, yaml)
  }

  return { projectRules, componentSpecs }
}

function buildProjectRulesPrompt(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string
): string {
  // Build context from nodes
  const nodeDescriptions = nodes.map(n =>
    `- ${n.data.label} (${n.data.type}): ${n.data.meta.description || 'No description'}`
  ).join('\n')

  return `Generate a PROJECT_RULES.md file for an AI coding assistant.

Project: ${projectName}

Components:
${nodeDescriptions}

Follow this exact structure:
1. System Overview (project type, stack summary, boundaries IS/IS NOT)
2. Component Registry (table with ID, Component, Type, Spec File, Status)
3. Architecture Constraints (ALWAYS/NEVER/PREFER rules)
4. Code Standards (naming conventions, file organization, patterns)
5. Build Order (implementation phases based on component types)
6. Integration Rules (communication patterns between components)

Output ONLY the markdown content, no code fences.`
}

function buildComponentSpecPrompt(
  node: DiagramNode,
  edges: DiagramEdge[],
  allNodes: DiagramNode[],
  projectName: string
): string {
  // Find connected nodes
  const connectedNodes = edges
    .filter(e => e.source === node.id || e.target === node.id)
    .map(e => {
      const otherId = e.source === node.id ? e.target : e.source
      return allNodes.find(n => n.id === otherId)
    })
    .filter(Boolean)
    .map(n => n!.data.label)

  return `Generate a YAML component specification for an AI coding assistant.

Project: ${projectName}
Component: ${node.data.label}
Type: ${node.data.type}
Description: ${node.data.meta.description || 'No description provided'}
Connected to: ${connectedNodes.join(', ') || 'None'}

Generate a complete YAML spec with:
- spec_version: "1.0"
- component_id: "${node.id}"
- name, type, description
- responsibilities (3-5 specific items)
- anti_responsibilities (3-5 NEVER statements with reasons)
- integration_points (based on connections)
- tech_stack (appropriate for the type)
- constraints (security, performance, architecture)
- Type-specific fields based on: ${node.data.type}

Output ONLY valid YAML, no code fences or explanations.`
}
```

**Acceptance Criteria:**
- [ ] Works with Anthropic API key + Claude model
- [ ] Works with OpenAI API key + GPT model
- [ ] Generates PROJECT_RULES.md content
- [ ] Generates YAML for each component
- [ ] Handles API errors gracefully
- [ ] Parallel generation for performance

---

### Task 4: Create Template Generator

**Description:** Implement template-based generation for users without API keys.

**Files:**
- `src/core/template-generator.ts` (new)

**Implementation:**
```typescript
// src/core/template-generator.ts
import type { DiagramNode, DiagramEdge, NodeType } from './types'

// Type-specific defaults
const TYPE_RESPONSIBILITIES: Record<NodeType, string[]> = {
  frontend: [
    'Render user interface components',
    'Handle user interactions and form submissions',
    'Manage client-side routing',
    'Display data from API responses',
  ],
  backend: [
    'Validate all incoming request payloads',
    'Execute business logic and data transformations',
    'Handle authentication and authorization checks',
    'Return consistent API responses',
  ],
  storage: [
    'Persist application data reliably',
    'Enforce data integrity via constraints',
    'Provide efficient query access patterns',
    'Maintain referential integrity',
  ],
  auth: [
    'Authenticate user credentials securely',
    'Manage user sessions or tokens',
    'Enforce authorization policies',
    'Handle password reset and recovery flows',
  ],
  external: [
    'Integrate with third-party API',
    'Handle rate limiting and retries',
    'Transform external data to internal formats',
    'Manage API credentials securely',
  ],
  background: [
    'Process asynchronous tasks reliably',
    'Implement retry logic for failures',
    'Monitor job status and health',
    'Handle scheduled and event-driven triggers',
  ],
}

const TYPE_ANTI_RESPONSIBILITIES: Record<NodeType, string[]> = {
  frontend: [
    'NEVER access database directly — all data through API',
    'NEVER store sensitive data in localStorage — use httpOnly cookies',
    'NEVER implement business logic — API handles calculations',
    'NEVER trust client-side validation alone — server validates too',
  ],
  backend: [
    'NEVER render HTML or serve static files — API-only',
    'NEVER store session state on server — use stateless auth',
    'NEVER trust client-provided data — always validate',
    'NEVER expose internal errors — log internally, return safe messages',
  ],
  storage: [
    'NEVER expose direct connections to other layers — access through service',
    'NEVER store computed values — calculate at query time',
    'NEVER use triggers for business logic — keep in application layer',
    'NEVER store files/blobs directly — use object storage',
  ],
  auth: [
    'NEVER store plaintext passwords — use bcrypt/argon2',
    'NEVER log tokens or credentials — sensitive data stays secret',
    'NEVER skip rate limiting — prevent brute force attacks',
    'NEVER trust client-provided user identity — verify server-side',
  ],
  external: [
    'NEVER hardcode API keys — use environment variables',
    'NEVER ignore rate limits — implement backoff strategy',
    'NEVER trust external data — validate before use',
    'NEVER block on external calls — use timeouts and fallbacks',
  ],
  background: [
    'NEVER make jobs depend on request context — jobs run independently',
    'NEVER skip idempotency — jobs may run multiple times',
    'NEVER ignore failures — implement dead letter handling',
    'NEVER block the main thread — background means background',
  ],
}

export function generateProjectRulesTemplate(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string
): string {
  // ... implementation using specs from master-instruction-file-spec.md
}

export function generateComponentYamlTemplate(
  node: DiagramNode,
  edges: DiagramEdge[],
  allNodes: DiagramNode[]
): string {
  // ... implementation using specs from component-yaml-schema-spec.md
}
```

**Acceptance Criteria:**
- [ ] Generates valid PROJECT_RULES.md without API
- [ ] Generates valid YAML for each node type
- [ ] Includes `# AI: Elaborate` markers for enhancement
- [ ] Uses node description when available
- [ ] Includes type-specific defaults

---

### Task 5: Create ZIP Export Function

**Description:** Orchestrate generation and package into ZIP.

**Files:**
- `src/core/export-blueprint.ts` (new)

**Implementation:**
```typescript
// src/core/export-blueprint.ts
import JSZip from 'jszip'
import { exportJson } from './export-json'
import { generateWithAI, type GenerationResult } from './ai-generator'
import { generateProjectRulesTemplate, generateComponentYamlTemplate } from './template-generator'
import type { DiagramNode, DiagramEdge } from './types'

export interface ExportOptions {
  projectName: string
  useAI: boolean
  apiKey?: string
  apiProvider?: 'anthropic' | 'openai'
  modelId?: string
}

export interface ExportResult {
  ok: true
  blob: Blob
  filename: string
} | {
  ok: false
  error: string
}

const MAX_FREE_NODES = 8

export async function exportBlueprint(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  options: ExportOptions
): Promise<ExportResult> {
  // Validate node count
  if (nodes.length === 0) {
    return { ok: false, error: 'Add at least one component to export.' }
  }

  if (nodes.length > MAX_FREE_NODES) {
    return { ok: false, error: `Free tier limited to ${MAX_FREE_NODES} nodes. You have ${nodes.length}.` }
  }

  try {
    let projectRules: string
    let componentSpecs: Map<string, string>

    if (options.useAI && options.apiKey && options.apiProvider && options.modelId) {
      // AI-enhanced generation
      const result = await generateWithAI(
        nodes,
        edges,
        options.projectName,
        options.apiKey,
        options.apiProvider,
        options.modelId
      )
      projectRules = result.projectRules
      componentSpecs = result.componentSpecs
    } else {
      // Template-based generation
      projectRules = generateProjectRulesTemplate(nodes, edges, options.projectName)
      componentSpecs = new Map()
      for (const node of nodes) {
        const yaml = generateComponentYamlTemplate(node, edges, nodes)
        componentSpecs.set(node.id, yaml)
      }
    }

    // Create ZIP
    const zip = new JSZip()

    // Add PROJECT_RULES.md
    zip.file('PROJECT_RULES.md', projectRules)

    // Add specs folder
    const specsFolder = zip.folder('specs')
    for (const node of nodes) {
      const yaml = componentSpecs.get(node.id) ?? ''
      const filename = slugify(node.data.label) + '.yaml'
      specsFolder?.file(filename, yaml)
    }

    // Add diagram.json for re-import
    const diagramJson = exportJson(nodes, edges)
    zip.file('diagram.json', diagramJson)

    // Generate blob
    const blob = await zip.generateAsync({ type: 'blob' })
    const filename = `${slugify(options.projectName)}-blueprint.zip`

    return { ok: true, blob, filename }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed'
    return { ok: false, error: message }
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'untitled'
}
```

**Acceptance Criteria:**
- [ ] Validates node count (0 = error, >8 = error)
- [ ] Uses AI generation when API key present
- [ ] Falls back to templates when no API key
- [ ] Produces valid ZIP with correct structure
- [ ] Filename matches `{project-name}-blueprint.zip`
- [ ] Includes diagram.json for re-import

---

### Task 6: Update ExportDrawer UI

**Description:** Replace Prompt tab with Blueprint tab, add settings.

**Files:**
- `src/components/ExportDrawer.tsx` (modify)

**Changes:**
1. Replace "Prompt" tab with "Blueprint" tab
2. Add project name input field
3. Add API key configuration section (collapsible)
4. Add provider/model selection
5. Show generation mode indicator (Template vs AI)
6. Update download to use exportBlueprint
7. Show progress during AI generation

**UI Layout:**
```
┌─────────────────────────────────────────────┐
│ Export                                    X │
├─────────────────────────────────────────────┤
│ [Blueprint]  [JSON]                         │
├─────────────────────────────────────────────┤
│ Project Name: [________________]            │
│                                             │
│ ┌─ AI Enhancement (Optional) ─────────────┐ │
│ │ Provider: [Anthropic ▼]                 │ │
│ │ API Key:  [••••••••••••]  [Clear]       │ │
│ │ Model:    [claude-sonnet-4-5 ▼]         │ │
│ │                                         │ │
│ │ ✓ AI-enhanced specs enabled             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Export includes:                            │
│ • PROJECT_RULES.md (master instructions)    │
│ • specs/*.yaml (4 component specs)          │
│ • diagram.json (re-import)                  │
│                                             │
├─────────────────────────────────────────────┤
│            [Download Blueprint]             │
└─────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Blueprint tab is default/first tab
- [ ] Project name editable and persisted
- [ ] API settings collapsible (collapsed by default)
- [ ] API key masked in UI
- [ ] Provider switch updates model dropdown
- [ ] Shows "Template mode" vs "AI-enhanced" indicator
- [ ] Download triggers ZIP download
- [ ] Loading state during AI generation
- [ ] Error messages for failures

---

### Task 7: Add Export Validation

**Description:** Validate diagram before export, show helpful errors.

**Files:**
- `src/core/export-blueprint.ts` (extend)
- `src/components/ExportDrawer.tsx` (extend)

**Validations:**
1. Node count: 0 = "Add components", >8 = "Upgrade or remove"
2. Missing descriptions: Warning banner (export allowed)
3. Orphan nodes: Info only (edges are visual)
4. API key format: Basic validation before API call

**Acceptance Criteria:**
- [ ] Clear error when 0 nodes
- [ ] Clear error when >8 nodes
- [ ] Warning for missing descriptions
- [ ] API key validated before generation attempt

---

### Task 8: Testing

**Description:** Add tests for new export functionality.

**Files:**
- `src/core/export-blueprint.test.ts` (new)
- `src/core/template-generator.test.ts` (new)

**Test Cases:**
```typescript
describe('exportBlueprint', () => {
  it('rejects empty diagram')
  it('rejects diagram with >8 nodes')
  it('generates ZIP with correct structure')
  it('includes PROJECT_RULES.md')
  it('includes specs folder with YAML files')
  it('includes diagram.json')
  it('uses template generation without API key')
  it('filename uses slugified project name')
})

describe('templateGenerator', () => {
  it('generates valid PROJECT_RULES.md')
  it('generates valid YAML for each node type')
  it('includes type-specific responsibilities')
  it('includes type-specific anti-responsibilities')
  it('includes AI elaboration markers')
})
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Coverage for happy path and error cases
- [ ] No mocking of AI calls (template tests only)

---

## Acceptance Criteria (Feature-Level)

### Functional
- [ ] User can export ZIP without API key (template mode)
- [ ] User can configure API key and export with AI enhancement
- [ ] ZIP contains PROJECT_RULES.md, specs/*.yaml, diagram.json
- [ ] Export blocked when >8 nodes with clear message
- [ ] Project name used in filename and content
- [ ] diagram.json enables re-import of exported diagram

### Non-Functional
- [ ] Template export completes in <1s
- [ ] AI export completes in <30s for 8 nodes
- [ ] API key never logged or transmitted except to AI provider
- [ ] No breaking changes to existing JSON import/export

---

## Additional Context

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `jszip` | ^3.10.x | ZIP file generation |
| `js-yaml` | ^4.1.x | YAML serialization |
| `openai` | ^4.x | AI generation (both providers) |
| `@types/js-yaml` | ^4.0.x | TypeScript types |

### Testing Strategy

1. **Unit tests**: Template generators, validation logic
2. **Integration tests**: Full export flow with mocked AI
3. **Manual testing**: Real API calls with dev keys
4. **E2E consideration**: Save for v1.1 (needs Playwright setup)

### Security Considerations

- API keys stored in localStorage (user's browser only)
- `dangerouslyAllowBrowser: true` required for client-side OpenAI SDK
- Keys visible in Network tab — acceptable for BYOK model
- Never log API keys in console or error messages

### Migration Notes

- Existing "Prompt" tab becomes "Blueprint" tab
- JSON tab unchanged
- No database migrations (localStorage only)
- Backward compatible with existing diagram.json imports

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Preview before download? | No — direct download for v1 |
| Which AI models to support? | Claude Sonnet 4, GPT-4o (user configurable) |
| How to handle API errors? | Show error message, suggest template fallback |
| Rate limiting? | User's API, their problem |

---

## File Tree (Final State)

```
src/
├── core/
│   ├── ai-generator.ts        (new)
│   ├── export-blueprint.ts    (new)
│   ├── export-blueprint.test.ts (new)
│   ├── export-json.ts         (unchanged)
│   ├── export-prompt.ts       (deprecated, keep for reference)
│   ├── id.ts                  (unchanged)
│   ├── import-json.ts         (unchanged)
│   ├── index.ts               (update exports)
│   ├── schema.ts              (unchanged)
│   ├── settings.ts            (new)
│   ├── store.ts               (unchanged)
│   ├── template-generator.ts  (new)
│   ├── template-generator.test.ts (new)
│   └── types.ts               (unchanged)
├── components/
│   ├── ExportDrawer.tsx       (major refactor)
│   └── ... (unchanged)
└── ...
```

---

*Generated by BMAD Tech-Spec Workflow*
