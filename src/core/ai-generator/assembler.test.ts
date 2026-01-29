import { describe, it, expect } from 'vitest'
import {
  assembleProjectRules,
  assembleAgentProtocol,
  assembleComponentSpec,
} from './assembler'
import type { DiagramNode, DiagramEdge } from '../types'
import type { AISnippets } from './types'

// =============================================================================
// Test Fixtures
// =============================================================================

const createNode = (
  id: string,
  label: string,
  type: DiagramNode['data']['type'],
  meta: DiagramNode['data']['meta'] = {}
): DiagramNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { label, type, meta },
})

const createEdge = (
  id: string,
  source: string,
  target: string,
  label?: string
): DiagramEdge => ({
  id,
  source,
  target,
  data: label ? { label } : {},
})

const createSnippets = (overrides: Partial<AISnippets> = {}): AISnippets => ({
  projectDescription: 'A test project for unit testing.',
  boundaryAdditions: {
    isItems: ['User authentication', 'Data persistence'],
    isNotItems: ['Mobile app', 'Real-time sync'],
  },
  componentSnippets: new Map(),
  ...overrides,
})

// =============================================================================
// assembleProjectRules Tests
// =============================================================================

describe('assembleProjectRules', () => {
  it('generates complete project rules with all sections', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'Backend', 'backend'),
    ]
    const snippets = createSnippets()

    const result = assembleProjectRules({
      nodes,
      edges: [],
      projectName: 'TestProject',
      snippets,
    })

    expect(result).toContain('# TestProject - System Rules')
    expect(result).toContain('## System Overview')
    expect(result).toContain('## Component Registry')
    expect(result).toContain('## Architecture Constraints')
    expect(result).toContain('## Code Standards')
    expect(result).toContain('## Build Order')
    expect(result).toContain('## Integration Rules')
  })

  it('injects AI project description into system overview', () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    const snippets = createSnippets({
      projectDescription: 'Custom AI-generated description for testing.',
    })

    const result = assembleProjectRules({
      nodes,
      edges: [],
      projectName: 'TestProject',
      snippets,
    })

    expect(result).toContain('Custom AI-generated description for testing.')
    // Should NOT contain placeholder
    expect(result).not.toContain('# AI: Add 2-3 sentence description')
  })

  it('injects boundary IS items', () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    const snippets = createSnippets({
      boundaryAdditions: {
        isItems: ['Feature A', 'Feature B'],
        isNotItems: [],
      },
    })

    const result = assembleProjectRules({
      nodes,
      edges: [],
      projectName: 'TestProject',
      snippets,
    })

    expect(result).toContain('- Feature A')
    expect(result).toContain('- Feature B')
  })

  it('injects boundary IS NOT items', () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    const snippets = createSnippets({
      boundaryAdditions: {
        isItems: [],
        isNotItems: ['Out of scope X', 'Out of scope Y'],
      },
    })

    const result = assembleProjectRules({
      nodes,
      edges: [],
      projectName: 'TestProject',
      snippets,
    })

    expect(result).toContain('- Out of scope X')
    expect(result).toContain('- Out of scope Y')
  })

  it('removes AI placeholders when no boundary items provided', () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    const snippets = createSnippets({
      boundaryAdditions: { isItems: [], isNotItems: [] },
    })

    const result = assembleProjectRules({
      nodes,
      edges: [],
      projectName: 'TestProject',
      snippets,
    })

    expect(result).not.toContain('# AI: Add more explicit inclusions')
    expect(result).not.toContain('# AI: Add more explicit exclusions')
  })

  it('includes component registry with all nodes', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'React App', 'frontend'),
      createNode('node-2', 'Express API', 'backend'),
      createNode('node-3', 'PostgreSQL', 'storage'),
    ]
    const snippets = createSnippets()

    const result = assembleProjectRules({
      nodes,
      edges: [],
      projectName: 'TestProject',
      snippets,
    })

    expect(result).toContain('React App')
    expect(result).toContain('Express API')
    expect(result).toContain('PostgreSQL')
    expect(result).toContain('specs/react-app.md')
    expect(result).toContain('specs/express-api.md')
    expect(result).toContain('specs/postgresql.md')
  })

  it('generates correct build order (storage before backend before frontend)', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'Backend', 'backend'),
      createNode('node-3', 'Database', 'storage'),
    ]
    const snippets = createSnippets()

    const result = assembleProjectRules({
      nodes,
      edges: [],
      projectName: 'TestProject',
      snippets,
    })

    const buildOrderSection = result.slice(result.indexOf('## Build Order'))
    const storageIndex = buildOrderSection.indexOf('Database')
    const backendIndex = buildOrderSection.indexOf('Backend')
    const frontendIndex = buildOrderSection.indexOf('Frontend')

    expect(storageIndex).toBeLessThan(backendIndex)
    expect(backendIndex).toBeLessThan(frontendIndex)
  })

  it('includes integration rules from edges', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'Backend', 'backend'),
    ]
    const edges: DiagramEdge[] = [
      createEdge('edge-1', 'node-1', 'node-2', 'API calls'),
    ]
    const snippets = createSnippets()

    const result = assembleProjectRules({
      nodes,
      edges,
      projectName: 'TestProject',
      snippets,
    })

    expect(result).toContain('Integration Rules')
    expect(result).toContain('Frontend')
    expect(result).toContain('Backend')
  })
})

// =============================================================================
// assembleAgentProtocol Tests
// =============================================================================

