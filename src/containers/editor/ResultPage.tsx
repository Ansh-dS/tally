'use client'

import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'
import { Avatar } from '@primitives/Avatar/Avatar'
import { Alert } from '@primitives/Alert/Alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@primitives/Card/Card'
import { Button } from '@primitives/Button/Button'
import { Input } from '@primitives/Input/Input'
import { Spinner } from '@primitives/Spinner/Spinner'
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Box } from '@primitives/Box/Box'
import { Sheet } from '@primitives/sheet/sheet'

import {
  BarChart3,
  CircleDashed,
  MessagesSquare,
  Plus,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'

const sidebarItems = [
  { icon: Sparkles, label: 'AI Insights', active: true },
  { icon: MessagesSquare, label: 'Raw Responses' },
  { icon: TrendingDown, label: 'Drop-off Funnel' },
]

const intentBars = [
  { label: 'Pricing clarity', value: 92 },
  { label: 'Feature requests', value: 78 },
  { label: 'Onboarding friction', value: 64 },
  { label: 'Trust / credibility', value: 54 },
  { label: 'Support responsiveness', value: 40 },
]

const sentimentSegments = [
  { label: 'Positive', value: 62, color: '#10b981' },
  { label: 'Neutral', value: 24, color: '#64748b' },
  { label: 'Negative', value: 14, color: '#f43f5e' },
]

const spikePoints = [
  { label: 'Mon', value: 18 },
  { label: 'Tue', value: 24 },
  { label: 'Wed', value: 38 },
  { label: 'Thu', value: 31 },
  { label: 'Fri', value: 49 },
  { label: 'Sat', value: 44 },
  { label: 'Sun', value: 58 },
]

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string
  value: string
  delta: string
  icon: ComponentType<{ size?: number; className?: string }>
}) {
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
        <Stack direction="horizontal" align="center" gap="xs">
          <TrendingUp size={14} className="text-status-success" />
          <Text variant="caption" color="success">
            {delta}
          </Text>
        </Stack>
      </CardContent>
    </Card>
  )
}

