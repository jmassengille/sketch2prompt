import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSnippets } from './snippet-orchestrator'
import type { DiagramNode } from '../types'

// Mock the client module
vi.mock('./client', () => ({
  createClient: vi.fn(() => ({})),
  callAI: vi.fn(),
}))

// Import the mocked function for control
import { callAI } from './client'
const mockCallAI = vi.mocked(callAI)

// =============================================================================
// Test Fixtures
// =============================================================================

const createNode = (
  id: string,
  label: string,
  type: DiagramNode['data']['type']
): DiagramNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { label, type, meta: {} },
})

// Valid AI responses for each snippet type
const mockResponses = {
  'project-description': JSON.stringify({
    description: 'A test system for unit testing the AI generation pipeline.',
  }),
  'boundary-additions': JSON.stringify({
    isItems: ['User management', 'Data persistence'],
    isNotItems: ['Mobile app', 'Real-time streaming'],
  }),
  'component-description': JSON.stringify({
    description: 'Handles all API requests and business logic.',
  }),
  'component-responsibilities': JSON.stringify({
    responsibilities: ['Validate inputs', 'Process requests', 'Return responses'],
  }),
  'anti-responsibilities': JSON.stringify({
    antiResponsibilities: ['NEVER access database directly', 'NEVER store secrets', 'NEVER bypass auth'],
  }),
}

// =============================================================================
// Helper to set up mock responses
// =============================================================================

function setupMockResponses(_nodes?: DiagramNode[]) {
  mockCallAI.mockImplementation((_client, prompt: string) => {
    // Determine snippet type from prompt content
    if (prompt.includes('project description')) {
      return Promise.resolve(mockResponses['project-description'])
    }
    if (prompt.includes('IS and') && prompt.includes('IS NOT')) {
      return Promise.resolve(mockResponses['boundary-additions'])
    }
    if (prompt.includes('2-3 sentence description for')) {
      return Promise.resolve(mockResponses['component-description'])
    }
    if (prompt.includes('core responsibilities')) {
      return Promise.resolve(mockResponses['component-responsibilities'])
    }
    if (prompt.includes('anti-responsibilities')) {
      return Promise.resolve(mockResponses['anti-responsibilities'])
    }
    return Promise.resolve('{}')
  })
}

// =============================================================================
// Tests
// =============================================================================

