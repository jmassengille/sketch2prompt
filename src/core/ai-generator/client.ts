import OpenAI from 'openai'
import type { AIProvider } from './types'
import { PROVIDER_CONFIG } from './types'

/**
 * Call AI API using OpenAI Responses API
 * @see https://platform.openai.com/docs/api-reference/responses
 */
export async function callAI(
  client: OpenAI,
  prompt: string,
  modelId: string,
  taskDescription: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    const response = await client.responses.create(
      {
        model: modelId,
        input: prompt,
      },
      { signal }
    )

    const content = response.output_text
    if (!content) {
      throw new Error(`No content returned for ${taskDescription}`)
    }

    return content.trim()
  } catch (error) {
    // Handle abort gracefully
    if (signal?.aborted) {
      throw new Error(`Generation cancelled for ${taskDescription}`)
    }
    if (error instanceof Error) {
      throw new Error(`Failed to generate ${taskDescription}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Create OpenAI client configured for the specified provider
 */
export function createClient(
  apiKey: string,
  provider: AIProvider
): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: PROVIDER_CONFIG[provider].baseURL,
    dangerouslyAllowBrowser: true, // Required for client-side
  })
}
