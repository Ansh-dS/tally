import React, { useMemo } from 'react'
import { Box } from '@primitives/Box/Box'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'

type Segment = { label: string; value: number; color: string }

type DonutChartProps = {
  segments: Segment[]
}

export default function DonutChart({ segments }: DonutChartProps) {
  const sweep = useMemo(
    () =>
      segments.reduce((acc, segment) => {
        const start = acc.total
        acc.total += segment.value
        acc.parts.push(`${segment.color} ${start}% ${acc.total}%`)
        return acc
      },
        { total: 0, parts: [] as string[] }),
    [segments]
  )

  return (
    <Box className="flex min-h-[220px] flex-col items-center justify-center gap-4 border-0 bg-transparent">
      <div
        className="h-40 w-40 rounded-full border border-border-default"
        style={{
          background: `conic-gradient(${sweep.parts.join(', ')})`,
        }}
      />
      <Stack direction="horizontal" gap="sm" className="flex-wrap justify-center">
        {segments.map((segment) => (
          <Stack key={segment.label} direction="horizontal" align="center" gap="xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            <Text variant="caption" color="secondary">
              {segment.label} {segment.value}%
            </Text>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
