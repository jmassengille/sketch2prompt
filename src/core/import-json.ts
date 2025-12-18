import type { ZodError } from 'zod'
import { safeParseDiagram, type ValidatedDiagram } from './schema'

export type ImportResult =
  | { ok: true; data: ValidatedDiagram }
  | { ok: false; error: string }

function formatZodError(error: ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    return `${path}${issue.message}`
  })

  if (issues.length === 1) {
    return issues[0] ?? 'Validation error'
  }

  return `Validation errors:\n${issues.map((i) => `  - ${i}`).join('\n')}`
}

export function importJson(json: string): ImportResult {
  // Try to parse JSON
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { ok: false, error: 'Invalid JSON format. Please check for syntax errors.' }
  }

  // Validate against schema
  const result = safeParseDiagram(parsed)

  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) }
  }

  return { ok: true, data: result.data }
}
