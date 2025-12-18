import { describe, it, expect } from 'vitest'
import { validateDiagram, safeParseDiagram } from './schema'
import type { SerializedDiagram } from './types'

describe('schema validation', () => {
  const validDiagram: SerializedDiagram = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    nodes: [
      {
        id: 'node-1',
        type: 'frontend',
        position: { x: 0, y: 0 },
        data: { label: 'Test', type: 'frontend', meta: {} },
      },
    ],
    edges: [],
  }

  it('accepts valid diagram', () => {
    expect(() => validateDiagram(validDiagram)).not.toThrow()
  })

  it('accepts all 6 node types', () => {
    const types = ['frontend', 'backend', 'storage', 'auth', 'external', 'background'] as const

    for (const type of types) {
      const diagram: SerializedDiagram = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        nodes: [
          {
            id: 'node-1',
            type,
            position: { x: 0, y: 0 },
            data: { label: 'Test', type, meta: {} },
          },
        ],
        edges: [],
      }

      const result = safeParseDiagram(diagram)
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid node type', () => {
    const invalid = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      nodes: [
        {
          id: 'node-1',
          type: 'invalid-type',
          position: { x: 0, y: 0 },
          data: { label: 'Test', type: 'invalid-type', meta: {} },
        },
      ],
      edges: [],
    }

    const result = safeParseDiagram(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects missing required fields', () => {
    const missingVersion = {
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    }

    const result = safeParseDiagram(missingVersion)
    expect(result.success).toBe(false)
  })

  it('accepts diagram with edges', () => {
    const diagramWithEdges: SerializedDiagram = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      nodes: [
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
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
          sourceHandle: null,
          targetHandle: null,
          data: { label: 'API calls' },
        },
      ],
    }

    const result = safeParseDiagram(diagramWithEdges)
    expect(result.success).toBe(true)
  })

  it('accepts node with description', () => {
    const withDescription: SerializedDiagram = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      nodes: [
        {
          id: 'node-1',
          type: 'frontend',
          position: { x: 0, y: 0 },
          data: {
            label: 'Landing Page',
            type: 'frontend',
            meta: { description: 'Main marketing page with signup form' },
          },
        },
      ],
      edges: [],
    }

    const result = safeParseDiagram(withDescription)
    expect(result.success).toBe(true)
  })
})
