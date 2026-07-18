import React from 'react'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'

type SpikePoint = { label: string; value: number }

type TimelineChartProps = {
  points: SpikePoint[]
}

export default function TimelineChart({ points }: TimelineChartProps) {
  const max = Math.max(...points.map((p) => p.value))

  return (
    <Stack gap="sm" className="min-h-[220px] justify-end">
      <div className="flex h-44 items-end gap-3">
        {points.map((point) => (
          <div
            key={point.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-brand/50 to-brand"
                style={{ height: `${(point.value / max) * 100}%` }}
              />
            </div>
            <Text variant="caption" color="secondary">
              {point.label}
            </Text>
          </div>
        ))}
      </div>
      <Text variant="caption" color="secondary">
        Spike in intent after pricing emails and office-hours reminders.
      </Text>
    </Stack>
  )
}
