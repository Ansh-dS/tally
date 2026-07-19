'use client'

import { Badge } from '@primitives/Badge/Badge'
import { Box } from '@primitives/Box/Box'
import { Button } from '@primitives/Button/Button'
import {
  DataGrid,
  DataGridCell,
  DataGridHead,
  DataGridHeader,
  DataGridRow,
} from '@primitives/DataGrid/DataGrid'
import { Alert } from '@/components/ui/Alert/Alert'
import { Stack } from '@primitives/Stack/Stack'
import { Stat } from '@primitives/Stat/Stat'
import { Text } from '@primitives/Text/Text'
import { Download, AlertCircle, Sparkles } from 'lucide-react'
import type {
  FormAggregationResult,
  RechartsDataArray,
  BinaryStatData,
  RawTextArray,
} from '@/lib/analytics/types'
import type { FormQualitativeInsight } from '@/lib/ai/inputsAndOutputs'
import LazyChartCard from './charts/LazyChartCard'
import QualitativeIntentChart from './charts/QualitativeIntentChart'
import SentimentChart from './charts/SentimentChart'
import BinaryStatWidget from './charts/BinaryStatWidget'
import { DB_TYPE_TO_FORM_BLOCK_TYPE } from '@/lib/analytics/types'
import { EmptyState } from '@/components/ui/EmptyState/EmptyState'
import { Spinner } from '@/components/ui/Spinner/Spinner'

export interface AnalyticsCanvasProps {
  data: FormAggregationResult
  isDemo?: boolean
}

