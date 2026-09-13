'use server'

/**
 * action/analytics.ts
 *
 * Server Action: getFormAnalytics
 *
 * Fetches a Form (blocks + submissions) and the total visitor count in
 * parallel, then delegates aggregation to the pure reducer.
 */

import { prismaClient } from '@db/client'
import { getAuthorizedUser } from '@actions/dashboard'
import { aggregateResponses } from '@/lib/analytics/reducer'
import { analyseLongTextBlock } from '@/lib/analytics/longTextAi'
import type { FormAggregationResult, FormBlock } from '@/lib/analytics/types'
import type {
  Feature2Inputs,
  aiFormQualitativeSummary,
} from '@/lib/ai/inputsAndOutputs'
import type { llmModels } from '@/lib/ai/chooseAi/llmProvider'

// ─────────────────────────────────────────────────────────────────────────────
// Public server action
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getFormAnalytics
 *
 * Fetches a Form by ID (ownership-checked) and returns a fully typed
 * FormAggregationResult.
 *
 * @param formId  The CUID of the form to analyse.
 * @param path    The calling Next.js route path — forwarded to protectApiRoute.
 */
export async function getFormAnalytics(
  formId: string,
  path: string = '/forms'
): Promise<FormAggregationResult> {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const user = await getAuthorizedUser(path)

  // ── 2. Fetch Form + Submissions + Visitor count in parallel ───────────────
  // We fetch FormVisitor.count concurrently with the form query to minimise
  // round-trip latency.  The ownership guard on the form query ensures a user
  // can only analyse their own forms; the visitor count has no ownership
  // requirement (visitors are anonymous by design).
  const [form, totalViews] = await Promise.all([
    prismaClient.form.findUnique({
      where: {
        id: formId,
        userId: user.id, // ownership guard
      },
      select: {
        id: true,
        blocks: true,
        formInsight: true,
        submissions: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, // needed for RawTextArray.id
            data: true,
            createdAt: true, // needed for RawTextArray.submittedAt
          },
        },
      },
    }),
    prismaClient.formVisitor.count({
      where: { formId },
    }),
  ])

  // ── 3. Guard: form not found or not owned by this user ────────────────────
  if (!form) {
    return {
      formId,
      totalViews,
      totalSubmissions: 0,
      conversionRate: '0%',
      layout: [],
      formInsight: null,
      aggregatedBlocks: {},
    }
  }

  // ── 4. Cast opaque JSON blocks field to our typed FormBlock[] ──────────────
  // Runtime shape is guaranteed by the Zod blockSchema enforced on every
  // createForm / updateForm write path (src/lib/schemas/form.ts).
  const blocks = form.blocks as unknown as FormBlock[]

  // ── 5. Aggregate via the pure reducer ─────────────────────────────────────
  const result = aggregateResponses(blocks, form.submissions, totalViews)

  // ── 6. Attach the real formId (reducer returns '' to stay formId-agnostic) ─
  return {
    ...result,
    formId: form.id,
    layout: blocks,
    formInsight: form.formInsight,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI processing action for LONG TEXT blocks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getFormLongTextInsights
 *
 * Feeds the raw string responses from a specific LONG TEXT block into the
 * Groq AI router and returns a validated FormQualitativeInsight.
 *
 * Composes on top of getFormAnalytics — no extra DB query needed.
 *
 * @param formId    The CUID of the form.
 * @param blockId   The ID of the LONG TEXT block to analyse.
 * @param modelName The LLM provider to use (defaults to 'Groq').
 * @param path      The calling Next.js route path for auth.
 */
export async function getFormLongTextInsights(
  formId: string,
  blockId: string,
  modelName: llmModels = 'Groq',
  path: string = '/forms'
): Promise<aiFormQualitativeSummary> {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  await getAuthorizedUser(path)

  // ── 2. Get the full aggregation result (reuses existing action) ────────────
  const aggregation = await getFormAnalytics(formId, path)

  // ── 3. Locate the target block ─────────────────────────────────────────────
  const blockEntry = aggregation.aggregatedBlocks[blockId]

  if (!blockEntry) {
    return {
      status: 'error',
      data: null,
      message: `Block '${blockId}' not found in form '${formId}'.`,
    }
  }

  // ── 4. Guard: block must be a LONG TEXT block ──────────────────────────────
  if (blockEntry.blockType !== 'LONG TEXT') {
    return {
      status: 'error',
      data: null,
      message: `Block '${blockId}' is of type '${blockEntry.blockType}', not 'LONG TEXT'. Only LONG TEXT blocks can be analysed with this action.`,
    }
  }

  // ── 5. Construct Feature2Inputs ────────────────────────────────────────────
  // At this point data is string[] (guaranteed by the reducer for LONG TEXT blocks).
  const rawResponses = (blockEntry.data ?? []) as string[]

  const input: Feature2Inputs = {
    data: {
      questionId: blockId,
      questionLabel: blockEntry.questionLabel,
      rawResponses,
    },
    modelName,
    featureType: 'FORM_QUALITATIVE_INSIGHTS',
  }

  // ── 6. Delegate to the typed AI bridge ────────────────────────────────────
  return analyseLongTextBlock(input)
}
