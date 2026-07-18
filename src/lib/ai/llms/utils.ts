import { errorResponse } from '@/lib/utils/apiResponse'
import { type InsightType, PROMPTS } from '../prompts'

interface BuildPromptArgs {
  featureType: InsightType
  data: unknown
  questionAsked?: string | null
}

// Replacing the '#DATA' and '#QUESTION' inside prompts.
export function buildPrompt({
  featureType,
  data,
  questionAsked,
}: BuildPromptArgs): string {
  // 1. Fetch the correct template
  let prompt = PROMPTS[featureType]

  // 2. Inject the data payload
  prompt = prompt.replace('#DATA', JSON.stringify(data, null, 2))

  // 3. Inject the user question (or remove the placeholder if none exists)
  if (questionAsked) {
    prompt = prompt.replace('#QUESTION', questionAsked)
  } else {
    // Fallback: If for some reason a question wasn't asked but the template expects one
    prompt = prompt.replace('#QUESTION', 'Please summarize this data.')
  }

  return prompt
}

export function handleGroqError(err: unknown) {
  // 4. Robust structural error handling block
  console.error('☠️ Groq Resilient Processing Pipeline Failed:', err)

  // Catch explicitly timed-out abort calls
  if (
    err instanceof Error &&
    (err.name === 'AbortError' || err.message?.includes('timeout'))
  ) {
    return errorResponse({
      message: 'The AI analysis request timed out after 10 seconds.',
    })
  }

  // Catch internal syntax parsing errors if LLM outputs dirty JSON strings
  if (err instanceof SyntaxError) {
    return errorResponse({
      message: 'Failed to process AI output: Response format was corrupted.',
    })
  }

  // Standard fallback error signature
  return errorResponse({
    message:
      err instanceof Error
        ? err.message
        : 'An unexpected error occurred during AI token generation.',
  })
}
// Three features same modle=> how to provide the correct data for each:
// By taking same input same output.
// we first need to collect input data before sending it to ai.
