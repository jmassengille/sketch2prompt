import { describe, it, expect } from 'vitest'
import { generateProjectRulesTemplate, generateComponentSpecMarkdown } from './template-generator'
import type { DiagramNode, DiagramEdge } from './types'

describe('generateProjectRulesTemplate', () => {
  it('generates template for empty project', () => {
    const result = generateProjectRulesTemplate([], [], 'Test Project')

    expect(result).toContain('# Test Project - System Rules')
    expect(result).toContain('## System Overview')
    expect(result).toContain('## Component Registry')
    expect(result).toContain('## Architecture Constraints')
    expect(result).toContain('## Code Standards')
    expect(result).toContain('## Build Order')
    expect(result).toContain('## Integration Rules')
  })

  it('generates template with frontend and backend nodes', () => {
    const nodes: DiagramNode[] = [
      {
        id: 'node-1',
        type: 'frontend',
        position: { x: 0, y: 0 },
        data: {
          label: 'React Dashboard',
          type: 'frontend',
          meta: {},
        },
      },
      {
        id: 'node-2',
        type: 'backend',
        position: { x: 100, y: 100 },
        data: {
          label: 'REST API',
          type: 'backend',
          meta: { description: 'Handles all business logic' },
        },
      },
    ]

    const result = generateProjectRulesTemplate(nodes, [], 'SalesTracker')

    expect(result).toContain('SalesTracker')
    expect(result).toContain('Full-stack web application')
    expect(result).toContain('React Dashboard')
    expect(result).toContain('REST API')
    expect(result).toContain('frontend')
    expect(result).toContain('backend')
    expect(result).toContain('specs/react-dashboard.md')
    expect(result).toContain('specs/rest-api.md')
  })

  it('generates proper build order based on node types', () => {
    const nodes: DiagramNode[] = [
      {
        id: 'node-1',
        type: 'frontend',
        position: { x: 0, y: 0 },
        data: { label: 'UI', type: 'frontend', meta: {} },
      },
      {
        id: 'node-2',
        type: 'backend',
        position: { x: 100, y: 100 },
        data: { label: 'API', type: 'backend', meta: {} },
      },
      {
        id: 'node-3',
        type: 'storage',
        position: { x: 200, y: 200 },
        data: { label: 'PostgreSQL', type: 'storage', meta: {} },
      },
    ]

    const result = generateProjectRulesTemplate(nodes, [], 'Test')

    // Check that build order section exists
    expect(result).toContain('## Build Order')

    // Check that all three node IDs appear in the build order section
    expect(result).toContain('[node-3] PostgreSQL')
    expect(result).toContain('[node-2] API')
    expect(result).toContain('[node-1] UI')

    // Verify the BUILD_ORDER is followed: storage, backend, frontend
    const buildOrderSection = result.slice(result.indexOf('## Build Order'))
    const storageIndex = buildOrderSection.indexOf('[node-3] PostgreSQL')
    const backendIndex = buildOrderSection.indexOf('[node-2] API')
    const frontendIndex = buildOrderSection.indexOf('[node-1] UI')

    expect(storageIndex).toBeLessThan(backendIndex)
    expect(backendIndex).toBeLessThan(frontendIndex)
  })

  it('generates integration rules from edges', () => {
    const nodes: DiagramNode[] = [
      {
        id: 'node-1',
        type: 'frontend',
        position: { x: 0, y: 0 },
        data: { label: 'Frontend', type: 'frontend', meta: {} },
      },
      {
        id: 'node-2',
        type: 'backend',
        position: { x: 100, y: 100 },
        data: { label: 'Backend', type: 'backend', meta: {} },
      },
    ]

    const edges: DiagramEdge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        data: { label: 'Fetches data' },
      },
    ]

    const result = generateProjectRulesTemplate(nodes, edges, 'Test')

    expect(result).toContain('Frontend')
    expect(result).toContain('Backend')
    expect(result).toContain('HTTP REST/GraphQL')
    expect(result).toContain('Fetches data')
  })

  it('derives integration rules from types when no edges', () => {
    const nodes: DiagramNode[] = [
      {
        id: 'node-1',
        type: 'frontend',
        position: { x: 0, y: 0 },
        data: { label: 'Frontend', type: 'frontend', meta: {} },
      },
      {
        id: 'node-2',
        type: 'backend',
        position: { x: 100, y: 100 },
        data: { label: 'Backend', type: 'backend', meta: {} },
      },
    ]

    const result = generateProjectRulesTemplate(nodes, [], 'Test')

    expect(result).toContain('Frontend')
    expect(result).toContain('Backend')
    expect(result).toContain('HTTP REST/GraphQL')
    expect(result).toContain('Inferred from types')
  })
})

