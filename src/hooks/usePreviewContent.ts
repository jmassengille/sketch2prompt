import { useMemo } from 'react'
import {
  generateProjectRulesTemplate,
  generateAgentProtocolTemplate,
  generateComponentSpecMarkdown,
  generateStartMd,
  generateReadme,
} from '../core/template-generator'
import { exportJson } from '../core/export-json'
import type { DiagramNode, DiagramEdge } from '../core/types'
import type { PreviewFile } from '../components/preview/FileTreePreview'
import type { OutOfScopeId } from '../core/onboarding'
import { slugify } from '../core/utils/slugify'

function getByteSize(content: string): number {
  return new TextEncoder().encode(content).length
}

export function usePreviewContent(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  projectName: string,
  outOfScope: OutOfScopeId[] = []
): PreviewFile[] {
  return useMemo(() => {
    const files: PreviewFile[] = []

    // 1. README.md (human quick-start)
    const readme = generateReadme(projectName)
    files.push({
      name: 'README.md',
      content: readme,
      language: 'markdown',
      size: getByteSize(readme),
      description: 'Quick start guide for humans',
    })

    // 2. START.md (LLM initialization protocol)
    const startMd = generateStartMd(nodes, projectName)
    files.push({
      name: 'START.md',
      content: startMd,
      language: 'markdown',
      size: getByteSize(startMd),
      description: 'Give this to your AI assistant first',
    })

    // 3. PROJECT_RULES.md
    const projectRules = generateProjectRulesTemplate(nodes, edges, projectName)
    files.push({
      name: 'PROJECT_RULES.md',
      content: projectRules,
      language: 'markdown',
      size: getByteSize(projectRules),
      description: 'System boundaries, component registry, and architectural constraints',
    })

    // 3. AGENT_PROTOCOL.md
    const agentProtocol = generateAgentProtocolTemplate(nodes, projectName, outOfScope)
    files.push({
      name: 'AGENT_PROTOCOL.md',
      content: agentProtocol,
      language: 'markdown',
      size: getByteSize(agentProtocol),
      description: 'Workflow phases, code standards, and implementation guidance',
    })

    // 4. specs/*.md (sorted alphabetically by filename)
    const specFiles: PreviewFile[] = nodes.map((node) => {
      const slug = slugify(node.data.label)
      const filename = `specs/${slug}.md`
      const content = generateComponentSpecMarkdown(node, nodes)
      return {
        name: filename,
        content,
        language: 'markdown' as const,
        size: getByteSize(content),
        description: `${node.data.type} component: responsibilities, integrations, validation`,
      }
    })

    // Sort specs alphabetically by filename
    specFiles.sort((a, b) => a.name.localeCompare(b.name))
    files.push(...specFiles)

    // 5. diagram.json (always last)
    const diagramJson = exportJson(nodes, edges)
    files.push({
      name: 'diagram.json',
      content: diagramJson,
      language: 'json',
      size: getByteSize(diagramJson),
      description: 'Re-import this file to restore your diagram in sketch2prompt',
    })

    return files
  }, [nodes, edges, projectName, outOfScope])
}
