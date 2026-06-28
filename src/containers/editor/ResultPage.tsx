'use client'


import { useState } from 'react'

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

import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Box } from '@primitives/Box/Box'
import { Sheet } from '@primitives/Sheet/Sheet'
import { Sidebar, SidebarItem } from '@primitives/Sidebar/Sidebar'

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

import StatCard from './components/StatCard'
import DonutChart from './components/DonutChart'
import TimelineChart from './components/TimelineChart'
import IntentChart from './components/IntentChart'

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


export default function EditorResultPage() {
  const [assistantOpen, setAssistantOpen] = useState(true)

  return (
    <Box className="relative overflow-x-hidden flex h-full min-h-0 w-full  border-0">
      <Sidebar
        position="left"
        size={'narrow'}
        footer={
          <Box className="mx-4 mt-auto mb-4 border border-brand/30 bg-brand/10 p-4">
            <Stack gap="sm">
              <Text variant="label" weight="semibold" className='flex-wrap'>
                Pro Limits Active
              </Text>
              <Text variant="caption" color="secondary" >
                Upgrade to unlock deeper tagging, unlimited exports, and team seats.
              </Text>
              <Button variant="outline" size="sm" startIcon={<Plus />} fullWidth>
                Upgrade Workspace
              </Button>
            </Stack>
          </Box>
        }
      >
        <Stack gap="sm" className="p-4">
          {sidebarItems.map(({ icon: Icon, label, active }) => (
            <SidebarItem key={label} icon={<Icon />} label={label} active={active} />
          ))}
        </Stack>
      </Sidebar>


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
            <IntentChart bars={intentBars} />
          </CardContent>
        </Card>

        <Stack direction="horizontal" gap="md" className="flex-wrap">
          <Card elevation="none" className="min-w-[280px] flex-1">
            <CardHeader>
              <CardTitle>Submission Sentiment</CardTitle>
              <CardDescription>Overall mood split across all completions.</CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart segments={sentimentSegments} />
            </CardContent>
          </Card>

          <Card elevation="none" className="min-w-[280px] flex-1">
            <CardHeader>
              <CardTitle>Recent Spikes</CardTitle>
              <CardDescription>Traffic clusters around deadlines and reminders.</CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineChart points={spikePoints} />
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
              <Stack gap="none">
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
    </Box>
  )
}