describe('assembleAgentProtocol', () => {
  it('generates agent protocol document', () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]

    const result = assembleAgentProtocol({
      nodes,
      projectName: 'TestProject',
    })

    expect(result).toContain('Agent Protocol')
    expect(result).toContain('Core Principle')
    expect(result).toContain('Status Tracking')
  })

  it('is fully deterministic (no AI snippets needed)', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'Backend', 'backend'),
    ]

    const result1 = assembleAgentProtocol({ nodes, projectName: 'Test' })
    const result2 = assembleAgentProtocol({ nodes, projectName: 'Test' })

    expect(result1).toBe(result2)
  })

  it('includes out-of-scope items when provided', () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]

    const result = assembleAgentProtocol({
      nodes,
      projectName: 'TestProject',
      outOfScope: ['caching', 'message-queues'],
    })

    expect(result).toContain('Out of Scope')
  })
})

// =============================================================================
// assembleComponentSpec Tests
// =============================================================================

describe('assembleComponentSpec', () => {
  it('generates component spec with XML tags', () => {
    const node = createNode('node-1', 'React App', 'frontend')
    const snippets = createSnippets()

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('<spec component="React App" type="frontend" id="node-1">')
    expect(result).toContain('</spec>')
  })

  it('includes tech stack section', () => {
    const node = createNode('node-1', 'API', 'backend', {
      techStack: ['Node.js', 'Express'],
    })
    const snippets = createSnippets()

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('## Tech Stack')
    expect(result).toContain('Node.js, Express')
  })

  it('uses TBD for missing tech stack', () => {
    const node = createNode('node-1', 'API', 'backend')
    const snippets = createSnippets()

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('TBD')
  })

  it('injects AI description when available', () => {
    const node = createNode('node-1', 'API', 'backend')
    const snippets = createSnippets({
      componentSnippets: new Map([
        ['node-1', {
          description: 'AI-generated component description.',
          responsibilities: [],
          antiResponsibilities: [],
        }],
      ]),
    })

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('AI-generated component description.')
  })

  it('falls back to node meta description', () => {
    const node = createNode('node-1', 'API', 'backend', {
      description: 'User-provided description from inspector.',
    })
    const snippets = createSnippets() // No component snippets

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('User-provided description from inspector.')
  })

  it('includes default responsibilities for type', () => {
    const node = createNode('node-1', 'API', 'backend')
    const snippets = createSnippets()

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('## Responsibilities')
    // Backend default responsibilities
    expect(result).toContain('Validate all incoming request payloads')
  })

  it('appends AI responsibilities to defaults', () => {
    const node = createNode('node-1', 'API', 'backend')
    const snippets = createSnippets({
      componentSnippets: new Map([
        ['node-1', {
          description: '',
          responsibilities: ['Custom responsibility from AI'],
          antiResponsibilities: [],
        }],
      ]),
    })

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    // Should have both defaults and AI additions
    expect(result).toContain('Validate all incoming request payloads')
    expect(result).toContain('Custom responsibility from AI')
  })

  it('includes default anti-responsibilities for type', () => {
    const node = createNode('node-1', 'API', 'backend')
    const snippets = createSnippets()

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('## Anti-Responsibilities')
    // Backend default anti-responsibility
    expect(result).toContain('trust client-provided data')
  })

  it('appends AI anti-responsibilities to defaults', () => {
    const node = createNode('node-1', 'API', 'backend')
    const snippets = createSnippets({
      componentSnippets: new Map([
        ['node-1', {
          description: '',
          responsibilities: [],
          antiResponsibilities: ['Custom anti-responsibility from AI'],
        }],
      ]),
    })

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('Custom anti-responsibility from AI')
  })

  it('includes type-based integrations', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'Backend', 'backend'),
    ]
    const snippets = createSnippets()

    const result = assembleComponentSpec({
      node: nodes[0]!,
      allNodes: nodes,
      snippets,
    })

    expect(result).toContain('## Integrates With')
    expect(result).toContain('Backend')
    expect(result).toContain('outbound')
  })

  it('includes dependencies table for known tech', () => {
    const node = createNode('node-1', 'Web App', 'frontend', {
      techStack: ['React (Vite)'], // Must match exact key in KNOWN_PACKAGES
    })
    const snippets = createSnippets()

    const result = assembleComponentSpec({
      node,
      allNodes: [node],
      snippets,
    })

    expect(result).toContain('## Dependencies')
    expect(result).toContain('| Package | Version | Purpose |')
    expect(result).toContain('react')
  })

  it('handles all node types', () => {
    const types: DiagramNode['data']['type'][] = [
      'frontend',
      'backend',
      'storage',
      'auth',
      'external',
      'background',
    ]
    const snippets = createSnippets()

    for (const type of types) {
      const node = createNode(`node-${type}`, `Test ${type}`, type)
      const result = assembleComponentSpec({
        node,
        allNodes: [node],
        snippets,
      })

      expect(result).toContain(`type="${type}"`)
      expect(result).toContain('## Responsibilities')
      expect(result).toContain('## Anti-Responsibilities')
    }
  })
})

// =============================================================================
// Determinism Tests
// =============================================================================

describe('determinism', () => {
  it('assembleProjectRules produces identical output for same input', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'Backend', 'backend'),
    ]
    const snippets = createSnippets()
    const options = { nodes, edges: [], projectName: 'Test', snippets }

    const result1 = assembleProjectRules(options)
    const result2 = assembleProjectRules(options)

    expect(result1).toBe(result2)
  })

  it('assembleComponentSpec produces identical output for same input', () => {
    const node = createNode('node-1', 'API', 'backend', {
      techStack: ['Node.js'],
    })
    const snippets = createSnippets({
      componentSnippets: new Map([
        ['node-1', {
          description: 'Test description',
          responsibilities: ['Responsibility 1'],
          antiResponsibilities: ['Anti 1'],
        }],
      ]),
    })
    const options = { node, allNodes: [node], snippets }

    const result1 = assembleComponentSpec(options)
    const result2 = assembleComponentSpec(options)

    expect(result1).toBe(result2)
  })
})
