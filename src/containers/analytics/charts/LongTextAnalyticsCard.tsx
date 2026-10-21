'use client'

import React, { useState } from 'react'
import { Sparkles, RefreshCw, AlertCircle, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@primitives/Card/Card'
import { Text } from '@primitives/Text/Text'
import { Box } from '@primitives/Box/Box'
import { Stack } from '@primitives/Stack/Stack'
import { Button } from '@primitives/Button/Button'
import { Badge } from '@primitives/Badge/Badge'
import { Alert } from '@/components/ui/Alert/Alert'
import { Spinner } from '@/components/ui/Spinner/Spinner'
import type { FormQualitativeInsight } from '@/lib/ai/inputsAndOutputs'
import { getFormLongTextInsights } from '@/action/analytics'
import LazyChartCard from './LazyChartCard'
import QualitativeIntentChart from './QualitativeIntentChart'
import SentimentChart from './SentimentChart'

export interface LongTextAnalyticsCardProps {
  formId: string
  blockId: string
  blockLabel: string
  initialInsight?: FormQualitativeInsight | null
  rawResponses?: string[]
  isDemo?: boolean
}

export default function LongTextAnalyticsCard({
  formId,
  blockId,
  blockLabel,
  initialInsight = null,
  rawResponses = [],
  isDemo = false,
}: LongTextAnalyticsCardProps) {
  const [insight, setInsight] = useState<FormQualitativeInsight | null>(
    initialInsight ?? null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const responseCount = rawResponses.length

  const handleGenerate = async () => {
    if (isDemo) {
      // In demo mode, simulate quick generation if needed
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await getFormLongTextInsights(formId, blockId)

      if (res.status === 'success' && res.data) {
        setInsight(res.data)
      } else {
        setError(
          res.message ||
            'Unable to generate AI analysis. Please verify responses and try again.'
        )
      }
    } catch (err) {
      console.error('Error executing getFormLongTextInsights:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'A network error occurred while communicating with the AI service.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LazyChartCard
      title={blockLabel}
      description={`${responseCount} response${responseCount === 1 ? '' : 's'} collected`}
      skeletonHeight={450}
    >
      <Stack align="stretch" className="gap-6 w-full">
        {error && (
          <Alert severity="error" icon={<AlertCircle />}>
            <Stack
              direction="horizontal"
              align="center"
              className="w-full justify-between"
            >
              <Text variant="caption">{error}</Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                Retry
              </Button>
            </Stack>
          </Alert>
        )}

        {insight ? (
          <Stack align="stretch" className="gap-8 w-full">
            {/* ── Executive Summary Callout ──────────────────────────────── */}
            {insight.executiveSummary && (
              <Box className="rounded-medium p-4 sm:p-5 bg-surface-sunken border border-border-default">
                <Stack align="stretch" className="gap-2">
                  <Stack
                    direction="horizontal"
                    align="center"
                    className="w-full justify-between"
                  >
                    <Stack
                      direction="horizontal"
                      align="center"
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-action-primary" />
                      <Text variant="caption" weight="semibold" color="primary">
                        AI Executive Summary
                      </Text>
                    </Stack>
                    <Button
                      variant="ghost"
                      size="sm"
                      startIcon={
                        isLoading ? (
                          <Spinner size="sm" variant="riverside" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )
                      }
                      disabled={isLoading}
                      onClick={handleGenerate}
                      className="text-xs text-text-secondary"
                    >
                      {isLoading ? 'Re-analyzing...' : 'Refresh'}
                    </Button>
                  </Stack>
                  <Text
                    variant="body"
                    color="primary"
                    className="leading-relaxed text-sm sm:text-base"
                  >
                    {insight.executiveSummary}
                  </Text>
                </Stack>
              </Box>
            )}

            {/* ── Visual Charts ────────────────────────────────────────── */}
            <Stack align="stretch" className="gap-8 w-full">
              {insight.intentTags && insight.intentTags.length > 0 && (
                <QualitativeIntentChart
                  data={insight.intentTags}
                  questionLabel={`${blockLabel} (Intent)`}
                />
              )}
              {insight.sentimentSplit && insight.sentimentSplit.length > 0 && (
                <SentimentChart
                  data={insight.sentimentSplit}
                  questionLabel={`${blockLabel} (Sentiment)`}
                />
              )}
            </Stack>
          </Stack>
        ) : responseCount === 0 ? (
          /* ── Empty State: No Responses ────────────────────────────────── */
          <Box className="flex flex-col h-44 w-full items-center justify-center rounded-medium bg-surface-sunken border border-dashed border-border-default p-6 text-center">
            <MessageSquare className="w-8 h-8 text-text-muted mb-2" />
            <Text variant="body" color="secondary" weight="medium">
              No responses collected yet
            </Text>
            <Text variant="caption" color="secondary" className="mt-1">
              Once respondents submit answers to this question, you can generate
              qualitative insights.
            </Text>
          </Box>
        ) : (
          /* ── Actionable CTA: Ready for AI Analysis ───────────────────── */
          <Box className="rounded-medium p-6 sm:p-8 bg-surface-sunken border border-border-default text-center">
            <Stack
              align="center"
              justify="center"
              className="gap-4 max-w-md mx-auto"
            >
              <Box className="p-3 rounded-full bg-action-primarySubtle text-action-primary">
                <Sparkles className="w-6 h-6" />
              </Box>
              <Stack align="center" className="gap-1">
                <Text variant="subheader" weight="bold" color="primary">
                  Qualitative & Sentiment Analysis
                </Text>
                <Text variant="caption" color="secondary">
                  Analyze {responseCount} open-ended response
                  {responseCount === 1 ? '' : 's'} with AI to cluster core
                  intents and detect sentiment.
                </Text>
              </Stack>
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <Spinner size="sm" variant="riverside" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )
                }
                className="mt-2"
              >
                {isLoading ? 'Analyzing Responses...' : 'Generate AI Insights'}
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </LazyChartCard>
  )
}
