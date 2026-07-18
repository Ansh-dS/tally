// takes up the prompt and provide the analytics.
import groqClient from './groqClient'
import { failedResponse, successResponse } from '@/lib/utils/apiResponse'
import { type InsightType } from '../prompts'
import { buildPrompt, handleGroqError } from './utils'

interface GroqInputs {
  featureType: InsightType
  questionAsked: string | null
  data: unknown
}

// timeout()
// retries
// error handlings
export async function groqResponse({
  featureType,
  questionAsked,
  data,
}: GroqInputs) {
  // 1. replacing "#DATA" and "#QUESTION" in our prompt.
  const finalUserPrompt = buildPrompt({
    featureType: featureType,
    data,
    questionAsked,
  })

  try {
    // 2. Execute with built-in timeouts, native retries, and structural handling
    const response = await groqClient.chat.completions.create(
      {
        messages: [
          {
            role: 'system',
            content:
              'You are an AI data assistant. Always respond with a raw, valid JSON object matching the requested schema. Do not output markdown fences like ```json.',
          },
          {
            role: 'user',
            content: finalUserPrompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        temperature: 0.2,
      },
      {
        // Native configurations passed into the request options
        timeout: 10 * 1000, // 10 Seconds Timeout limit before throwing an abort error
        maxRetries: 3, // Automatically handles exponential backoff retries on 429 (Rate Limits) or 5xx server issues
      }
    )

    // 3. Extract payload safely using standard content reading
    const rawContent = response.choices[0]?.message?.content

    if (!rawContent) {
      return failedResponse({
        message: 'LLM returned an empty choice sequence payload.',
      })
    }

    // Parse and return structural wrapper success
    const parsedJson = JSON.parse(rawContent)
    return successResponse({
      data: parsedJson,
    })
  } catch (err) {
    const rich = handleGroqError(err)
    console.error('GroqAi is generating error', rich)
    return rich
  }
}
