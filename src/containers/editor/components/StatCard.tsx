import type { ComponentType } from 'react'
import { Card, CardContent } from '@primitives/Card/Card'
import { Stack } from '@primitives/Stack/Stack'
import { Stat } from '../../../components/ui/Stat/Stat'

type StatCardProps = {
  label: string
  value: string
  delta: string
  icon: ComponentType<{ size?: number; className?: string }>
}

export default function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card elevation="none" padding="sm" className="min-w-0">
      <CardContent className="gap-3">
        <Stack
          direction="horizontal"
          align="center"
          className="justify-between"
        >
          <Stat label={label} value={value} trend="up" trendValue={delta} />
          <Icon size={16} className="text-fg-secondary" />
        </Stack>
      </CardContent>
    </Card>
  )
}
