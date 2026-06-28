import React, { ComponentType } from 'react'
import {
  Card,
  CardContent,
} from '@primitives/Card/Card'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { TrendingUp } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string
  delta: string
  icon: ComponentType<{ size?: number; className?: string }>
}

export default function StatCard({ label, value, delta, icon: Icon }: StatCardProps) {
  return (
    <Card elevation="none" padding="sm" className="min-w-0">
      <CardContent className="gap-3">
        <Stack direction="horizontal" align="center" className="justify-between">
          <Text variant="label" color="secondary" className="uppercase tracking-[0.16em]">
            {label}
          </Text>
          <Icon size={16} className="text-fg-secondary" />
        </Stack>
        <Text as="div" variant="display" weight="bold">
          {value}
        </Text>
        <Stack direction="horizontal" align="center" gap="none">
          <TrendingUp size={14} className="text-status-success" />
          <Text variant="caption" color="success">
            {delta}
          </Text>
        </Stack>
      </CardContent>
    </Card>
  )
}

