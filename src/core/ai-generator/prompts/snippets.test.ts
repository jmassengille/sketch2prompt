import { describe, it, expect } from 'vitest'
import {
  buildProjectDescriptionPrompt,
  buildBoundaryAdditionsPrompt,
  buildComponentDescriptionPrompt,
  buildComponentResponsibilitiesPrompt,
  buildAntiResponsibilitiesPrompt,
} from './snippets'
import type { NodeType } from '../../types'

// =============================================================================
// buildProjectDescriptionPrompt Tests
// =============================================================================

describe('buildProjectDescriptionPrompt', () => {
  it('returns correct snippet type', () => {
    const result = buildProjectDescriptionPrompt(
      [{ label: 'API', type: 'backend' }],
      'TestProject'
    )

    expect(result.type).toBe('project-description')
  })

  it('includes project name in prompt', () => {
    const result = buildProjectDescriptionPrompt(
      [{ label: 'API', type: 'backend' }],
      'MyAwesomeProject'
    )

    expect(result.prompt).toContain('MyAwesomeProject')
  })

  it('includes component summary', () => {
    const result = buildProjectDescriptionPrompt(
      [
        { label: 'Web App', type: 'frontend' },
        { label: 'API Server', type: 'backend' },
      ],
      'TestProject'
    )

    expect(result.prompt).toContain('Web App (frontend)')
    expect(result.prompt).toContain('API Server (backend)')
  })

  it('includes type breakdown', () => {
    const result = buildProjectDescriptionPrompt(
      [
        { label: 'UI', type: 'frontend' },
        { label: 'Admin', type: 'frontend' },
        { label: 'API', type: 'backend' },
      ],
      'TestProject'
    )

    expect(result.prompt).toContain('2 frontend')
    expect(result.prompt).toContain('1 backend')
  })

  it('sets appropriate maxTokens', () => {
    const result = buildProjectDescriptionPrompt(
      [{ label: 'API', type: 'backend' }],
      'TestProject'
    )

    expect(result.maxTokens).toBe(80)
  })

  it('requests JSON output format', () => {
    const result = buildProjectDescriptionPrompt(
      [{ label: 'API', type: 'backend' }],
      'TestProject'
    )

    expect(result.prompt).toContain('JSON')
    expect(result.prompt).toContain('{"description":')
  })

  it('does not include componentId (project-level)', () => {
    const result = buildProjectDescriptionPrompt(
      [{ label: 'API', type: 'backend' }],
      'TestProject'
    )

    expect(result.componentId).toBeUndefined()
  })
})

// =============================================================================
// buildBoundaryAdditionsPrompt Tests
// =============================================================================

describe('buildBoundaryAdditionsPrompt', () => {
  it('returns correct snippet type', () => {
    const result = buildBoundaryAdditionsPrompt(['frontend', 'backend'], 'TestProject')

    expect(result.type).toBe('boundary-additions')
  })

  it('includes project name in prompt', () => {
    const result = buildBoundaryAdditionsPrompt(['backend'], 'MyProject')

    expect(result.prompt).toContain('MyProject')
  })

  it('includes boundary context for each type', () => {
    const result = buildBoundaryAdditionsPrompt(['frontend', 'backend'], 'TestProject')

    expect(result.prompt).toContain('frontend')
    expect(result.prompt).toContain('backend')
    expect(result.prompt).toContain('IS')
    expect(result.prompt).toContain('IS NOT')
  })

  it('deduplicates component types', () => {
    const result = buildBoundaryAdditionsPrompt(
      ['frontend', 'frontend', 'backend', 'backend', 'backend'],
      'TestProject'
    )

    // Should only appear once each
    const frontendCount = (result.prompt.match(/- frontend:/g) ?? []).length
    const backendCount = (result.prompt.match(/- backend:/g) ?? []).length

    expect(frontendCount).toBe(1)
    expect(backendCount).toBe(1)
  })

  it('requests JSON output with isItems and isNotItems', () => {
    const result = buildBoundaryAdditionsPrompt(['backend'], 'TestProject')

    expect(result.prompt).toContain('{"isItems":')
    expect(result.prompt).toContain('"isNotItems":')
  })

  it('sets appropriate maxTokens', () => {
    const result = buildBoundaryAdditionsPrompt(['backend'], 'TestProject')

    expect(result.maxTokens).toBe(80)
  })
})

// =============================================================================
// buildComponentDescriptionPrompt Tests
// =============================================================================

describe('buildComponentDescriptionPrompt', () => {
  it('returns correct snippet type', () => {
    const result = buildComponentDescriptionPrompt(
      { label: 'API', type: 'backend' },
      'node-1'
    )

    expect(result.type).toBe('component-description')
  })

  it('includes componentId', () => {
    const result = buildComponentDescriptionPrompt(
      { label: 'API', type: 'backend' },
      'node-123'
    )

    expect(result.componentId).toBe('node-123')
  })

  it('includes component label and type', () => {
    const result = buildComponentDescriptionPrompt(
      { label: 'React Dashboard', type: 'frontend' },
      'node-1'
    )

    expect(result.prompt).toContain('React Dashboard')
    expect(result.prompt).toContain('frontend')
  })

  it('includes type context', () => {
    const result = buildComponentDescriptionPrompt(
      { label: 'API', type: 'backend' },
      'node-1'
    )

    // Backend context should mention API endpoints, business logic
    expect(result.prompt).toContain('API endpoints')
  })

  it('includes tech stack when provided', () => {
    const result = buildComponentDescriptionPrompt(
      { label: 'API', type: 'backend', techStack: ['Node.js', 'Express'] },
      'node-1'
    )

    expect(result.prompt).toContain('Node.js')
    expect(result.prompt).toContain('Express')
  })

  it('includes user description when provided', () => {
    const result = buildComponentDescriptionPrompt(
      { label: 'API', type: 'backend', description: 'Handles user authentication' },
      'node-1'
    )

    expect(result.prompt).toContain('Handles user authentication')
  })

  it('requests JSON output format', () => {
    const result = buildComponentDescriptionPrompt(
      { label: 'API', type: 'backend' },
      'node-1'
    )

    expect(result.prompt).toContain('{"description":')
  })

  it('sets appropriate maxTokens', () => {
    const result = buildComponentDescriptionPrompt(
      { label: 'API', type: 'backend' },
      'node-1'
    )

    expect(result.maxTokens).toBe(80)
  })
})

