import { describe, it, expect } from 'vitest'
import { importJson } from './import-json'
import { exportJson } from './export-json'
import type { DiagramNode, DiagramEdge } from './types'

function createNode(
  id: string,
  type: DiagramNode['data']['type'],
  label: string
): DiagramNode {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: {
      label,
      type,
      meta: {},
    },
  }
}

function createEdge(id: string, source: string, target: string, label?: string): DiagramEdge {
  return {
    id,
    source,
    target,
    sourceHandle: null,
    targetHandle: null,
    data: label ? { label } : {},
  }
}

describe('importJson', () => {
  it('imports valid JSON successfully', () => {
    const validJson = JSON.stringify({
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
    })

    const result = importJson(validJson)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.nodes).toHaveLength(1)
      expect(result.data.nodes[0]?.data.label).toBe('Test')
    }
  })

  it('returns error for invalid JSON syntax', () => {
    const invalidJson = '{ invalid json'

    const result = importJson(invalidJson)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Invalid JSON format')
    }
  })

  it('returns error for invalid schema', () => {
    const invalidSchema = JSON.stringify({
      version: '1.0',
      createdAt: new Date().toISOString(),
      nodes: [
        {
          id: 'node-1',
          type: 'invalid-type', // Invalid node type
          position: { x: 0, y: 0 },
          data: { label: 'Test', type: 'invalid-type', meta: {} },
        },
      ],
      edges: [],
    })

    const result = importJson(invalidSchema)

    expect(result.ok).toBe(false)
  })

  it('returns error for missing required fields', () => {
    const missingFields = JSON.stringify({
      // Missing version, createdAt
      nodes: [],
      edges: [],
    })

    const result = importJson(missingFields)

    expect(result.ok).toBe(false)
  })

  it('returns clear error message', () => {
    const invalid = JSON.stringify({
      version: '2.0', // Wrong version
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    })

    const result = importJson(invalid)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBeTruthy()
      expect(typeof result.error).toBe('string')
    }
  })
})

describe('export/import round-trip', () => {
  it('preserves nodes through round-trip', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'frontend', 'Landing Page'),
      createNode('node-2', 'backend', 'API Server'),
    ]
    const edges: DiagramEdge[] = []

    const exported = exportJson(nodes, edges)
    const imported = importJson(exported)

    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.data.nodes).toHaveLength(2)
      expect(imported.data.nodes[0]?.data.label).toBe('Landing Page')
      expect(imported.data.nodes[1]?.data.label).toBe('API Server')
    }
  })

  it('preserves edges through round-trip', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'frontend', 'UI'),
      createNode('node-2', 'backend', 'API'),
    ]
    const edges: DiagramEdge[] = [createEdge('edge-1', 'node-1', 'node-2', 'API calls')]

    const exported = exportJson(nodes, edges)
    const imported = importJson(exported)

    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.data.edges).toHaveLength(1)
      expect(imported.data.edges[0]?.data?.label).toBe('API calls')
    }
  })

  it('preserves node positions through round-trip', () => {
    const nodes: DiagramNode[] = [
      {
        id: 'node-1',
        type: 'frontend',
        position: { x: 150, y: 250 },
        data: { label: 'Test', type: 'frontend', meta: {} },
      },
    ]

    const exported = exportJson(nodes, [])
    const imported = importJson(exported)

    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.data.nodes[0]?.position).toEqual({ x: 150, y: 250 })
    }
  })

  it('preserves node descriptions through round-trip', () => {
    const nodes: DiagramNode[] = [
      {
        id: 'node-1',
        type: 'frontend',
        position: { x: 0, y: 0 },
        data: {
          label: 'Landing Page',
          type: 'frontend',
          meta: { description: 'Main marketing page' },
        },
      },
    ]

    const exported = exportJson(nodes, [])
    const imported = importJson(exported)

    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.data.nodes[0]?.data.meta.description).toBe('Main marketing page')
    }
  })

  it('handles empty diagram', () => {
    const exported = exportJson([], [])
    const imported = importJson(exported)

    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.data.nodes).toHaveLength(0)
      expect(imported.data.edges).toHaveLength(0)
    }
  })

  it('preserves all 6 node types through round-trip', () => {
    const types = ['frontend', 'backend', 'storage', 'auth', 'external', 'background'] as const
    const nodes: DiagramNode[] = types.map((type, i) => createNode(`node-${String(i)}`, type, type))

    const exported = exportJson(nodes, [])
    const imported = importJson(exported)

    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.data.nodes).toHaveLength(6)
      types.forEach((type, i) => {
        expect(imported.data.nodes[i]?.data.type).toBe(type)
      })
    }
  })
})
