import { describe, it, expect } from 'vitest'
import { exportPrompt } from './export-prompt'
import type { DiagramNode } from './types'

function createNode(
  id: string,
  type: DiagramNode['data']['type'],
  label: string,
  description?: string
): DiagramNode {
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: {
      label,
      type,
      meta: description ? { description } : {},
    },
  }
}

describe('exportPrompt', () => {
  it('produces valid output for empty diagram', () => {
    const output = exportPrompt([])

    expect(output).toContain('# Project:')
    expect(output).toContain('## Architecture Overview')
    expect(output).toContain('## Recommended Build Order')
    expect(output).toContain('## Component Guidance')
    expect(output).toContain('## Getting Started Prompt')
  })

  it('includes project title', () => {
    const output = exportPrompt([], 'My Awesome App')

    expect(output).toContain('# Project: My Awesome App')
  })

  it('uses Untitled Project as default title', () => {
    const output = exportPrompt([])

    expect(output).toContain('# Project: Untitled Project')
  })

  it('lists nodes in architecture overview', () => {
    const nodes = [
      createNode('1', 'frontend', 'Landing Page'),
      createNode('2', 'backend', 'API Server'),
    ]

    const output = exportPrompt(nodes)

    expect(output).toContain('1 Frontend')
    expect(output).toContain('Landing Page')
    expect(output).toContain('1 Backend')
    expect(output).toContain('API Server')
  })

  it('groups multiple nodes of same type', () => {
    const nodes = [
      createNode('1', 'frontend', 'Landing Page'),
      createNode('2', 'frontend', 'Dashboard'),
    ]

    const output = exportPrompt(nodes)

    expect(output).toContain('2 Frontend')
    expect(output).toContain('Landing Page, Dashboard')
  })

  it('generates build order by type', () => {
    const nodes = [
      createNode('1', 'frontend', 'Dashboard'),
      createNode('2', 'backend', 'API'),
      createNode('3', 'storage', 'Database'),
    ]

    const output = exportPrompt(nodes)

    // Storage should come before Backend which should come before Frontend
    const storageIndex = output.indexOf('Storage Phase')
    const backendIndex = output.indexOf('Backend Phase')
    const frontendIndex = output.indexOf('Frontend Phase')

    expect(storageIndex).toBeLessThan(backendIndex)
    expect(backendIndex).toBeLessThan(frontendIndex)
  })

  it('includes type-specific guidance', () => {
    const nodes = [createNode('1', 'auth', 'User Auth')]

    const output = exportPrompt(nodes)

    // Auth-specific guidance
    expect(output).toContain('Auth: User Auth')
    expect(output).toContain('plain-text passwords')
  })

  it('includes user description when provided', () => {
    const nodes = [
      createNode('1', 'frontend', 'Landing Page', 'Main marketing page with signup form'),
    ]

    const output = exportPrompt(nodes)

    expect(output).toContain('Main marketing page with signup form')
  })

  it('does not include edge topology in output', () => {
    // Edges are visual-only, not parsed for flows
    const nodes = [
      createNode('1', 'frontend', 'UI'),
      createNode('2', 'backend', 'API'),
    ]

    const output = exportPrompt(nodes)

    // Should not mention data flow or connections between specific nodes
    expect(output).not.toContain('connects to')
    expect(output).not.toContain('flows to')
    expect(output).not.toContain('UI -> API')
  })

  it('includes getting started prompt', () => {
    const nodes = [createNode('1', 'backend', 'API Server')]

    const output = exportPrompt(nodes)

    expect(output).toContain('Getting Started Prompt')
    expect(output).toContain("I'm building")
    expect(output).toContain('help me')
  })

  it('includes all node types in appropriate guidance', () => {
    const nodes = [
      createNode('1', 'frontend', 'UI'),
      createNode('2', 'backend', 'API'),
      createNode('3', 'storage', 'DB'),
      createNode('4', 'auth', 'Auth'),
      createNode('5', 'external', 'Stripe'),
      createNode('6', 'background', 'Worker'),
    ]

    const output = exportPrompt(nodes)

    // Each type should have guidance
    expect(output).toContain('Frontend: UI')
    expect(output).toContain('Backend: API')
    expect(output).toContain('Storage: DB')
    expect(output).toContain('Auth: Auth')
    expect(output).toContain('External: Stripe')
    expect(output).toContain('Background: Worker')
  })
})
