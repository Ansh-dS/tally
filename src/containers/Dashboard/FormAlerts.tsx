import { Stack } from '@primitives/Stack/Stack'
import { Box } from '@primitives/Box/Box'
import { Text } from '@primitives/Text/Text'
import { Button } from '@primitives/Button/Button'
import { Badge } from '@primitives/Badge/Badge'
import { Card } from '@primitives/Card/Card'
import { DataList, DataListItem } from '@primitives/DataList/DataList'
import { EmptyState } from '@primitives/EmptyState/EmptyState'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { type aiDropOffSummary } from '@/lib/ai/inputsAndOutputs'

interface SheetContentInput {
  setAssistantOpen: (open: boolean) => void
  dropOffs: aiDropOffSummary
  formsCount: number
}

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical'

const badgeColor: Record<
  SeverityLevel,
  'default' | 'success' | 'warning' | 'error' | 'info' | 'brand'
> = {
  Low: 'info',
  Medium: 'warning',
  High: 'error',
  Critical: 'error',
}

const DEMO_DATA = {
  severityLevel: 'Medium' as SeverityLevel,
  executiveSummary:
    '(Demo) The form conversion rate is healthy at 25.6%. However, significant drop-offs occur on the long-text feedback question.',
  suspectedFrictionPoints: [
    'Long-text Feedback: High drop-off rate (18%) on the final page',
  ],
  actionableRecommendations: [
    'Make the optional long-text feedback block collapsible or place it on a dedicated thank-you page to avoid funnel abandonment.',
    'Reduce descriptive requirements or explicitly mark the field as optional within the component settings.',
  ],
}

export function FormAlerts({
  setAssistantOpen,
  dropOffs,
  formsCount,
}: SheetContentInput): ReactNode {
  const isDemo = formsCount === 0
  const displayData = isDemo ? DEMO_DATA : dropOffs.data

  const renderContent = () => {
    if (!isDemo && dropOffs.status === 'error') {
      return (
        <EmptyState
          variant="minimal"
          fullWidth
          title="Error Fetching Insights"
          description={dropOffs.message}
          className="p-2xl"
        />
      )
    }

    if (!displayData) {
      return (
        <Box className="border-0 flex-1 flex justify-center align-center">
          {' '}
          <EmptyState
            variant="minimal"
            fullWidth
            title="No Insights Yet"
            description="We haven't gathered enough drop-off data to generate insights for your workspace yet."
            spacing={'spacious'}
          />
        </Box>
      )
    }

    return (
      <>
        {/* Executive Summary */}
        <Stack gap="sm">
          <Text variant={'h3'} weight="bold">
            Executive Summary
          </Text>
          <Text color="secondary" className="mt-0.5">
            {displayData.executiveSummary}
          </Text>
        </Stack>

        {/* Friction Points */}
        <Stack gap="sm">
          <Text variant={'h3'} weight="bold">
            Suspected Friction Points
          </Text>
          <DataList variant="inset" className="mt-s">
            {displayData.suspectedFrictionPoints.map((point, index) => (
              <DataListItem key={index}>
                <Text>{point}</Text>
              </DataListItem>
            ))}
          </DataList>
        </Stack>

        {/* Recommended Actions */}
        <Stack gap="md">
          <Text variant={'h3'} weight="bold">
            Recommended Actions
          </Text>
          <Stack gap="md" className="mt-s">
            {displayData.actionableRecommendations.map((action, index) => (
              <Card key={index} variant="sunken" className="p-4">
                <Text>{action}</Text>
              </Card>
            ))}
          </Stack>
        </Stack>
      </>
    )
  }

  return (
    <Stack gap="none" className="h-full">
      {/* HeaderZone */}
      <Stack
        direction="horizontal"
        align="center"
        className="w-full border-0 px-1 pb-4 shadow-popout "
      >
        <Stack className="flex flex-1">
          {displayData ? (
            <Badge color={badgeColor[displayData.severityLevel]}>
              {displayData.severityLevel} Severity
            </Badge>
          ) : (
            <Box />
          )}
        </Stack>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Close assistant"
          onClick={() => setAssistantOpen(false)}
          startIcon={<X />}
          className="rounded-full"
        />
      </Stack>

      {/* Scrollable Body */}
      <Stack className="flex-1 overflow-y-auto p-6 gap-3xl">
        {renderContent()}
      </Stack>
    </Stack>
  )
}