describe('generateSnippets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns AISnippets with correct structure', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    setupMockResponses(nodes)

    const result = await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    expect(result).toHaveProperty('projectDescription')
    expect(result).toHaveProperty('boundaryAdditions')
    expect(result).toHaveProperty('componentSnippets')
    expect(result.componentSnippets).toBeInstanceOf(Map)
  })

  it('extracts project description from AI response', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    setupMockResponses(nodes)

    const result = await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    expect(result.projectDescription).toBe(
      'A test system for unit testing the AI generation pipeline.'
    )
  })

  it('extracts boundary additions from AI response', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    setupMockResponses(nodes)

    const result = await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    expect(result.boundaryAdditions.isItems).toEqual(['User management', 'Data persistence'])
    expect(result.boundaryAdditions.isNotItems).toEqual(['Mobile app', 'Real-time streaming'])
  })

  it('extracts component snippets for each node', async () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'Backend', 'backend'),
    ]
    setupMockResponses(nodes)

    const result = await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    expect(result.componentSnippets.size).toBe(2)
    expect(result.componentSnippets.has('node-1')).toBe(true)
    expect(result.componentSnippets.has('node-2')).toBe(true)
  })

  it('component snippets contain description, responsibilities, and anti-responsibilities', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    setupMockResponses(nodes)

    const result = await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    const snippet = result.componentSnippets.get('node-1')
    expect(snippet).toBeDefined()
    expect(snippet?.description).toBe('Handles all API requests and business logic.')
    expect(snippet?.responsibilities).toEqual(['Validate inputs', 'Process requests', 'Return responses'])
    expect(snippet?.antiResponsibilities).toEqual([
      'NEVER access database directly',
      'NEVER store secrets',
      'NEVER bypass auth',
    ])
  })

  it('calls AI for correct number of prompts', async () => {
    // For N nodes: 2 project-level + 3*N component-level
    // 1 node = 2 + 3 = 5 calls
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    setupMockResponses(nodes)

    await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    expect(mockCallAI).toHaveBeenCalledTimes(5)
  })

  it('calls AI for multiple nodes correctly', async () => {
    // 2 nodes = 2 + 6 = 8 calls
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'Backend', 'backend'),
    ]
    setupMockResponses(nodes)

    await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    expect(mockCallAI).toHaveBeenCalledTimes(8)
  })

  it('handles JSON with markdown code fences', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]

    mockCallAI.mockImplementation((_client, prompt: string) => {
      if (prompt.includes('project description')) {
        // AI sometimes wraps JSON in code fences
        return Promise.resolve('```json\n{"description": "Wrapped description"}\n```')
      }
      if (prompt.includes('IS and') && prompt.includes('IS NOT')) {
        return Promise.resolve(mockResponses['boundary-additions'])
      }
      if (prompt.includes('2-3 sentence description for')) {
        return Promise.resolve(mockResponses['component-description'])
      }
      if (prompt.includes('core responsibilities')) {
        return Promise.resolve(mockResponses['component-responsibilities'])
      }
      if (prompt.includes('anti-responsibilities')) {
        return Promise.resolve(mockResponses['anti-responsibilities'])
      }
      return Promise.resolve('{}')
    })

    const result = await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    expect(result.projectDescription).toBe('Wrapped description')
  })

  it('calls onSnippetComplete callback for each snippet', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]
    setupMockResponses(nodes)
    const onSnippetComplete = vi.fn()

    await generateSnippets({
      nodes,
      projectName: 'TestProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
      onSnippetComplete,
    })

    expect(onSnippetComplete).toHaveBeenCalledTimes(5)
    // Should be called with snippet type and optional componentId
    expect(onSnippetComplete).toHaveBeenCalledWith('project-description', undefined)
    expect(onSnippetComplete).toHaveBeenCalledWith('boundary-additions', undefined)
    expect(onSnippetComplete).toHaveBeenCalledWith('component-description', 'node-1')
    expect(onSnippetComplete).toHaveBeenCalledWith('component-responsibilities', 'node-1')
    expect(onSnippetComplete).toHaveBeenCalledWith('anti-responsibilities', 'node-1')
  })

  it('throws error on invalid JSON response', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]

    mockCallAI.mockImplementation((_client, prompt: string) => {
      if (prompt.includes('project description')) {
        return Promise.resolve('This is not JSON at all')
      }
      return Promise.resolve('{}')
    })

    await expect(
      generateSnippets({
        nodes,
        projectName: 'TestProject',
        apiKey: 'test-key',
        provider: 'openai',
        modelId: 'gpt-4o',
      })
    ).rejects.toThrow('Invalid JSON')
  })

  it('throws error on schema validation failure', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]

    mockCallAI.mockImplementation((_client, prompt: string) => {
      if (prompt.includes('project description')) {
        // Valid JSON but wrong schema (number instead of string)
        return Promise.resolve('{"description": 12345}')
      }
      return Promise.resolve('{}')
    })

    await expect(
      generateSnippets({
        nodes,
        projectName: 'TestProject',
        apiKey: 'test-key',
        provider: 'openai',
        modelId: 'gpt-4o',
      })
    ).rejects.toThrow('Schema validation failed')
  })

  it('wraps API errors with context', async () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend')]

    mockCallAI.mockRejectedValue(new Error('API rate limit exceeded'))

    await expect(
      generateSnippets({
        nodes,
        projectName: 'TestProject',
        apiKey: 'test-key',
        provider: 'openai',
        modelId: 'gpt-4o',
      })
    ).rejects.toThrow('Snippet generation failed')
  })
})

describe('edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles empty nodes array', async () => {
    setupMockResponses([])

    const result = await generateSnippets({
      nodes: [],
      projectName: 'EmptyProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    // Should still have project-level snippets
    expect(result.projectDescription).toBeDefined()
    expect(result.boundaryAdditions).toBeDefined()
    expect(result.componentSnippets.size).toBe(0)
  })

  it('handles all node types', async () => {
    const types: DiagramNode['data']['type'][] = [
      'frontend', 'backend', 'storage', 'auth', 'external', 'background'
    ]
    const nodes = types.map((type, i) => createNode(`node-${String(i)}`, `Test ${type}`, type))
    setupMockResponses(nodes)

    const result = await generateSnippets({
      nodes,
      projectName: 'AllTypesProject',
      apiKey: 'test-key',
      provider: 'openai',
      modelId: 'gpt-4o',
    })

    expect(result.componentSnippets.size).toBe(6)
    for (const node of nodes) {
      expect(result.componentSnippets.has(node.id)).toBe(true)
    }
  })
})
