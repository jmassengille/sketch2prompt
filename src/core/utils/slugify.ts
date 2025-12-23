/**
 * Slugify - Convert text to URL/filename-safe format
 *
 * Used for:
 * - Component spec filenames (specs/component-name.yaml)
 * - Blueprint ZIP filenames (project-name-blueprint.zip)
 * - Preview filenames in UI
 */

/**
 * Convert text to a lowercase, hyphen-separated slug suitable for filenames.
 *
 * Algorithm:
 * 1. Convert to lowercase
 * 2. Replace non-alphanumeric sequences with hyphens
 * 3. Trim leading/trailing hyphens
 * 4. Return fallback if result is empty
 *
 * @param text - The input text to slugify
 * @param fallback - Value to return if result is empty (default: 'untitled')
 * @returns A filename-safe slug
 *
 * @example
 * slugify('My Component') // 'my-component'
 * slugify('React Frontend!') // 'react-frontend'
 * slugify('') // 'untitled'
 * slugify('', 'default') // 'default'
 */
export function slugify(text: string, fallback = 'untitled'): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || fallback
}