// =============================================================================
// buildComponentResponsibilitiesPrompt Tests
// =============================================================================

describe('buildComponentResponsibilitiesPrompt', () => {
  it('returns correct snippet type', () => {
    const result = buildComponentResponsibilitiesPrompt(
      { label: 'API', type: 'backend' },
      'node-1'
    )

    expect(result.type).toBe('component-responsibilities')
  })

  it('includes componentId', () => {
    const result = buildComponentResponsibilitiesPrompt(
      { label: 'API', type: 'backend' },
      'node-456'
    )

    expect(result.componentId).toBe('node-456')
  })

  it('includes component label and type context', () => {
    const result = buildComponentResponsibilitiesPrompt(
      { label: 'User Service', type: 'auth' },
      'node-1'
    )

    expect(result.prompt).toContain('User Service')
    expect(result.prompt).toContain('auth')
  })

  it('includes user description when provided', () => {
    const result = buildComponentResponsibilitiesPrompt(
      { label: 'API', type: 'backend', description: 'Main REST API' },
      'node-1'
    )

    expect(result.prompt).toContain('Main REST API')
  })

  it('requests JSON output with responsibilities array', () => {
    const result = buildComponentResponsibilitiesPrompt(
      { label: 'API', type: 'backend' },
      'node-1'
    )

    expect(result.prompt).toContain('{"responsibilities":')
  })

  it('specifies action verb requirement', () => {
    const result = buildComponentResponsibilitiesPrompt(
      { label: 'API', type: 'backend' },
      'node-1'
    )

    expect(result.prompt).toContain('action verb')
  })

  it('sets appropriate maxTokens', () => {
    const result = buildComponentResponsibilitiesPrompt(
      { label: 'API', type: 'backend' },
      'node-1'
    )

    expect(result.maxTokens).toBe(100)
  })
})

// =============================================================================
// buildAntiResponsibilitiesPrompt Tests
// =============================================================================

describe('buildAntiResponsibilitiesPrompt', () => {
  it('returns correct snippet type', () => {
    const result = buildAntiResponsibilitiesPrompt({ label: 'API', type: 'backend' }, 'node-1')

    expect(result.type).toBe('anti-responsibilities')
  })

  it('includes componentId', () => {
    const result = buildAntiResponsibilitiesPrompt({ label: 'API', type: 'backend' }, 'node-789')

    expect(result.componentId).toBe('node-789')
  })

  it('includes component label and type', () => {
    const result = buildAntiResponsibilitiesPrompt({ label: 'Web App', type: 'frontend' }, 'node-1')

    expect(result.prompt).toContain('Web App')
    expect(result.prompt).toContain('frontend')
  })

  it('includes boundary context (what type should NOT handle)', () => {
    const result = buildAntiResponsibilitiesPrompt({ label: 'Web App', type: 'frontend' }, 'node-1')

    // Frontend should NOT handle backend logic, database access
    expect(result.prompt).toContain('NOT')
  })

  it('requests JSON output with antiResponsibilities array', () => {
    const result = buildAntiResponsibilitiesPrompt({ label: 'API', type: 'backend' }, 'node-1')

    expect(result.prompt).toContain('{"antiResponsibilities":')
  })

  it('specifies NEVER prefix requirement', () => {
    const result = buildAntiResponsibilitiesPrompt({ label: 'API', type: 'backend' }, 'node-1')

    expect(result.prompt).toContain('NEVER')
  })

  it('sets appropriate maxTokens', () => {
    const result = buildAntiResponsibilitiesPrompt({ label: 'API', type: 'backend' }, 'node-1')

    expect(result.maxTokens).toBe(100)
  })
})

// =============================================================================
// Type Coverage Tests
// =============================================================================

describe('type coverage', () => {
  const allTypes: NodeType[] = ['frontend', 'backend', 'storage', 'auth', 'external', 'background']

  it('buildComponentDescriptionPrompt handles all node types', () => {
    for (const type of allTypes) {
      const result = buildComponentDescriptionPrompt({ label: 'Test', type }, 'node-1')

      expect(result.type).toBe('component-description')
      expect(result.prompt).toContain(type)
    }
  })

  it('buildComponentResponsibilitiesPrompt handles all node types', () => {
    for (const type of allTypes) {
      const result = buildComponentResponsibilitiesPrompt({ label: 'Test', type }, 'node-1')

      expect(result.type).toBe('component-responsibilities')
      expect(result.prompt).toContain(type)
    }
  })

  it('buildAntiResponsibilitiesPrompt handles all node types', () => {
    for (const type of allTypes) {
      const result = buildAntiResponsibilitiesPrompt({ label: 'Test', type }, 'node-1')

      expect(result.type).toBe('anti-responsibilities')
      expect(result.prompt).toContain(type)
    }
  })

  it('buildBoundaryAdditionsPrompt handles all node types', () => {
    const result = buildBoundaryAdditionsPrompt(allTypes, 'TestProject')

    for (const type of allTypes) {
      expect(result.prompt).toContain(type)
    }
  })
})
