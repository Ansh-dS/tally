'use client'

/**
 * SentimentChart.tsx
 *
 * Pure presentational component. Renders the Positive / Neutral / Negative
 * sentiment split from LONG TEXT AI analysis as a donut PieChart.
 *
 * Replaces Recharts' default legend with a custom CSS pill-badge row for
 * better visual control and design-system alignment.
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { SentimentDataPoint } from '@/lib/ai/inputsAndOutputs'
import { Text } from '@primitives/Text/Text'
import { Box } from '@primitives/Box/Box'
import { Stack } from '@primitives/Stack/Stack'
import { cn } from '@primitives/Utils/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Sentiment config — maps each bucket to its color tokens
// ─────────────────────────────────────────────────────────────────────────────
const SENTIMENT_CONFIG: Record<
  SentimentDataPoint['name'],
  {
    fill: string // CSS var for Recharts SVG Cell fill
    dot: string // Tailwind bg class for legend dot
    pill: string // Tailwind classes for legend pill badge
    text: string // Tailwind text class for pill label
  }
> = {
  Positive: {
    fill: 'var(--color-status-success)',
    dot: 'bg-status-success',
    pill: 'bg-status-success-subtle',
    text: 'text-status-success',
  },
  Neutral: {
    fill: 'var(--color-status-warning)',
    dot: 'bg-status-warning',
    pill: 'bg-status-warning-subtle',
    text: 'text-status-warning',
  },
  Negative: {
    fill: 'var(--color-status-danger)',
    dot: 'bg-status-danger',
    pill: 'bg-status-danger-subtle',
    text: 'text-status-danger',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom tooltip
// ─────────────────────────────────────────────────────────────────────────────
function CustomPieTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload as SentimentDataPoint | undefined
  if (!point) return null

  const config = SENTIMENT_CONFIG[point.name]

  return (
    <div className="rounded-medium border border-border-default bg-surface-overlay px-m py-s shadow-overlay">
      <Stack direction="horizontal" className="items-center gap-2">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', config.dot)} />
        <Text variant="label" weight="semibold" color="primary">
          {point.name}
        </Text>
      </Stack>
      <Text variant="caption" color="secondary">
        {point.value} {point.value === 1 ? 'response' : 'responses'}
      </Text>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
export interface SentimentChartProps {
  /** Exactly 3 entries: Positive, Neutral, Negative — from FormQualitativeInsight.sentimentSplit */
  data: SentimentDataPoint[]
  /** The original form question label shown in the card header */
  questionLabel: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SentimentChart({
  data,
  questionLabel,
}: SentimentChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  // ── Empty state ─────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <Box className="w-full pt-2">
        <Box className="flex h-48 items-center justify-center rounded-medium bg-surface-sunken">
          <Text variant="body" color="secondary">
            No sentiment data available yet.
          </Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="w-full pt-2 border-0 ">
      <Stack gap="sm" className="mb-6 w-full">
        <Text variant="subheader" weight="semibold" color="primary">
          Response Sentiment Analysis
        </Text>
        <Text variant="caption" color="secondary">
          AI TEXT ANALYSIS FOR THIS QUESTION
        </Text>
      </Stack>

      <Stack justify={'center'} align={'center'} className="gap-6 w-full">
        {/* ── Donut chart + centre-label overlay ──────────────────────── */}
        <Stack
          align={'center'}
          justify={'center'}
          className="relative w-[240px] h-[240px] "
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={3}
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={SENTIMENT_CONFIG[entry.name].fill}
                  />
                ))}
              </Pie>
              <Tooltip content={CustomPieTooltip} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centre label — total count + "responses" label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Text variant="h2" weight="bold" color="primary">
              {total}
            </Text>
            <Text variant="caption" color="secondary">
              total
            </Text>
          </div>
        </Stack>

        {/* ── Custom CSS legend — pill badges ─────────────────────────── */}
        <Stack
          direction="horizontal"
          align={'center'}
          justify={'center'}
          className="flex-wrap gap-3"
        >
          {data.map((entry) => {
            const config = SENTIMENT_CONFIG[entry.name]
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0

            return (
              <div
                key={entry.name}
                className={cn(
                  'flex items-center gap-2 rounded-pill px-m py-xs',
                  config.pill
                )}
              >
                <span
                  className={cn('h-2 w-2 shrink-0 rounded-full', config.dot)}
                />
                <Text variant="label" weight="medium" className={config.text}>
                  {entry.name}
                </Text>
                <Text variant="label" weight="bold" className={config.text}>
                  {pct}%
                </Text>
                <Text variant="caption" color="secondary">
                  ({entry.value})
                </Text>
              </div>
            )
          })}
        </Stack>
      </Stack>
    </Box>
  )
}
