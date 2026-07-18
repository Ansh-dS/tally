/**
 * analytics/reducer.ts
 *
 * Pure, stateless reducer that aggregates raw Response rows into per-block
 * analytics summaries.  Zero external libraries — only native JS reducers.
 */

import { Prisma } from '@prisma/client'
import {
  DB_TYPE_TO_FORM_BLOCK_TYPE,
  type AnswerValue,
  type BinaryStatData,
  type FormAggregationResult,
  type FormBlock,
  type RawTextArray,
  type RechartsDataArray,
  type ResponseData,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Internal accumulator types — private to this file
// ─────────────────────────────────────────────────────────────────────────────

interface ChoiceAcc {
  kind: 'choice'
  blockType: 'SINGLE CHOICE' | 'MULTIPLE CHOICE' | 'SELECT MENU'
  blockLabel: string
  counts: Map<string, number>
}

interface ToggleAcc {
  kind: 'toggle'
  blockLabel: string
  trueCount: number
  falseCount: number
}

interface TextAcc {
  kind: 'text'
  blockType: 'SHORT TEXT' | 'EMAIL FIELD'
  blockLabel: string
  entries: RawTextArray
}

interface LongTextAcc {
  kind: 'longText'
  blockLabel: string
  strings: string[]
}

interface NullAcc {
  kind: 'null'
  blockType: 'ACTION BUTTON' | 'ALERT NOTICE'
  blockLabel: string
}

type BlockAcc = ChoiceAcc | ToggleAcc | TextAcc | LongTextAcc | NullAcc

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Narrow the opaque Prisma JsonValue to our ResponseData shape.
 * Returns null for non-object values (null, scalar, array).
 */
function parseResponseData(raw: Prisma.JsonValue): ResponseData | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null
  }
  return raw as ResponseData
}

/**
 * Coerce a boolean-ish AnswerValue to a JS boolean.
 * Handles: actual booleans, "true"/"false" strings, 1/0 numbers, "on"/"off".
 */
function coerceToBool(value: AnswerValue): boolean {
  return value === true || value === 'true' || value === 1 || value === 'on'
}

// ─────────────────────────────────────────────────────────────────────────────
// Core reducer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * aggregateResponses
 *
 * Iterates over every submission and groups answer values by block.
 * Branches on the canonical FormBlockType derived from the DB block type:
 *
 *  SHORT TEXT / EMAIL FIELD  → RawTextArray  (id + value + submittedAt)
 *  LONG TEXT                 → string[]      (for Groq AI router / Feature2Inputs)
 *  SINGLE CHOICE / SELECT MENU / MULTIPLE CHOICE → RechartsDataArray
 *  TOGGLE SWITCH             → BinaryStatData
 *  ACTION BUTTON / ALERT NOTICE → null
 *
 * @param blocks        The form's block definitions (from Form.blocks JSON field).
 * @param submissions   All Response rows — must include id, data, createdAt.
 * @param totalViews    Pre-fetched FormVisitor count for conversion rate.
 * @returns             Omit<FormAggregationResult, 'formId' | 'layout' | 'formInsight'>
 */
