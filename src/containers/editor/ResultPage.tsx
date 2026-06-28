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
import { Stack } from '@primitives/Stack/Stack'
import { Text } from '@primitives/Text/Text'
import { Box } from '@primitives/Box/Box'
import { Sheet } from '@primitives/Sheet/Sheet'
import { Sidebar, SidebarItem } from '../../components/ui/Sidebar/Sidebar'

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
import {SheetContent} from './components/SheetContent'

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
    <Box className="relative flex h-full min-h-0 w-full overflow-hidden bg-slate-950 text-slate-100 border-0">
      <Sidebar
        position="left"
        size={'narrow'}
        footer={
          <Stack gap={"md"} className="mx-4 mt-auto mb-4 border border-brand/30 bg-brand/10 p-4">
            <Stack gap="none">
              <Text variant="label" weight="semibold" className='flex-wrap'>
                Pro Limits Active
              </Text>
              <Text variant="caption" color="secondary" className="text-wrap">
                Upgrade to unlock deeper tagging, unlimited exports, and team seats.
              </Text>
            </Stack>
              <Button variant="outline" size="sm" startIcon={<Plus />} fullWidth>
                Upgrade Workspace
              </Button>
            
          </Stack>
        }
      >
        <Stack gap="sm" className="p-4 w-full">
          {sidebarItems.map(({ icon: Icon, label, active }) => (
            <SidebarItem fullWidth key={label} icon={<Icon />} label={label} active={active} />
          ))}
        </Stack>
      </Sidebar>


   

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
       <SheetContent setAssistantOpen={setAssistantOpen} Icon={<Send/>}/>
      </Sheet>
    </Box>
  )
}
