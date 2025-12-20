import { useMemo } from 'react'
import {
  generateProjectRulesTemplate,
  generateAgentProtocolTemplate,
  generateComponentYamlTemplate,
} from '../core/template-generator'
import { exportJson } from '../core/export-json'
import type { DiagramNode, DiagramEdge } from '../core/types'
import type { PreviewFile } from '../components/preview/FileTreePreview'
import type { OutOfScopeId } from '../core/onboarding'

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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

    // 1. PROJECT_RULES.md (always first)
    const projectRules = generateProjectRulesTemplate(nodes, edges, projectName)
    files.push({
      name: 'PROJECT_RULES.md',
      content: projectRules,
      language: 'markdown',
      size: getByteSize(projectRules),
      description: 'System boundaries, component registry, and architectural constraints',
    })

    // 2. AGENT_PROTOCOL.md (always second)
    const agentProtocol = generateAgentProtocolTemplate(nodes, projectName, outOfScope)
    files.push({
      name: 'AGENT_PROTOCOL.md',
      content: agentProtocol,
      language: 'markdown',
      size: getByteSize(agentProtocol),
      description: 'Workflow phases, code standards, and implementation guidance',
    })

    // 3. specs/*.yaml (sorted alphabetically by filename)
    const specFiles: PreviewFile[] = nodes.map((node) => {
      const slug = slugify(node.data.label)
      const filename = `specs/${slug}.yaml`
      const content = generateComponentYamlTemplate(node, edges, nodes)
      return {
        name: filename,
        content,
        language: 'yaml' as const,
        size: getByteSize(content),
        description: `${node.data.type} component: responsibilities, integrations, validation`,
      }
    })

    // Sort specs alphabetically by filename
    specFiles.sort((a, b) => a.name.localeCompare(b.name))
    files.push(...specFiles)

    // 4. diagram.json (always last)
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
