import { InsightType } from '../prompts'
import { groqResponse } from '../llms/groq'
import { ApiResponse } from '@/lib/utils/apiResponse'
export type llmModels = 'Gemini' | 'Groq' | 'OpenAi' | 'Grok'

export interface AiInputs {
  question?: string | null
  modelName: llmModels
  featureType: InsightType
  data?: unknown
}

type ResponseFunction<T> = () => Promise<T>

// we can ask three tyeps of questions
// for each we need to different type of output.
export async function aiResponse({
  question,
  modelName,
  featureType,
  data,
}: AiInputs) {
  if (!question) question = ''
  switch (modelName) {
    case 'Groq':
      return await structureAiResponse(() =>
        groqResponse({
          featureType: featureType,
          questionAsked: question,
          data: data,
        })
      )
    case 'Gemini':
    case 'Grok':
    case 'OpenAi':
  }
}

async function structureAiResponse<T>(
  responseFuntion: ResponseFunction<T>
): Promise<Partial<ApiResponse> | null> {
  try {
    const response = (await responseFuntion()) as Partial<ApiResponse>
    return response
  } catch (err) {
    console.error("Can't able to structure aiResponse.")
    return null
  }
}