function DonutChart() {
  const sweep = useMemo(
    () =>
      sentimentSegments.reduce((acc, segment, index) => {
        const start = acc.total
        acc.total += segment.value
        acc.parts.push(`${segment.color} ${start}% ${acc.total}%`)
        return acc
      },
        { total: 0, parts: [] as string[] }),
    []
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
        {sentimentSegments.map((segment) => (
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

function TimelineChart() {
  const max = Math.max(...spikePoints.map((point) => point.value))

  return (
    <Stack gap="sm" className="min-h-[220px] justify-end">
      <div className="flex h-44 items-end gap-3">
        {spikePoints.map((point) => (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
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

function IntentChart() {
  return (
    <Stack gap="md">
      {intentBars.map((bar) => (
        <Stack key={bar.label} gap="none">
          <Stack direction="horizontal" align="center" className="justify-between">
            <Text variant="caption" weight="semibold">
              {bar.label}
            </Text>
            <Text variant="caption" color="secondary">
              {bar.value}%
            </Text>
          </Stack>
          <div className="h-3 rounded-full bg-slate-800">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-brand to-accent"
              style={{ width: `${bar.value}%` }}
            />
          </div>
        </Stack>
      ))}
    </Stack>
  )
}

export default function EditorResultPage() {
  const [assistantOpen, setAssistantOpen] = useState(true)

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-slate-950 text-slate-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
        <Stack gap="sm" className="p-4">
          {sidebarItems.map(({ icon: Icon, label, active }) => (
            <Button
              key={label}
              variant={active ? 'primary' : 'secondary'}
              size="sm"
              startIcon={<Icon />}
              className="justify-start"
              fullWidth
            >
              {label}
            </Button>
          ))}
        </Stack>

        <Box className="mx-4 mt-auto mb-4 border border-brand/30 bg-brand/10 p-4">
          <Stack gap="xs">
            <Text variant="label" weight="semibold">
              Pro Limits Active
            </Text>
            <Text variant="caption" color="secondary">
              Upgrade to unlock deeper tagging, unlimited exports, and team seats.
            </Text>
            <Button variant="outline" size="sm" startIcon={<Plus />} fullWidth>
              Upgrade Workspace
            </Button>
          </Stack>
        </Box>
      </aside>


      <Box className="rounded-none border-0 border-b border-slate-800 bg-slate-900/30 px-6 py-6">
        <Stack gap="none">
          <Stack direction="horizontal" align="center" className="flex-wrap justify-between gap-4">
            <Stack gap="none">
              <Text variant="label" color="secondary">
                AI Qualitative Analytics Dashboard
              </Text>
              <Text variant="body" color="secondary">
                Real-time background intent parsing across submissions.
              </Text>
            </Stack>

          </Stack>
        </Stack>
      </Box>

      <Stack gap="lg" className="flex-1 p-6">
        <Stack direction="horizontal" gap="md" className="flex-wrap ">
          <StatCard label="Total Views" value="12,842" delta="+18.4% this week" icon={BarChart3} />
          <StatCard label="Submits" value="3,401" delta="+9.2% this week" icon={CircleDashed} />
          <StatCard label="Conv %" value="26.5%" delta="+1.8 pts this week" icon={TrendingUp} />
        </Stack>

        <Card elevation="none">
          <CardHeader>
            <CardTitle>Primary Discovered Feedback Categories</CardTitle>
            <CardDescription>
              High-signal clusters extracted from open-ended responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntentChart />
          </CardContent>
        </Card>

        <Stack direction="horizontal" gap="md" className="flex-wrap">
          <Card elevation="none" className="min-w-[280px] flex-1">
            <CardHeader>
              <CardTitle>Submission Sentiment</CardTitle>
              <CardDescription>Overall mood split across all completions.</CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart />
            </CardContent>
          </Card>

          <Card elevation="none" className="min-w-[280px] flex-1">
            <CardHeader>
              <CardTitle>Recent Spikes</CardTitle>
              <CardDescription>Traffic clusters around deadlines and reminders.</CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineChart />
            </CardContent>
          </Card>
        </Stack>
      </Stack>


      <Button
        className="fixed bottom-6 right-6 z-20 shadow-modal"
        startIcon={<Sparkles />}
        onClick={() => setAssistantOpen(true)}
      >
        Ask AI
      </Button>

      {assistantOpen && (
        <Button
          type="button"
          className="fixed inset-0 z-20 cursor-default bg-slate-950/50"
          onClick={() => setAssistantOpen(false)}
          aria-label="Close assistant drawer"
        />
      )}

      <Sheet
        side="right"
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        className="z-30 w-[420px] border-l border-slate-800 bg-slate-900 shadow-modal"
      >
        <Stack gap="none" className="h-full">
          <Box className="rounded-none border-0 border-b border-slate-800 bg-slate-950/70 p-4">
            <Stack direction="horizontal" align="center" gap="sm" className="justify-between">
              <Stack gap="xs">
                <Text variant="label" weight="semibold">
                  AI Data Assistant Copilot
                </Text>
                <Text variant="caption" color="secondary">
                  Query individual submission records dynamically using custom natural language logic.
                </Text>
              </Stack>
              <Button
                variant="ghost"
                size="sm"
                collapsed
                aria-label="Close assistant"
                onClick={() => setAssistantOpen(false)}
              >
                <X />
              </Button>
            </Stack>
          </Box>

          <Stack gap="md" className="flex-1 overflow-y-auto p-4">
            <Box className="border-0 bg-slate-950/60 p-4">
              <Text variant="caption" color="secondary">
                Hi Anshdeep! Ask me anything about your 3,401 form completions. I will fetch matching rows natively.
              </Text>
            </Box>

            <Box className="border-0 bg-brand/10 p-4">
              <Text variant="caption" color="secondary">
                Show me what students from @iitp.ac.in thought about the pricing structure blocks.
              </Text>
            </Box>

            <Alert severity="info">
              Database Filter Parameter Extracted: {`{ "College Email": "iitp.ac.in" }`}
            </Alert>

            <Box className="border-0 bg-slate-950/60 p-4">
              <Text variant="body">
                Based on the matched responses, students from IIT Patna find the core tier affordable due to student
                discounts, but mention that the standard premium limits feel steep for individual projects.
              </Text>
            </Box>
          </Stack>

          <Box className="rounded-none border-0 border-t border-slate-800 bg-slate-950/70 p-4">
            <Stack direction="horizontal" align="center" gap="sm">
              <Input
                placeholder="Query fields, sum values, isolate bugs..."
                className="bg-slate-950"
              />
              <Button variant="primary" endIcon={<Send />} className="shrink-0">
                Stream Run
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Sheet>
    </div>
  )
}
