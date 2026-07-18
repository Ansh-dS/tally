'use client'

/**
 * BinaryStatWidget.tsx
 *
 * Pure presentational component. Renders a TOGGLE SWITCH block's true/false
 * distribution as a typographic stat widget — no Recharts, pure HTML+Tailwind.
 *
 * Features:
 *  - Bold percentage numbers with status color coding
 *  - CSS-animated split progress bar (animates on mount via useEffect)
 *  - Full breakdown: raw counts + percentage + total
 */

import { useEffect, useState } from 'react'
import type { BinaryStatData } from '@/lib/analytics/types'
import { Text } from '@primitives/Text/Text'
import { Box } from '@primitives/Box/Box'
import { Stack } from '@primitives/Stack/Stack'

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
export interface BinaryStatWidgetProps {
  /** Distribution data — from the reducer's BinaryStatData output */
  data: BinaryStatData
  /** The original form question label shown in the card header */
  questionLabel: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function BinaryStatWidget({
  data,
  questionLabel,
}: BinaryStatWidgetProps) {
  const { trueCount, falseCount, total } = data

  // Trigger the CSS width transition after the first paint.
  // Without this, the bar renders at full width immediately (no animation).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // Use rAF to ensure the browser has committed the initial 0%-width paint
    // before we switch to the target widths — otherwise the transition skips.
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // ── Empty state ─────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <Box className="w-full pt-2 border-0">
        <Box className="flex h-32 items-center justify-center rounded-medium bg-surface-sunken border-0">
          <Text variant="body" color="secondary">
            No responses collected yet.
          </Text>
        </Box>
      </Box>
    )
  }

  const truePercent = Math.round((trueCount / total) * 100)
  const falsePercent = 100 - truePercent

  return (
    <Box className="w-full pt-2 border-0">
      <Stack gap="sm" className="mb-6">
        <Text variant="caption" color="secondary">
          Total Responses · {total} {total === 1 ? 'response' : 'responses'}
        </Text>
      </Stack>

      <Stack className="gap-6">
        {/* ── Big number row ─────────────────────────────────────────── */}
        <Stack
          direction="horizontal"
          align="center"
          justify="center"
          className="w-full gap-16 px-8"
        >
          {/* Yes / True side */}
          <Stack className="items-center gap-2">
            <Text
              variant="h1"
              weight="bold"
              className="text-status-success tabular-nums leading-none"
            >
              {truePercent}%
            </Text>
            <Stack className="items-center gap-1">
              <Text variant="label" weight="semibold" color="primary">
                Yes
              </Text>
              <Text variant="caption" color="secondary">
                {trueCount} {trueCount === 1 ? 'response' : 'responses'}
              </Text>
            </Stack>
          </Stack>

          {/* Divider */}
          <Text
            variant="h2"
            color="secondary"
            className="mb-6 select-none opacity-30"
          >
            /
          </Text>

          {/* No / False side */}
          <Stack className="items-center gap-2 ">
            <Text
              variant="h1"
              weight="bold"
              className="text-status-danger tabular-nums leading-none"
            >
              {falsePercent}%
            </Text>
            <Stack className="items-center gap-1">
              <Text variant="label" weight="semibold" color="primary">
                No
              </Text>
              <Text variant="caption" color="secondary">
                {falseCount} {falseCount === 1 ? 'response' : 'responses'}
              </Text>
            </Stack>
          </Stack>
        </Stack>

        {/* ── Split progress bar ─────────────────────────────────────── */}
        {/*
            Two adjacent divs inside an overflow-hidden pill container.
            `transition-all duration-700 ease-out` on each segment creates a
            smooth left-to-right fill animation triggered by the `mounted` flag.
            The bar starts at 0% width (pre-mount) and expands to the real value.
          */}
        <Box className="h-3 w-full overflow-hidden rounded-pill bg-surface-sunken border-0">
          <div className="flex h-full">
            <div
              className="bg-status-success transition-all duration-700 ease-out"
              style={{ width: mounted ? `${truePercent}%` : '0%' }}
            />
            <div
              className="bg-status-danger transition-all duration-700 ease-out"
              style={{ width: mounted ? `${falsePercent}%` : '0%' }}
            />
          </div>
        </Box>
      </Stack>
    </Box>
  )
}
