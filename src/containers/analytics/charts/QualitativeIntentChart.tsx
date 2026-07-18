'use client'

/**
 * QualitativeIntentChart.tsx
 *
 * Pure presentational component. Renders AI-clustered intent categories
 * from a LONG TEXT block as a horizontal bar chart (Recharts layout="vertical").
 *
 * Props are passed in directly — no data fetching inside this component.
 */

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { RechartsDataPoint } from '@/lib/ai/inputsAndOutputs'
import { Card, CardContent, CardHeader } from '@primitives/Card/Card'
import { Text } from '@primitives/Text/Text'
import { Box } from '@primitives/Box/Box'
import { Stack } from '@primitives/Stack/Stack'

// ─────────────────────────────────────────────────────────────────────────────
// CSS-var color tokens (valid for Recharts SVG fill/stroke props)
// Resolved from the @theme block in global.css at runtime.
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bar: 'var(--color-action-primary)',
  grid: 'var(--color-border-default)',
  axis: 'var(--color-fg-secondary)',
  cursorFill: 'var(--color-surface-sunken)',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Custom tooltip
// ─────────────────────────────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload as RechartsDataPoint | undefined
  if (!point) return null

  return (
    <div className="rounded-medium border border-border-default bg-surface-overlay px-m py-s shadow-overlay">
      <Text variant="label" weight="semibold" color="primary">
        {point.name}
      </Text>
      <Text variant="caption" color="secondary">
        {point.value} {point.value === 1 ? 'response' : 'responses'}
      </Text>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
export interface QualitativeIntentChartProps {
  /** AI-clustered intent categories — from FormQualitativeInsight.intentTags */
  data: RechartsDataPoint[]
  /** The original form question label shown in the card header */
  questionLabel: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const BAR_HEIGHT_PX = 52 // height per bar row (including gap)
const CHART_PADDING = 48 // top + bottom margin
const MAX_CATEGORIES = 10 // cap display to keep the chart readable

export default function QualitativeIntentChart({
  data,
  questionLabel,
}: QualitativeIntentChartProps) {
  // ── Empty state ─────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <Box className="w-full pt-2 border-0">
        <Box className="flex h-48 items-center justify-center rounded-medium bg-surface-sunken">
          <Text variant="body" color="secondary">
            No intent categories identified yet.
          </Text>
        </Box>
      </Box>
    )
  }

  // Sort descending by frequency and cap at MAX_CATEGORIES
  const sorted = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_CATEGORIES)

  const chartHeight = sorted.length * BAR_HEIGHT_PX + CHART_PADDING

  return (
    <Box className="w-full pt-2 border-0 flex justify-center border-0">
      <Stack
        justify="center"
        align="center"
        className="w-full max-w-[800px] gap-6"
      >
        <Stack gap="sm" className="mb-2 w-full text-center">
          <Text variant="caption" color="secondary">
            {sorted.length} intent{' '}
            {sorted.length === 1 ? 'category' : 'categories'} identified
            {data.length > MAX_CATEGORIES && ` · showing top ${MAX_CATEGORIES}`}
          </Text>
        </Stack>

        <Box className="w-full border-0" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sorted}
              margin={{ top: 4, right: 52, left: 0, bottom: 4 }}
            >
              {/* Vertical grid lines only — horizontal lines create noise on a bar chart */}
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke={C.grid}
                strokeOpacity={0.6}
              />

              <XAxis
                type="number"
                tick={{ fill: C.axis, fontSize: 12 }}
                axisLine={{ stroke: C.grid }}
                tickLine={false}
                allowDecimals={false}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={152}
                tick={{
                  fill: C.axis,
                  fontSize: 12,
                  textAnchor: 'start',
                  dx: -145,
                }}
                axisLine={false}
                tickLine={false}
                // Truncate long labels that would overflow the Y-axis width
                tickFormatter={(label: string) =>
                  label.length > 22 ? `${label.slice(0, 20)}…` : label
                }
              />

              <Tooltip
                content={CustomBarTooltip}
                cursor={{ fill: C.cursorFill, opacity: 0.35, radius: 4 }}
              />

              <Bar
                dataKey="value"
                fill={C.bar}
                radius={[0, 4, 4, 0]}
                maxBarSize={32}
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-out"
              >
                {/* Inline count label to the right of each bar */}
                <LabelList
                  dataKey="value"
                  position="right"
                  style={{ fill: C.axis, fontSize: 12, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Stack>
    </Box>
  )
}