export default function AnalyticsCanvas({
  data,
  isDemo,
}: AnalyticsCanvasProps) {
  const {
    totalViews,
    totalSubmissions,
    conversionRate,
    layout,
    formInsight,
    aggregatedBlocks,
  } = data

  const hasSubmissions = totalSubmissions > 0
  const isColdStart = totalSubmissions < 10
  const badgeLabel = isDemo ? 'Demo Data' : hasSubmissions ? 'Active' : 'Draft'
  const badgeColor = badgeLabel === 'Demo Data' ? 'warning' : 'default'
  const badgeSize = isDemo ? 'md' : 'sm'
  const badgeStyle = isDemo ? 'opacity-50 bg-transparent' : ''

  const safeLayout = Array.isArray(layout) ? layout : []
  const hasLongTextBlocks = safeLayout.some(
    (block) => DB_TYPE_TO_FORM_BLOCK_TYPE[block.type] === 'LONG TEXT'
  )

  // Check if we have text submissions but no globalSummary
  const hasTextSubmissions =
    hasLongTextBlocks &&
    safeLayout.some((block) => {
      if (DB_TYPE_TO_FORM_BLOCK_TYPE[block.type] === 'LONG TEXT') {
        const blockData = aggregatedBlocks[block.id]?.data
        return Array.isArray(blockData) && blockData.length > 0
      }
      return false
    })

  const isAiProcessing = hasTextSubmissions && !formInsight?.globalSummary

  return (
    <Stack
      direction="vertical"
      align="stretch"
      className="w-full py-xl px-l gap-8"
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Stack
        direction="horizontal"
        className="items-center justify-between w-full"
      >
        <Stack direction="horizontal" className="items-center gap-4">
          <Text variant="h1" weight="bold" color="primary">
            Form Analytics
          </Text>
          <Badge
            size={badgeSize}
            className={`${badgeStyle}`}
            color={badgeColor}
          >
            {badgeLabel}
          </Badge>
        </Stack>

        <Button variant="primary" startIcon={<Download />}>
          Export Report
        </Button>
      </Stack>

      {/* ── High-Level Metrics ───────────────────────────────────────────── */}
      <Stack direction="horizontal" className="gap-10 p-6 w-full">
        <Stat
          label="Total Views"
          className="flex-1 "
          value={totalViews.toString()}
        />
        <Stat
          label="Total Submissions"
          value={totalSubmissions.toString()}
          className="flex-1 "
        />
        <Stat
          label="Conversion Rate"
          value={conversionRate}
          className="flex-1 "
        />
      </Stack>

      {/* ── Conditional Global States ─────────────────────────────────────── */}
      {isColdStart && (
        <Stack justify={'center'} align={'center'} className="border-0 p-2xl ">
          <EmptyState
            className="w-fit"
            variant={'dashed'}
            spacing={'spacious'}
            title="Waiting for more submissions."
            description="Share your form to gather more data."
          ></EmptyState>
        </Stack>
      )}

      {isAiProcessing && (
        <Stack
          direction={'horizontal'}
          justify={'center'}
          align={'center'}
          className="border-0 p-2xl "
        >
          <Spinner variant={'riverside'} size={'md'} />
          <Text variant="body" color="primary">
            AI is currently processing your open-ended responses...
          </Text>
        </Stack>
      )}

      {!hasLongTextBlocks && totalSubmissions > 0 && (
        <Stack justify={'center'}>
          <Alert
            icon={<AlertCircle />}
            severity="warning"
            className="w-fit opacity-60"
          >
            Low Variance: All quantitative fields are tracked via the direct
            grids below.
          </Alert>
        </Stack>
      )}

      {/* ── Bigger components started. ─────────────────────────────────────── */}
      {!isColdStart && !isAiProcessing && (
        <Stack className="px-2 w-full mt-8">
          <Stack className=" w-full">
            <Text variant={'h2'} weight={'bold'}>
              Each Question Analysis
            </Text>
            <Stack
              direction="vertical"
              align="stretch"
              className="w-full gap-20  px-3 py-1"
            >
              {safeLayout.map((block) => {
                const blockType = DB_TYPE_TO_FORM_BLOCK_TYPE[block.type]
                const blockData = aggregatedBlocks[block.id]

                if (!blockData || !blockData.data) return null

                switch (blockType) {
                  // 1.
                  case 'LONG TEXT': {
                    // Extract the qualitative insight for this specific block, if it exists
                    const globalSummary = formInsight?.globalSummary as
                      | Record<string, FormQualitativeInsight>
                      | undefined
                    const insight = globalSummary?.[block.id]

                    return (
                      <LazyChartCard
                        key={block.id}
                        title={block.label}
                        skeletonHeight={450}
                      >
                        <Stack align="stretch" className="gap-2xl">
                          {insight ? (
                            <>
                              <QualitativeIntentChart
                                data={insight.intentTags}
                                questionLabel={`${block.label} (Intent)`}
                              />
                              <SentimentChart
                                data={insight.sentimentSplit}
                                questionLabel={`${block.label} (Sentiment)`}
                              />
                            </>
                          ) : (
                            <Box className="flex h-48 w-full items-center justify-center rounded-medium bg-surface-sunken pt-2">
                              <Text variant="body" color="secondary">
                                Waiting for AI processing...
                              </Text>
                            </Box>
                          )}
                        </Stack>
                      </LazyChartCard>
                    )
                  }

                  // 2.
                  case 'SINGLE CHOICE':
                  case 'MULTIPLE CHOICE':
                  case 'SELECT MENU':
                    return (
                      <LazyChartCard
                        key={block.id}
                        title={block.label}
                        skeletonHeight={400}
                      >
                        <QualitativeIntentChart
                          data={blockData.data as RechartsDataArray}
                          questionLabel={block.label}
                        />
                      </LazyChartCard>
                    )

                  case 'TOGGLE SWITCH':
                    return (
                      <LazyChartCard
                        key={block.id}
                        title={block.label}
                        skeletonHeight={150}
                      >
                        <BinaryStatWidget
                          data={blockData.data as BinaryStatData}
                          questionLabel={block.label}
                        />
                      </LazyChartCard>
                    )

                  // 3.
                  case 'SHORT TEXT':
                  case 'EMAIL FIELD': {
                    const rows = blockData.data as RawTextArray
                    return (
                      <LazyChartCard
                        key={block.id}
                        title={block.label}
                        skeletonHeight={300}
                      >
                        <Box className="w-full pt-2 border-0">
                          <Stack gap="sm" className="mb-6">
                            <Text variant="caption" color="secondary">
                              Recent responses
                            </Text>
                          </Stack>
                          <Box className="w-full overflow-hidden">
                            {rows.length === 0 ? (
                              <Box className="flex h-32 items-center justify-center bg-surface-sunken">
                                <Text variant="body" color="secondary">
                                  No responses collected yet.
                                </Text>
                              </Box>
                            ) : (
                              <DataGrid size="md">
                                <DataGridHeader>
                                  <DataGridRow>
                                    <DataGridHead>Response</DataGridHead>
                                    <DataGridHead>Submitted At</DataGridHead>
                                  </DataGridRow>
                                </DataGridHeader>
                                {rows.map((row) => (
                                  <DataGridRow key={row.id}>
                                    <DataGridCell>{row.value}</DataGridCell>
                                    <DataGridCell>
                                      {new Date(
                                        row.submittedAt
                                      ).toLocaleDateString()}
                                    </DataGridCell>
                                  </DataGridRow>
                                ))}
                              </DataGrid>
                            )}
                          </Box>
                        </Box>
                      </LazyChartCard>
                    )
                  }

                  default:
                    return null
                }
              })}
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>
  )
}