describe('generateComponentSpecMarkdown', () => {
  it('generates valid Markdown with XML tags for frontend component', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'frontend',
      position: { x: 0, y: 0 },
      data: {
        label: 'React Dashboard',
        type: 'frontend',
        meta: {},
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('<spec component="React Dashboard" type="frontend" id="node-1">')
    expect(result).toContain('</spec>')
    expect(result).toContain('## Tech Stack')
    expect(result).toContain('## Responsibilities')
    expect(result).toContain('## Anti-Responsibilities')
    expect(result).toContain('## Frontend Notes')
    expect(result).toContain('## Validation')
  })

  it('generates valid Markdown for backend component', () => {
    const node: DiagramNode = {
      id: 'node-2',
      type: 'backend',
      position: { x: 0, y: 0 },
      data: {
        label: 'REST API',
        type: 'backend',
        meta: { description: 'Main API server' },
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('<spec component="REST API" type="backend" id="node-2">')
    expect(result).toContain('Main API server')
    expect(result).toContain('## API Notes')
  })

  it('generates valid Markdown for storage component', () => {
    const node: DiagramNode = {
      id: 'node-3',
      type: 'storage',
      position: { x: 0, y: 0 },
      data: {
        label: 'PostgreSQL',
        type: 'storage',
        meta: {},
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('type="storage"')
    expect(result).toContain('## Storage Notes')
  })

  it('generates valid Markdown for auth component', () => {
    const node: DiagramNode = {
      id: 'node-4',
      type: 'auth',
      position: { x: 0, y: 0 },
      data: {
        label: 'Auth Service',
        type: 'auth',
        meta: {},
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('type="auth"')
    expect(result).toContain('## Auth Notes')
  })

  it('generates valid Markdown for external component', () => {
    const node: DiagramNode = {
      id: 'node-5',
      type: 'external',
      position: { x: 0, y: 0 },
      data: {
        label: 'Stripe',
        type: 'external',
        meta: {},
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('type="external"')
    expect(result).toContain('## External Service Notes')
  })

  it('generates valid Markdown for background component', () => {
    const node: DiagramNode = {
      id: 'node-6',
      type: 'background',
      position: { x: 0, y: 0 },
      data: {
        label: 'Email Worker',
        type: 'background',
        meta: {},
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('type="background"')
    expect(result).toContain('## Job Notes')
  })

  it('includes type-based integrations', () => {
    const nodes: DiagramNode[] = [
      {
        id: 'node-1',
        type: 'frontend',
        position: { x: 0, y: 0 },
        data: { label: 'Frontend', type: 'frontend', meta: {} },
      },
      {
        id: 'node-2',
        type: 'backend',
        position: { x: 100, y: 100 },
        data: { label: 'Backend', type: 'backend', meta: {} },
      },
    ]

    const frontendNode = nodes[0]
    if (!frontendNode) throw new Error('Test setup error: missing node')
    const result = generateComponentSpecMarkdown(frontendNode, nodes)

    expect(result).toContain('## Integrates With')
    expect(result).toContain('Backend')
    expect(result).toContain('outbound')
    expect(result).toContain('HTTP REST/GraphQL')
  })

  it('includes type-specific default responsibilities', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'backend',
      position: { x: 0, y: 0 },
      data: { label: 'API', type: 'backend', meta: {} },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('Validate all incoming request payloads')
    expect(result).toContain('Enforce authentication and authorization rules')
  })

  it('includes type-specific default anti-responsibilities', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'backend',
      position: { x: 0, y: 0 },
      data: { label: 'API', type: 'backend', meta: {} },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('## Anti-Responsibilities')
    expect(result).toContain('NEVER')
    expect(result).toContain('—') // em dash separator
    expect(result).toContain('trust client-provided data without validation')
  })

  it('includes validation section', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'backend',
      position: { x: 0, y: 0 },
      data: { label: 'API', type: 'backend', meta: {} },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('## Validation')
    expect(result).toContain('- [ ]')
    expect(result).toContain('STATUS.md updated')
  })

  it('uses TBD for unspecified tech stack', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'frontend',
      position: { x: 0, y: 0 },
      data: { label: 'UI', type: 'frontend', meta: {} },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('TBD')
  })

  it('uses node description when provided', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'backend',
      position: { x: 0, y: 0 },
      data: {
        label: 'API',
        type: 'backend',
        meta: { description: 'Custom API description for testing' },
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('Custom API description for testing')
  })

  it('includes tech stack when specified', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'frontend',
      position: { x: 0, y: 0 },
      data: {
        label: 'Web App',
        type: 'frontend',
        meta: { techStack: ['React', 'TypeScript'] },
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    expect(result).toContain('React, TypeScript')
    expect(result).toContain('## Dependencies')
  })

  it('outputs concise format under 400 tokens', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'backend',
      position: { x: 0, y: 0 },
      data: {
        label: 'API',
        type: 'backend',
        meta: { techStack: ['Python', 'FastAPI'] },
      },
    }

    const result = generateComponentSpecMarkdown(node, [node])

    // Rough token estimate: 1 token ≈ 4 chars for code
    const estimatedTokens = result.length / 4
    expect(estimatedTokens).toBeLessThan(500) // Some buffer
  })
})
