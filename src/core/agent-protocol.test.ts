import { describe, it, expect } from 'vitest'
import { generateAgentProtocolTemplate } from './template-generator/generators/agent-protocol'
import type { DiagramNode, NodeType } from './types'

// Test helper to create nodes
const createNode = (
  id: string,
  label: string,
  type: NodeType,
  techStack?: string[],
): DiagramNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { label, type, meta: techStack ? { techStack } : {} },
})

describe('generateAgentProtocolTemplate', () => {
  it('generates valid markdown with all 6 sections', () => {
    const nodes: DiagramNode[] = [createNode('node-1', 'API', 'backend', ['Node.js'])]
    const result = generateAgentProtocolTemplate(nodes, 'Test Project')

    expect(result).toContain('# Agent Protocol')
    expect(result).toContain('## Core Principle')
    expect(result).toContain('## Status Tracking (MANDATORY)')
    expect(result).toContain('## Workflow Guidance')
    expect(result).toContain('## Scope Discipline')
    expect(result).toContain('## Library Policy')
    expect(result).toContain('## Code Standards')
  })

  it('includes Core Principle section', () => {
    const result = generateAgentProtocolTemplate([], 'Test')

    expect(result).toContain('## Core Principle')
    expect(result).toContain('The system you are building already has rules')
    expect(result).toContain('Read `PROJECT_RULES.md` to understand system boundaries')
    expect(result).toContain('Load ONLY the component spec you are currently implementing')
    expect(result).toContain('Do not load other specs unless resolving an integration contract')
  })

  it('includes Status Tracking section (generic, not .claude specific)', () => {
    const result = generateAgentProtocolTemplate([], 'Test')

    expect(result).toContain('## Status Tracking (MANDATORY)')
    expect(result).toContain('`STATUS.md` tracks current phase, milestone, and progress')
    expect(result).toContain('Update after every feature or milestone')
    expect(result).toContain('# Project Status')
    expect(result).toContain('## Current Phase')
    expect(result).toContain('## Active Component')
    expect(result).toContain('## Current Milestone')
    expect(result).toContain('## Progress')
    expect(result).toContain('## Blockers')
    expect(result).toContain('## Last Updated')
    // Should NOT contain .claude specific path
    expect(result).not.toContain('.claude/STATUS.md')
  })

  it('includes Workflow Guidance section', () => {
    const result = generateAgentProtocolTemplate([], 'Test')

    expect(result).toContain('## Workflow Guidance')
    expect(result).toContain('1. **Index**')
    expect(result).toContain('2. **Plan**')
    expect(result).toContain('3. **Implement**')
    expect(result).toContain('4. **Verify**')
    expect(result).toContain('Map files and dependencies in scope')
    expect(result).toContain('Research latest stable versions')
    expect(result).toContain('Follow the plan')
    expect(result).toContain('Check exit criteria')
  })

  it('includes Scope Discipline with ALWAYS/NEVER/PREFER', () => {
    const result = generateAgentProtocolTemplate([], 'Test')

    expect(result).toContain('## Scope Discipline')
    expect(result).toContain('### ALWAYS')
    expect(result).toContain('### NEVER')
    expect(result).toContain('### PREFER')

    // Check ALWAYS section
    expect(result).toContain('Implement what the spec defines')
    expect(result).toContain('Flag gaps or ambiguities')
    expect(result).toContain('Use baseline deps from spec as version anchors')
    expect(result).toContain('Follow code standards from `PROJECT_RULES.md`')
    expect(result).toContain('Verify exit criteria before marking component complete')
    expect(result).toContain('Update `STATUS.md` after every feature/milestone')

    // Check NEVER section
    expect(result).toContain('Add features not in the spec')
    expect(result).toContain('Refactor adjacent components unprompted')
    expect(result).toContain('Upgrade deps beyond stable versions in spec')
    expect(result).toContain('Create abstractions for hypothetical future requirements')
    expect(result).toContain('Proceed to next component before current passes verification')

    // Check PREFER section
    expect(result).toContain('Established libraries over custom implementations')
    expect(result).toContain('Explicit over implicit')
    expect(result).toContain('Composition over inheritance')
    expect(result).toContain('Failing fast over silent degradation')
    expect(result).toContain('Asking over assuming when spec is ambiguous')
  })

  it('includes Library Policy section', () => {
    const result = generateAgentProtocolTemplate([], 'Test')

    expect(result).toContain('## Library Policy')
    expect(result).toContain('**Search before building.**')
    expect(result).toContain('1. Current codebase utilities')
    expect(result).toContain('2. Project dependencies')
    expect(result).toContain('3. Well-maintained packages (PyPI, npm, etc.)')
    expect(result).toContain('parsing, validation, date/time, HTTP clients, file formats')
    expect(result).toContain('Custom code only when no suitable library exists')
  })

  it('includes Code Standards section', () => {
    const result = generateAgentProtocolTemplate([], 'Test')

    expect(result).toContain('## Code Standards')
    expect(result).toContain('**Modular**')
    expect(result).toContain('**Extensible**')
    expect(result).toContain('**Debuggable**')
    expect(result).toContain('**Testable**')
  })

  it('detects TypeScript stack and includes ESLint standards', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend', ['TypeScript', 'React']),
      createNode('node-2', 'API', 'backend', ['Node.js', 'Express']),
    ]

    const result = generateAgentProtocolTemplate(nodes, 'Test')

    expect(result).toContain('| Stack | Standards |')
    expect(result).toContain('TypeScript')
    expect(result).toContain('ESLint, strict mode, explicit types')
  })

  it('detects Python stack and includes PEP 8 standards', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'API', 'backend', ['Python', 'FastAPI']),
      createNode('node-2', 'Database', 'storage', ['PostgreSQL']),
    ]

    const result = generateAgentProtocolTemplate(nodes, 'Test')

    expect(result).toContain('| Stack | Standards |')
    expect(result).toContain('Python')
    expect(result).toContain('PEP 8, type hints, docstrings')
  })

  it('handles nodes with no tech stack gracefully', () => {
    const nodes: DiagramNode[] = [
      createNode('node-1', 'Frontend', 'frontend'),
      createNode('node-2', 'API', 'backend'),
    ]

    const result = generateAgentProtocolTemplate(nodes, 'Test')

    // Should still have Code Standards section
    expect(result).toContain('## Code Standards')
    expect(result).toContain('General principles:')
    expect(result).toContain('**Modular**')
    expect(result).toContain('**Extensible**')
    // Should not have a tech stack table
    expect(result).not.toContain('| Stack | Standards |')
  })
})