export function aggregateResponses(
  blocks: FormBlock[],
  submissions: { id: string; data: Prisma.JsonValue; createdAt: Date }[],
  totalViews: number
): Omit<FormAggregationResult, 'formId' | 'layout' | 'formInsight'> {
  const totalSubmissions = submissions.length

  // Safety check: protect against malformed JSON or null in the database
  const safeBlocks = Array.isArray(blocks) ? blocks : []

  // ── Phase 1: Initialise one accumulator per block ─────────────────────────
  // Pre-populating from the block definitions (not lazily from responses)
  // guarantees that every answerable block appears in the output even with 0 answers.
  const initAcc = safeBlocks.reduce<Record<string, BlockAcc>>((acc, block) => {
    const formBlockType = DB_TYPE_TO_FORM_BLOCK_TYPE[block.type]
    if (!formBlockType) return acc // unknown DB type — skip

    switch (formBlockType) {
      case 'SINGLE CHOICE':
      case 'MULTIPLE CHOICE':
      case 'SELECT MENU':
        acc[block.id] = {
          kind: 'choice',
          blockType: formBlockType,
          blockLabel: block.label,
          counts: new Map<string, number>(),
        }
        break

      case 'TOGGLE SWITCH':
        acc[block.id] = {
          kind: 'toggle',
          blockLabel: block.label,
          trueCount: 0,
          falseCount: 0,
        }
        break

      case 'SHORT TEXT':
      case 'EMAIL FIELD':
        acc[block.id] = {
          kind: 'text',
          blockType: formBlockType,
          blockLabel: block.label,
          entries: [],
        }
        break

      case 'LONG TEXT':
        acc[block.id] = {
          kind: 'longText',
          blockLabel: block.label,
          strings: [],
        }
        break

      case 'ACTION BUTTON':
      case 'ALERT NOTICE':
        acc[block.id] = {
          kind: 'null',
          blockType: formBlockType,
          blockLabel: block.label,
        }
        break
    }

    return acc
  }, {})

  // ── Phase 2: Reduce all submissions into the accumulator ──────────────────
  const filled = submissions.reduce<Record<string, BlockAcc>>(
    (acc, submission) => {
      const responseData = parseResponseData(submission.data)
      if (!responseData) return acc // malformed row — skip silently

      for (const [blockId, rawValue] of Object.entries(responseData)) {
        const slot = acc[blockId]
        // Skip if block unknown (form edited after submission) or non-answerable
        if (!slot || slot.kind === 'null') continue

        const value = rawValue as AnswerValue

        if (slot.kind === 'choice') {
          // MULTIPLE CHOICE (checkbox) can submit an array of selected options —
          // each selected option is counted independently so the Recharts bar
          // chart shows per-option frequency rather than per-submission frequency.
          if (Array.isArray(value)) {
            for (const option of value) {
              const key = String(option)
              slot.counts.set(key, (slot.counts.get(key) ?? 0) + 1)
            }
          } else {
            const key = String(value)
            slot.counts.set(key, (slot.counts.get(key) ?? 0) + 1)
          }
        } else if (slot.kind === 'toggle') {
          if (coerceToBool(value)) {
            slot.trueCount++
          } else {
            slot.falseCount++
          }
        } else if (slot.kind === 'text') {
          slot.entries.push({
            id: submission.id,
            value: String(value),
            submittedAt: submission.createdAt,
          })
        } else if (slot.kind === 'longText') {
          slot.strings.push(String(value))
        }
      }

      return acc
    },
    initAcc
  )

  // ── Phase 3: Finalise — shape accumulators into output types ──────────────
  // Iterating `safeBlocks` (not Object.keys) preserves form-definition order.
  const aggregatedBlocks: FormAggregationResult['aggregatedBlocks'] = {}

  safeBlocks.forEach((block) => {
    const slot = filled[block.id]
    if (!slot) return // block had no accumulator (unknown DB type)

    const formBlockType = DB_TYPE_TO_FORM_BLOCK_TYPE[block.type]
    if (!formBlockType) return

    let data:
      | RechartsDataArray
      | BinaryStatData
      | RawTextArray
      | string[]
      | null

    if (slot.kind === 'choice') {
      // Sort descending by vote count so the most popular option renders first
      const rechartsData: RechartsDataArray = Array.from(slot.counts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
      data = rechartsData
    } else if (slot.kind === 'toggle') {
      const total = slot.trueCount + slot.falseCount
      const binaryData: BinaryStatData = {
        trueCount: slot.trueCount,
        falseCount: slot.falseCount,
        total,
        ratioString: `${slot.trueCount}/${total}`,
      }
      data = binaryData
    } else if (slot.kind === 'text') {
      data = slot.entries
    } else if (slot.kind === 'longText') {
      data = slot.strings
    } else {
      // ACTION BUTTON / ALERT NOTICE
      data = null
    }

    aggregatedBlocks[block.id] = {
      blockType: formBlockType,
      questionLabel: block.label,
      data,
    }
  })

  // ── Compute conversion rate ───────────────────────────────────────────────
  const conversionRate =
    totalViews > 0
      ? `${((totalSubmissions / totalViews) * 100).toFixed(1)}%`
      : '0%'

  return {
    totalViews,
    totalSubmissions,
    conversionRate,
    aggregatedBlocks,
  }
}
