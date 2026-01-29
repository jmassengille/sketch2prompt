/**
 * E2E Tests for AI Generation Pipeline
 *
 * These tests actually call AI APIs and require valid credentials.
 * Skip by default unless API key is provided via environment variable.
 *
 * Run with: OPENAI_API_KEY=your-key npm run test:run -- src/core/ai-generator/e2e.test.ts
 * Or: TEST_API_KEY=your-key TEST_API_PROVIDER=anthropic npm run test:run -- src/core/ai-generator/e2e.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { generateSnippets } from './snippet-orchestrator'
import { generateWithAI } from './orchestrator'
import type { DiagramNode } from '../types'
import type { AIProvider } from './types'

// =============================================================================
// Test Configuration
// =============================================================================

interface TestConfig {
  apiKey: string
  provider: AIProvider
  modelId: string
}

function getTestConfig(): TestConfig | null {
  // Check for test-specific env vars first
  const testApiKey = process.env['TEST_API_KEY']
  const testProvider = process.env['TEST_API_PROVIDER'] as AIProvider | undefined

  if (testApiKey) {
    return {
      apiKey: testApiKey,
      provider: testProvider ?? 'openai',
      modelId: testProvider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o-mini',
    }
  }

  // Fall back to common env vars
  const openaiKey = process.env['OPENAI_API_KEY']
  if (openaiKey) {
    return {
      apiKey: openaiKey,
      provider: 'openai',
      modelId: 'gpt-4o-mini', // Use mini for faster/cheaper tests
    }
  }

  const anthropicKey = process.env['ANTHROPIC_API_KEY']
  if (anthropicKey) {
    return {
      apiKey: anthropicKey,
      provider: 'anthropic',
      modelId: 'claude-sonnet-4-20250514',
    }
  }

  return null
}

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

// Small realistic diagram for E2E testing
const testNodes: DiagramNode[] = [
  createNode('node-1', 'React Dashboard', 'frontend', {
    techStack: ['React (Vite)', 'TypeScript'],
    description: 'Admin dashboard for managing users and content',
  }),
  createNode('node-2', 'REST API', 'backend', {
    techStack: ['Node.js', 'Express'],
    description: 'Handles authentication and CRUD operations',
  }),
]

// =============================================================================
// E2E Tests
// =============================================================================

describe('E2E: AI Generation Pipeline', () => {
  let config: TestConfig | null = null

  beforeAll(() => {
    config = getTestConfig()
    if (!config) {
      console.log('⚠️  Skipping E2E tests - no API key found')
      console.log('   Set OPENAI_API_KEY or ANTHROPIC_API_KEY to run E2E tests')
    }
  })

  describe('generateSnippets', () => {
    it('generates valid project description from real AI', async () => {
      if (!config) return

      const result = await generateSnippets({
        nodes: testNodes,
        projectName: 'E2E Test Project',
        apiKey: config.apiKey,
        provider: config.provider,
        modelId: config.modelId,
      })

      // Verify structure
      expect(result.projectDescription).toBeDefined()
      expect(typeof result.projectDescription).toBe('string')
      expect(result.projectDescription.length).toBeGreaterThan(10)
      expect(result.projectDescription.length).toBeLessThan(500)
    }, 30000) // 30s timeout for API call

    it('generates valid boundary additions from real AI', async () => {
      if (!config) return

      const result = await generateSnippets({
        nodes: testNodes,
        projectName: 'E2E Test Project',
        apiKey: config.apiKey,
        provider: config.provider,
        modelId: config.modelId,
      })

      // Verify structure
      expect(result.boundaryAdditions).toBeDefined()
      expect(Array.isArray(result.boundaryAdditions.isItems)).toBe(true)
      expect(Array.isArray(result.boundaryAdditions.isNotItems)).toBe(true)
      expect(result.boundaryAdditions.isItems.length).toBeGreaterThanOrEqual(1)
      expect(result.boundaryAdditions.isNotItems.length).toBeGreaterThanOrEqual(1)
    }, 30000)

    it('generates valid component snippets from real AI', async () => {
      if (!config) return

      const result = await generateSnippets({
        nodes: testNodes,
        projectName: 'E2E Test Project',
        apiKey: config.apiKey,
        provider: config.provider,
        modelId: config.modelId,
      })

      // Verify component snippets exist for each node
      expect(result.componentSnippets.size).toBe(testNodes.length)

      for (const node of testNodes) {
        const snippet = result.componentSnippets.get(node.id)
        expect(snippet).toBeDefined()
        expect(typeof snippet?.description).toBe('string')
        expect(Array.isArray(snippet?.responsibilities)).toBe(true)
        expect(Array.isArray(snippet?.antiResponsibilities)).toBe(true)

        // Verify content quality
        expect(snippet?.description.length).toBeGreaterThan(10)
        expect(snippet?.responsibilities.length).toBeGreaterThanOrEqual(3)
        expect(snippet?.antiResponsibilities.length).toBeGreaterThanOrEqual(3)
      }
    }, 60000) // 60s timeout for multiple component calls

    it('handles progress callback during generation', async () => {
      if (!config) return

      const completedSnippets: string[] = []

      await generateSnippets({
        nodes: [testNodes[0]!], // Single node for faster test
        projectName: 'Callback Test',
        apiKey: config.apiKey,
        provider: config.provider,
        modelId: config.modelId,
        onSnippetComplete: (type) => {
          completedSnippets.push(type)
        },
      })

      // Should have 5 completions: 2 project-level + 3 component-level
      expect(completedSnippets.length).toBe(5)
      expect(completedSnippets).toContain('project-description')
      expect(completedSnippets).toContain('boundary-additions')
      expect(completedSnippets).toContain('component-description')
      expect(completedSnippets).toContain('component-responsibilities')
      expect(completedSnippets).toContain('anti-responsibilities')
    }, 60000)
  })

  describe('generateWithAI (full pipeline)', () => {
    it('generates complete blueprint from real AI', async () => {
      if (!config) return

      const result = await generateWithAI({
        nodes: testNodes,
        edges: [],
        projectName: 'Full Pipeline Test',
        apiKey: config.apiKey,
        provider: config.provider,
        modelId: config.modelId,
      })

      // Verify all documents generated
      expect(result.projectRules).toBeDefined()
      expect(result.agentProtocol).toBeDefined()
      expect(result.componentSpecs).toBeInstanceOf(Map)
      expect(result.componentSpecs.size).toBe(testNodes.length)

      // Verify PROJECT_RULES.md structure
      expect(result.projectRules).toContain('Full Pipeline Test')
      expect(result.projectRules).toContain('## System Overview')
      expect(result.projectRules).toContain('## Component Registry')
      expect(result.projectRules).toContain('React Dashboard')
      expect(result.projectRules).toContain('REST API')

      // Verify AGENT_PROTOCOL.md structure
      expect(result.agentProtocol).toContain('Agent Protocol')
      expect(result.agentProtocol).toContain('Core Principle')

      // Verify component specs have XML tags
      for (const [nodeId, spec] of result.componentSpecs) {
        expect(spec).toContain('<spec')
        expect(spec).toContain('</spec>')
        expect(spec).toContain(`id="${nodeId}"`)
      }
    }, 90000) // 90s timeout for full pipeline

    it('fires onFileComplete callbacks in correct order', async () => {
      if (!config) return

      const completedFiles: string[] = []

      await generateWithAI({
        nodes: [testNodes[0]!], // Single node for faster test
        edges: [],
        projectName: 'Callback Order Test',
        apiKey: config.apiKey,
        provider: config.provider,
        modelId: config.modelId,
        onFileComplete: (fileName) => {
          completedFiles.push(fileName)
        },
      })

      // Files should complete after assembly
      expect(completedFiles).toContain('PROJECT_RULES.md')
      expect(completedFiles).toContain('AGENT_PROTOCOL.md')
      expect(completedFiles.some((f) => f.startsWith('specs/'))).toBe(true)
    }, 60000)

    it('AI descriptions are injected into assembled documents', async () => {
      if (!config) return

      const result = await generateWithAI({
        nodes: testNodes,
        edges: [],
        projectName: 'Injection Test',
        apiKey: config.apiKey,
        provider: config.provider,
        modelId: config.modelId,
      })

      // PROJECT_RULES should have AI-generated description (not placeholder)
      expect(result.projectRules).not.toContain('# AI: Add 2-3 sentence description')

      // Component specs should have descriptions (not just type defaults)
      const frontendSpec = result.componentSpecs.get('node-1')
      expect(frontendSpec).toBeDefined()
      expect(frontendSpec).toContain('## Description')
      // Should have actual content, not just the type label
      expect(frontendSpec?.length).toBeGreaterThan(200)
    }, 90000)
  })

  describe('error handling', () => {
    it('handles invalid API key gracefully', async () => {
      await expect(
        generateSnippets({
          nodes: testNodes,
          projectName: 'Invalid Key Test',
          apiKey: 'invalid-key-12345',
          provider: 'openai',
          modelId: 'gpt-4o-mini',
        })
      ).rejects.toThrow()
    }, 15000)

    it('handles abort signal', async () => {
      if (!config) return

      const controller = new AbortController()

      // Abort immediately
      controller.abort()

      await expect(
        generateSnippets({
          nodes: testNodes,
          projectName: 'Abort Test',
          apiKey: config.apiKey,
          provider: config.provider,
          modelId: config.modelId,
          signal: controller.signal,
        })
      ).rejects.toThrow()
    }, 5000)
  })
})

// =============================================================================
// Validation Tests (schema conformance)
// =============================================================================

describe('E2E: Response Schema Validation', () => {
  let config: TestConfig | null = null

  beforeAll(() => {
    config = getTestConfig()
  })

  it('AI responses conform to Zod schemas', async () => {
    if (!config) return

    // This test validates that real AI responses pass Zod validation
    // If this fails, the AI is producing malformed output
    const result = await generateSnippets({
      nodes: testNodes,
      projectName: 'Schema Validation Test',
      apiKey: config.apiKey,
      provider: config.provider,
      modelId: config.modelId,
    })

    // If we get here without error, schemas validated
    expect(result).toBeDefined()

    // Additional structural checks
    expect(typeof result.projectDescription).toBe('string')
    expect(result.projectDescription.length).toBeLessThanOrEqual(500)

    for (const item of result.boundaryAdditions.isItems) {
      expect(typeof item).toBe('string')
    }

    for (const [, snippet] of result.componentSnippets) {
      expect(snippet.responsibilities.length).toBeGreaterThanOrEqual(3)
      expect(snippet.responsibilities.length).toBeLessThanOrEqual(5)
      expect(snippet.antiResponsibilities.length).toBeGreaterThanOrEqual(3)
      expect(snippet.antiResponsibilities.length).toBeLessThanOrEqual(5)
    }
  }, 90000)
})
