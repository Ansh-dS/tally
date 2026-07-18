/**
 * analytics/longTextAi.ts
 *
 * Typed bridge between the analytics aggregation pipeline and the Groq AI router.
 * Accepts a Feature2Inputs payload, calls aiResponse, and returns a validated
 * aiFormQualitativeSummary — with no unsafe casts.
 */

import { aiResponse } from '@/lib/ai/chooseAi/llmProvider'
import type {
  Feature2Inputs,
  FormQualitativeInsight,
  RechartsDataPoint,
  SentimentDataPoint,
  aiFormQualitativeSummary,
} from '@/lib/ai/inputsAndOutputs'

// ─────────────────────────────────────────────────────────────────────────────
// Runtime type guard — no libraries
// ─────────────────────────────────────────────────────────────────────────────

const VALID_SENTIMENTS = new Set(['Positive', 'Neutral', 'Negative'])

/**
 * Narrow an unknown value to RechartsDataPoint[].
 * Each element must have { name: string; value: number }.
 */
function isRechartsDataPointArray(val: unknown): val is RechartsDataPoint[] {
  return (
    Array.isArray(val) &&
    val.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).name === 'string' &&
        typeof (item as Record<string, unknown>).value === 'number'
    )
  )
}

/**
 * Narrow an unknown value to SentimentDataPoint[].
 * Must be exactly 3 entries with names drawn from the Positive/Neutral/Negative set.
 */
function isSentimentDataPointArray(val: unknown): val is SentimentDataPoint[] {
  return (
    Array.isArray(val) &&
    val.length === 3 &&
    val.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        VALID_SENTIMENTS.has(
          (item as Record<string, unknown>).name as string
        ) &&
        typeof (item as Record<string, unknown>).value === 'number'
    )
  )
}

/**
 * Full guard for the FormQualitativeInsight shape returned by the LLM.
 * Returns the strongly-typed object if valid, null otherwise.
 */
function parseFormQualitativeInsight(
  raw: unknown
): FormQualitativeInsight | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }

  const obj = raw as Record<string, unknown>

  if (
    typeof obj.executiveSummary !== 'string' ||
    !isRechartsDataPointArray(obj.intentTags) ||
    !isSentimentDataPointArray(obj.sentimentSplit)
  ) {
    return null
  }

  return {
    executiveSummary: obj.executiveSummary,
    intentTags: obj.intentTags,
    sentimentSplit: obj.sentimentSplit,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public bridge function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * analyseLongTextBlock
 *
 * Takes a Feature2Inputs payload (built from the LONG TEXT block aggregation
 * result) and returns a fully-typed aiFormQualitativeSummary.
 *
 * Flow:
 *   Feature2Inputs
 *     → aiResponse (Groq router)
 *       → groqResponse (LLM call + JSON.parse)
 *         → parseFormQualitativeInsight (runtime type guard, no libraries)
 *           → aiFormQualitativeSummary
 *
 * @param input  The Feature2Inputs object — questionId, questionLabel, rawResponses[].
 */
export async function analyseLongTextBlock(
  input: Feature2Inputs
): Promise<aiFormQualitativeSummary> {
  // ── Guard: nothing to analyse ─────────────────────────────────────────────
  if (input.data.rawResponses.length === 0) {
    return {
      status: 'success',
      data: null,
      message: 'No long-text responses collected for this block yet.',
    }
  }

  // ── Call the AI router ────────────────────────────────────────────────────
  // We pass the full data object (questionId + questionLabel + rawResponses)
  // as the `data` field so the prompt can reference the question label and
  // enumerate the responses array.
  const aiRes = await aiResponse({
    modelName: input.modelName,
    featureType: input.featureType,
    data: input.data,
  })

  // ── Handle router-level failures ──────────────────────────────────────────
  // aiResponse returns undefined when the modelName hits an unimplemented
  // provider case in the switch statement (Gemini / OpenAI / Grok stubs).
  if (aiRes == null) {
    return {
      status: 'error',
      data: null,
      message:
        'The AI router returned null — the LLM provider may be unavailable or not yet implemented.',
    }
  }

  if (aiRes.status !== 'success' || !aiRes.data) {
    return {
      status: 'error',
      data: null,
      message: aiRes.message ?? 'AI analysis failed with an unknown error.',
    }
  }

  // ── Validate the parsed JSON against FormQualitativeInsight ───────────────
  // groqResponse already called JSON.parse; aiRes.data is the raw parsed object.
  const insight = parseFormQualitativeInsight(aiRes.data)

  if (!insight) {
    return {
      status: 'error',
      data: null,
      message:
        'The LLM returned a malformed response — expected { executiveSummary, intentTags[], sentimentSplit[] }.',
    }
  }

  return {
    status: 'success',
    data: insight,
    message: '',
  }
}
