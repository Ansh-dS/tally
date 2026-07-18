/**
 * analytics/types.ts
 *
 * All domain types for the Analytics Dashboard feature (v2).
 * Exactly matches the reference types specified by the product team.
 * No external libraries — plain TypeScript only.
 */

import type { FormBlock } from '@utils/store'
import type { FormInsight } from '@prisma/client'

// Re-export for use by the reducer (avoids a second import in that file)
export type { FormBlock }

// ─────────────────────────────────────────────────────────────────────────────
// 1. Human-readable block type union  (exact reference type)
// ─────────────────────────────────────────────────────────────────────────────

export type FormBlockType =
  | 'SHORT TEXT'
  | 'EMAIL FIELD'
  | 'LONG TEXT'
  | 'SINGLE CHOICE'
  | 'MULTIPLE CHOICE'
  | 'SELECT MENU'
  | 'TOGGLE SWITCH'
  | 'ACTION BUTTON'
  | 'ALERT NOTICE'

// ─────────────────────────────────────────────────────────────────────────────
// 2. DB BlockType → FormBlockType mapping  (drives reducer branching)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps the lowercase DB/Zod block type strings (from store.ts: BlockType)
 * to the canonical human-readable FormBlockType.
 *
 *  input      → SHORT TEXT
 *  email      → EMAIL FIELD
 *  textarea   → LONG TEXT
 *  textArea   → LONG TEXT
 *  radio      → SINGLE CHOICE
 *  select     → SELECT MENU
 *  checkbox   → MULTIPLE CHOICE
 *  switch     → TOGGLE SWITCH
 *  Button     → ACTION BUTTON
 *  Alert      → ALERT NOTICE
 */
export const DB_TYPE_TO_FORM_BLOCK_TYPE: Record<string, FormBlockType> = {
  input: 'SHORT TEXT',
  email: 'EMAIL FIELD',
  textarea: 'LONG TEXT',
  textArea: 'LONG TEXT',
  radio: 'SINGLE CHOICE',
  select: 'SELECT MENU',
  checkbox: 'MULTIPLE CHOICE',
  switch: 'TOGGLE SWITCH',
  Button: 'ACTION BUTTON',
  Alert: 'ALERT NOTICE',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 3. Internal answer-value primitives  (mirrors Zod union in response.ts)
// ─────────────────────────────────────────────────────────────────────────────

/** The value stored for a single block inside a Response.data JSON object. */
export type AnswerValue = string | number | boolean | string[]

/** Full shape of Response.data at runtime — keys are block IDs. */
export type ResponseData = Record<string, AnswerValue>

// ─────────────────────────────────────────────────────────────────────────────
// 4. Per-block output shapes  (exact reference types)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Used by SINGLE CHOICE, MULTIPLE CHOICE, SELECT MENU.
 * Passed directly to a Recharts <BarChart data={...} /> or <PieChart data={...} />.
 */
export type RechartsDataArray = Array<{ name: string; value: number }>

/**
 * Used by TOGGLE SWITCH.
 * Gives the UI everything needed to render a binary doughnut/stat card.
 */
export type BinaryStatData = {
  trueCount: number
  falseCount: number
  total: number
  ratioString: string // e.g. "7/10"
}

/**
 * Used by SHORT TEXT and EMAIL FIELD.
 * Preserves submission identity and timestamp so the UI can sort/filter rows.
 */
export type RawTextArray = Array<{
  id: string
  value: string
  submittedAt: Date
}>

// ─────────────────────────────────────────────────────────────────────────────
// 5. Top-level result  (exact reference interface)
// ─────────────────────────────────────────────────────────────────────────────

export interface FormAggregationResult {
  formId: string
  totalViews: number
  totalSubmissions: number
  conversionRate: string // e.g. "42.5%"
  layout: FormBlock[]
  formInsight: FormInsight | null
  aggregatedBlocks: Record<
    string,
    {
      blockType: FormBlockType
      questionLabel: string
      data: RechartsDataArray | BinaryStatData | RawTextArray | string[] | null
    }
  >
}
