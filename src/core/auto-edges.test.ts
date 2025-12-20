import { describe, it, expect } from 'vitest'
import { autoGenerateEdges } from './auto-edges'
import type { DiagramNode } from './types'

function createNode(id: string, type: string, label: string): DiagramNode {
  return {
    id,
    type: type as DiagramNode['type'],
    position: { x: 0, y: 0 },
    data: {
      label,
      type: type as DiagramNode['data']['type'],
      meta: {},
    },
  }
}

describe('autoGenerateEdges', () => {
  it('generates frontend -> backend edge', () => {
    const nodes = [
      createNode('fe1', 'frontend', 'React App'),
      createNode('be1', 'backend', 'API Server'),
    ]

    const edges = autoGenerateEdges(nodes)

    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'fe1',
      target: 'be1',
      data: { label: 'API calls' },
    })
  })

  it('generates backend -> storage edge', () => {
    const nodes = [
      createNode('be1', 'backend', 'API Server'),
      createNode('db1', 'storage', 'PostgreSQL'),
    ]

    const edges = autoGenerateEdges(nodes)

    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'be1',
      target: 'db1',
      data: { label: 'queries' },
    })
  })

  it('generates backend -> AI provider edge with inference label', () => {
    const nodes = [
      createNode('be1', 'backend', 'API Server'),
      createNode('ai1', 'external', 'OpenAI'),
    ]

    const edges = autoGenerateEdges(nodes)

    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'be1',
      target: 'ai1',
      data: { label: 'inference' },
    })
  })

  it('generates multiple edges for full-stack app', () => {
    const nodes = [
      createNode('fe1', 'frontend', 'Next.js App'),
      createNode('be1', 'backend', 'Express API'),
      createNode('db1', 'storage', 'PostgreSQL'),
      createNode('auth1', 'auth', 'Clerk'),
      createNode('ai1', 'external', 'OpenAI'),
    ]

    const edges = autoGenerateEdges(nodes)

    // Expected edges:
    // frontend -> backend (API calls)
    // frontend -> auth (authenticates)
    // backend -> storage (queries)
    // backend -> auth (validates)
    // backend -> external/OpenAI (inference)
    expect(edges.length).toBeGreaterThanOrEqual(5)

    const edgeLabels = edges.map((e) => `${e.source}->${e.target}:${e.data?.label}`)
    expect(edgeLabels).toContain('fe1->be1:API calls')
    expect(edgeLabels).toContain('fe1->auth1:authenticates')
    expect(edgeLabels).toContain('be1->db1:queries')
    expect(edgeLabels).toContain('be1->auth1:validates')
    expect(edgeLabels).toContain('be1->ai1:inference')
  })

  it('uses embeddings label for vector store', () => {
    const nodes = [
      createNode('be1', 'backend', 'API Server'),
      createNode('vec1', 'storage', 'Vector Store (pgvector)'),
    ]

    const edges = autoGenerateEdges(nodes)

    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'be1',
      target: 'vec1',
      data: { label: 'embeddings' },
    })
  })

  it('does not duplicate existing edges', () => {
    const nodes = [
      createNode('fe1', 'frontend', 'React App'),
      createNode('be1', 'backend', 'API Server'),
    ]

    const existingEdges = [
      { id: 'e1', source: 'fe1', target: 'be1', data: { label: 'custom label' } },
    ]

    const edges = autoGenerateEdges(nodes, existingEdges)

    expect(edges).toHaveLength(0)
  })

  it('handles background jobs', () => {
    const nodes = [
      createNode('bg1', 'background', 'Queue Worker'),
      createNode('be1', 'backend', 'API Server'),
      createNode('db1', 'storage', 'PostgreSQL'),
    ]

    const edges = autoGenerateEdges(nodes)

    const edgeLabels = edges.map((e) => `${e.source}->${e.target}:${e.data?.label}`)
    expect(edgeLabels).toContain('bg1->be1:triggers')
    expect(edgeLabels).toContain('bg1->db1:processes')
  })

  it('returns empty array for empty nodes', () => {
    const edges = autoGenerateEdges([])
    expect(edges).toHaveLength(0)
  })
})
