import { describe, it, expect } from 'vitest'
import { generateProjectRulesTemplate, generateComponentYamlTemplate } from './template-generator'
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
    expect(result).toContain('specs/react-dashboard.yaml')
    expect(result).toContain('specs/rest-api.yaml')
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

  it('includes AI markers for elaboration', () => {
    const result = generateProjectRulesTemplate([], [], 'Test')

    expect(result).toContain('# AI:')
  })
})

describe('generateComponentYamlTemplate', () => {
  it('generates valid YAML for frontend component', () => {
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

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('spec_version: "1.0"')
    expect(result).toContain('component_id: node-1')
    expect(result).toContain('name: React Dashboard')
    expect(result).toContain('type: frontend')
    expect(result).toContain('responsibilities:')
    expect(result).toContain('anti_responsibilities:')
    expect(result).toContain('tech_stack:')
    expect(result).toContain('routing_strategy:')
    expect(result).toContain('state_management:')
    expect(result).toContain('accessibility:')
  })

  it('generates valid YAML for backend component', () => {
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

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('component_id: node-2')
    expect(result).toContain('name: REST API')
    expect(result).toContain('type: backend')
    expect(result).toContain('Main API server')
    expect(result).toContain('api_style:')
    expect(result).toContain('endpoint_patterns:')
    expect(result).toContain('error_handling:')
  })

  it('generates valid YAML for storage component', () => {
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

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('type: storage')
    expect(result).toContain('schema_notes:')
    expect(result).toContain('backup_strategy:')
    expect(result).toContain('indexing_strategy:')
  })

  it('generates valid YAML for auth component', () => {
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

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('type: auth')
    expect(result).toContain('auth_strategy:')
    expect(result).toContain('security_notes:')
    expect(result).toContain('providers:')
  })

  it('generates valid YAML for external component', () => {
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

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('type: external')
    expect(result).toContain('service_details:')
    expect(result).toContain('rate_limits:')
  })

  it('generates valid YAML for background component', () => {
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

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('type: background')
    expect(result).toContain('job_queue:')
    expect(result).toContain('jobs:')
  })

  it('includes integration points from edges', () => {
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
        data: { label: 'Fetches data via REST' },
      },
    ]

    const frontendNode = nodes[0]
    if (!frontendNode) throw new Error('Test setup error: missing node')
    const result = generateComponentYamlTemplate(frontendNode, edges, nodes)

    expect(result).toContain('integration_points:')
    expect(result).toContain('component: Backend')
    expect(result).toContain('Fetches data via REST')
  })

  it('includes type-specific default responsibilities', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'backend',
      position: { x: 0, y: 0 },
      data: { label: 'API', type: 'backend', meta: {} },
    }

    const result = generateComponentYamlTemplate(node, [], [node])

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

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('NEVER')
    expect(result).toContain('render HTML or serve static files')
  })

  it('includes type-specific default constraints', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'backend',
      position: { x: 0, y: 0 },
      data: { label: 'API', type: 'backend', meta: {} },
    }

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('constraints:')
    expect(result).toContain('security:')
    expect(result).toContain('performance:')
    expect(result).toContain('architecture:')
    expect(result).toContain('Validate ALL inputs')
  })

  it('includes AI markers for elaboration', () => {
    const node: DiagramNode = {
      id: 'node-1',
      type: 'frontend',
      position: { x: 0, y: 0 },
      data: { label: 'UI', type: 'frontend', meta: {} },
    }

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('# AI:')
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

    const result = generateComponentYamlTemplate(node, [], [node])

    expect(result).toContain('Custom API description for testing')
  })
})
